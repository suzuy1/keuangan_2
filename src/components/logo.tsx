import { Wallet } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="Logo Keuangan">
      <Wallet className="h-7 w-7 text-primary" />
      <h1 className="text-xl font-bold text-primary tracking-tight">Keuangan</h1>
    </div>
  );
}
