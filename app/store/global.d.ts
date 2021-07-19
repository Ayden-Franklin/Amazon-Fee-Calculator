declare type Nullable<T> = T | null

declare interface ITierFragment {
  value: number
  unit: string
  // '=' or '>'
  symbol: string
}

declare interface ITier {
  type: string
  order: number
  weight: ITierFragment
  volumes: Array<ITierFragment>
  lengthGirth: ITierFragment
}
