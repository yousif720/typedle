import { Modal } from '../Modal'

type CreditsModalProps = {
  open: boolean
  onClose: () => void
}

const sources = [
  { name: 'Bulbagarden', note: 'Type icon archive', href: 'https://archives.bulbagarden.net' },
  { name: 'PokéAPI', note: 'Roster, evolution and artwork data', href: 'https://pokeapi.co' },
  { name: 'Serebii', note: 'Legends: Z-A Mega roster', href: 'https://www.serebii.net' },
  { name: 'Pokémon DB', note: 'Fallback artwork', href: 'https://pokemondb.net' },
]

export function CreditsModal({ open, onClose }: CreditsModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="modal-credits"
      eyebrow="Credits"
      title="Sources"
      description="TypeDle is a fan project and isn't affiliated with Nintendo, Game Freak or The Pokémon Company."
    >
      <ul className="credits-grid">
        {sources.map((source) => (
          <li key={source.name}>
            <a className="credits-card" href={source.href} target="_blank" rel="noreferrer">
              <span className="credits-name">{source.name}</span>
              <span className="credits-note">{source.note}</span>
            </a>
          </li>
        ))}
      </ul>

      <p className="field-hint">
        Pokémon and all related names and images are trademarks of their respective owners.
      </p>
    </Modal>
  )
}
