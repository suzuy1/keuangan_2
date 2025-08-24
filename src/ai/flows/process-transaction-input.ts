'use server';

/**
 * @fileOverview Memproses masukan transaksi bahasa alami menggunakan chatbot AI percakapan.
 *
 * - processTransactionInput - Memproses masukan bahasa alami pengguna untuk mengekstrak detail transaksi.
 * - ProcessTransactionInputInput - Tipe masukan untuk fungsi processTransactionInput.
 * - ProcessTransactionInputOutput - Tipe keluaran untuk fungsi processTransactionInput.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessTransactionInputInputSchema = z.object({
  userInput: z.string().describe('String masukan pengguna yang berisi detail transaksi.'),
});
export type ProcessTransactionInputInput = z.infer<typeof ProcessTransactionInputInputSchema>;

const ProcessTransactionInputOutputSchema = z.object({
  transactionType: z.enum(['income', 'expense']).describe('Jenis transaksi.'),
  amount: z.number().describe('Jumlah transaksi.'),
  category: z.string().describe('Kategori transaksi.'),
  description: z.string().describe('Deskripsi transaksi.'),
});
export type ProcessTransactionInputOutput = z.infer<typeof ProcessTransactionInputOutputSchema>;

export async function processTransactionInput(input: ProcessTransactionInputInput): Promise<ProcessTransactionInputOutput> {
  return processTransactionInputFlow(input);
}

const processTransactionInputPrompt = ai.definePrompt({
  name: 'processTransactionInputPrompt',
  input: {schema: ProcessTransactionInputInputSchema},
  output: {schema: ProcessTransactionInputOutputSchema},
  prompt: `Anda adalah chatbot keuangan yang mengekstrak detail transaksi dari masukan pengguna dalam Bahasa Indonesia.

  Berdasarkan masukan pengguna, ekstrak jenis transaksi (pemasukan atau pengeluaran), jumlah, kategori, dan deskripsi.

  Masukan Pengguna: {{{userInput}}}
  `,
});

const processTransactionInputFlow = ai.defineFlow(
  {
    name: 'processTransactionInputFlow',
    inputSchema: ProcessTransactionInputInputSchema,
    outputSchema: ProcessTransactionInputOutputSchema,
  },
  async input => {
    const {output} = await processTransactionInputPrompt(input);
    return output!;
  }
);
