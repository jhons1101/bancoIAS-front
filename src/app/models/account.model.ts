export interface Account {
  accountId: string;
  customerId: string;
  status: 'ACTIVE' | 'BLOCKED' | string;
  balance: number;
}