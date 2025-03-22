export type Currency = 'EUR' | 'INR';

export type TransactionType = 'asset' | 'liability' | 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  currency: Currency;
  date: string;
}

export interface StorageConfig {
  type: 'local' | 'google-drive';
  credentials?: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
} 