export interface Team {
  id?: number
  name: string
  school: number
  teammates: Teammate[]
}

export interface Teammate {
  name: string
  role: number
  captain: boolean
  imageId: string
}
