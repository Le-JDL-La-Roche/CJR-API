export interface Match {
  id?: number
  team1: number
  team2: number
  score1: number
  score2: number
  category: 'C' | 'L'
  fromDate: string
  toDate: string
  field: number
  tree: string
}
