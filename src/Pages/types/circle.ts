import { CircleGenerationStatus } from '../../utils/constants'

export interface CircleInterface {
  id: string
  name: string
  description: string
  tags: string[]
  circle_logo_image: string
}

export interface ICircleGenerationStatus {
  type: 'auto' | 'manual'
  status: CircleGenerationStatus
  result: CircleInterface[]
}
