import type { PokemonType } from '../data/pokemon'
import { getTypeIconUrl } from '../lib/typeIcons'

type TypeIconProps = {
  type: PokemonType
  size?: number
  className?: string
}

export function TypeIcon({ type, size = 32, className = '' }: TypeIconProps) {
  return (
    <img
      className={`type-icon ${className}`.trim()}
      src={getTypeIconUrl(type)}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
    />
  )
}
