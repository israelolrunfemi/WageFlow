import 'dotenv/config';
import { z } from 'zod';
export declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        test: "test";
        production: "production";
    }>>;
    BOT_TOKEN: z.ZodString;
    DATABASE_URL: z.ZodString;
    CELO_RPC_URL: z.ZodOptional<z.ZodString>;
    PRIVATE_KEY: z.ZodOptional<z.ZodString>;
    MISTRAL_API_KEY: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const env: {
    NODE_ENV: "development" | "test" | "production";
    BOT_TOKEN: string;
    DATABASE_URL: string;
    CELO_RPC_URL?: string | undefined;
    PRIVATE_KEY?: string | undefined;
    MISTRAL_API_KEY?: string | undefined;
};
