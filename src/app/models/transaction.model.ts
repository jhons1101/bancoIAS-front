export type TransactionStatus = 'PROCESSED' | 'REJECTED';

export interface Transaction {
  requestReference: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  status: TransactionStatus | string;
  reason: string | null;
  processedAt: string;
}

export interface CreateTransactionRequest {
  requestReference: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
}

export interface ApiError {
  status: number;
  message: string;
  timestamp?: string;
}