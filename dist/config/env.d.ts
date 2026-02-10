import 'dotenv/config';
export declare const env: {
    NODE_ENV: "development" | "test" | "production";
    BOT_TOKEN: string;
    DATABASE_URL: string;
    CELO_RPC_URL?: string | undefined;
    PRIVATE_KEY?: string | undefined;
    MISTRAL_API_KEY?: string | undefined;
};
