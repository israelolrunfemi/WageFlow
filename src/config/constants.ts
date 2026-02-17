import type { TokenConfig } from '../types/blockchain.js';

export const APP_NAME = 'WageFlow';

// ─── Celo Token Addresses (Alfajores Testnet) ─────────────────────────────────
export const TOKENS: Record<string, TokenConfig> = {
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
};

// ─── ERC-20 ABI ───────────────────────────────────────────────────────────────
export const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

// ─── Network ──────────────────────────────────────────────────────────────────
export const NETWORK = {
  NAME: 'Alfajores Testnet',
  CHAIN_ID: 44787,
  RPC_URL: 'https://alfajores-forno.celo-testnet.org',
  EXPLORER_URL: 'https://alfajores.celoscan.io',
  FAUCET_URL: 'https://faucet.celo.org',
} as const;

// ─── Bot Commands ─────────────────────────────────────────────────────────────
export const COMMANDS = {
  START: 'start',
  ADD_EMPLOYEE: 'add_employee',
  EMPLOYEES: 'employees',
  PAY: 'pay',
  BALANCE: 'balance',
  HISTORY: 'history',
  HELP: 'help',
} as const;