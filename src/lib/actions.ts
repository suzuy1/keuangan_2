'use server';

import { processTransactionInput, type ProcessTransactionInputOutput } from '@/ai/flows/process-transaction-input';
import { supabase } from './supabaseClient';
import { revalidatePath } from 'next/cache';

export async function handleTransaction(formData: FormData): Promise<{data: ProcessTransactionInputOutput | null, error: string | null}> {
  const userInput = formData.get('userInput') as string;
  if (!userInput) {
    return { data: null, error: 'Input kosong. Harap jelaskan transaksi Anda.' };
  }

  try {
    const result = await processTransactionInput({ userInput });
    // Basic validation on AI output
    if (!result.amount || !result.category || !result.description || !result.transactionType) {
        throw new Error("AI gagal mengekstrak semua bidang yang diperlukan.");
    }

    const { error: dbError } = await supabase.from('transactions').insert([
      {
        description: result.description,
        amount: result.amount,
        type: result.transactionType,
        category: result.category,
      },
    ]);

    if (dbError) {
      console.error('Supabase error:', dbError);
      throw new Error('Gagal menyimpan transaksi ke database.');
    }
    
    revalidatePath('/');
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: 'Gagal memproses transaksi. Coba gunakan kalimat yang berbeda, contohnya "Saya bayar 50rb untuk makan malam di restoran".' };
  }
}
