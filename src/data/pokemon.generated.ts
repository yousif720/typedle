import type { PokemonEntry } from './pokemon'

export const pokemonPool = [
  {
    "name": "Bulbasaur",
    "types": [
      "grass",
      "poison"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Ivysaur",
    "types": [
      "grass",
      "poison"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Venusaur",
    "types": [
      "grass",
      "poison"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Charmander",
    "types": [
      "fire"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Charmeleon",
    "types": [
      "fire"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Charizard",
    "types": [
      "fire",
      "flying"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Squirtle",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Wartortle",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Blastoise",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Caterpie",
    "types": [
      "bug"
    ],
    "ability": "Shield Dust"
  },
  {
    "name": "Metapod",
    "types": [
      "bug"
    ],
    "ability": "Shed Skin"
  },
  {
    "name": "Butterfree",
    "types": [
      "bug",
      "flying"
    ],
    "ability": "Compound Eyes"
  },
  {
    "name": "Weedle",
    "types": [
      "bug",
      "poison"
    ],
    "ability": "Shield Dust"
  },
  {
    "name": "Kakuna",
    "types": [
      "bug",
      "poison"
    ],
    "ability": "Shed Skin"
  },
  {
    "name": "Beedrill",
    "types": [
      "bug",
      "poison"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Pidgey",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Pidgeotto",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Pidgeot",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Rattata",
    "types": [
      "normal"
    ],
    "ability": "Run Away"
  },
  {
    "name": "Raticate",
    "types": [
      "normal"
    ],
    "ability": "Run Away"
  },
  {
    "name": "Spearow",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Fearow",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Ekans",
    "types": [
      "poison"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Arbok",
    "types": [
      "poison"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Pikachu",
    "types": [
      "electric"
    ],
    "ability": "Static"
  },
  {
    "name": "Raichu",
    "types": [
      "electric"
    ],
    "ability": "Static"
  },
  {
    "name": "Sandshrew",
    "types": [
      "ground"
    ],
    "ability": "Sand Veil"
  },
  {
    "name": "Sandslash",
    "types": [
      "ground"
    ],
    "ability": "Sand Veil"
  },
  {
    "name": "Nidoran♀",
    "types": [
      "poison"
    ],
    "ability": "Poison Point"
  },
  {
    "name": "Nidorina",
    "types": [
      "poison"
    ],
    "ability": "Poison Point"
  },
  {
    "name": "Nidoqueen",
    "types": [
      "poison",
      "ground"
    ],
    "ability": "Poison Point"
  },
  {
    "name": "Nidoran♂",
    "types": [
      "poison"
    ],
    "ability": "Poison Point"
  },
  {
    "name": "Nidorino",
    "types": [
      "poison"
    ],
    "ability": "Poison Point"
  },
  {
    "name": "Nidoking",
    "types": [
      "poison",
      "ground"
    ],
    "ability": "Poison Point"
  },
  {
    "name": "Clefairy",
    "types": [
      "fairy"
    ],
    "ability": "Cute Charm"
  },
  {
    "name": "Clefable",
    "types": [
      "fairy"
    ],
    "ability": "Cute Charm"
  },
  {
    "name": "Vulpix",
    "types": [
      "fire"
    ],
    "ability": "Flash Fire"
  },
  {
    "name": "Ninetales",
    "types": [
      "fire"
    ],
    "ability": "Flash Fire"
  },
  {
    "name": "Jigglypuff",
    "types": [
      "normal",
      "fairy"
    ],
    "ability": "Cute Charm"
  },
  {
    "name": "Wigglytuff",
    "types": [
      "normal",
      "fairy"
    ],
    "ability": "Cute Charm"
  },
  {
    "name": "Zubat",
    "types": [
      "poison",
      "flying"
    ],
    "ability": "Inner Focus"
  },
  {
    "name": "Golbat",
    "types": [
      "poison",
      "flying"
    ],
    "ability": "Inner Focus"
  },
  {
    "name": "Oddish",
    "types": [
      "grass",
      "poison"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Gloom",
    "types": [
      "grass",
      "poison"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Vileplume",
    "types": [
      "grass",
      "poison"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Paras",
    "types": [
      "bug",
      "grass"
    ],
    "ability": "Effect Spore"
  },
  {
    "name": "Parasect",
    "types": [
      "bug",
      "grass"
    ],
    "ability": "Effect Spore"
  },
  {
    "name": "Venonat",
    "types": [
      "bug",
      "poison"
    ],
    "ability": "Compound Eyes"
  },
  {
    "name": "Venomoth",
    "types": [
      "bug",
      "poison"
    ],
    "ability": "Shield Dust"
  },
  {
    "name": "Diglett",
    "types": [
      "ground"
    ],
    "ability": "Sand Veil"
  },
  {
    "name": "Dugtrio",
    "types": [
      "ground"
    ],
    "ability": "Sand Veil"
  },
  {
    "name": "Meowth",
    "types": [
      "normal"
    ],
    "ability": "Pickup"
  },
  {
    "name": "Persian",
    "types": [
      "normal"
    ],
    "ability": "Limber"
  },
  {
    "name": "Psyduck",
    "types": [
      "water"
    ],
    "ability": "Damp"
  },
  {
    "name": "Golduck",
    "types": [
      "water"
    ],
    "ability": "Damp"
  },
  {
    "name": "Mankey",
    "types": [
      "fighting"
    ],
    "ability": "Vital Spirit"
  },
  {
    "name": "Primeape",
    "types": [
      "fighting"
    ],
    "ability": "Vital Spirit"
  },
  {
    "name": "Growlithe",
    "types": [
      "fire"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Arcanine",
    "types": [
      "fire"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Poliwag",
    "types": [
      "water"
    ],
    "ability": "Water Absorb"
  },
  {
    "name": "Poliwhirl",
    "types": [
      "water"
    ],
    "ability": "Water Absorb"
  },
  {
    "name": "Poliwrath",
    "types": [
      "water",
      "fighting"
    ],
    "ability": "Water Absorb"
  },
  {
    "name": "Abra",
    "types": [
      "psychic"
    ],
    "ability": "Synchronize"
  },
  {
    "name": "Kadabra",
    "types": [
      "psychic"
    ],
    "ability": "Synchronize"
  },
  {
    "name": "Alakazam",
    "types": [
      "psychic"
    ],
    "ability": "Synchronize"
  },
  {
    "name": "Machop",
    "types": [
      "fighting"
    ],
    "ability": "Guts"
  },
  {
    "name": "Machoke",
    "types": [
      "fighting"
    ],
    "ability": "Guts"
  },
  {
    "name": "Machamp",
    "types": [
      "fighting"
    ],
    "ability": "Guts"
  },
  {
    "name": "Bellsprout",
    "types": [
      "grass",
      "poison"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Weepinbell",
    "types": [
      "grass",
      "poison"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Victreebel",
    "types": [
      "grass",
      "poison"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Tentacool",
    "types": [
      "water",
      "poison"
    ],
    "ability": "Clear Body"
  },
  {
    "name": "Tentacruel",
    "types": [
      "water",
      "poison"
    ],
    "ability": "Clear Body"
  },
  {
    "name": "Geodude",
    "types": [
      "rock",
      "ground"
    ],
    "ability": "Rock Head"
  },
  {
    "name": "Graveler",
    "types": [
      "rock",
      "ground"
    ],
    "ability": "Rock Head"
  },
  {
    "name": "Golem",
    "types": [
      "rock",
      "ground"
    ],
    "ability": "Rock Head"
  },
  {
    "name": "Ponyta",
    "types": [
      "fire"
    ],
    "ability": "Run Away"
  },
  {
    "name": "Rapidash",
    "types": [
      "fire"
    ],
    "ability": "Run Away"
  },
  {
    "name": "Slowpoke",
    "types": [
      "water",
      "psychic"
    ],
    "ability": "Oblivious"
  },
  {
    "name": "Slowbro",
    "types": [
      "water",
      "psychic"
    ],
    "ability": "Oblivious"
  },
  {
    "name": "Magnemite",
    "types": [
      "electric",
      "steel"
    ],
    "ability": "Magnet Pull"
  },
  {
    "name": "Magneton",
    "types": [
      "electric",
      "steel"
    ],
    "ability": "Magnet Pull"
  },
  {
    "name": "Farfetch’d",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Doduo",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Run Away"
  },
  {
    "name": "Dodrio",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Run Away"
  },
  {
    "name": "Seel",
    "types": [
      "water"
    ],
    "ability": "Thick Fat"
  },
  {
    "name": "Dewgong",
    "types": [
      "water",
      "ice"
    ],
    "ability": "Thick Fat"
  },
  {
    "name": "Grimer",
    "types": [
      "poison"
    ],
    "ability": "Stench"
  },
  {
    "name": "Muk",
    "types": [
      "poison"
    ],
    "ability": "Stench"
  },
  {
    "name": "Shellder",
    "types": [
      "water"
    ],
    "ability": "Shell Armor"
  },
  {
    "name": "Cloyster",
    "types": [
      "water",
      "ice"
    ],
    "ability": "Shell Armor"
  },
  {
    "name": "Gastly",
    "types": [
      "ghost",
      "poison"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Haunter",
    "types": [
      "ghost",
      "poison"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Gengar",
    "types": [
      "ghost",
      "poison"
    ],
    "ability": "Cursed Body"
  },
  {
    "name": "Onix",
    "types": [
      "rock",
      "ground"
    ],
    "ability": "Rock Head"
  },
  {
    "name": "Drowzee",
    "types": [
      "psychic"
    ],
    "ability": "Insomnia"
  },
  {
    "name": "Hypno",
    "types": [
      "psychic"
    ],
    "ability": "Insomnia"
  },
  {
    "name": "Krabby",
    "types": [
      "water"
    ],
    "ability": "Hyper Cutter"
  },
  {
    "name": "Kingler",
    "types": [
      "water"
    ],
    "ability": "Hyper Cutter"
  },
  {
    "name": "Voltorb",
    "types": [
      "electric"
    ],
    "ability": "Soundproof"
  },
  {
    "name": "Electrode",
    "types": [
      "electric"
    ],
    "ability": "Soundproof"
  },
  {
    "name": "Exeggcute",
    "types": [
      "grass",
      "psychic"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Exeggutor",
    "types": [
      "grass",
      "psychic"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Cubone",
    "types": [
      "ground"
    ],
    "ability": "Rock Head"
  },
  {
    "name": "Marowak",
    "types": [
      "ground"
    ],
    "ability": "Rock Head"
  },
  {
    "name": "Hitmonlee",
    "types": [
      "fighting"
    ],
    "ability": "Limber"
  },
  {
    "name": "Hitmonchan",
    "types": [
      "fighting"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Lickitung",
    "types": [
      "normal"
    ],
    "ability": "Own Tempo"
  },
  {
    "name": "Koffing",
    "types": [
      "poison"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Weezing",
    "types": [
      "poison"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Rhyhorn",
    "types": [
      "ground",
      "rock"
    ],
    "ability": "Lightning Rod"
  },
  {
    "name": "Rhydon",
    "types": [
      "ground",
      "rock"
    ],
    "ability": "Lightning Rod"
  },
  {
    "name": "Chansey",
    "types": [
      "normal"
    ],
    "ability": "Natural Cure"
  },
  {
    "name": "Tangela",
    "types": [
      "grass"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Kangaskhan",
    "types": [
      "normal"
    ],
    "ability": "Early Bird"
  },
  {
    "name": "Horsea",
    "types": [
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Seadra",
    "types": [
      "water"
    ],
    "ability": "Poison Point"
  },
  {
    "name": "Goldeen",
    "types": [
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Seaking",
    "types": [
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Staryu",
    "types": [
      "water"
    ],
    "ability": "Illuminate"
  },
  {
    "name": "Starmie",
    "types": [
      "water",
      "psychic"
    ],
    "ability": "Illuminate"
  },
  {
    "name": "Mr. Mime",
    "types": [
      "psychic",
      "fairy"
    ],
    "ability": "Soundproof"
  },
  {
    "name": "Scyther",
    "types": [
      "bug",
      "flying"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Jynx",
    "types": [
      "ice",
      "psychic"
    ],
    "ability": "Oblivious"
  },
  {
    "name": "Electabuzz",
    "types": [
      "electric"
    ],
    "ability": "Static"
  },
  {
    "name": "Magmar",
    "types": [
      "fire"
    ],
    "ability": "Flame Body"
  },
  {
    "name": "Pinsir",
    "types": [
      "bug"
    ],
    "ability": "Hyper Cutter"
  },
  {
    "name": "Tauros",
    "types": [
      "normal"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Magikarp",
    "types": [
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Gyarados",
    "types": [
      "water",
      "flying"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Lapras",
    "types": [
      "water",
      "ice"
    ],
    "ability": "Water Absorb"
  },
  {
    "name": "Ditto",
    "types": [
      "normal"
    ],
    "ability": "Limber"
  },
  {
    "name": "Eevee",
    "types": [
      "normal"
    ],
    "ability": "Run Away"
  },
  {
    "name": "Vaporeon",
    "types": [
      "water"
    ],
    "ability": "Water Absorb"
  },
  {
    "name": "Jolteon",
    "types": [
      "electric"
    ],
    "ability": "Volt Absorb"
  },
  {
    "name": "Flareon",
    "types": [
      "fire"
    ],
    "ability": "Flash Fire"
  },
  {
    "name": "Porygon",
    "types": [
      "normal"
    ],
    "ability": "Trace"
  },
  {
    "name": "Omanyte",
    "types": [
      "rock",
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Omastar",
    "types": [
      "rock",
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Kabuto",
    "types": [
      "rock",
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Kabutops",
    "types": [
      "rock",
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Aerodactyl",
    "types": [
      "rock",
      "flying"
    ],
    "ability": "Rock Head"
  },
  {
    "name": "Snorlax",
    "types": [
      "normal"
    ],
    "ability": "Immunity"
  },
  {
    "name": "Articuno",
    "types": [
      "ice",
      "flying"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Zapdos",
    "types": [
      "electric",
      "flying"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Moltres",
    "types": [
      "fire",
      "flying"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Dratini",
    "types": [
      "dragon"
    ],
    "ability": "Shed Skin"
  },
  {
    "name": "Dragonair",
    "types": [
      "dragon"
    ],
    "ability": "Shed Skin"
  },
  {
    "name": "Dragonite",
    "types": [
      "dragon",
      "flying"
    ],
    "ability": "Inner Focus"
  },
  {
    "name": "Mewtwo",
    "types": [
      "psychic"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Mew",
    "types": [
      "psychic"
    ],
    "ability": "Synchronize"
  },
  {
    "name": "Chikorita",
    "types": [
      "grass"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Bayleef",
    "types": [
      "grass"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Meganium",
    "types": [
      "grass"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Cyndaquil",
    "types": [
      "fire"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Quilava",
    "types": [
      "fire"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Typhlosion",
    "types": [
      "fire"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Totodile",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Croconaw",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Feraligatr",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Sentret",
    "types": [
      "normal"
    ],
    "ability": "Run Away"
  },
  {
    "name": "Furret",
    "types": [
      "normal"
    ],
    "ability": "Run Away"
  },
  {
    "name": "Hoothoot",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Insomnia"
  },
  {
    "name": "Noctowl",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Insomnia"
  },
  {
    "name": "Ledyba",
    "types": [
      "bug",
      "flying"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Ledian",
    "types": [
      "bug",
      "flying"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Spinarak",
    "types": [
      "bug",
      "poison"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Ariados",
    "types": [
      "bug",
      "poison"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Crobat",
    "types": [
      "poison",
      "flying"
    ],
    "ability": "Inner Focus"
  },
  {
    "name": "Chinchou",
    "types": [
      "water",
      "electric"
    ],
    "ability": "Volt Absorb"
  },
  {
    "name": "Lanturn",
    "types": [
      "water",
      "electric"
    ],
    "ability": "Volt Absorb"
  },
  {
    "name": "Pichu",
    "types": [
      "electric"
    ],
    "ability": "Static"
  },
  {
    "name": "Cleffa",
    "types": [
      "fairy"
    ],
    "ability": "Cute Charm"
  },
  {
    "name": "Igglybuff",
    "types": [
      "normal",
      "fairy"
    ],
    "ability": "Cute Charm"
  },
  {
    "name": "Togepi",
    "types": [
      "fairy"
    ],
    "ability": "Hustle"
  },
  {
    "name": "Togetic",
    "types": [
      "fairy",
      "flying"
    ],
    "ability": "Hustle"
  },
  {
    "name": "Natu",
    "types": [
      "psychic",
      "flying"
    ],
    "ability": "Synchronize"
  },
  {
    "name": "Xatu",
    "types": [
      "psychic",
      "flying"
    ],
    "ability": "Synchronize"
  },
  {
    "name": "Mareep",
    "types": [
      "electric"
    ],
    "ability": "Static"
  },
  {
    "name": "Flaaffy",
    "types": [
      "electric"
    ],
    "ability": "Static"
  },
  {
    "name": "Ampharos",
    "types": [
      "electric"
    ],
    "ability": "Static"
  },
  {
    "name": "Bellossom",
    "types": [
      "grass"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Marill",
    "types": [
      "water",
      "fairy"
    ],
    "ability": "Thick Fat"
  },
  {
    "name": "Azumarill",
    "types": [
      "water",
      "fairy"
    ],
    "ability": "Thick Fat"
  },
  {
    "name": "Sudowoodo",
    "types": [
      "rock"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Politoed",
    "types": [
      "water"
    ],
    "ability": "Water Absorb"
  },
  {
    "name": "Hoppip",
    "types": [
      "grass",
      "flying"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Skiploom",
    "types": [
      "grass",
      "flying"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Jumpluff",
    "types": [
      "grass",
      "flying"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Aipom",
    "types": [
      "normal"
    ],
    "ability": "Run Away"
  },
  {
    "name": "Sunkern",
    "types": [
      "grass"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Sunflora",
    "types": [
      "grass"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Yanma",
    "types": [
      "bug",
      "flying"
    ],
    "ability": "Speed Boost"
  },
  {
    "name": "Wooper",
    "types": [
      "water",
      "ground"
    ],
    "ability": "Damp"
  },
  {
    "name": "Quagsire",
    "types": [
      "water",
      "ground"
    ],
    "ability": "Damp"
  },
  {
    "name": "Espeon",
    "types": [
      "psychic"
    ],
    "ability": "Synchronize"
  },
  {
    "name": "Umbreon",
    "types": [
      "dark"
    ],
    "ability": "Synchronize"
  },
  {
    "name": "Murkrow",
    "types": [
      "dark",
      "flying"
    ],
    "ability": "Insomnia"
  },
  {
    "name": "Slowking",
    "types": [
      "water",
      "psychic"
    ],
    "ability": "Oblivious"
  },
  {
    "name": "Misdreavus",
    "types": [
      "ghost"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Unown",
    "types": [
      "psychic"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Wobbuffet",
    "types": [
      "psychic"
    ],
    "ability": "Shadow Tag"
  },
  {
    "name": "Girafarig",
    "types": [
      "normal",
      "psychic"
    ],
    "ability": "Inner Focus"
  },
  {
    "name": "Pineco",
    "types": [
      "bug"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Forretress",
    "types": [
      "bug",
      "steel"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Dunsparce",
    "types": [
      "normal"
    ],
    "ability": "Serene Grace"
  },
  {
    "name": "Gligar",
    "types": [
      "ground",
      "flying"
    ],
    "ability": "Hyper Cutter"
  },
  {
    "name": "Steelix",
    "types": [
      "steel",
      "ground"
    ],
    "ability": "Rock Head"
  },
  {
    "name": "Snubbull",
    "types": [
      "fairy"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Granbull",
    "types": [
      "fairy"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Qwilfish",
    "types": [
      "water",
      "poison"
    ],
    "ability": "Poison Point"
  },
  {
    "name": "Scizor",
    "types": [
      "bug",
      "steel"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Shuckle",
    "types": [
      "bug",
      "rock"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Heracross",
    "types": [
      "bug",
      "fighting"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Sneasel",
    "types": [
      "dark",
      "ice"
    ],
    "ability": "Inner Focus"
  },
  {
    "name": "Teddiursa",
    "types": [
      "normal"
    ],
    "ability": "Pickup"
  },
  {
    "name": "Ursaring",
    "types": [
      "normal"
    ],
    "ability": "Guts"
  },
  {
    "name": "Slugma",
    "types": [
      "fire"
    ],
    "ability": "Magma Armor"
  },
  {
    "name": "Magcargo",
    "types": [
      "fire",
      "rock"
    ],
    "ability": "Magma Armor"
  },
  {
    "name": "Swinub",
    "types": [
      "ice",
      "ground"
    ],
    "ability": "Oblivious"
  },
  {
    "name": "Piloswine",
    "types": [
      "ice",
      "ground"
    ],
    "ability": "Oblivious"
  },
  {
    "name": "Corsola",
    "types": [
      "water",
      "rock"
    ],
    "ability": "Hustle"
  },
  {
    "name": "Remoraid",
    "types": [
      "water"
    ],
    "ability": "Hustle"
  },
  {
    "name": "Octillery",
    "types": [
      "water"
    ],
    "ability": "Suction Cups"
  },
  {
    "name": "Delibird",
    "types": [
      "ice",
      "flying"
    ],
    "ability": "Vital Spirit"
  },
  {
    "name": "Mantine",
    "types": [
      "water",
      "flying"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Skarmory",
    "types": [
      "steel",
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Houndour",
    "types": [
      "dark",
      "fire"
    ],
    "ability": "Early Bird"
  },
  {
    "name": "Houndoom",
    "types": [
      "dark",
      "fire"
    ],
    "ability": "Early Bird"
  },
  {
    "name": "Kingdra",
    "types": [
      "water",
      "dragon"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Phanpy",
    "types": [
      "ground"
    ],
    "ability": "Pickup"
  },
  {
    "name": "Donphan",
    "types": [
      "ground"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Porygon2",
    "types": [
      "normal"
    ],
    "ability": "Trace"
  },
  {
    "name": "Stantler",
    "types": [
      "normal"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Smeargle",
    "types": [
      "normal"
    ],
    "ability": "Own Tempo"
  },
  {
    "name": "Tyrogue",
    "types": [
      "fighting"
    ],
    "ability": "Guts"
  },
  {
    "name": "Hitmontop",
    "types": [
      "fighting"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Smoochum",
    "types": [
      "ice",
      "psychic"
    ],
    "ability": "Oblivious"
  },
  {
    "name": "Elekid",
    "types": [
      "electric"
    ],
    "ability": "Static"
  },
  {
    "name": "Magby",
    "types": [
      "fire"
    ],
    "ability": "Flame Body"
  },
  {
    "name": "Miltank",
    "types": [
      "normal"
    ],
    "ability": "Thick Fat"
  },
  {
    "name": "Blissey",
    "types": [
      "normal"
    ],
    "ability": "Natural Cure"
  },
  {
    "name": "Raikou",
    "types": [
      "electric"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Entei",
    "types": [
      "fire"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Suicune",
    "types": [
      "water"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Larvitar",
    "types": [
      "rock",
      "ground"
    ],
    "ability": "Guts"
  },
  {
    "name": "Pupitar",
    "types": [
      "rock",
      "ground"
    ],
    "ability": "Shed Skin"
  },
  {
    "name": "Tyranitar",
    "types": [
      "rock",
      "dark"
    ],
    "ability": "Sand Stream"
  },
  {
    "name": "Lugia",
    "types": [
      "psychic",
      "flying"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Ho-Oh",
    "types": [
      "fire",
      "flying"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Celebi",
    "types": [
      "psychic",
      "grass"
    ],
    "ability": "Natural Cure"
  },
  {
    "name": "Treecko",
    "types": [
      "grass"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Grovyle",
    "types": [
      "grass"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Sceptile",
    "types": [
      "grass"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Torchic",
    "types": [
      "fire"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Combusken",
    "types": [
      "fire",
      "fighting"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Blaziken",
    "types": [
      "fire",
      "fighting"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Mudkip",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Marshtomp",
    "types": [
      "water",
      "ground"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Swampert",
    "types": [
      "water",
      "ground"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Poochyena",
    "types": [
      "dark"
    ],
    "ability": "Run Away"
  },
  {
    "name": "Mightyena",
    "types": [
      "dark"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Zigzagoon",
    "types": [
      "normal"
    ],
    "ability": "Pickup"
  },
  {
    "name": "Linoone",
    "types": [
      "normal"
    ],
    "ability": "Pickup"
  },
  {
    "name": "Wurmple",
    "types": [
      "bug"
    ],
    "ability": "Shield Dust"
  },
  {
    "name": "Silcoon",
    "types": [
      "bug"
    ],
    "ability": "Shed Skin"
  },
  {
    "name": "Beautifly",
    "types": [
      "bug",
      "flying"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Cascoon",
    "types": [
      "bug"
    ],
    "ability": "Shed Skin"
  },
  {
    "name": "Dustox",
    "types": [
      "bug",
      "poison"
    ],
    "ability": "Shield Dust"
  },
  {
    "name": "Lotad",
    "types": [
      "water",
      "grass"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Lombre",
    "types": [
      "water",
      "grass"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Ludicolo",
    "types": [
      "water",
      "grass"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Seedot",
    "types": [
      "grass"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Nuzleaf",
    "types": [
      "grass",
      "dark"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Shiftry",
    "types": [
      "grass",
      "dark"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Taillow",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Guts"
  },
  {
    "name": "Swellow",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Guts"
  },
  {
    "name": "Wingull",
    "types": [
      "water",
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Pelipper",
    "types": [
      "water",
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Ralts",
    "types": [
      "psychic",
      "fairy"
    ],
    "ability": "Synchronize"
  },
  {
    "name": "Kirlia",
    "types": [
      "psychic",
      "fairy"
    ],
    "ability": "Synchronize"
  },
  {
    "name": "Gardevoir",
    "types": [
      "psychic",
      "fairy"
    ],
    "ability": "Synchronize"
  },
  {
    "name": "Surskit",
    "types": [
      "bug",
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Masquerain",
    "types": [
      "bug",
      "flying"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Shroomish",
    "types": [
      "grass"
    ],
    "ability": "Effect Spore"
  },
  {
    "name": "Breloom",
    "types": [
      "grass",
      "fighting"
    ],
    "ability": "Effect Spore"
  },
  {
    "name": "Slakoth",
    "types": [
      "normal"
    ],
    "ability": "Truant"
  },
  {
    "name": "Vigoroth",
    "types": [
      "normal"
    ],
    "ability": "Vital Spirit"
  },
  {
    "name": "Slaking",
    "types": [
      "normal"
    ],
    "ability": "Truant"
  },
  {
    "name": "Nincada",
    "types": [
      "bug",
      "ground"
    ],
    "ability": "Compound Eyes"
  },
  {
    "name": "Ninjask",
    "types": [
      "bug",
      "flying"
    ],
    "ability": "Speed Boost"
  },
  {
    "name": "Shedinja",
    "types": [
      "bug",
      "ghost"
    ],
    "ability": "Wonder Guard"
  },
  {
    "name": "Whismur",
    "types": [
      "normal"
    ],
    "ability": "Soundproof"
  },
  {
    "name": "Loudred",
    "types": [
      "normal"
    ],
    "ability": "Soundproof"
  },
  {
    "name": "Exploud",
    "types": [
      "normal"
    ],
    "ability": "Soundproof"
  },
  {
    "name": "Makuhita",
    "types": [
      "fighting"
    ],
    "ability": "Thick Fat"
  },
  {
    "name": "Hariyama",
    "types": [
      "fighting"
    ],
    "ability": "Thick Fat"
  },
  {
    "name": "Azurill",
    "types": [
      "normal",
      "fairy"
    ],
    "ability": "Thick Fat"
  },
  {
    "name": "Nosepass",
    "types": [
      "rock"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Skitty",
    "types": [
      "normal"
    ],
    "ability": "Cute Charm"
  },
  {
    "name": "Delcatty",
    "types": [
      "normal"
    ],
    "ability": "Cute Charm"
  },
  {
    "name": "Sableye",
    "types": [
      "dark",
      "ghost"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Mawile",
    "types": [
      "steel",
      "fairy"
    ],
    "ability": "Hyper Cutter"
  },
  {
    "name": "Aron",
    "types": [
      "steel",
      "rock"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Lairon",
    "types": [
      "steel",
      "rock"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Aggron",
    "types": [
      "steel",
      "rock"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Meditite",
    "types": [
      "fighting",
      "psychic"
    ],
    "ability": "Pure Power"
  },
  {
    "name": "Medicham",
    "types": [
      "fighting",
      "psychic"
    ],
    "ability": "Pure Power"
  },
  {
    "name": "Electrike",
    "types": [
      "electric"
    ],
    "ability": "Static"
  },
  {
    "name": "Manectric",
    "types": [
      "electric"
    ],
    "ability": "Static"
  },
  {
    "name": "Plusle",
    "types": [
      "electric"
    ],
    "ability": "Plus"
  },
  {
    "name": "Minun",
    "types": [
      "electric"
    ],
    "ability": "Minus"
  },
  {
    "name": "Volbeat",
    "types": [
      "bug"
    ],
    "ability": "Illuminate"
  },
  {
    "name": "Illumise",
    "types": [
      "bug"
    ],
    "ability": "Oblivious"
  },
  {
    "name": "Roselia",
    "types": [
      "grass",
      "poison"
    ],
    "ability": "Natural Cure"
  },
  {
    "name": "Gulpin",
    "types": [
      "poison"
    ],
    "ability": "Liquid Ooze"
  },
  {
    "name": "Swalot",
    "types": [
      "poison"
    ],
    "ability": "Liquid Ooze"
  },
  {
    "name": "Carvanha",
    "types": [
      "water",
      "dark"
    ],
    "ability": "Rough Skin"
  },
  {
    "name": "Sharpedo",
    "types": [
      "water",
      "dark"
    ],
    "ability": "Rough Skin"
  },
  {
    "name": "Wailmer",
    "types": [
      "water"
    ],
    "ability": "Water Veil"
  },
  {
    "name": "Wailord",
    "types": [
      "water"
    ],
    "ability": "Water Veil"
  },
  {
    "name": "Numel",
    "types": [
      "fire",
      "ground"
    ],
    "ability": "Oblivious"
  },
  {
    "name": "Camerupt",
    "types": [
      "fire",
      "ground"
    ],
    "ability": "Magma Armor"
  },
  {
    "name": "Torkoal",
    "types": [
      "fire"
    ],
    "ability": "White Smoke"
  },
  {
    "name": "Spoink",
    "types": [
      "psychic"
    ],
    "ability": "Thick Fat"
  },
  {
    "name": "Grumpig",
    "types": [
      "psychic"
    ],
    "ability": "Thick Fat"
  },
  {
    "name": "Spinda",
    "types": [
      "normal"
    ],
    "ability": "Own Tempo"
  },
  {
    "name": "Trapinch",
    "types": [
      "ground"
    ],
    "ability": "Hyper Cutter"
  },
  {
    "name": "Vibrava",
    "types": [
      "ground",
      "dragon"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Flygon",
    "types": [
      "ground",
      "dragon"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Cacnea",
    "types": [
      "grass"
    ],
    "ability": "Sand Veil"
  },
  {
    "name": "Cacturne",
    "types": [
      "grass",
      "dark"
    ],
    "ability": "Sand Veil"
  },
  {
    "name": "Swablu",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Natural Cure"
  },
  {
    "name": "Altaria",
    "types": [
      "dragon",
      "flying"
    ],
    "ability": "Natural Cure"
  },
  {
    "name": "Zangoose",
    "types": [
      "normal"
    ],
    "ability": "Immunity"
  },
  {
    "name": "Seviper",
    "types": [
      "poison"
    ],
    "ability": "Shed Skin"
  },
  {
    "name": "Lunatone",
    "types": [
      "rock",
      "psychic"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Solrock",
    "types": [
      "rock",
      "psychic"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Barboach",
    "types": [
      "water",
      "ground"
    ],
    "ability": "Oblivious"
  },
  {
    "name": "Whiscash",
    "types": [
      "water",
      "ground"
    ],
    "ability": "Oblivious"
  },
  {
    "name": "Corphish",
    "types": [
      "water"
    ],
    "ability": "Hyper Cutter"
  },
  {
    "name": "Crawdaunt",
    "types": [
      "water",
      "dark"
    ],
    "ability": "Hyper Cutter"
  },
  {
    "name": "Baltoy",
    "types": [
      "ground",
      "psychic"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Claydol",
    "types": [
      "ground",
      "psychic"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Lileep",
    "types": [
      "rock",
      "grass"
    ],
    "ability": "Suction Cups"
  },
  {
    "name": "Cradily",
    "types": [
      "rock",
      "grass"
    ],
    "ability": "Suction Cups"
  },
  {
    "name": "Anorith",
    "types": [
      "rock",
      "bug"
    ],
    "ability": "Battle Armor"
  },
  {
    "name": "Armaldo",
    "types": [
      "rock",
      "bug"
    ],
    "ability": "Battle Armor"
  },
  {
    "name": "Feebas",
    "types": [
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Milotic",
    "types": [
      "water"
    ],
    "ability": "Marvel Scale"
  },
  {
    "name": "Castform",
    "types": [
      "normal"
    ],
    "ability": "Forecast"
  },
  {
    "name": "Kecleon",
    "types": [
      "normal"
    ],
    "ability": "Color Change"
  },
  {
    "name": "Shuppet",
    "types": [
      "ghost"
    ],
    "ability": "Insomnia"
  },
  {
    "name": "Banette",
    "types": [
      "ghost"
    ],
    "ability": "Insomnia"
  },
  {
    "name": "Duskull",
    "types": [
      "ghost"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Dusclops",
    "types": [
      "ghost"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Tropius",
    "types": [
      "grass",
      "flying"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Chimecho",
    "types": [
      "psychic"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Absol",
    "types": [
      "dark"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Wynaut",
    "types": [
      "psychic"
    ],
    "ability": "Shadow Tag"
  },
  {
    "name": "Snorunt",
    "types": [
      "ice"
    ],
    "ability": "Inner Focus"
  },
  {
    "name": "Glalie",
    "types": [
      "ice"
    ],
    "ability": "Inner Focus"
  },
  {
    "name": "Spheal",
    "types": [
      "ice",
      "water"
    ],
    "ability": "Thick Fat"
  },
  {
    "name": "Sealeo",
    "types": [
      "ice",
      "water"
    ],
    "ability": "Thick Fat"
  },
  {
    "name": "Walrein",
    "types": [
      "ice",
      "water"
    ],
    "ability": "Thick Fat"
  },
  {
    "name": "Clamperl",
    "types": [
      "water"
    ],
    "ability": "Shell Armor"
  },
  {
    "name": "Huntail",
    "types": [
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Gorebyss",
    "types": [
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Relicanth",
    "types": [
      "water",
      "rock"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Luvdisc",
    "types": [
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Bagon",
    "types": [
      "dragon"
    ],
    "ability": "Rock Head"
  },
  {
    "name": "Shelgon",
    "types": [
      "dragon"
    ],
    "ability": "Rock Head"
  },
  {
    "name": "Salamence",
    "types": [
      "dragon",
      "flying"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Beldum",
    "types": [
      "steel",
      "psychic"
    ],
    "ability": "Clear Body"
  },
  {
    "name": "Metang",
    "types": [
      "steel",
      "psychic"
    ],
    "ability": "Clear Body"
  },
  {
    "name": "Metagross",
    "types": [
      "steel",
      "psychic"
    ],
    "ability": "Clear Body"
  },
  {
    "name": "Regirock",
    "types": [
      "rock"
    ],
    "ability": "Clear Body"
  },
  {
    "name": "Regice",
    "types": [
      "ice"
    ],
    "ability": "Clear Body"
  },
  {
    "name": "Registeel",
    "types": [
      "steel"
    ],
    "ability": "Clear Body"
  },
  {
    "name": "Latias",
    "types": [
      "dragon",
      "psychic"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Latios",
    "types": [
      "dragon",
      "psychic"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Kyogre",
    "types": [
      "water"
    ],
    "ability": "Drizzle"
  },
  {
    "name": "Groudon",
    "types": [
      "ground"
    ],
    "ability": "Drought"
  },
  {
    "name": "Rayquaza",
    "types": [
      "dragon",
      "flying"
    ],
    "ability": "Air Lock"
  },
  {
    "name": "Jirachi",
    "types": [
      "steel",
      "psychic"
    ],
    "ability": "Serene Grace"
  },
  {
    "name": "Deoxys",
    "types": [
      "psychic"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Turtwig",
    "types": [
      "grass"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Grotle",
    "types": [
      "grass"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Torterra",
    "types": [
      "grass",
      "ground"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Chimchar",
    "types": [
      "fire"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Monferno",
    "types": [
      "fire",
      "fighting"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Infernape",
    "types": [
      "fire",
      "fighting"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Piplup",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Prinplup",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Empoleon",
    "types": [
      "water",
      "steel"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Starly",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Staravia",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Staraptor",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Bidoof",
    "types": [
      "normal"
    ],
    "ability": "Simple"
  },
  {
    "name": "Bibarel",
    "types": [
      "normal",
      "water"
    ],
    "ability": "Simple"
  },
  {
    "name": "Kricketot",
    "types": [
      "bug"
    ],
    "ability": "Shed Skin"
  },
  {
    "name": "Kricketune",
    "types": [
      "bug"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Shinx",
    "types": [
      "electric"
    ],
    "ability": "Rivalry"
  },
  {
    "name": "Luxio",
    "types": [
      "electric"
    ],
    "ability": "Rivalry"
  },
  {
    "name": "Luxray",
    "types": [
      "electric"
    ],
    "ability": "Rivalry"
  },
  {
    "name": "Budew",
    "types": [
      "grass",
      "poison"
    ],
    "ability": "Natural Cure"
  },
  {
    "name": "Roserade",
    "types": [
      "grass",
      "poison"
    ],
    "ability": "Natural Cure"
  },
  {
    "name": "Cranidos",
    "types": [
      "rock"
    ],
    "ability": "Mold Breaker"
  },
  {
    "name": "Rampardos",
    "types": [
      "rock"
    ],
    "ability": "Mold Breaker"
  },
  {
    "name": "Shieldon",
    "types": [
      "rock",
      "steel"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Bastiodon",
    "types": [
      "rock",
      "steel"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Burmy",
    "types": [
      "bug"
    ],
    "ability": "Shed Skin"
  },
  {
    "name": "Wormadam",
    "types": [
      "bug",
      "grass"
    ],
    "ability": "Anticipation"
  },
  {
    "name": "Mothim",
    "types": [
      "bug",
      "flying"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Combee",
    "types": [
      "bug",
      "flying"
    ],
    "ability": "Honey Gather"
  },
  {
    "name": "Vespiquen",
    "types": [
      "bug",
      "flying"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Pachirisu",
    "types": [
      "electric"
    ],
    "ability": "Run Away"
  },
  {
    "name": "Buizel",
    "types": [
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Floatzel",
    "types": [
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Cherubi",
    "types": [
      "grass"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Cherrim",
    "types": [
      "grass"
    ],
    "ability": "Flower Gift"
  },
  {
    "name": "Shellos",
    "types": [
      "water"
    ],
    "ability": "Sticky Hold"
  },
  {
    "name": "Gastrodon",
    "types": [
      "water",
      "ground"
    ],
    "ability": "Sticky Hold"
  },
  {
    "name": "Ambipom",
    "types": [
      "normal"
    ],
    "ability": "Technician"
  },
  {
    "name": "Drifloon",
    "types": [
      "ghost",
      "flying"
    ],
    "ability": "Aftermath"
  },
  {
    "name": "Drifblim",
    "types": [
      "ghost",
      "flying"
    ],
    "ability": "Aftermath"
  },
  {
    "name": "Buneary",
    "types": [
      "normal"
    ],
    "ability": "Run Away"
  },
  {
    "name": "Lopunny",
    "types": [
      "normal"
    ],
    "ability": "Cute Charm"
  },
  {
    "name": "Mismagius",
    "types": [
      "ghost"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Honchkrow",
    "types": [
      "dark",
      "flying"
    ],
    "ability": "Insomnia"
  },
  {
    "name": "Glameow",
    "types": [
      "normal"
    ],
    "ability": "Limber"
  },
  {
    "name": "Purugly",
    "types": [
      "normal"
    ],
    "ability": "Thick Fat"
  },
  {
    "name": "Chingling",
    "types": [
      "psychic"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Stunky",
    "types": [
      "poison",
      "dark"
    ],
    "ability": "Stench"
  },
  {
    "name": "Skuntank",
    "types": [
      "poison",
      "dark"
    ],
    "ability": "Stench"
  },
  {
    "name": "Bronzor",
    "types": [
      "steel",
      "psychic"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Bronzong",
    "types": [
      "steel",
      "psychic"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Bonsly",
    "types": [
      "rock"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Mime Jr.",
    "types": [
      "psychic",
      "fairy"
    ],
    "ability": "Soundproof"
  },
  {
    "name": "Happiny",
    "types": [
      "normal"
    ],
    "ability": "Natural Cure"
  },
  {
    "name": "Chatot",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Spiritomb",
    "types": [
      "ghost",
      "dark"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Gible",
    "types": [
      "dragon",
      "ground"
    ],
    "ability": "Sand Veil"
  },
  {
    "name": "Gabite",
    "types": [
      "dragon",
      "ground"
    ],
    "ability": "Sand Veil"
  },
  {
    "name": "Garchomp",
    "types": [
      "dragon",
      "ground"
    ],
    "ability": "Sand Veil"
  },
  {
    "name": "Munchlax",
    "types": [
      "normal"
    ],
    "ability": "Pickup"
  },
  {
    "name": "Riolu",
    "types": [
      "fighting"
    ],
    "ability": "Steadfast"
  },
  {
    "name": "Lucario",
    "types": [
      "fighting",
      "steel"
    ],
    "ability": "Steadfast"
  },
  {
    "name": "Hippopotas",
    "types": [
      "ground"
    ],
    "ability": "Sand Stream"
  },
  {
    "name": "Hippowdon",
    "types": [
      "ground"
    ],
    "ability": "Sand Stream"
  },
  {
    "name": "Skorupi",
    "types": [
      "poison",
      "bug"
    ],
    "ability": "Battle Armor"
  },
  {
    "name": "Drapion",
    "types": [
      "poison",
      "dark"
    ],
    "ability": "Battle Armor"
  },
  {
    "name": "Croagunk",
    "types": [
      "poison",
      "fighting"
    ],
    "ability": "Anticipation"
  },
  {
    "name": "Toxicroak",
    "types": [
      "poison",
      "fighting"
    ],
    "ability": "Anticipation"
  },
  {
    "name": "Carnivine",
    "types": [
      "grass"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Finneon",
    "types": [
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Lumineon",
    "types": [
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Mantyke",
    "types": [
      "water",
      "flying"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Snover",
    "types": [
      "grass",
      "ice"
    ],
    "ability": "Snow Warning"
  },
  {
    "name": "Abomasnow",
    "types": [
      "grass",
      "ice"
    ],
    "ability": "Snow Warning"
  },
  {
    "name": "Weavile",
    "types": [
      "dark",
      "ice"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Magnezone",
    "types": [
      "electric",
      "steel"
    ],
    "ability": "Magnet Pull"
  },
  {
    "name": "Lickilicky",
    "types": [
      "normal"
    ],
    "ability": "Own Tempo"
  },
  {
    "name": "Rhyperior",
    "types": [
      "ground",
      "rock"
    ],
    "ability": "Lightning Rod"
  },
  {
    "name": "Tangrowth",
    "types": [
      "grass"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Electivire",
    "types": [
      "electric"
    ],
    "ability": "Motor Drive"
  },
  {
    "name": "Magmortar",
    "types": [
      "fire"
    ],
    "ability": "Flame Body"
  },
  {
    "name": "Togekiss",
    "types": [
      "fairy",
      "flying"
    ],
    "ability": "Hustle"
  },
  {
    "name": "Yanmega",
    "types": [
      "bug",
      "flying"
    ],
    "ability": "Speed Boost"
  },
  {
    "name": "Leafeon",
    "types": [
      "grass"
    ],
    "ability": "Leaf Guard"
  },
  {
    "name": "Glaceon",
    "types": [
      "ice"
    ],
    "ability": "Snow Cloak"
  },
  {
    "name": "Gliscor",
    "types": [
      "ground",
      "flying"
    ],
    "ability": "Hyper Cutter"
  },
  {
    "name": "Mamoswine",
    "types": [
      "ice",
      "ground"
    ],
    "ability": "Oblivious"
  },
  {
    "name": "Porygon-Z",
    "types": [
      "normal"
    ],
    "ability": "Adaptability"
  },
  {
    "name": "Gallade",
    "types": [
      "psychic",
      "fighting"
    ],
    "ability": "Steadfast"
  },
  {
    "name": "Probopass",
    "types": [
      "rock",
      "steel"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Dusknoir",
    "types": [
      "ghost"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Froslass",
    "types": [
      "ice",
      "ghost"
    ],
    "ability": "Snow Cloak"
  },
  {
    "name": "Rotom",
    "types": [
      "electric",
      "ghost"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Uxie",
    "types": [
      "psychic"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Mesprit",
    "types": [
      "psychic"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Azelf",
    "types": [
      "psychic"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Dialga",
    "types": [
      "steel",
      "dragon"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Palkia",
    "types": [
      "water",
      "dragon"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Heatran",
    "types": [
      "fire",
      "steel"
    ],
    "ability": "Flash Fire"
  },
  {
    "name": "Regigigas",
    "types": [
      "normal"
    ],
    "ability": "Slow Start"
  },
  {
    "name": "Giratina",
    "types": [
      "ghost",
      "dragon"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Cresselia",
    "types": [
      "psychic"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Phione",
    "types": [
      "water"
    ],
    "ability": "Hydration"
  },
  {
    "name": "Manaphy",
    "types": [
      "water"
    ],
    "ability": "Hydration"
  },
  {
    "name": "Darkrai",
    "types": [
      "dark"
    ],
    "ability": "Bad Dreams"
  },
  {
    "name": "Shaymin",
    "types": [
      "grass"
    ],
    "ability": "Natural Cure"
  },
  {
    "name": "Arceus",
    "types": [
      "normal"
    ],
    "ability": "Multitype"
  },
  {
    "name": "Victini",
    "types": [
      "psychic",
      "fire"
    ],
    "ability": "Victory Star"
  },
  {
    "name": "Snivy",
    "types": [
      "grass"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Servine",
    "types": [
      "grass"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Serperior",
    "types": [
      "grass"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Tepig",
    "types": [
      "fire"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Pignite",
    "types": [
      "fire",
      "fighting"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Emboar",
    "types": [
      "fire",
      "fighting"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Oshawott",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Dewott",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Samurott",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Patrat",
    "types": [
      "normal"
    ],
    "ability": "Run Away"
  },
  {
    "name": "Watchog",
    "types": [
      "normal"
    ],
    "ability": "Illuminate"
  },
  {
    "name": "Lillipup",
    "types": [
      "normal"
    ],
    "ability": "Vital Spirit"
  },
  {
    "name": "Herdier",
    "types": [
      "normal"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Stoutland",
    "types": [
      "normal"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Purrloin",
    "types": [
      "dark"
    ],
    "ability": "Limber"
  },
  {
    "name": "Liepard",
    "types": [
      "dark"
    ],
    "ability": "Limber"
  },
  {
    "name": "Pansage",
    "types": [
      "grass"
    ],
    "ability": "Gluttony"
  },
  {
    "name": "Simisage",
    "types": [
      "grass"
    ],
    "ability": "Gluttony"
  },
  {
    "name": "Pansear",
    "types": [
      "fire"
    ],
    "ability": "Gluttony"
  },
  {
    "name": "Simisear",
    "types": [
      "fire"
    ],
    "ability": "Gluttony"
  },
  {
    "name": "Panpour",
    "types": [
      "water"
    ],
    "ability": "Gluttony"
  },
  {
    "name": "Simipour",
    "types": [
      "water"
    ],
    "ability": "Gluttony"
  },
  {
    "name": "Munna",
    "types": [
      "psychic"
    ],
    "ability": "Forewarn"
  },
  {
    "name": "Musharna",
    "types": [
      "psychic"
    ],
    "ability": "Forewarn"
  },
  {
    "name": "Pidove",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Big Pecks"
  },
  {
    "name": "Tranquill",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Big Pecks"
  },
  {
    "name": "Unfezant",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Big Pecks"
  },
  {
    "name": "Blitzle",
    "types": [
      "electric"
    ],
    "ability": "Lightning Rod"
  },
  {
    "name": "Zebstrika",
    "types": [
      "electric"
    ],
    "ability": "Lightning Rod"
  },
  {
    "name": "Roggenrola",
    "types": [
      "rock"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Boldore",
    "types": [
      "rock"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Gigalith",
    "types": [
      "rock"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Woobat",
    "types": [
      "psychic",
      "flying"
    ],
    "ability": "Unaware"
  },
  {
    "name": "Swoobat",
    "types": [
      "psychic",
      "flying"
    ],
    "ability": "Unaware"
  },
  {
    "name": "Drilbur",
    "types": [
      "ground"
    ],
    "ability": "Sand Rush"
  },
  {
    "name": "Excadrill",
    "types": [
      "ground",
      "steel"
    ],
    "ability": "Sand Rush"
  },
  {
    "name": "Audino",
    "types": [
      "normal"
    ],
    "ability": "Healer"
  },
  {
    "name": "Timburr",
    "types": [
      "fighting"
    ],
    "ability": "Guts"
  },
  {
    "name": "Gurdurr",
    "types": [
      "fighting"
    ],
    "ability": "Guts"
  },
  {
    "name": "Conkeldurr",
    "types": [
      "fighting"
    ],
    "ability": "Guts"
  },
  {
    "name": "Tympole",
    "types": [
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Palpitoad",
    "types": [
      "water",
      "ground"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Seismitoad",
    "types": [
      "water",
      "ground"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Throh",
    "types": [
      "fighting"
    ],
    "ability": "Guts"
  },
  {
    "name": "Sawk",
    "types": [
      "fighting"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Sewaddle",
    "types": [
      "bug",
      "grass"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Swadloon",
    "types": [
      "bug",
      "grass"
    ],
    "ability": "Leaf Guard"
  },
  {
    "name": "Leavanny",
    "types": [
      "bug",
      "grass"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Venipede",
    "types": [
      "bug",
      "poison"
    ],
    "ability": "Poison Point"
  },
  {
    "name": "Whirlipede",
    "types": [
      "bug",
      "poison"
    ],
    "ability": "Poison Point"
  },
  {
    "name": "Scolipede",
    "types": [
      "bug",
      "poison"
    ],
    "ability": "Poison Point"
  },
  {
    "name": "Cottonee",
    "types": [
      "grass",
      "fairy"
    ],
    "ability": "Prankster"
  },
  {
    "name": "Whimsicott",
    "types": [
      "grass",
      "fairy"
    ],
    "ability": "Prankster"
  },
  {
    "name": "Petilil",
    "types": [
      "grass"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Lilligant",
    "types": [
      "grass"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Basculin",
    "types": [
      "water"
    ],
    "ability": "Reckless"
  },
  {
    "name": "Sandile",
    "types": [
      "ground",
      "dark"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Krokorok",
    "types": [
      "ground",
      "dark"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Krookodile",
    "types": [
      "ground",
      "dark"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Darumaka",
    "types": [
      "fire"
    ],
    "ability": "Hustle"
  },
  {
    "name": "Darmanitan",
    "types": [
      "fire"
    ],
    "ability": "Sheer Force"
  },
  {
    "name": "Maractus",
    "types": [
      "grass"
    ],
    "ability": "Water Absorb"
  },
  {
    "name": "Dwebble",
    "types": [
      "bug",
      "rock"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Crustle",
    "types": [
      "bug",
      "rock"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Scraggy",
    "types": [
      "dark",
      "fighting"
    ],
    "ability": "Shed Skin"
  },
  {
    "name": "Scrafty",
    "types": [
      "dark",
      "fighting"
    ],
    "ability": "Shed Skin"
  },
  {
    "name": "Sigilyph",
    "types": [
      "psychic",
      "flying"
    ],
    "ability": "Wonder Skin"
  },
  {
    "name": "Yamask",
    "types": [
      "ghost"
    ],
    "ability": "Mummy"
  },
  {
    "name": "Cofagrigus",
    "types": [
      "ghost"
    ],
    "ability": "Mummy"
  },
  {
    "name": "Tirtouga",
    "types": [
      "water",
      "rock"
    ],
    "ability": "Solid Rock"
  },
  {
    "name": "Carracosta",
    "types": [
      "water",
      "rock"
    ],
    "ability": "Solid Rock"
  },
  {
    "name": "Archen",
    "types": [
      "rock",
      "flying"
    ],
    "ability": "Defeatist"
  },
  {
    "name": "Archeops",
    "types": [
      "rock",
      "flying"
    ],
    "ability": "Defeatist"
  },
  {
    "name": "Trubbish",
    "types": [
      "poison"
    ],
    "ability": "Stench"
  },
  {
    "name": "Garbodor",
    "types": [
      "poison"
    ],
    "ability": "Stench"
  },
  {
    "name": "Zorua",
    "types": [
      "dark"
    ],
    "ability": "Illusion"
  },
  {
    "name": "Zoroark",
    "types": [
      "dark"
    ],
    "ability": "Illusion"
  },
  {
    "name": "Minccino",
    "types": [
      "normal"
    ],
    "ability": "Cute Charm"
  },
  {
    "name": "Cinccino",
    "types": [
      "normal"
    ],
    "ability": "Cute Charm"
  },
  {
    "name": "Gothita",
    "types": [
      "psychic"
    ],
    "ability": "Frisk"
  },
  {
    "name": "Gothorita",
    "types": [
      "psychic"
    ],
    "ability": "Frisk"
  },
  {
    "name": "Gothitelle",
    "types": [
      "psychic"
    ],
    "ability": "Frisk"
  },
  {
    "name": "Solosis",
    "types": [
      "psychic"
    ],
    "ability": "Overcoat"
  },
  {
    "name": "Duosion",
    "types": [
      "psychic"
    ],
    "ability": "Overcoat"
  },
  {
    "name": "Reuniclus",
    "types": [
      "psychic"
    ],
    "ability": "Overcoat"
  },
  {
    "name": "Ducklett",
    "types": [
      "water",
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Swanna",
    "types": [
      "water",
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Vanillite",
    "types": [
      "ice"
    ],
    "ability": "Ice Body"
  },
  {
    "name": "Vanillish",
    "types": [
      "ice"
    ],
    "ability": "Ice Body"
  },
  {
    "name": "Vanilluxe",
    "types": [
      "ice"
    ],
    "ability": "Ice Body"
  },
  {
    "name": "Deerling",
    "types": [
      "normal",
      "grass"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Sawsbuck",
    "types": [
      "normal",
      "grass"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Emolga",
    "types": [
      "electric",
      "flying"
    ],
    "ability": "Static"
  },
  {
    "name": "Karrablast",
    "types": [
      "bug"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Escavalier",
    "types": [
      "bug",
      "steel"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Foongus",
    "types": [
      "grass",
      "poison"
    ],
    "ability": "Effect Spore"
  },
  {
    "name": "Amoonguss",
    "types": [
      "grass",
      "poison"
    ],
    "ability": "Effect Spore"
  },
  {
    "name": "Frillish",
    "types": [
      "water",
      "ghost"
    ],
    "ability": "Water Absorb"
  },
  {
    "name": "Jellicent",
    "types": [
      "water",
      "ghost"
    ],
    "ability": "Water Absorb"
  },
  {
    "name": "Alomomola",
    "types": [
      "water"
    ],
    "ability": "Healer"
  },
  {
    "name": "Joltik",
    "types": [
      "bug",
      "electric"
    ],
    "ability": "Compound Eyes"
  },
  {
    "name": "Galvantula",
    "types": [
      "bug",
      "electric"
    ],
    "ability": "Compound Eyes"
  },
  {
    "name": "Ferroseed",
    "types": [
      "grass",
      "steel"
    ],
    "ability": "Iron Barbs"
  },
  {
    "name": "Ferrothorn",
    "types": [
      "grass",
      "steel"
    ],
    "ability": "Iron Barbs"
  },
  {
    "name": "Klink",
    "types": [
      "steel"
    ],
    "ability": "Plus"
  },
  {
    "name": "Klang",
    "types": [
      "steel"
    ],
    "ability": "Plus"
  },
  {
    "name": "Klinklang",
    "types": [
      "steel"
    ],
    "ability": "Plus"
  },
  {
    "name": "Tynamo",
    "types": [
      "electric"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Eelektrik",
    "types": [
      "electric"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Eelektross",
    "types": [
      "electric"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Elgyem",
    "types": [
      "psychic"
    ],
    "ability": "Telepathy"
  },
  {
    "name": "Beheeyem",
    "types": [
      "psychic"
    ],
    "ability": "Telepathy"
  },
  {
    "name": "Litwick",
    "types": [
      "ghost",
      "fire"
    ],
    "ability": "Flash Fire"
  },
  {
    "name": "Lampent",
    "types": [
      "ghost",
      "fire"
    ],
    "ability": "Flash Fire"
  },
  {
    "name": "Chandelure",
    "types": [
      "ghost",
      "fire"
    ],
    "ability": "Flash Fire"
  },
  {
    "name": "Axew",
    "types": [
      "dragon"
    ],
    "ability": "Rivalry"
  },
  {
    "name": "Fraxure",
    "types": [
      "dragon"
    ],
    "ability": "Rivalry"
  },
  {
    "name": "Haxorus",
    "types": [
      "dragon"
    ],
    "ability": "Rivalry"
  },
  {
    "name": "Cubchoo",
    "types": [
      "ice"
    ],
    "ability": "Snow Cloak"
  },
  {
    "name": "Beartic",
    "types": [
      "ice"
    ],
    "ability": "Snow Cloak"
  },
  {
    "name": "Cryogonal",
    "types": [
      "ice"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Shelmet",
    "types": [
      "bug"
    ],
    "ability": "Hydration"
  },
  {
    "name": "Accelgor",
    "types": [
      "bug"
    ],
    "ability": "Hydration"
  },
  {
    "name": "Stunfisk",
    "types": [
      "ground",
      "electric"
    ],
    "ability": "Static"
  },
  {
    "name": "Mienfoo",
    "types": [
      "fighting"
    ],
    "ability": "Inner Focus"
  },
  {
    "name": "Mienshao",
    "types": [
      "fighting"
    ],
    "ability": "Inner Focus"
  },
  {
    "name": "Druddigon",
    "types": [
      "dragon"
    ],
    "ability": "Rough Skin"
  },
  {
    "name": "Golett",
    "types": [
      "ground",
      "ghost"
    ],
    "ability": "Iron Fist"
  },
  {
    "name": "Golurk",
    "types": [
      "ground",
      "ghost"
    ],
    "ability": "Iron Fist"
  },
  {
    "name": "Pawniard",
    "types": [
      "dark",
      "steel"
    ],
    "ability": "Defiant"
  },
  {
    "name": "Bisharp",
    "types": [
      "dark",
      "steel"
    ],
    "ability": "Defiant"
  },
  {
    "name": "Bouffalant",
    "types": [
      "normal"
    ],
    "ability": "Reckless"
  },
  {
    "name": "Rufflet",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Braviary",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Vullaby",
    "types": [
      "dark",
      "flying"
    ],
    "ability": "Big Pecks"
  },
  {
    "name": "Mandibuzz",
    "types": [
      "dark",
      "flying"
    ],
    "ability": "Big Pecks"
  },
  {
    "name": "Heatmor",
    "types": [
      "fire"
    ],
    "ability": "Gluttony"
  },
  {
    "name": "Durant",
    "types": [
      "bug",
      "steel"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Deino",
    "types": [
      "dark",
      "dragon"
    ],
    "ability": "Hustle"
  },
  {
    "name": "Zweilous",
    "types": [
      "dark",
      "dragon"
    ],
    "ability": "Hustle"
  },
  {
    "name": "Hydreigon",
    "types": [
      "dark",
      "dragon"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Larvesta",
    "types": [
      "bug",
      "fire"
    ],
    "ability": "Flame Body"
  },
  {
    "name": "Volcarona",
    "types": [
      "bug",
      "fire"
    ],
    "ability": "Flame Body"
  },
  {
    "name": "Cobalion",
    "types": [
      "steel",
      "fighting"
    ],
    "ability": "Justified"
  },
  {
    "name": "Terrakion",
    "types": [
      "rock",
      "fighting"
    ],
    "ability": "Justified"
  },
  {
    "name": "Virizion",
    "types": [
      "grass",
      "fighting"
    ],
    "ability": "Justified"
  },
  {
    "name": "Tornadus",
    "types": [
      "flying"
    ],
    "ability": "Prankster"
  },
  {
    "name": "Thundurus",
    "types": [
      "electric",
      "flying"
    ],
    "ability": "Prankster"
  },
  {
    "name": "Reshiram",
    "types": [
      "dragon",
      "fire"
    ],
    "ability": "Turboblaze"
  },
  {
    "name": "Zekrom",
    "types": [
      "dragon",
      "electric"
    ],
    "ability": "Teravolt"
  },
  {
    "name": "Landorus",
    "types": [
      "ground",
      "flying"
    ],
    "ability": "Sand Force"
  },
  {
    "name": "Kyurem",
    "types": [
      "dragon",
      "ice"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Keldeo",
    "types": [
      "water",
      "fighting"
    ],
    "ability": "Justified"
  },
  {
    "name": "Meloetta",
    "types": [
      "normal",
      "psychic"
    ],
    "ability": "Serene Grace"
  },
  {
    "name": "Genesect",
    "types": [
      "bug",
      "steel"
    ],
    "ability": "Download"
  },
  {
    "name": "Chespin",
    "types": [
      "grass"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Quilladin",
    "types": [
      "grass"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Chesnaught",
    "types": [
      "grass",
      "fighting"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Fennekin",
    "types": [
      "fire"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Braixen",
    "types": [
      "fire"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Delphox",
    "types": [
      "fire",
      "psychic"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Froakie",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Frogadier",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Greninja",
    "types": [
      "water",
      "dark"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Bunnelby",
    "types": [
      "normal"
    ],
    "ability": "Pickup"
  },
  {
    "name": "Diggersby",
    "types": [
      "normal",
      "ground"
    ],
    "ability": "Pickup"
  },
  {
    "name": "Fletchling",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Big Pecks"
  },
  {
    "name": "Fletchinder",
    "types": [
      "fire",
      "flying"
    ],
    "ability": "Flame Body"
  },
  {
    "name": "Talonflame",
    "types": [
      "fire",
      "flying"
    ],
    "ability": "Flame Body"
  },
  {
    "name": "Scatterbug",
    "types": [
      "bug"
    ],
    "ability": "Shield Dust"
  },
  {
    "name": "Spewpa",
    "types": [
      "bug"
    ],
    "ability": "Shed Skin"
  },
  {
    "name": "Vivillon",
    "types": [
      "bug",
      "flying"
    ],
    "ability": "Shield Dust"
  },
  {
    "name": "Litleo",
    "types": [
      "fire",
      "normal"
    ],
    "ability": "Rivalry"
  },
  {
    "name": "Pyroar",
    "types": [
      "fire",
      "normal"
    ],
    "ability": "Rivalry"
  },
  {
    "name": "Flabébé",
    "types": [
      "fairy"
    ],
    "ability": "Flower Veil"
  },
  {
    "name": "Floette",
    "types": [
      "fairy"
    ],
    "ability": "Flower Veil"
  },
  {
    "name": "Florges",
    "types": [
      "fairy"
    ],
    "ability": "Flower Veil"
  },
  {
    "name": "Skiddo",
    "types": [
      "grass"
    ],
    "ability": "Sap Sipper"
  },
  {
    "name": "Gogoat",
    "types": [
      "grass"
    ],
    "ability": "Sap Sipper"
  },
  {
    "name": "Pancham",
    "types": [
      "fighting"
    ],
    "ability": "Iron Fist"
  },
  {
    "name": "Pangoro",
    "types": [
      "fighting",
      "dark"
    ],
    "ability": "Iron Fist"
  },
  {
    "name": "Furfrou",
    "types": [
      "normal"
    ],
    "ability": "Fur Coat"
  },
  {
    "name": "Espurr",
    "types": [
      "psychic"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Meowstic",
    "types": [
      "psychic"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Honedge",
    "types": [
      "steel",
      "ghost"
    ],
    "ability": "No Guard"
  },
  {
    "name": "Doublade",
    "types": [
      "steel",
      "ghost"
    ],
    "ability": "No Guard"
  },
  {
    "name": "Aegislash",
    "types": [
      "steel",
      "ghost"
    ],
    "ability": "Stance Change"
  },
  {
    "name": "Spritzee",
    "types": [
      "fairy"
    ],
    "ability": "Healer"
  },
  {
    "name": "Aromatisse",
    "types": [
      "fairy"
    ],
    "ability": "Healer"
  },
  {
    "name": "Swirlix",
    "types": [
      "fairy"
    ],
    "ability": "Sweet Veil"
  },
  {
    "name": "Slurpuff",
    "types": [
      "fairy"
    ],
    "ability": "Sweet Veil"
  },
  {
    "name": "Inkay",
    "types": [
      "dark",
      "psychic"
    ],
    "ability": "Contrary"
  },
  {
    "name": "Malamar",
    "types": [
      "dark",
      "psychic"
    ],
    "ability": "Contrary"
  },
  {
    "name": "Binacle",
    "types": [
      "rock",
      "water"
    ],
    "ability": "Tough Claws"
  },
  {
    "name": "Barbaracle",
    "types": [
      "rock",
      "water"
    ],
    "ability": "Tough Claws"
  },
  {
    "name": "Skrelp",
    "types": [
      "poison",
      "water"
    ],
    "ability": "Poison Point"
  },
  {
    "name": "Dragalge",
    "types": [
      "poison",
      "dragon"
    ],
    "ability": "Poison Point"
  },
  {
    "name": "Clauncher",
    "types": [
      "water"
    ],
    "ability": "Mega Launcher"
  },
  {
    "name": "Clawitzer",
    "types": [
      "water"
    ],
    "ability": "Mega Launcher"
  },
  {
    "name": "Helioptile",
    "types": [
      "electric",
      "normal"
    ],
    "ability": "Dry Skin"
  },
  {
    "name": "Heliolisk",
    "types": [
      "electric",
      "normal"
    ],
    "ability": "Dry Skin"
  },
  {
    "name": "Tyrunt",
    "types": [
      "rock",
      "dragon"
    ],
    "ability": "Strong Jaw"
  },
  {
    "name": "Tyrantrum",
    "types": [
      "rock",
      "dragon"
    ],
    "ability": "Strong Jaw"
  },
  {
    "name": "Amaura",
    "types": [
      "rock",
      "ice"
    ],
    "ability": "Refrigerate"
  },
  {
    "name": "Aurorus",
    "types": [
      "rock",
      "ice"
    ],
    "ability": "Refrigerate"
  },
  {
    "name": "Sylveon",
    "types": [
      "fairy"
    ],
    "ability": "Cute Charm"
  },
  {
    "name": "Hawlucha",
    "types": [
      "fighting",
      "flying"
    ],
    "ability": "Limber"
  },
  {
    "name": "Dedenne",
    "types": [
      "electric",
      "fairy"
    ],
    "ability": "Cheek Pouch"
  },
  {
    "name": "Carbink",
    "types": [
      "rock",
      "fairy"
    ],
    "ability": "Clear Body"
  },
  {
    "name": "Goomy",
    "types": [
      "dragon"
    ],
    "ability": "Sap Sipper"
  },
  {
    "name": "Sliggoo",
    "types": [
      "dragon"
    ],
    "ability": "Sap Sipper"
  },
  {
    "name": "Goodra",
    "types": [
      "dragon"
    ],
    "ability": "Sap Sipper"
  },
  {
    "name": "Klefki",
    "types": [
      "steel",
      "fairy"
    ],
    "ability": "Prankster"
  },
  {
    "name": "Phantump",
    "types": [
      "ghost",
      "grass"
    ],
    "ability": "Natural Cure"
  },
  {
    "name": "Trevenant",
    "types": [
      "ghost",
      "grass"
    ],
    "ability": "Natural Cure"
  },
  {
    "name": "Pumpkaboo",
    "types": [
      "ghost",
      "grass"
    ],
    "ability": "Pickup"
  },
  {
    "name": "Gourgeist",
    "types": [
      "ghost",
      "grass"
    ],
    "ability": "Pickup"
  },
  {
    "name": "Bergmite",
    "types": [
      "ice"
    ],
    "ability": "Own Tempo"
  },
  {
    "name": "Avalugg",
    "types": [
      "ice"
    ],
    "ability": "Own Tempo"
  },
  {
    "name": "Noibat",
    "types": [
      "flying",
      "dragon"
    ],
    "ability": "Frisk"
  },
  {
    "name": "Noivern",
    "types": [
      "flying",
      "dragon"
    ],
    "ability": "Frisk"
  },
  {
    "name": "Xerneas",
    "types": [
      "fairy"
    ],
    "ability": "Fairy Aura"
  },
  {
    "name": "Yveltal",
    "types": [
      "dark",
      "flying"
    ],
    "ability": "Dark Aura"
  },
  {
    "name": "Zygarde",
    "types": [
      "dragon",
      "ground"
    ],
    "ability": "Aura Break"
  },
  {
    "name": "Diancie",
    "types": [
      "rock",
      "fairy"
    ],
    "ability": "Clear Body"
  },
  {
    "name": "Hoopa",
    "types": [
      "psychic",
      "ghost"
    ],
    "ability": "Magician"
  },
  {
    "name": "Volcanion",
    "types": [
      "fire",
      "water"
    ],
    "ability": "Water Absorb"
  },
  {
    "name": "Rowlet",
    "types": [
      "grass",
      "flying"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Dartrix",
    "types": [
      "grass",
      "flying"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Decidueye",
    "types": [
      "grass",
      "ghost"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Litten",
    "types": [
      "fire"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Torracat",
    "types": [
      "fire"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Incineroar",
    "types": [
      "fire",
      "dark"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Popplio",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Brionne",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Primarina",
    "types": [
      "water",
      "fairy"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Pikipek",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Trumbeak",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Toucannon",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Yungoos",
    "types": [
      "normal"
    ],
    "ability": "Stakeout"
  },
  {
    "name": "Gumshoos",
    "types": [
      "normal"
    ],
    "ability": "Stakeout"
  },
  {
    "name": "Grubbin",
    "types": [
      "bug"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Charjabug",
    "types": [
      "bug",
      "electric"
    ],
    "ability": "Battery"
  },
  {
    "name": "Vikavolt",
    "types": [
      "bug",
      "electric"
    ],
    "ability": "Levitate"
  },
  {
    "name": "Crabrawler",
    "types": [
      "fighting"
    ],
    "ability": "Hyper Cutter"
  },
  {
    "name": "Crabominable",
    "types": [
      "fighting",
      "ice"
    ],
    "ability": "Hyper Cutter"
  },
  {
    "name": "Oricorio",
    "types": [
      "fire",
      "flying"
    ],
    "ability": "Dancer"
  },
  {
    "name": "Cutiefly",
    "types": [
      "bug",
      "fairy"
    ],
    "ability": "Honey Gather"
  },
  {
    "name": "Ribombee",
    "types": [
      "bug",
      "fairy"
    ],
    "ability": "Honey Gather"
  },
  {
    "name": "Rockruff",
    "types": [
      "rock"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Lycanroc",
    "types": [
      "rock"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Wishiwashi",
    "types": [
      "water"
    ],
    "ability": "Schooling"
  },
  {
    "name": "Mareanie",
    "types": [
      "poison",
      "water"
    ],
    "ability": "Merciless"
  },
  {
    "name": "Toxapex",
    "types": [
      "poison",
      "water"
    ],
    "ability": "Merciless"
  },
  {
    "name": "Mudbray",
    "types": [
      "ground"
    ],
    "ability": "Own Tempo"
  },
  {
    "name": "Mudsdale",
    "types": [
      "ground"
    ],
    "ability": "Own Tempo"
  },
  {
    "name": "Dewpider",
    "types": [
      "water",
      "bug"
    ],
    "ability": "Water Bubble"
  },
  {
    "name": "Araquanid",
    "types": [
      "water",
      "bug"
    ],
    "ability": "Water Bubble"
  },
  {
    "name": "Fomantis",
    "types": [
      "grass"
    ],
    "ability": "Leaf Guard"
  },
  {
    "name": "Lurantis",
    "types": [
      "grass"
    ],
    "ability": "Leaf Guard"
  },
  {
    "name": "Morelull",
    "types": [
      "grass",
      "fairy"
    ],
    "ability": "Illuminate"
  },
  {
    "name": "Shiinotic",
    "types": [
      "grass",
      "fairy"
    ],
    "ability": "Illuminate"
  },
  {
    "name": "Salandit",
    "types": [
      "poison",
      "fire"
    ],
    "ability": "Corrosion"
  },
  {
    "name": "Salazzle",
    "types": [
      "poison",
      "fire"
    ],
    "ability": "Corrosion"
  },
  {
    "name": "Stufful",
    "types": [
      "normal",
      "fighting"
    ],
    "ability": "Fluffy"
  },
  {
    "name": "Bewear",
    "types": [
      "normal",
      "fighting"
    ],
    "ability": "Fluffy"
  },
  {
    "name": "Bounsweet",
    "types": [
      "grass"
    ],
    "ability": "Leaf Guard"
  },
  {
    "name": "Steenee",
    "types": [
      "grass"
    ],
    "ability": "Leaf Guard"
  },
  {
    "name": "Tsareena",
    "types": [
      "grass"
    ],
    "ability": "Leaf Guard"
  },
  {
    "name": "Comfey",
    "types": [
      "fairy"
    ],
    "ability": "Flower Veil"
  },
  {
    "name": "Oranguru",
    "types": [
      "normal",
      "psychic"
    ],
    "ability": "Inner Focus"
  },
  {
    "name": "Passimian",
    "types": [
      "fighting"
    ],
    "ability": "Receiver"
  },
  {
    "name": "Wimpod",
    "types": [
      "bug",
      "water"
    ],
    "ability": "Wimp Out"
  },
  {
    "name": "Golisopod",
    "types": [
      "bug",
      "water"
    ],
    "ability": "Emergency Exit"
  },
  {
    "name": "Sandygast",
    "types": [
      "ghost",
      "ground"
    ],
    "ability": "Water Compaction"
  },
  {
    "name": "Palossand",
    "types": [
      "ghost",
      "ground"
    ],
    "ability": "Water Compaction"
  },
  {
    "name": "Pyukumuku",
    "types": [
      "water"
    ],
    "ability": "Innards Out"
  },
  {
    "name": "Type: Null",
    "types": [
      "normal"
    ],
    "ability": "Battle Armor"
  },
  {
    "name": "Silvally",
    "types": [
      "normal"
    ],
    "ability": "Rks System"
  },
  {
    "name": "Minior",
    "types": [
      "rock",
      "flying"
    ],
    "ability": "Shields Down"
  },
  {
    "name": "Komala",
    "types": [
      "normal"
    ],
    "ability": "Comatose"
  },
  {
    "name": "Turtonator",
    "types": [
      "fire",
      "dragon"
    ],
    "ability": "Shell Armor"
  },
  {
    "name": "Togedemaru",
    "types": [
      "electric",
      "steel"
    ],
    "ability": "Iron Barbs"
  },
  {
    "name": "Mimikyu",
    "types": [
      "ghost",
      "fairy"
    ],
    "ability": "Disguise"
  },
  {
    "name": "Bruxish",
    "types": [
      "water",
      "psychic"
    ],
    "ability": "Dazzling"
  },
  {
    "name": "Drampa",
    "types": [
      "normal",
      "dragon"
    ],
    "ability": "Berserk"
  },
  {
    "name": "Dhelmise",
    "types": [
      "ghost",
      "grass"
    ],
    "ability": "Steelworker"
  },
  {
    "name": "Jangmo-o",
    "types": [
      "dragon"
    ],
    "ability": "Bulletproof"
  },
  {
    "name": "Hakamo-o",
    "types": [
      "dragon",
      "fighting"
    ],
    "ability": "Bulletproof"
  },
  {
    "name": "Kommo-o",
    "types": [
      "dragon",
      "fighting"
    ],
    "ability": "Bulletproof"
  },
  {
    "name": "Tapu Koko",
    "types": [
      "electric",
      "fairy"
    ],
    "ability": "Electric Surge"
  },
  {
    "name": "Tapu Lele",
    "types": [
      "psychic",
      "fairy"
    ],
    "ability": "Psychic Surge"
  },
  {
    "name": "Tapu Bulu",
    "types": [
      "grass",
      "fairy"
    ],
    "ability": "Grassy Surge"
  },
  {
    "name": "Tapu Fini",
    "types": [
      "water",
      "fairy"
    ],
    "ability": "Misty Surge"
  },
  {
    "name": "Cosmog",
    "types": [
      "psychic"
    ],
    "ability": "Unaware"
  },
  {
    "name": "Cosmoem",
    "types": [
      "psychic"
    ],
    "ability": "Sturdy"
  },
  {
    "name": "Solgaleo",
    "types": [
      "psychic",
      "steel"
    ],
    "ability": "Full Metal Body"
  },
  {
    "name": "Lunala",
    "types": [
      "psychic",
      "ghost"
    ],
    "ability": "Shadow Shield"
  },
  {
    "name": "Nihilego",
    "types": [
      "rock",
      "poison"
    ],
    "ability": "Beast Boost"
  },
  {
    "name": "Buzzwole",
    "types": [
      "bug",
      "fighting"
    ],
    "ability": "Beast Boost"
  },
  {
    "name": "Pheromosa",
    "types": [
      "bug",
      "fighting"
    ],
    "ability": "Beast Boost"
  },
  {
    "name": "Xurkitree",
    "types": [
      "electric"
    ],
    "ability": "Beast Boost"
  },
  {
    "name": "Celesteela",
    "types": [
      "steel",
      "flying"
    ],
    "ability": "Beast Boost"
  },
  {
    "name": "Kartana",
    "types": [
      "grass",
      "steel"
    ],
    "ability": "Beast Boost"
  },
  {
    "name": "Guzzlord",
    "types": [
      "dark",
      "dragon"
    ],
    "ability": "Beast Boost"
  },
  {
    "name": "Necrozma",
    "types": [
      "psychic"
    ],
    "ability": "Prism Armor"
  },
  {
    "name": "Magearna",
    "types": [
      "steel",
      "fairy"
    ],
    "ability": "Soul Heart"
  },
  {
    "name": "Marshadow",
    "types": [
      "fighting",
      "ghost"
    ],
    "ability": "Technician"
  },
  {
    "name": "Poipole",
    "types": [
      "poison"
    ],
    "ability": "Beast Boost"
  },
  {
    "name": "Naganadel",
    "types": [
      "poison",
      "dragon"
    ],
    "ability": "Beast Boost"
  },
  {
    "name": "Stakataka",
    "types": [
      "rock",
      "steel"
    ],
    "ability": "Beast Boost"
  },
  {
    "name": "Blacephalon",
    "types": [
      "fire",
      "ghost"
    ],
    "ability": "Beast Boost"
  },
  {
    "name": "Zeraora",
    "types": [
      "electric"
    ],
    "ability": "Volt Absorb"
  },
  {
    "name": "Meltan",
    "types": [
      "steel"
    ],
    "ability": "Magnet Pull"
  },
  {
    "name": "Melmetal",
    "types": [
      "steel"
    ],
    "ability": "Iron Fist"
  },
  {
    "name": "Grookey",
    "types": [
      "grass"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Thwackey",
    "types": [
      "grass"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Rillaboom",
    "types": [
      "grass"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Scorbunny",
    "types": [
      "fire"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Raboot",
    "types": [
      "fire"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Cinderace",
    "types": [
      "fire"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Sobble",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Drizzile",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Inteleon",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Skwovet",
    "types": [
      "normal"
    ],
    "ability": "Cheek Pouch"
  },
  {
    "name": "Greedent",
    "types": [
      "normal"
    ],
    "ability": "Cheek Pouch"
  },
  {
    "name": "Rookidee",
    "types": [
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Corvisquire",
    "types": [
      "flying"
    ],
    "ability": "Keen Eye"
  },
  {
    "name": "Corviknight",
    "types": [
      "flying",
      "steel"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Blipbug",
    "types": [
      "bug"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Dottler",
    "types": [
      "bug",
      "psychic"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Orbeetle",
    "types": [
      "bug",
      "psychic"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Nickit",
    "types": [
      "dark"
    ],
    "ability": "Run Away"
  },
  {
    "name": "Thievul",
    "types": [
      "dark"
    ],
    "ability": "Run Away"
  },
  {
    "name": "Gossifleur",
    "types": [
      "grass"
    ],
    "ability": "Cotton Down"
  },
  {
    "name": "Eldegoss",
    "types": [
      "grass"
    ],
    "ability": "Cotton Down"
  },
  {
    "name": "Wooloo",
    "types": [
      "normal"
    ],
    "ability": "Fluffy"
  },
  {
    "name": "Dubwool",
    "types": [
      "normal"
    ],
    "ability": "Fluffy"
  },
  {
    "name": "Chewtle",
    "types": [
      "water"
    ],
    "ability": "Strong Jaw"
  },
  {
    "name": "Drednaw",
    "types": [
      "water",
      "rock"
    ],
    "ability": "Strong Jaw"
  },
  {
    "name": "Yamper",
    "types": [
      "electric"
    ],
    "ability": "Ball Fetch"
  },
  {
    "name": "Boltund",
    "types": [
      "electric"
    ],
    "ability": "Strong Jaw"
  },
  {
    "name": "Rolycoly",
    "types": [
      "rock"
    ],
    "ability": "Steam Engine"
  },
  {
    "name": "Carkol",
    "types": [
      "rock",
      "fire"
    ],
    "ability": "Steam Engine"
  },
  {
    "name": "Coalossal",
    "types": [
      "rock",
      "fire"
    ],
    "ability": "Steam Engine"
  },
  {
    "name": "Applin",
    "types": [
      "grass",
      "dragon"
    ],
    "ability": "Ripen"
  },
  {
    "name": "Flapple",
    "types": [
      "grass",
      "dragon"
    ],
    "ability": "Ripen"
  },
  {
    "name": "Appletun",
    "types": [
      "grass",
      "dragon"
    ],
    "ability": "Ripen"
  },
  {
    "name": "Silicobra",
    "types": [
      "ground"
    ],
    "ability": "Sand Spit"
  },
  {
    "name": "Sandaconda",
    "types": [
      "ground"
    ],
    "ability": "Sand Spit"
  },
  {
    "name": "Cramorant",
    "types": [
      "flying",
      "water"
    ],
    "ability": "Gulp Missile"
  },
  {
    "name": "Arrokuda",
    "types": [
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Barraskewda",
    "types": [
      "water"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Toxel",
    "types": [
      "electric",
      "poison"
    ],
    "ability": "Rattled"
  },
  {
    "name": "Toxtricity",
    "types": [
      "electric",
      "poison"
    ],
    "ability": "Punk Rock"
  },
  {
    "name": "Sizzlipede",
    "types": [
      "fire",
      "bug"
    ],
    "ability": "Flash Fire"
  },
  {
    "name": "Centiskorch",
    "types": [
      "fire",
      "bug"
    ],
    "ability": "Flash Fire"
  },
  {
    "name": "Clobbopus",
    "types": [
      "fighting"
    ],
    "ability": "Limber"
  },
  {
    "name": "Grapploct",
    "types": [
      "fighting"
    ],
    "ability": "Limber"
  },
  {
    "name": "Sinistea",
    "types": [
      "ghost"
    ],
    "ability": "Weak Armor"
  },
  {
    "name": "Polteageist",
    "types": [
      "ghost"
    ],
    "ability": "Weak Armor"
  },
  {
    "name": "Hatenna",
    "types": [
      "psychic"
    ],
    "ability": "Healer"
  },
  {
    "name": "Hattrem",
    "types": [
      "psychic"
    ],
    "ability": "Healer"
  },
  {
    "name": "Hatterene",
    "types": [
      "psychic",
      "fairy"
    ],
    "ability": "Healer"
  },
  {
    "name": "Impidimp",
    "types": [
      "dark",
      "fairy"
    ],
    "ability": "Prankster"
  },
  {
    "name": "Morgrem",
    "types": [
      "dark",
      "fairy"
    ],
    "ability": "Prankster"
  },
  {
    "name": "Grimmsnarl",
    "types": [
      "dark",
      "fairy"
    ],
    "ability": "Prankster"
  },
  {
    "name": "Obstagoon",
    "types": [
      "dark",
      "normal"
    ],
    "ability": "Reckless"
  },
  {
    "name": "Perrserker",
    "types": [
      "steel"
    ],
    "ability": "Battle Armor"
  },
  {
    "name": "Cursola",
    "types": [
      "ghost"
    ],
    "ability": "Weak Armor"
  },
  {
    "name": "Sirfetch’d",
    "types": [
      "fighting"
    ],
    "ability": "Steadfast"
  },
  {
    "name": "Mr. Rime",
    "types": [
      "ice",
      "psychic"
    ],
    "ability": "Tangled Feet"
  },
  {
    "name": "Runerigus",
    "types": [
      "ground",
      "ghost"
    ],
    "ability": "Wandering Spirit"
  },
  {
    "name": "Milcery",
    "types": [
      "fairy"
    ],
    "ability": "Sweet Veil"
  },
  {
    "name": "Alcremie",
    "types": [
      "fairy"
    ],
    "ability": "Sweet Veil"
  },
  {
    "name": "Falinks",
    "types": [
      "fighting"
    ],
    "ability": "Battle Armor"
  },
  {
    "name": "Pincurchin",
    "types": [
      "electric"
    ],
    "ability": "Lightning Rod"
  },
  {
    "name": "Snom",
    "types": [
      "ice",
      "bug"
    ],
    "ability": "Shield Dust"
  },
  {
    "name": "Frosmoth",
    "types": [
      "ice",
      "bug"
    ],
    "ability": "Shield Dust"
  },
  {
    "name": "Stonjourner",
    "types": [
      "rock"
    ],
    "ability": "Power Spot"
  },
  {
    "name": "Eiscue",
    "types": [
      "ice"
    ],
    "ability": "Ice Face"
  },
  {
    "name": "Indeedee",
    "types": [
      "psychic",
      "normal"
    ],
    "ability": "Inner Focus"
  },
  {
    "name": "Morpeko",
    "types": [
      "electric",
      "dark"
    ],
    "ability": "Hunger Switch"
  },
  {
    "name": "Cufant",
    "types": [
      "steel"
    ],
    "ability": "Sheer Force"
  },
  {
    "name": "Copperajah",
    "types": [
      "steel"
    ],
    "ability": "Sheer Force"
  },
  {
    "name": "Dracozolt",
    "types": [
      "electric",
      "dragon"
    ],
    "ability": "Volt Absorb"
  },
  {
    "name": "Arctozolt",
    "types": [
      "electric",
      "ice"
    ],
    "ability": "Volt Absorb"
  },
  {
    "name": "Dracovish",
    "types": [
      "water",
      "dragon"
    ],
    "ability": "Water Absorb"
  },
  {
    "name": "Arctovish",
    "types": [
      "water",
      "ice"
    ],
    "ability": "Water Absorb"
  },
  {
    "name": "Duraludon",
    "types": [
      "steel",
      "dragon"
    ],
    "ability": "Light Metal"
  },
  {
    "name": "Dreepy",
    "types": [
      "dragon",
      "ghost"
    ],
    "ability": "Clear Body"
  },
  {
    "name": "Drakloak",
    "types": [
      "dragon",
      "ghost"
    ],
    "ability": "Clear Body"
  },
  {
    "name": "Dragapult",
    "types": [
      "dragon",
      "ghost"
    ],
    "ability": "Clear Body"
  },
  {
    "name": "Zacian",
    "types": [
      "fairy"
    ],
    "ability": "Intrepid Sword"
  },
  {
    "name": "Zamazenta",
    "types": [
      "fighting"
    ],
    "ability": "Dauntless Shield"
  },
  {
    "name": "Eternatus",
    "types": [
      "poison",
      "dragon"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Kubfu",
    "types": [
      "fighting"
    ],
    "ability": "Inner Focus"
  },
  {
    "name": "Urshifu",
    "types": [
      "fighting",
      "dark"
    ],
    "ability": "Unseen Fist"
  },
  {
    "name": "Zarude",
    "types": [
      "dark",
      "grass"
    ],
    "ability": "Leaf Guard"
  },
  {
    "name": "Regieleki",
    "types": [
      "electric"
    ],
    "ability": "Transistor"
  },
  {
    "name": "Regidrago",
    "types": [
      "dragon"
    ],
    "ability": "Dragons Maw"
  },
  {
    "name": "Glastrier",
    "types": [
      "ice"
    ],
    "ability": "Chilling Neigh"
  },
  {
    "name": "Spectrier",
    "types": [
      "ghost"
    ],
    "ability": "Grim Neigh"
  },
  {
    "name": "Calyrex",
    "types": [
      "psychic",
      "grass"
    ],
    "ability": "Unnerve"
  },
  {
    "name": "Wyrdeer",
    "types": [
      "normal",
      "psychic"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Kleavor",
    "types": [
      "bug",
      "rock"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Ursaluna",
    "types": [
      "ground",
      "normal"
    ],
    "ability": "Guts"
  },
  {
    "name": "Basculegion",
    "types": [
      "water",
      "ghost"
    ],
    "ability": "Swift Swim"
  },
  {
    "name": "Sneasler",
    "types": [
      "fighting",
      "poison"
    ],
    "ability": "Pressure"
  },
  {
    "name": "Overqwil",
    "types": [
      "dark",
      "poison"
    ],
    "ability": "Poison Point"
  },
  {
    "name": "Enamorus",
    "types": [
      "fairy",
      "flying"
    ],
    "ability": "Cute Charm"
  },
  {
    "name": "Sprigatito",
    "types": [
      "grass"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Floragato",
    "types": [
      "grass"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Meowscarada",
    "types": [
      "grass",
      "dark"
    ],
    "ability": "Overgrow"
  },
  {
    "name": "Fuecoco",
    "types": [
      "fire"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Crocalor",
    "types": [
      "fire"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Skeledirge",
    "types": [
      "fire",
      "ghost"
    ],
    "ability": "Blaze"
  },
  {
    "name": "Quaxly",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Quaxwell",
    "types": [
      "water"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Quaquaval",
    "types": [
      "water",
      "fighting"
    ],
    "ability": "Torrent"
  },
  {
    "name": "Lechonk",
    "types": [
      "normal"
    ],
    "ability": "Aroma Veil"
  },
  {
    "name": "Oinkologne",
    "types": [
      "normal"
    ],
    "ability": "Lingering Aroma"
  },
  {
    "name": "Tarountula",
    "types": [
      "bug"
    ],
    "ability": "Insomnia"
  },
  {
    "name": "Spidops",
    "types": [
      "bug"
    ],
    "ability": "Insomnia"
  },
  {
    "name": "Nymble",
    "types": [
      "bug"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Lokix",
    "types": [
      "bug",
      "dark"
    ],
    "ability": "Swarm"
  },
  {
    "name": "Pawmi",
    "types": [
      "electric"
    ],
    "ability": "Static"
  },
  {
    "name": "Pawmo",
    "types": [
      "electric",
      "fighting"
    ],
    "ability": "Volt Absorb"
  },
  {
    "name": "Pawmot",
    "types": [
      "electric",
      "fighting"
    ],
    "ability": "Volt Absorb"
  },
  {
    "name": "Tandemaus",
    "types": [
      "normal"
    ],
    "ability": "Run Away"
  },
  {
    "name": "Maushold",
    "types": [
      "normal"
    ],
    "ability": "Friend Guard"
  },
  {
    "name": "Fidough",
    "types": [
      "fairy"
    ],
    "ability": "Own Tempo"
  },
  {
    "name": "Dachsbun",
    "types": [
      "fairy"
    ],
    "ability": "Well Baked Body"
  },
  {
    "name": "Smoliv",
    "types": [
      "grass",
      "normal"
    ],
    "ability": "Early Bird"
  },
  {
    "name": "Dolliv",
    "types": [
      "grass",
      "normal"
    ],
    "ability": "Early Bird"
  },
  {
    "name": "Arboliva",
    "types": [
      "grass",
      "normal"
    ],
    "ability": "Seed Sower"
  },
  {
    "name": "Squawkabilly",
    "types": [
      "normal",
      "flying"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Nacli",
    "types": [
      "rock"
    ],
    "ability": "Purifying Salt"
  },
  {
    "name": "Naclstack",
    "types": [
      "rock"
    ],
    "ability": "Purifying Salt"
  },
  {
    "name": "Garganacl",
    "types": [
      "rock"
    ],
    "ability": "Purifying Salt"
  },
  {
    "name": "Charcadet",
    "types": [
      "fire"
    ],
    "ability": "Flash Fire"
  },
  {
    "name": "Armarouge",
    "types": [
      "fire",
      "psychic"
    ],
    "ability": "Flash Fire"
  },
  {
    "name": "Ceruledge",
    "types": [
      "fire",
      "ghost"
    ],
    "ability": "Flash Fire"
  },
  {
    "name": "Tadbulb",
    "types": [
      "electric"
    ],
    "ability": "Own Tempo"
  },
  {
    "name": "Bellibolt",
    "types": [
      "electric"
    ],
    "ability": "Electromorphosis"
  },
  {
    "name": "Wattrel",
    "types": [
      "electric",
      "flying"
    ],
    "ability": "Wind Power"
  },
  {
    "name": "Kilowattrel",
    "types": [
      "electric",
      "flying"
    ],
    "ability": "Wind Power"
  },
  {
    "name": "Maschiff",
    "types": [
      "dark"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Mabosstiff",
    "types": [
      "dark"
    ],
    "ability": "Intimidate"
  },
  {
    "name": "Shroodle",
    "types": [
      "poison",
      "normal"
    ],
    "ability": "Unburden"
  },
  {
    "name": "Grafaiai",
    "types": [
      "poison",
      "normal"
    ],
    "ability": "Unburden"
  },
  {
    "name": "Bramblin",
    "types": [
      "grass",
      "ghost"
    ],
    "ability": "Wind Rider"
  },
  {
    "name": "Brambleghast",
    "types": [
      "grass",
      "ghost"
    ],
    "ability": "Wind Rider"
  },
  {
    "name": "Toedscool",
    "types": [
      "ground",
      "grass"
    ],
    "ability": "Mycelium Might"
  },
  {
    "name": "Toedscruel",
    "types": [
      "ground",
      "grass"
    ],
    "ability": "Mycelium Might"
  },
  {
    "name": "Klawf",
    "types": [
      "rock"
    ],
    "ability": "Anger Shell"
  },
  {
    "name": "Capsakid",
    "types": [
      "grass"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Scovillain",
    "types": [
      "grass",
      "fire"
    ],
    "ability": "Chlorophyll"
  },
  {
    "name": "Rellor",
    "types": [
      "bug"
    ],
    "ability": "Compound Eyes"
  },
  {
    "name": "Rabsca",
    "types": [
      "bug",
      "psychic"
    ],
    "ability": "Synchronize"
  },
  {
    "name": "Flittle",
    "types": [
      "psychic"
    ],
    "ability": "Anticipation"
  },
  {
    "name": "Espathra",
    "types": [
      "psychic"
    ],
    "ability": "Opportunist"
  },
  {
    "name": "Tinkatink",
    "types": [
      "fairy",
      "steel"
    ],
    "ability": "Mold Breaker"
  },
  {
    "name": "Tinkatuff",
    "types": [
      "fairy",
      "steel"
    ],
    "ability": "Mold Breaker"
  },
  {
    "name": "Tinkaton",
    "types": [
      "fairy",
      "steel"
    ],
    "ability": "Mold Breaker"
  },
  {
    "name": "Wiglett",
    "types": [
      "water"
    ],
    "ability": "Gooey"
  },
  {
    "name": "Wugtrio",
    "types": [
      "water"
    ],
    "ability": "Gooey"
  },
  {
    "name": "Bombirdier",
    "types": [
      "flying",
      "dark"
    ],
    "ability": "Big Pecks"
  },
  {
    "name": "Finizen",
    "types": [
      "water"
    ],
    "ability": "Water Veil"
  },
  {
    "name": "Palafin",
    "types": [
      "water"
    ],
    "ability": "Zero To Hero"
  },
  {
    "name": "Varoom",
    "types": [
      "steel",
      "poison"
    ],
    "ability": "Overcoat"
  },
  {
    "name": "Revavroom",
    "types": [
      "steel",
      "poison"
    ],
    "ability": "Overcoat"
  },
  {
    "name": "Cyclizar",
    "types": [
      "dragon",
      "normal"
    ],
    "ability": "Shed Skin"
  },
  {
    "name": "Orthworm",
    "types": [
      "steel"
    ],
    "ability": "Earth Eater"
  },
  {
    "name": "Glimmet",
    "types": [
      "rock",
      "poison"
    ],
    "ability": "Toxic Debris"
  },
  {
    "name": "Glimmora",
    "types": [
      "rock",
      "poison"
    ],
    "ability": "Toxic Debris"
  },
  {
    "name": "Greavard",
    "types": [
      "ghost"
    ],
    "ability": "Pickup"
  },
  {
    "name": "Houndstone",
    "types": [
      "ghost"
    ],
    "ability": "Sand Rush"
  },
  {
    "name": "Flamigo",
    "types": [
      "flying",
      "fighting"
    ],
    "ability": "Scrappy"
  },
  {
    "name": "Cetoddle",
    "types": [
      "ice"
    ],
    "ability": "Thick Fat"
  },
  {
    "name": "Cetitan",
    "types": [
      "ice"
    ],
    "ability": "Thick Fat"
  },
  {
    "name": "Veluza",
    "types": [
      "water",
      "psychic"
    ],
    "ability": "Mold Breaker"
  },
  {
    "name": "Dondozo",
    "types": [
      "water"
    ],
    "ability": "Unaware"
  },
  {
    "name": "Tatsugiri",
    "types": [
      "dragon",
      "water"
    ],
    "ability": "Commander"
  },
  {
    "name": "Annihilape",
    "types": [
      "fighting",
      "ghost"
    ],
    "ability": "Vital Spirit"
  },
  {
    "name": "Clodsire",
    "types": [
      "poison",
      "ground"
    ],
    "ability": "Poison Point"
  },
  {
    "name": "Farigiraf",
    "types": [
      "normal",
      "psychic"
    ],
    "ability": "Cud Chew"
  },
  {
    "name": "Dudunsparce",
    "types": [
      "normal"
    ],
    "ability": "Serene Grace"
  },
  {
    "name": "Kingambit",
    "types": [
      "dark",
      "steel"
    ],
    "ability": "Defiant"
  },
  {
    "name": "Great Tusk",
    "types": [
      "ground",
      "fighting"
    ],
    "ability": "Protosynthesis"
  },
  {
    "name": "Scream Tail",
    "types": [
      "fairy",
      "psychic"
    ],
    "ability": "Protosynthesis"
  },
  {
    "name": "Brute Bonnet",
    "types": [
      "grass",
      "dark"
    ],
    "ability": "Protosynthesis"
  },
  {
    "name": "Flutter Mane",
    "types": [
      "ghost",
      "fairy"
    ],
    "ability": "Protosynthesis"
  },
  {
    "name": "Slither Wing",
    "types": [
      "bug",
      "fighting"
    ],
    "ability": "Protosynthesis"
  },
  {
    "name": "Sandy Shocks",
    "types": [
      "electric",
      "ground"
    ],
    "ability": "Protosynthesis"
  },
  {
    "name": "Iron Treads",
    "types": [
      "ground",
      "steel"
    ],
    "ability": "Quark Drive"
  },
  {
    "name": "Iron Bundle",
    "types": [
      "ice",
      "water"
    ],
    "ability": "Quark Drive"
  },
  {
    "name": "Iron Hands",
    "types": [
      "fighting",
      "electric"
    ],
    "ability": "Quark Drive"
  },
  {
    "name": "Iron Jugulis",
    "types": [
      "dark",
      "flying"
    ],
    "ability": "Quark Drive"
  },
  {
    "name": "Iron Moth",
    "types": [
      "fire",
      "poison"
    ],
    "ability": "Quark Drive"
  },
  {
    "name": "Iron Thorns",
    "types": [
      "rock",
      "electric"
    ],
    "ability": "Quark Drive"
  },
  {
    "name": "Frigibax",
    "types": [
      "dragon",
      "ice"
    ],
    "ability": "Thermal Exchange"
  },
  {
    "name": "Arctibax",
    "types": [
      "dragon",
      "ice"
    ],
    "ability": "Thermal Exchange"
  },
  {
    "name": "Baxcalibur",
    "types": [
      "dragon",
      "ice"
    ],
    "ability": "Thermal Exchange"
  },
  {
    "name": "Gimmighoul",
    "types": [
      "ghost"
    ],
    "ability": "Rattled"
  },
  {
    "name": "Gholdengo",
    "types": [
      "steel",
      "ghost"
    ],
    "ability": "Good As Gold"
  },
  {
    "name": "Wo-Chien",
    "types": [
      "dark",
      "grass"
    ],
    "ability": "Tablets Of Ruin"
  },
  {
    "name": "Chien-Pao",
    "types": [
      "dark",
      "ice"
    ],
    "ability": "Sword Of Ruin"
  },
  {
    "name": "Ting-Lu",
    "types": [
      "dark",
      "ground"
    ],
    "ability": "Vessel Of Ruin"
  },
  {
    "name": "Chi-Yu",
    "types": [
      "dark",
      "fire"
    ],
    "ability": "Beads Of Ruin"
  },
  {
    "name": "Roaring Moon",
    "types": [
      "dragon",
      "dark"
    ],
    "ability": "Protosynthesis"
  },
  {
    "name": "Iron Valiant",
    "types": [
      "fairy",
      "fighting"
    ],
    "ability": "Quark Drive"
  },
  {
    "name": "Koraidon",
    "types": [
      "fighting",
      "dragon"
    ],
    "ability": "Orichalcum Pulse"
  },
  {
    "name": "Miraidon",
    "types": [
      "electric",
      "dragon"
    ],
    "ability": "Hadron Engine"
  },
  {
    "name": "Walking Wake",
    "types": [
      "water",
      "dragon"
    ],
    "ability": "Protosynthesis"
  },
  {
    "name": "Iron Leaves",
    "types": [
      "grass",
      "psychic"
    ],
    "ability": "Quark Drive"
  },
  {
    "name": "Dipplin",
    "types": [
      "grass",
      "dragon"
    ],
    "ability": "Supersweet Syrup"
  },
  {
    "name": "Poltchageist",
    "types": [
      "grass",
      "ghost"
    ],
    "ability": "Hospitality"
  },
  {
    "name": "Sinistcha",
    "types": [
      "grass",
      "ghost"
    ],
    "ability": "Hospitality"
  },
  {
    "name": "Okidogi",
    "types": [
      "poison",
      "fighting"
    ],
    "ability": "Toxic Chain"
  },
  {
    "name": "Munkidori",
    "types": [
      "poison",
      "psychic"
    ],
    "ability": "Toxic Chain"
  },
  {
    "name": "Fezandipiti",
    "types": [
      "poison",
      "fairy"
    ],
    "ability": "Toxic Chain"
  },
  {
    "name": "Ogerpon",
    "types": [
      "grass"
    ],
    "ability": "Defiant"
  },
  {
    "name": "Archaludon",
    "types": [
      "steel",
      "dragon"
    ],
    "ability": "Stamina"
  },
  {
    "name": "Hydrapple",
    "types": [
      "grass",
      "dragon"
    ],
    "ability": "Supersweet Syrup"
  },
  {
    "name": "Gouging Fire",
    "types": [
      "fire",
      "dragon"
    ],
    "ability": "Protosynthesis"
  },
  {
    "name": "Raging Bolt",
    "types": [
      "electric",
      "dragon"
    ],
    "ability": "Protosynthesis"
  },
  {
    "name": "Iron Boulder",
    "types": [
      "rock",
      "psychic"
    ],
    "ability": "Quark Drive"
  },
  {
    "name": "Iron Crown",
    "types": [
      "steel",
      "psychic"
    ],
    "ability": "Quark Drive"
  },
  {
    "name": "Terapagos",
    "types": [
      "normal"
    ],
    "ability": "Tera Shift"
  },
  {
    "name": "Pecharunt",
    "types": [
      "poison",
      "ghost"
    ],
    "ability": "Poison Puppeteer"
  }
] as const satisfies readonly PokemonEntry[]
