import { useMemo } from 'react'

import { regions } from '../../data/pokemon'
import { getFilteredPracticePool } from '../../lib/practice'
import type { MegaFilter, PracticeFilters } from '../../lib/types'
import { Modal } from '../Modal'

type CustomizerModalProps = {
  open: boolean
  onClose: () => void
  filters: PracticeFilters
  onChange: (filters: PracticeFilters) => void
  onStart: () => void
  status: string
}

const megaOptions: Array<{ value: MegaFilter; label: string }> = [
  { value: 'all', label: 'Include all' },
  { value: 'exclude', label: 'No Mega/Primal' },
  { value: 'only', label: 'Only Mega/Primal' },
]

export function CustomizerModal({ open, onClose, filters, onChange, onStart, status }: CustomizerModalProps) {
  const candidates = useMemo(() => getFilteredPracticePool(filters), [filters])

  function toggleRegion(region: string) {
    const next = filters.regions.includes(region)
      ? filters.regions.filter((entry) => entry !== region)
      : [...filters.regions, region]

    onChange({ ...filters, regions: next })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="modal-customizer"
      eyebrow="Practice"
      title="Build your pool"
      description="Choose which Pokémon can show up in practice rounds."
      status={status}
      footer={
        <>
          <button type="button" className="button button-primary" onClick={onStart} disabled={candidates.length === 0}>
            Start practice round
          </button>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => onChange({ regions: [], megaFilter: 'all' })}
          >
            Reset
          </button>
        </>
      }
    >
      <fieldset className="filter-group">
        <legend className="section-heading">Region</legend>
        <div className="chip-grid">
          {regions.map((region) => {
            const active = filters.regions.includes(region)

            return (
              <button
                key={region}
                type="button"
                className={`chip${active ? ' is-active' : ''}`}
                aria-pressed={active}
                onClick={() => toggleRegion(region)}
              >
                {region}
              </button>
            )
          })}
        </div>
        <p className="field-hint">No selection means every region is fair game.</p>
      </fieldset>

      <fieldset className="filter-group">
        <legend className="section-heading">Mega &amp; Primal forms</legend>
        <div className="chip-grid">
          {megaOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`chip${filters.megaFilter === option.value ? ' is-active' : ''}`}
              aria-pressed={filters.megaFilter === option.value}
              onClick={() => onChange({ ...filters, megaFilter: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <p className={`pool-count${candidates.length === 0 ? ' is-empty' : ''}`}>
        <strong>{candidates.length}</strong> Pokémon match these filters
        {candidates.length === 0 ? ' — widen your selection to start a round.' : '.'}
      </p>
    </Modal>
  )
}
