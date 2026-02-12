export type ConversationState =
  |'idle'
  | 'awaiting_company_name'
  | 'employee_name'
  | 'employee_wallet'
  | 'employee_salary'
  | 'employee_currency'
  | 'await_pin'
  | 'await_new_pin'
  | null;

export interface EmployeeData {
  name?: string;
  wallet?: string;
  salary?: number;
  currency?: 'cUSD' | 'cEUR';
}

export interface SessionData {
  state: ConversationState;
  companyId?: number;
  employee?: EmployeeData;
  pin?: string;
  pinVerified?: boolean;
  pinAttempts?: number;
}