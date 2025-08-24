
'use client';

import { useState, useMemo, useTransition, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { handleTransaction } from '@/lib/actions';
import type { Transaction } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { getCategoryIcon, exportToCsv } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, ResponsiveContainer, Cell } from "recharts"
import { ArrowDown, ArrowUp, Bot, Download, Landmark, Loader2, CircleDollarSign, Receipt, Send, Pencil, Edit, Trash2 } from 'lucide-react';
import { Logo } from '@/components/logo';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [storedBalance, setStoredBalance] = useState<number | null>(null);
  const [newBalance, setNewBalance] = useState(0);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const { totalIncome, totalExpense } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return { totalIncome: income, totalExpense: expense };
  }, [transactions]);

  const balance = useMemo(() => {
    if (storedBalance === null) {
      // While loading or if no balance is set, calculate from transactions
      return totalIncome - totalExpense;
    }
    // Once a balance is set, it acts as the base
    return storedBalance + totalIncome - totalExpense;
  }, [storedBalance, totalIncome, totalExpense]);
  
  useEffect(() => {
    setIsClient(true);
    setNewBalance(balance);
  }, [balance]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Gagal mengambil data transaksi.',
        });
      } else {
        setTransactions(transactionsData as Transaction[]);
      }

      // Fetch balance
      const { data: profileData, error: profileError } = await supabase
        .from('user_profile')
        .select('balance')
        .eq('id', '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed')
        .single();

      if (profileError) {
        console.error('Error fetching balance:', profileError);
        setStoredBalance(0); // Default to 0 if no profile exists
      } else if (profileData && profileData.balance !== null) {
        setStoredBalance(profileData.balance);
      } else {
        setStoredBalance(0); // Default to 0 if balance is null
      }
    };

    fetchData();
  }, []);
  
  const expenseByCategory = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        if (!categoryMap[t.category]) {
          categoryMap[t.category] = 0;
        }
        categoryMap[t.category] += t.amount;
      });
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);
  
  const chartConfig = {
    expense: { label: "Pengeluaran", color: "hsl(var(--destructive))" },
    income: { label: "Pemasukan", color: "hsl(var(--primary))" },
  }

  const pieChartConfig = useMemo(() => {
    const config: any = {};
    expenseByCategory.forEach((cat, index) => {
      config[cat.name] = {
        label: cat.name,
        color: `hsl(var(--chart-${(index % 5) + 1}))`
      }
    });
    return config;
  }, [expenseByCategory]);


  async function formAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const userInput = formData.get('userInput') as string;

    if (!userInput.trim()) return;

    startTransition(async () => {
      const { data, error } = await handleTransaction(formData);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error,
        });
      } else if (data) {
        const newTransaction: Transaction = {
          id: new Date().getTime().toString(),
          date: new Date().toISOString(),
          description: data.description,
          amount: data.amount,
          type: data.transactionType,
          category: data.category,
        };
        // Optimistic UI update
        const optimisticTransaction: Transaction = {
          id: `temp-${new Date().getTime()}`,
          created_at: new Date().toISOString(),
          description: data.description,
          amount: data.amount,
          type: data.transactionType,
          category: data.category,
        };
        setTransactions((prev) => [optimisticTransaction, ...prev]);
        
        toast({
          title: 'Transaksi Ditambahkan',
          description: `${data.description} sebesar Rp${data.amount.toLocaleString()} telah dicatat.`,
        });
        formRef.current?.reset();
      }
    });
  }

  const handleUpdateBalance = async () => {
    // This update sets a new "base" balance, from which future transactions will be added/subtracted.
    // To do this, we adjust the new base by the income/expense that has already occurred.
    const newBaseBalance = newBalance - (totalIncome - totalExpense);

    const { error: updateError } = await supabase
      .from('user_profile')
      .update({ balance: newBaseBalance })
      .eq('id', '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed');

    if (updateError) {
      console.error('Error updating balance:', updateError);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memperbarui saldo.',
      });
    } else {
      setStoredBalance(newBaseBalance);
      toast({
        title: 'Saldo Diperbarui',
        description: `Saldo baru Anda adalah Rp${newBalance.toLocaleString()}.`,
      });
    }
  };

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    // Optimistic UI update
    const originalTransactions = transactions;
    setTransactions(transactions.filter(t => t.id !== transactionToDelete));

    const { error } = await supabase
      .from('transactions')
      .delete()
      .match({ id: transactionToDelete });

    if (error) {
      console.error('Error deleting transaction:', error);
      setTransactions(originalTransactions); // Rollback on error
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menghapus transaksi.',
      });
    } else {
      toast({
        title: 'Transaksi Dihapus',
        description: 'Transaksi telah berhasil dihapus.',
      });
    }
    setTransactionToDelete(null);
  };
  
  const handleEditFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!transactionToEdit) return;

    const formData = new FormData(event.currentTarget);
    const updatedTransactionData = {
      description: formData.get('description') as string,
      amount: Number(formData.get('amount')),
      category: formData.get('category') as string,
      type: formData.get('type') as 'income' | 'expense',
    };

    // Optimistic UI update
    const originalTransactions = transactions;
    setTransactions(transactions.map(t => t.id === transactionToEdit.id ? { ...t, ...updatedTransactionData } : t));
    setTransactionToEdit(null);

    const { error } = await supabase
      .from('transactions')
      .update(updatedTransactionData)
      .match({ id: transactionToEdit.id });

    if (error) {
      console.error('Error updating transaction:', error);
      setTransactions(originalTransactions); // Rollback on error
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memperbarui transaksi.',
      });
    } else {
      toast({
        title: 'Transaksi Diperbarui',
        description: 'Transaksi telah berhasil diperbarui.',
      });
    }
  };

  const displayedTransactions = showAllTransactions ? transactions : transactions.slice(0, 5);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-background font-body">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <Logo />
        <Button variant="ghost" size="icon">
          <Bot className="h-6 w-6" />
          <span className="sr-only">Asisten AI</span>
        </Button>
      </header>
      
      <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 space-y-6 pb-24">
        {/* === Bagian Dasbor === */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saldo</CardTitle>
              <div className="flex items-center gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Ubah Saldo</AlertDialogTitle>
                      <AlertDialogDescription>
                        Masukkan jumlah saldo Anda saat ini. Ini akan menimpa saldo yang dihitung secara otomatis.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="balance-input" className="text-right">
                          Saldo
                        </Label>
                        <Input
                          id="balance-input"
                          type="number"
                          value={newBalance}
                          onChange={(e) => setNewBalance(Number(e.target.value))}
                          className="col-span-3"
                          placeholder="Masukkan saldo baru"
                        />
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={handleUpdateBalance}>Simpan</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <CircleDollarSign className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">Rp{balance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Saldo tersedia Anda saat ini</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
              <Landmark className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-primary">Rp{totalIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total pemasukan periode ini</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-destructive/20 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
              <Receipt className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-destructive">Rp{totalExpense.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total pengeluaran periode ini</p>
            </CardContent>
          </Card>
        </div>
        
        {/* === Bagian Grafik === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="lg:col-span-3 shadow-lg">
                <CardHeader>
                    <CardTitle>Pemasukan vs. Pengeluaran</CardTitle>
                    <CardDescription>Ringkasan aktivitas keuangan Anda.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full sm:min-h-[250px]">
                        <BarChart accessibilityLayer data={[{ name: "Ringkasan", income: totalIncome, expense: totalExpense }]}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="income" fill="var(--color-income)" radius={8} />
                            <Bar dataKey="expense" fill="var(--color-expense)" radius={8} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card className="lg:col-span-2 shadow-lg">
                <CardHeader>
                    <CardTitle>Pengeluaran per Kategori</CardTitle>
                    <CardDescription>Bagaimana Anda membelanjakan uang Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={pieChartConfig} className="mx-auto aspect-square min-h-[200px] sm:min-h-[250px]">
                      <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                              <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
                              <Pie data={expenseByCategory} dataKey="value" nameKey="name" innerRadius={50} strokeWidth={5}>
                                {expenseByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={pieChartConfig[entry.name]?.color} />
                                ))}
                              </Pie>
                              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                          </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>

        {/* === Bagian Riwayat Transaksi === */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Riwayat Transaksi</CardTitle>
              <CardDescription>Daftar terperinci dari semua transaksi Anda.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => exportToCsv(transactions, 'transaksi.csv')}>
              <Download className="mr-2 h-4 w-4" />
              Ekspor CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hidden md:table-row">
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead>Tanggal & Waktu</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                        Belum ada transaksi.
                      </TableCell>
                    </TableRow>
                  )}
                  {displayedTransactions.map((t) => {
                    const Icon = getCategoryIcon(t.category);
                    return (
                      <TableRow key={t.id} className="flex flex-col md:table-row mb-4 md:mb-0 border-b last:border-b-0 md:border-b">
                        <TableCell className="font-medium flex items-center gap-2 p-2 md:p-4">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-full ${t.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                            {t.type === 'income' ? <ArrowUp className="h-4 w-4"/> : <ArrowDown className="h-4 w-4" />}
                          </span>
                           <div className="flex flex-col">
                            <span className="truncate">{t.description}</span>
                            <span className="text-xs text-muted-foreground md:hidden">
                              {new Date(t.created_at || t.date || '').toLocaleString('id-ID')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="p-2 md:p-4">
                          <Badge variant="outline" className="flex items-center gap-1.5 w-fit">
                            <Icon className="h-3 w-3" />
                            {t.category}
                          </Badge>
                        </TableCell>
                        <TableCell className={`font-mono p-2 md:p-4 text-right ${t.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                          {t.type === 'income' ? '+' : '-'}Rp{t.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground p-2 md:p-4">
                          {new Date(t.created_at || t.date || '').toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell className="p-2 md:p-4 md:text-right">
                          <div className="flex gap-2 justify-end">
                            <Dialog onOpenChange={(open) => !open && setTransactionToEdit(null)}>
                               <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTransactionToEdit(t)}>
                                      <Edit className="h-4 w-4" />
                                      <span className="sr-only">Edit</span>
                                  </Button>
                                </DialogTrigger>
                                {transactionToEdit && transactionToEdit.id === t.id && (
                                  <DialogContent>
                                      <DialogHeader>
                                          <DialogTitle>Edit Transaksi</DialogTitle>
                                          <DialogDescription>
                                              Perbarui detail transaksi Anda di bawah ini.
                                          </DialogDescription>
                                      </DialogHeader>
                                      <form onSubmit={handleEditFormSubmit} className="grid gap-4 py-4">
                                          <div className="grid grid-cols-4 items-center gap-4">
                                              <Label htmlFor="description" className="text-right">Deskripsi</Label>
                                              <Input id="description" name="description" defaultValue={transactionToEdit.description} className="col-span-3" />
                                          </div>
                                          <div className="grid grid-cols-4 items-center gap-4">
                                              <Label htmlFor="amount" className="text-right">Jumlah</Label>
                                              <Input id="amount" name="amount" type="number" defaultValue={transactionToEdit.amount} className="col-span-3" />
                                          </div>
                                          <div className="grid grid-cols-4 items-center gap-4">
                                              <Label htmlFor="category" className="text-right">Kategori</Label>
                                              <Input id="category" name="category" defaultValue={transactionToEdit.category} className="col-span-3" />
                                          </div>
                                           <div className="grid grid-cols-4 items-center gap-4">
                                              <Label htmlFor="type" className="text-right">Tipe</Label>
                                              <Select name="type" defaultValue={transactionToEdit.type}>
                                                <SelectTrigger className="col-span-3">
                                                  <SelectValue placeholder="Pilih tipe" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="expense">Pengeluaran</SelectItem>
                                                  <SelectItem value="income">Pemasukan</SelectItem>
                                                </SelectContent>
                                              </Select>
                                          </div>
                                          <DialogFooter>
                                              <DialogClose asChild>
                                                <Button type="button" variant="secondary">Batal</Button>
                                              </DialogClose>
                                              <Button type="submit">Simpan Perubahan</Button>
                                          </DialogFooter>
                                      </form>
                                  </DialogContent>
                                )}
                            </Dialog>
                            <AlertDialog onOpenChange={(open) => !open && setTransactionToDelete(null)}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setTransactionToDelete(t.id)}>
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Hapus</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus transaksi secara permanen.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteTransaction}>Lanjutkan</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
           {transactions.length > 5 && (
            <CardFooter className="justify-center">
              <Button
                onClick={() => setShowAllTransactions(!showAllTransactions)}
                variant="outline"
              >
                {showAllTransactions ? 'Tutup' : 'Lihat Lainnya'}
              </Button>
            </CardFooter>
          )}
        </Card>
      </main>

      {/* === Bagian Input Chatbot === */}
      <footer className="sticky bottom-0 p-2 sm:p-4 bg-background/80 backdrop-blur-sm border-t z-10">
        <form ref={formRef} onSubmit={formAction} className="max-w-3xl mx-auto">
          <div className="relative">
            <Input
              name="userInput"
              placeholder="cth., 'Makan siang 50rb'"
              className="pr-14 h-12 text-sm sm:text-base"
              disabled={isPending}
              autoComplete="off"
            />
            <Button type="submit" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-11" disabled={isPending}>
              {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              <span className="sr-only">Kirim</span>
            </Button>
          </div>
        </form>
      </footer>
    </div>
  );
}
