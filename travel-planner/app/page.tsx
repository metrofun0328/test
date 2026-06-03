"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Itinerary } from "@/types";
import { getItineraries, saveItinerary, deleteItinerary } from "@/lib/storage";
import CreateTripForm from "@/components/CreateTripForm";
import { MapPin, Calendar, Trash2, ArrowRight, Plane } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setItineraries(getItineraries());
  }, []);

  const handleCreate = (params: {
    destination: string;
    days: number;
    startDate: string;
    budget: string;
  }) => {
    const endDate = new Date(params.startDate);
    endDate.setDate(endDate.getDate() + params.days - 1);

    const days = Array.from({ length: params.days }, (_, i) => {
      const date = new Date(params.startDate);
      date.setDate(date.getDate() + i);
      return {
        day: i + 1,
        date: date.toISOString().split("T")[0],
        activities: [],
      };
    });

    const itinerary: Itinerary = {
      id: Date.now().toString(),
      title: `${params.destination}之旅`,
      destination: params.destination,
      startDate: params.startDate,
      endDate: endDate.toISOString().split("T")[0],
      days,
      totalBudget: params.budget ? parseInt(params.budget) : 0,
      createdAt: new Date().toISOString(),
    };

    saveItinerary(itinerary);
    setItineraries(getItineraries());
    setShowForm(false);
    router.push(`/itinerary/${itinerary.id}`);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteItinerary(id);
    setItineraries(getItineraries());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Plane size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">旅遊規劃</h1>
          <p className="text-gray-500 mt-2">輕鬆規劃你的旅遊行程</p>
        </div>

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-6 shadow-lg shadow-blue-200"
          >
            + 建立新行程
          </button>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">建立新行程</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <CreateTripForm onSubmit={handleCreate} />
          </div>
        )}

        {itineraries.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">我的行程</h2>
            <div className="space-y-3">
              {itineraries.map((it) => (
                <div
                  key={it.id}
                  onClick={() => router.push(`/itinerary/${it.id}`)}
                  className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{it.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><MapPin size={13} />{it.destination}</span>
                        <span className="flex items-center gap-1"><Calendar size={13} />{it.startDate}</span>
                      </div>
                      {it.totalBudget > 0 && (
                        <p className="text-xs text-green-600 mt-1 font-medium">預算 NT${it.totalBudget.toLocaleString()}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={(e) => handleDelete(it.id, e)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                      <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {itineraries.length === 0 && !showForm && (
          <div className="text-center py-16 text-gray-400">
            <Plane size={48} className="mx-auto mb-4 opacity-30" />
            <p>還沒有行程，建立你的第一趟旅行吧！</p>
          </div>
        )}
      </div>
    </div>
  );
}
