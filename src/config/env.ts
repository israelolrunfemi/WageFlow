import 'dotenv/config'
import { z } from 'zod'

// Define the schema for environment variables
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  BOT_TOKEN: z.string().min(1, 'BOT_TOKEN is required'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  CELO_RPC_URL: z.string().optional(),
  PRIVATE_KEY: z.string().optional(),
  MISTRAL_API_KEY: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables')
  console.error(parsed.error.format())
  process.exit(1)
}

export const env = parsed.data