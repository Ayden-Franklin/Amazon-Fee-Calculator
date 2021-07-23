export const countryMenuItems = [
  { code: 'us', name: 'Unitied State' },
  { code: 'ca', name: 'Canada' },
  { code: 'it', name: 'Italy' },
  { code: 'fr', name: 'France' },
  { code: 'de', name: 'Germany' },
  { code: 'in', name: 'India' },
  { code: 'jp', name: 'Japan' },
  { code: 'se', name: 'Spain' },
  { code: 'mx', name: 'Mexico' },
  { code: 'uk', name: 'United Kingdom' },
]

export enum StateStatus {
  Idel,
  Loading,
  Succeeded,
  Failed,
}

export const InitializedStateSlice = {
  content: {
    tier: 'Content has not been initialized',
    weight: 'Content has not been initialized',
    package: 'Content has not been initialized',
    shipping: 'Content has not been initialized',
    fba: 'Content has not been initialized',
    referral: 'Content has not been initialized',
    closing: 'Content has not been initialized',
  },
  status: StateStatus.Idel,
  currentCountry: countryMenuItems[0],
}

export enum FbaProductType {
  Normal,
  Apparel,
  Dangerous,
}
