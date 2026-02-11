export type ConversationState = 'idle' | 'awaiting_company_name' | 'employee_name' | 'employee_wallet' | 'employee_salary';
export interface SessionData {
    state: ConversationState;
    companyId?: number;
    employee?: {
        name?: string;
        wallet?: string;
        salary?: number;
    };
}
export interface EmployeeDraft {
    name?: string;
    wallet?: string;
    salary?: number;
}
