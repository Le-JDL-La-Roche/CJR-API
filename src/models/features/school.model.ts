export interface School {
  id?: number
  name: string
  category: 'C' | 'L'
  teammates: Teammate[]
}

export interface Teammate {
  name: string
  role: number
  captain: boolean
  imageId: string
}
