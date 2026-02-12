export type ConversationState = 'idle' | 'awaiting_company_name' | 'employee_name' | 'employee_wallet' | 'employee_salary' | 'await_pin' | 'await_new_pin';
export interface SessionData {
    state: ConversationState;
    pinVerified: boolean;
    pinAttempts?: number;
    companyId?: number;
    employee?: {
        name?: string;
        wallet?: string;
        salary?: number;
    };
    newPin?: number;
}
export interface EmployeeDraft {
    name?: string;
    wallet?: string;
    salary?: number;
}
