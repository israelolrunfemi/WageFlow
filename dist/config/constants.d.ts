export declare const APP_NAME = "WageFlow";
export declare const TOKENS: {
    readonly cUSD: {
        readonly address: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
        readonly decimals: 18;
        readonly symbol: "cUSD";
        readonly name: "Celo Dollar";
    };
    readonly cEUR: {
        readonly address: "0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F";
        readonly decimals: 18;
        readonly symbol: "cEUR";
        readonly name: "Celo Euro";
    };
};
export type TokenSymbol = keyof typeof TOKENS;
export type TokenConfig = (typeof TOKENS)[TokenSymbol];
export declare const COMMANDS: {
    readonly START: "start";
    readonly HELP: "help";
    readonly BALANCE: "balance";
    readonly EMPLOYEES: "employees";
    readonly ADD_EMPLOYEE: "add_employee";
    readonly PAY: "pay";
};
export type Command = typeof COMMANDS[keyof typeof COMMANDS];
