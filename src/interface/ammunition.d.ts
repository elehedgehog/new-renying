interface AmmunitionEvent {
  endTime: number
  startTime: number
  userId: string
  startName?: string
  endPos?: [number, number]
  endName: string
  stationId: string
  id: string
  info: string[]
  pos: {lon: number, lat: number}[]
  repo: string
  res: {res: any, type: 'Ammo' | 'AmmoBox'}[]
  type: 'store' | 'takeout' | 'transport' | 'destroy' | 'work' | 'other' | 'arrive'
}