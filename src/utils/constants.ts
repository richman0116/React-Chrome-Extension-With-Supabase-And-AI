import { SUPABASE_URL } from './supabase'

export const circlePageStatus = {
  CIRCLE_LIST: 0,
  ADD_AUTOMATICALLY: 1,
  ADD_MANUALLY: 2,
  ENLIGHTEN_ME: 3,
}

export const Paths = {
  SIGNUP: 'https://0xeden.com/signup',
}

export const supabaseSotrageUrl = `${SUPABASE_URL}/storage/v1/object/public`

export const circleLoadingMessages = [
  'Summoning your ape',
  'Your ape is eating bananas',
  'Doing the hard work',
  'Digging through the page',
  'Ape trying to make sense of the page',
  'Imagining',
  // 'Almost there',
  'Hang on',
]

export enum CircleGenerationStatus {
  INITIALIZED = 'initialized',
  GENERATING = 'generating',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}
