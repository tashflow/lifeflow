import React, { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, DollarSign, Trash2 } from 'lucide-react';
import { Transaction } from '../types';

interface FinanceViewProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<'Housing' | 'Food' | 'Transport' | 'Investment' | 'Salary' | 'Leisure'>('Food');
  const [currency, setCurrency] = useState<'USD' | 'SAR'>('USD');

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netWorth = totalIncome - totalExpense;

  const formatCurrency = (val: number) => {
    if (currency === 'SAR') {
      return `${(val * 3.75).toLocaleString()} SAR`;
    }
    return `$${val.toLocaleString()}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    onAddTransaction({
      id: 'tx_' + Date.now(),
      title,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString().split('T')[0]
    });
    setTitle('');
    setAmount('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E9ECE8] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#123D32]">Personal Finance & Ledger</h2>
          <p className="text-xs text-neutral-500">Track income, monthly expenses, and net savings rate (Private by default).</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-neutral-100 p-1 rounded-xl">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currency === 'USD' ? 'bg-white text-[#123D32] shadow-sm' : 'text-neutral-600'}`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency('SAR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currency === 'SAR' ? 'bg-white text-[#123D32] shadow-sm' : 'text-neutral-600'}`}
            >
              SAR (ر.س)
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#123D32] text-white rounded-xl hover:bg-[#1a5244] font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Total Income</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold font-mono text-neutral-900">{formatCurrency(totalIncome)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Total Expenses</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold font-mono text-neutral-900">{formatCurrency(totalExpense)}</span>
          </div>
        </div>

        <div className="bg-[#123D32] text-white rounded-2xl p-6 shadow-md">
          <span className="text-xs font-bold text-[#C5A45D] uppercase tracking-wider block mb-2">Net Cashflow</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A45D] text-[#123D32] flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold font-mono text-white">{formatCurrency(netWorth)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E9ECE8] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-bold text-base text-[#123D32]">Recent Transactions</h3>
          <span className="text-xs text-neutral-400">Strict Personal Privacy Enforced</span>
        </div>
        <div className="divide-y divide-neutral-100">
          {transactions.length === 0 && (
            <div className="text-center py-12 text-neutral-400">
              <p className="text-sm">No transactions recorded yet.</p>
            </div>
          )}
          {transactions.map(tx => (
            <div key={tx.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors">
              <div>
                <h4 className="text-sm font-semibold text-neutral-900">{tx.title}</h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
                  <span className="font-medium text-[#123D32]">{tx.category}</span>
                  <span>•</span>
                  <span>{tx.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-sm font-bold font-mono ${tx.type === 'income' ? 'text-emerald-600' : 'text-neutral-900'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
                <button
                  onClick={() => onDeleteTransaction(tx.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                  title="Delete transaction"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-[#E9ECE8] space-y-4">
            <h3 className="font-bold text-lg text-[#123D32]">Add Transaction</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Title</label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cloud server hosting"
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#123D32]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Amount ({currency})</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="120.00"
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#123D32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#123D32]"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#123D32]"
                >
                  <option value="Food">Food</option>
                  <option value="Housing">Housing</option>
                  <option value="Transport">Transport</option>
                  <option value="Investment">Investment</option>
                  <option value="Salary">Salary</option>
                  <option value="Leisure">Leisure</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 font-medium text-sm hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#123D32] text-white rounded-xl font-medium text-sm hover:bg-[#1a5244]"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
