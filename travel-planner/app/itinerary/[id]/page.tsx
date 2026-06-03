"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Itinerary, TripExpense, TripMember, Activity } from "@/types";
import { getItinerary, saveItinerary, getExpenses, saveExpenses } from "@/lib/storage";
import ItineraryView from "@/components/ItineraryView";
import ExpenseTracker from "@/components/ExpenseTracker";
import { ArrowLeft, Map, DollarSign, Plus, X } from "lucide-react";

const categoryOptions = [
  { value: "attraction", label: "景點" },
  { value: "food", label: "美食" },
  { value: "transport", label: "交通" },
  { value: "accommodation", label: "住宿" },
  { value: "other", label: "其他" },
];

function AddActivityModal({
  dayIndex,
  onAdd,
  onClose,
}: {
  dayIndex: number;
  onAdd: (dayIndex: number, activity: Activity) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    time: "09:00",
    title: "",
    description: "",
    location: "",
    category: "attraction" as Activity["category"],
    estimatedCost: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    onAdd(dayIndex, {
      id: Date.now().toString(),
      time: form.time,
      title: form.title,
      description: form.description,
      location: form.location,
      category: form.category,
      estimatedCost: form.estimatedCost ? parseInt(form.estimatedCost) : 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">新增活動</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">時間</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">類型</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Activity["category"] })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categoryOptions.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">活動名稱 *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="例如：參觀淺草寺"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">地點</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="例如：東京都台東區"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">備註</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="行程備註..."
              rows={2}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">預估費用（NT$）</label>
            <input
              type="number"
              value={form.estimatedCost}
              onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
              placeholder="0"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            新增
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [tab, setTab] = useState<"itinerary" | "expenses">("itinerary");
  const [expenses, setExpenses] = useState<TripExpense[]>([]);
  const [members, setMembers] = useState<TripMember[]>([]);
  const [addingToDayIndex, setAddingToDayIndex] = useState<number | null>(null);

  useEffect(() => {
    const it = getItinerary(id);
    if (!it) { router.push("/"); return; }
    setItinerary(it);
    const { expenses: e, members: m } = getExpenses(id);
    setExpenses(e);
    setMembers(m);
  }, [id, router]);

  const handleAddActivity = (dayIndex: number, activity: Activity) => {
    if (!itinerary) return;
    const updated = { ...itinerary };
    updated.days[dayIndex].activities = [...updated.days[dayIndex].activities, activity];
    updated.totalBudget = updated.days.flatMap((d) => d.activities).reduce((s, a) => s + a.estimatedCost, 0);
    saveItinerary(updated);
    setItinerary({ ...updated });
  };

  const handleDeleteActivity = (dayIndex: number, activityId: string) => {
    if (!itinerary) return;
    const updated = { ...itinerary };
    updated.days[dayIndex].activities = updated.days[dayIndex].activities.filter((a) => a.id !== activityId);
    updated.totalBudget = updated.days.flatMap((d) => d.activities).reduce((s, a) => s + a.estimatedCost, 0);
    saveItinerary(updated);
    setItinerary({ ...updated });
  };

  const handleExpenseUpdate = (newExpenses: TripExpense[], newMembers: TripMember[]) => {
    setExpenses(newExpenses);
    setMembers(newMembers);
    saveExpenses(id, newExpenses, newMembers);
  };

  if (!itinerary) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 text-sm"
        >
          <ArrowLeft size={16} />
          返回首頁
        </button>

        <div className="flex gap-1 bg-white border rounded-xl p-1 mb-6">
          <button
            onClick={() => setTab("itinerary")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${tab === "itinerary" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Map size={16} />
            行程規劃
          </button>
          <button
            onClick={() => setTab("expenses")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${tab === "expenses" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700"}`}
          >
            <DollarSign size={16} />
            分帳記帳
          </button>
        </div>

        {tab === "itinerary" && (
          <ItineraryView
            title={itinerary.title}
            destination={itinerary.destination}
            startDate={itinerary.startDate}
            endDate={itinerary.endDate}
            days={itinerary.days}
            totalBudget={itinerary.totalBudget}
            onAddActivity={(dayIndex) => setAddingToDayIndex(dayIndex)}
            onDeleteActivity={handleDeleteActivity}
          />
        )}

        {tab === "expenses" && (
          <ExpenseTracker
            expenses={expenses}
            members={members}
            onUpdate={handleExpenseUpdate}
          />
        )}

        {addingToDayIndex !== null && (
          <AddActivityModal
            dayIndex={addingToDayIndex}
            onAdd={handleAddActivity}
            onClose={() => setAddingToDayIndex(null)}
          />
        )}
      </div>
    </div>
  );
}
