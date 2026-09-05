/**
 * Roster entries append these words to a base species name to describe a form
 * (e.g. "Charizard Mega X", "Raticate Totem Alola"). PokeAPI only has data for
 * the base species, so these are stripped before building a lookup slug.
 */
const formModifierWords = new Set([
  'mega', 'x', 'y', 'z', 'primal', 'alola', 'cap', 'galar', 'hisui', 'paldea',
  'totem', 'original', 'color', 'curly', 'droopy', 'stretchy', 'form',
  'blaze', 'aqua', 'combat', 'three', 'segment',
])

/**
 * Converts a display name into a PokeAPI slug. The tricky cases:
 *   Nidoran♀    -> nidoran-f   (gender symbols become suffixes)
 *   Farfetch'd  -> farfetchd   (apostrophes vanish, they don't become hyphens)
 *   Flabébé     -> flabebe     (accents are stripped, not hyphenated)
 *   Mr. Mime    -> mr-mime     (punctuation and spaces do become hyphens)
 */
export function toPokemonSlug(name: string) {
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

export function getBaseSpeciesName(name: string) {
  const words = name.trim().split(/\s+/)

  while (words.length > 1 && formModifierWords.has(words[words.length - 1].toLowerCase())) {
    words.pop()
  }

  return words.join(' ')
}

export function getBaseSpeciesSlug(name: string) {
  return toPokemonSlug(getBaseSpeciesName(name))
}

/**
 * Artwork URLs are precomputed into pokemon.artwork.generated.ts, so this is a
 * lookup rather than a network round trip. The pokemondb fallback only matters
 * for a roster entry added after the generator last ran.
 */
export function getArtworkUrl(name: string, artworkMap: Record<string, string>): string {
  return artworkMap[name] ?? `https://img.pokemondb.net/artwork/large/${getBaseSpeciesSlug(name)}.jpg`
}
