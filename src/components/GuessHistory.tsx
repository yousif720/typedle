import { findPokemonByName, getTypeMatchFeedback, type PokemonType } from '../data/pokemon'
import { TypeIcon } from './TypeIcon'

type GuessHistoryProps = {
  guesses: string[]
  targetTypes: PokemonType[]
  /** Renders a heading when shown as a standalone section on the board. */
  heading?: string
  emptyLabel?: string
}

export function GuessHistory({ guesses, targetTypes, heading, emptyLabel }: GuessHistoryProps) {
  if (guesses.length === 0 && !emptyLabel) {
    return null
  }

  const content =
    guesses.length === 0 ? (
      <p className="guess-history-empty">{emptyLabel}</p>
    ) : (
      <ol className="guess-history-list">
        {guesses.map((name, index) => {
          const pokemon = findPokemonByName(name)
          const matches = pokemon ? getTypeMatchFeedback(pokemon.types, targetTypes) : []
          const matchCount = matches.filter((match) => match.isMatch).length

          return (
            <li key={`${name}-${index}`} className="guess-history-item">
              <span className="guess-history-index" aria-hidden="true">
                {index + 1}
              </span>
              <span className="guess-history-name">{name}</span>
              <span
                className="guess-history-types"
                aria-label={
                  matches.length === 0
                    ? 'Type data unavailable'
                    : `${matchCount} of ${matches.length} types match the answer`
                }
              >
                {matches.map((match) => (
                  <span
                    key={match.type}
                    className={`type-chip${match.isMatch ? ' is-match' : ''}`}
                    title={`${match.type}: ${match.isMatch ? 'shared with the answer' : 'not on the answer'}`}
                  >
                    <TypeIcon type={match.type} size={16} />
                  </span>
                ))}
              </span>
            </li>
          )
        })}
      </ol>
    )

  if (!heading) {
    return content
  }

  return (
    <section className="guess-history" aria-label="Your guesses">
      <h3 className="guess-history-heading">{heading}</h3>
      {content}
    </section>
  )
}
