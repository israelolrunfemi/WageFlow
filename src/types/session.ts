export type ConversationState =
  'idle'
  | 'awaiting_company_name'
  | 'employee_name'
  | 'employee_wallet'
  | 'employee_salary'
  | 'await_pin'
  |'await_new_pin';

export interface SessionData {
  state: ConversationState;
  pinVerified: boolean;       // tracks if PIN has been verified
  pinAttempts?: number;     // counts PIN attempts
  companyId?: number;
 
  employee?: {
    name?: string;
    wallet?: string;
    salary?: number;
  };
newPin?:number; // temporarily holds new PIN during setup

}
export interface EmployeeDraft {
  name?: string;
  wallet?: string;
  salary?: number;
}