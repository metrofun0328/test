"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Itinerary, TripExpense, TripMember } from "@/types";
import { getItinerary } from "@/lib/storage";
import { getExpenses, saveExpenses } from "@/lib/storage";
import ItineraryView from "@/components/ItineraryView";
import ExpenseTracker from "@/components/ExpenseTracker";
import { ArrowLeft, Map, DollarSign } from "lucide-react";

export default function ItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [tab, setTab] = useState<"itinerary" | "expenses">("itinerary");
  const [expenses, setExpenses] = useState<TripExpense[]>([]);
  const [members, setMembers] = useState<TripMember[]>([]);

  useEffect(() => {
    const it = getItinerary(id);
    if (!it) { router.push("/"); return; }
    setItinerary(it);
    const { expenses: e, members: m } = getExpenses(id);
    setExpenses(e);
    setMembers(m);
  }, [id, router]);

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
          />
        )}

        {tab === "expenses" && (
          <ExpenseTracker
            expenses={expenses}
            members={members}
            onUpdate={handleExpenseUpdate}
          />
        )}
      </div>
    </div>
  );
}
