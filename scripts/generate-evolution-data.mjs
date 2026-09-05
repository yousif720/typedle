/**
 * One-off generator: resolves every roster entry's evolution stage from PokeAPI
 * and bakes the result into src/data/pokemon.evolution.generated.ts.
 *
 * v1 fetched this live on every single play, which meant three network round
 * trips before the evolution clue could render, a visible loading state, and a
 * hard dependency on PokeAPI being up. The data is static historical fact, so
 * there is no reason to pay that cost at runtime.
 *
 * Run with: npm run generate:evolution
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'src', 'data')
const outputPath = path.join(dataDir, 'pokemon.evolution.generated.ts')

const concurrency = 20

// Suffix words the roster appends to a base species name to describe a form.
// PokeAPI only knows the base species, so these are stripped before lookup.
const formModifierWords = new Set([
  'mega', 'x', 'y', 'z', 'primal', 'alola', 'cap', 'galar', 'hisui', 'paldea',
  'totem', 'original', 'color', 'curly', 'droopy', 'stretchy', 'form',
  'blaze', 'aqua', 'combat', 'three', 'segment',
])

function toPokemonSlug(name) {
  return name
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/['’]/g, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getBaseSpeciesSlug(name) {
  const words = name.trim().split(/\s+/)

  while (words.length > 1 && formModifierWords.has(words[words.length - 1].toLowerCase())) {
    words.pop()
  }

  return toPokemonSlug(words.join(' '))
}

function isMegaFormName(name) {
  return /\bmega\b/i.test(name)
}

/**
 * Finds a species in the chain and reports how deep it sits. The evolution
 * chain API does NOT expose an `evolves_from_species` field on chain nodes
 * (that only exists on the species resource), so depth from the root is what
 * actually distinguishes first / middle / final.
 */
function findSpeciesInChain(chain, speciesName, depth = 0) {
  if (!chain) {
    return null
  }

  if (chain.species?.name === speciesName) {
    return { node: chain, depth }
  }

  for (const next of chain.evolves_to ?? []) {
    const found = findSpeciesInChain(next, speciesName, depth + 1)

    if (found) {
      return found
    }
  }

  return null
}

function resolveEvolutionStage(chain, speciesName) {
  const match = findSpeciesInChain(chain, speciesName)

  if (!match) {
    return 'no-evolution-line'
  }

  const hasPreEvolution = match.depth > 0
  const hasEvolutions = (match.node.evolves_to?.length ?? 0) > 0

  if (!hasPreEvolution && !hasEvolutions) return 'no-evolution-line'
  if (!hasPreEvolution && hasEvolutions) return 'first'
  if (hasPreEvolution && hasEvolutions) return 'middle'
  return 'final'
}

async function readRosterNames() {
  const files = ['pokemon.generated.ts', 'pokemon.variants.generated.ts']
  const names = []

  for (const file of files) {
    const source = await readFile(path.join(dataDir, file), 'utf8')

    // Handles both the JSON-style ("name": "X") and object-literal (name: 'X')
    // shapes used by the two generated files.
    for (const match of source.matchAll(/name['"]?\s*:\s*['"]([^'"]+)['"]/g)) {
      names.push(match[1])
    }
  }

  return [...new Set(names)]
}

async function main() {
  const names = await readRosterNames()
  console.log(`Roster entries: ${names.length}`)

  // One network request per unique base species, not per roster entry.
  const slugToNames = new Map()

  for (const name of names) {
    const slug = getBaseSpeciesSlug(name)

    if (!slugToNames.has(slug)) {
      slugToNames.set(slug, [])
    }

    slugToNames.get(slug).push(name)
  }

  const slugs = [...slugToNames.keys()]
  console.log(`Unique species to fetch: ${slugs.length}`)

  const slugToStage = new Map()
  const failures = []
  let index = 0
  let done = 0

  async function worker() {
    while (index < slugs.length) {
      const slug = slugs[index++]

      try {
        const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${slug}`)

        if (!speciesResponse.ok) {
          throw new Error(`species ${speciesResponse.status}`)
        }

        const species = await speciesResponse.json()
        const chainUrl = species?.evolution_chain?.url

        if (!chainUrl) {
          slugToStage.set(slug, 'no-evolution-line')
        } else {
          const chainResponse = await fetch(chainUrl)

          if (!chainResponse.ok) {
            throw new Error(`chain ${chainResponse.status}`)
          }

          const chainData = await chainResponse.json()
          slugToStage.set(slug, resolveEvolutionStage(chainData?.chain, species.name))
        }
      } catch (error) {
        failures.push({ slug, error: error.message })
        slugToStage.set(slug, 'no-evolution-line')
      }

      done += 1

      if (done % 100 === 0) {
        console.log(`  ${done}/${slugs.length}`)
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()))

  const result = {}

  for (const [slug, entryNames] of slugToNames) {
    for (const name of entryNames) {
      // Mega/Primal forms are their own stage in this game regardless of where
      // the base species sits in its evolution chain.
      result[name] = isMegaFormName(name) ? 'mega' : slugToStage.get(slug)
    }
  }

  const tally = {}

  for (const stage of Object.values(result)) {
    tally[stage] = (tally[stage] ?? 0) + 1
  }

  const header = `// Generated by scripts/generate-evolution-data.mjs — do not edit by hand.
// Evolution stage per roster entry, resolved once from PokeAPI so the game does
// not need live network calls to render the evolution clue.
import type { EvolutionStage } from './pokemon'

export const pokemonEvolutionStages: Record<string, EvolutionStage> = `

  await writeFile(outputPath, `${header}${JSON.stringify(result, null, 2)}\n`, 'utf8')

  console.log(`\nWrote ${Object.keys(result).length} entries to ${path.relative(process.cwd(), outputPath)}`)
  console.log('Stage tally:', tally)

  if (failures.length > 0) {
    console.warn(`\n${failures.length} lookups failed:`, failures.slice(0, 10))
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
