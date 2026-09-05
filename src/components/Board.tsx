import {
  formatTypeMultiplier,
  type EvolutionStage,
  type InteractionClue,
  type PokemonEntry,
  type TypeSummary,
} from '../data/pokemon'
import { CLUE_SCHEDULE, type ClueKey } from '../lib/gameRules'
import { TypeIcon } from './TypeIcon'

type TileGroupProps = {
  clues: InteractionClue[]
  tone: 'weakness' | 'resistance' | 'immunity'
}

function ClueTiles({ clues, tone }: TileGroupProps) {
  return (
    <div className="tile-group">
      {clues.map((clue) => {
        const label = formatTypeMultiplier(clue.multiplier)

        return (
          <span
            key={clue.attackType}
            className={`tile tile-clue tone-${tone}`}
            title={`${clue.attackType} ${label}`}
            aria-label={`${clue.attackType}, ${label}`}
          >
            <TypeIcon type={clue.attackType} size={28} />
            <span className="tile-multiplier">{label}</span>
          </span>
        )
      })}
    </div>
  )
}

function EmptyTile({ label }: { label: string }) {
  return (
    <div className="tile-group">
      <span className="tile tile-empty" title={label} aria-label={label}>
        <svg className="stop-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M7.8 7.8 16.2 16.2" />
        </svg>
      </span>
    </div>
  )
}

function LockedTile({ guessesAway }: { guessesAway: number }) {
  const label =
    guessesAway === 1 ? 'Unlocks after your next guess' : `Unlocks after ${guessesAway} more guesses`

  return (
    <div className="tile-group">
      <span className="tile tile-locked" aria-label={label} title={label}>
        <span aria-hidden="true">?</span>
      </span>
    </div>
  )
}

function WordTile({ words, tone }: { words: string[]; tone: string }) {
  return (
    <div className="tile-group">
      <span className={`tile tile-word tone-${tone}`} aria-label={words.join(' ')}>
        <span className="word-stack">
          {words.map((word) => (
            <span key={word} className="word-line">
              {word}
            </span>
          ))}
        </span>
      </span>
    </div>
  )
}

const stageLabels: Record<EvolutionStage, string[]> = {
  first: ['First'],
  middle: ['Middle'],
  final: ['Final'],
  mega: ['Mega'],
  'no-evolution-line': ['No', 'Evolution', 'Line'],
}

type BoardProps = {
  target: PokemonEntry
  summary: TypeSummary
  region: string
  evolutionStage: EvolutionStage
  wrongGuessCount: number
}

export function Board({ target, summary, region, evolutionStage, wrongGuessCount }: BoardProps) {
  function isVisible(key: ClueKey) {
    const clue = CLUE_SCHEDULE.find((entry) => entry.key === key)
    return clue ? wrongGuessCount >= clue.revealAfter : false
  }

  function guessesUntil(key: ClueKey) {
    const clue = CLUE_SCHEDULE.find((entry) => entry.key === key)
    return clue ? Math.max(0, clue.revealAfter - wrongGuessCount) : 0
  }

  function renderRow(key: ClueKey, label: string, content: React.ReactNode) {
    const visible = isVisible(key)

    return (
      <div className={`board-row row-${key}`} data-revealed={visible}>
        <span className="row-label" id={`clue-${key}`}>
          {label}
        </span>
        <div className="row-content" aria-labelledby={`clue-${key}`}>
          {visible ? content : <LockedTile guessesAway={guessesUntil(key)} />}
        </div>
      </div>
    )
  }

  const weaknessGroups = [
    { key: '4x', clues: summary.weaknesses4x },
    { key: '2x', clues: summary.weaknesses2x },
  ].filter((group) => group.clues.length > 0)

  const resistGroups = [
    { key: 'half', clues: summary.resistancesHalf, tone: 'resistance' as const },
    { key: 'quarter', clues: summary.resistancesQuarter, tone: 'resistance' as const },
    { key: 'immune', clues: summary.immunities, tone: 'immunity' as const },
  ].filter((group) => group.clues.length > 0)

  return (
    <section className="board" aria-label="Clue board">
      {renderRow(
        'weakness',
        'Weak to',
        weaknessGroups.length === 0 ? (
          <EmptyTile label="No weaknesses" />
        ) : (
          <div className="tile-stack">
            {weaknessGroups.map((group) => (
              <ClueTiles key={group.key} clues={group.clues} tone="weakness" />
            ))}
          </div>
        ),
      )}

      {renderRow('region', 'Region', <WordTile words={region.split(/\s+/)} tone="region" />)}

      {renderRow('evolution', 'Evolution stage', <WordTile words={stageLabels[evolutionStage]} tone="stage" />)}

      {renderRow(
        'resistance',
        'Resists',
        resistGroups.length === 0 ? (
          <EmptyTile label="No resistances" />
        ) : (
          <div className="tile-stack">
            {resistGroups.map((group) => (
              <ClueTiles key={group.key} clues={group.clues} tone={group.tone} />
            ))}
          </div>
        ),
      )}

      {renderRow('ability', 'Ability', <WordTile words={target.ability.split(/\s+/)} tone="ability" />)}
    </section>
  )
}
