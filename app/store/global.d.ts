declare type Nullable<T> = T | null

declare type Undefinedable<T> = T | undefined

declare type Nilable<T> = T | undefined | null

declare interface Country {
  code: string
  name: string
}

interface StateSlice {
  content: string
  status: import('@src/service/constants').StateStatus
  error?: string
  currentCountry: Country
}

declare interface Iu {
  value: number
  unit: string
  operator?: string
}

declare interface IProduct {
  length: Iu
  width: Iu
  height: Iu
  weight: Iu
  category: Undefinedable<string>
  country: string
}

declare interface ITier {
  type: string
  order: number
  weight: Iu
  volumes: Array<Iu>
  lengthGirth: Iu
}
