import type { PokemonType } from '../data/pokemon'

const typeIconFiles: Record<PokemonType, string> = {
  normal: 'Normal_icon_SV.png',
  fire: 'Fire_icon_SV.png',
  water: 'Water_icon_SV.png',
  electric: 'Electric_icon_SV.png',
  grass: 'Grass_icon_SV.png',
  ice: 'Ice_icon_SV.png',
  fighting: 'Fighting_icon_SV.png',
  poison: 'Poison_icon_SV.png',
  ground: 'Ground_icon_SV.png',
  flying: 'Flying_icon_SV.png',
  psychic: 'Psychic_icon_SV.png',
  bug: 'Bug_icon_SV.png',
  rock: 'Rock_icon_SV.png',
  ghost: 'Ghost_icon_SV.png',
  dragon: 'Dragon_icon_SV.png',
  dark: 'Dark_icon_SV.png',
  steel: 'Steel_icon_SV.png',
  fairy: 'Fairy_icon_SV.png',
}

export function getTypeIconUrl(type: PokemonType) {
  return `${import.meta.env.BASE_URL}type-icons/${typeIconFiles[type]}`
}
