"use client";

import { useState } from "react";
import { MapPin, Calendar, DollarSign, Heart, Loader2 } from "lucide-react";

interface Props {
  onGenerate: (params: {
    destination: string;
    days: number;
    startDate: string;
    budget: string;
    preferences: string;
  }) => void;
  loading: boolean;
}

export default function GenerateForm({ onGenerate, loading }: Props) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("5");
  const [startDate, setStartDate] = useState("");
  const [budget, setBudget] = useState("");
  const [preferences, setPreferences] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !days || !startDate) return;
    onGenerate({ destination, days: parseInt(days), startDate, budget, preferences });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          <MapPin size={16} className="text-blue-500" />
          目的地 *
        </label>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="例如：日本東京、泰國清邁"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Calendar size={16} className="text-blue-500" />
            出發日期 *
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Calendar size={16} className="text-blue-500" />
            天數 *
          </label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            min="1"
            max="30"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          <DollarSign size={16} className="text-blue-500" />
          預算（台幣，選填）
        </label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="例如：30000"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          <Heart size={16} className="text-blue-500" />
          旅遊偏好（選填）
        </label>
        <textarea
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          placeholder="例如：喜歡美食、文化體驗、避免過多趕路..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !destination || !startDate}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            AI 規劃中...
          </>
        ) : (
          "✨ 生成行程"
        )}
      </button>
    </form>
  );
}
