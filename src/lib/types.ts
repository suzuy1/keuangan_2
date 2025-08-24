export type Transaction = {
  id: string;
  created_at?: string; // from Supabase
  date?: string; // for optimistic UI
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
};
