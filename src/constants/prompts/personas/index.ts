import ROCK_JOCK from './rock_jock'
import WALL_FLOWER from './wall_flower'
import PUBLIC_RADIO from './public_radio'

import type { BeatBrainPersona } from '../../../types'

const BEATBRAIN_PERSONAS: BeatBrainPersona[] = [
  ROCK_JOCK,
  WALL_FLOWER,
  PUBLIC_RADIO
]

export const DEFAULT_PERSONA = ROCK_JOCK

export default BEATBRAIN_PERSONAS
