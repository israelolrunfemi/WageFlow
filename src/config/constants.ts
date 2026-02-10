export const APP_NAME = 'WageFlow'
export const TOKENS = {
  cUSD: {
    address: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
    decimals: 18,
    symbol: 'cUSD',
    name: 'Celo Dollar',
  },
  cEUR: {
    address: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
    decimals: 18,
    symbol: 'cEUR',
    name: 'Celo Euro',
  },
} as const

export type TokenSymbol = keyof typeof TOKENS
export type TokenConfig = (typeof TOKENS)[TokenSymbol]

export const COMMANDS = {
  START: 'start',
  HELP: 'help',
  BALANCE: 'balance',
  EMPLOYEES: 'employees',
  ADD_EMPLOYEE: 'add_employee',
  PAY: 'pay',
} as const

export type Command = typeof COMMANDS[keyof typeof COMMANDS]
