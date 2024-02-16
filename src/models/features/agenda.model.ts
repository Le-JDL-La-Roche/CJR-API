export interface Event {
  id?: number
  fromDate: string
  toDate: string
  title: string
  content: string
  field: number // 0-4 (0 <=> category g)
  category: 'C' | 'L' | 'g' // Collège | Lycée | Général (g <=> field 0)
  status: 0 | 1 // Privé | Public
}
