"use client";

import { useState } from "react";
import { TripExpense, TripMember } from "@/types";
import { Plus, Trash2, Users, Receipt } from "lucide-react";

interface Props {
  expenses: TripExpense[];
  members: TripMember[];
  onUpdate: (expenses: TripExpense[], members: TripMember[]) => void;
}

function calculateSettlement(expenses: TripExpense[], members: TripMember[]) {
  const balances: Record<string, number> = {};
  members.forEach((m) => (balances[m.name] = 0));

  expenses.forEach((exp) => {
    const share = exp.amount / exp.participants.length;
    exp.participants.forEach((p) => {
      balances[p] = (balances[p] ?? 0) - share;
    });
    balances[exp.paidBy] = (balances[exp.paidBy] ?? 0) + exp.amount;
  });

  const settlements: { from: string; to: string; amount: number }[] = [];
  const debtors = Object.entries(balances).filter(([, v]) => v < -0.01).sort(([, a], [, b]) => a - b);
  const creditors = Object.entries(balances).filter(([, v]) => v > 0.01).sort(([, a], [, b]) => b - a);

  let di = 0, ci = 0;
  const d = debtors.map(([n, v]) => ({ name: n, amount: -v }));
  const c = creditors.map(([n, v]) => ({ name: n, amount: v }));

  while (di < d.length && ci < c.length) {
    const pay = Math.min(d[di].amount, c[ci].amount);
    settlements.push({ from: d[di].name, to: c[ci].name, amount: Math.round(pay) });
    d[di].amount -= pay;
    c[ci].amount -= pay;
    if (d[di].amount < 0.01) di++;
    if (c[ci].amount < 0.01) ci++;
  }

  return settlements;
}

export default function ExpenseTracker({ expenses, members, onUpdate }: Props) {
  const [newMember, setNewMember] = useState("");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    paidBy: "",
    participants: [] as string[],
    category: "other",
    date: new Date().toISOString().split("T")[0],
  });

  const addMember = () => {
    if (!newMember.trim()) return;
    const member: TripMember = { id: Date.now().toString(), name: newMember.trim() };
    onUpdate(expenses, [...members, member]);
    setNewMember("");
  };

  const addExpense = () => {
    if (!form.description || !form.amount || !form.paidBy || form.participants.length === 0) return;
    const expense: TripExpense = {
      id: Date.now().toString(),
      description: form.description,
      amount: parseFloat(form.amount),
      paidBy: form.paidBy,
      participants: form.participants,
      category: form.category,
      date: form.date,
    };
    onUpdate([...expenses, expense], members);
    setForm({ description: "", amount: "", paidBy: "", participants: [], category: "other", date: new Date().toISOString().split("T")[0] });
    setShowAddExpense(false);
  };

  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const settlements = calculateSettlement(expenses, members);

  return (
    <div className="space-y-4">
      {/* 成員管理 */}
      <div className="bg-white rounded-xl border p-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
          <Users size={16} className="text-blue-500" />
          旅伴成員
        </h3>
        <div className="flex gap-2 mb-3">
          <input
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMember()}
            placeholder="輸入成員姓名"
            className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={addMember} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
              {m.name}
              <button onClick={() => onUpdate(expenses, members.filter((x) => x.id !== m.id))} className="text-blue-400 hover:text-red-500 ml-1">
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 費用統計 */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
        <p className="text-sm opacity-90">總花費</p>
        <p className="text-2xl font-bold">NT${totalExpense.toLocaleString()}</p>
        {members.length > 0 && (
          <p className="text-sm opacity-90 mt-1">每人平均 NT${Math.round(totalExpense / members.length).toLocaleString()}</p>
        )}
      </div>

      {/* 新增費用 */}
      <button
        onClick={() => setShowAddExpense(!showAddExpense)}
        className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center gap-2 transition-colors"
      >
        <Plus size={18} />
        新增費用
      </button>

      {showAddExpense && members.length > 0 && (
        <div className="bg-white border rounded-xl p-4 space-y-3">
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="費用說明"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="金額 (NT$)"
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">由誰付款</p>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setForm({ ...form, paidBy: m.name })}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${form.paidBy === m.name ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:border-blue-400"}`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">分攤成員</p>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    const p = form.participants.includes(m.name)
                      ? form.participants.filter((x) => x !== m.name)
                      : [...form.participants, m.name];
                    setForm({ ...form, participants: p });
                  }}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${form.participants.includes(m.name) ? "bg-green-600 text-white border-green-600" : "border-gray-300 text-gray-600 hover:border-green-400"}`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={addExpense}
            className="w-full py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
          >
            確認新增
          </button>
        </div>
      )}

      {/* 費用列表 */}
      {expenses.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Receipt size={16} className="text-green-500" />
            費用明細
          </h3>
          {expenses.map((exp) => (
            <div key={exp.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div>
                <p className="text-sm font-medium text-gray-800">{exp.description}</p>
                <p className="text-xs text-gray-400">{exp.paidBy} 付款 · 分攤：{exp.participants.join("、")}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-green-600">NT${exp.amount.toLocaleString()}</span>
                <button
                  onClick={() => onUpdate(expenses.filter((e) => e.id !== exp.id), members)}
                  className="text-gray-300 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 結算 */}
      {settlements.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-semibold text-amber-800 mb-2">結算建議</h3>
          {settlements.map((s, i) => (
            <p key={i} className="text-sm text-amber-700">
              <span className="font-medium">{s.from}</span> 需付給 <span className="font-medium">{s.to}</span>：NT${s.amount.toLocaleString()}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
