"use client";

import { useState } from "react";
import { DayPlan, Activity } from "@/types";
import { Clock, MapPin, Utensils, Camera, Car, Home, MoreHorizontal, ChevronDown, ChevronUp } from "lucide-react";

const categoryIcon = {
  food: <Utensils size={14} />,
  attraction: <Camera size={14} />,
  transport: <Car size={14} />,
  accommodation: <Home size={14} />,
  other: <MoreHorizontal size={14} />,
};

const categoryColor = {
  food: "bg-orange-100 text-orange-700 border-orange-200",
  attraction: "bg-blue-100 text-blue-700 border-blue-200",
  transport: "bg-gray-100 text-gray-700 border-gray-200",
  accommodation: "bg-purple-100 text-purple-700 border-purple-200",
  other: "bg-green-100 text-green-700 border-green-200",
};

const categoryLabel = {
  food: "美食",
  attraction: "景點",
  transport: "交通",
  accommodation: "住宿",
  other: "其他",
};

function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <div className="flex gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
      <div className="text-xs text-gray-400 w-12 pt-0.5 flex-shrink-0">
        <Clock size={12} className="inline mr-1" />
        {activity.time}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-gray-800 text-sm">{activity.title}</h4>
          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${categoryColor[activity.category]}`}>
            {categoryIcon[activity.category]}
            {categoryLabel[activity.category]}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
          <MapPin size={11} />
          {activity.location}
        </div>
        <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
        {activity.estimatedCost > 0 && (
          <p className="text-xs text-green-600 mt-1 font-medium">約 NT${activity.estimatedCost.toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}

function DayCard({ dayPlan }: { dayPlan: DayPlan }) {
  const [expanded, setExpanded] = useState(true);
  const dailyCost = dayPlan.activities.reduce((sum, a) => sum + a.estimatedCost, 0);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
            {dayPlan.day}
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-800">第 {dayPlan.day} 天</p>
            <p className="text-xs text-gray-500">{dayPlan.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-green-600 font-medium">NT${dailyCost.toLocaleString()}</span>
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>
      {expanded && (
        <div className="p-4 space-y-2 bg-gray-50">
          {dayPlan.activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: DayPlan[];
  totalBudget: number;
}

export default function ItineraryView({ title, destination, startDate, endDate, days, totalBudget }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex items-center gap-4 mt-2 text-blue-100 text-sm">
          <span className="flex items-center gap-1"><MapPin size={14} />{destination}</span>
          <span className="flex items-center gap-1"><Clock size={14} />{startDate} ～ {endDate}</span>
        </div>
        <div className="mt-3 text-lg font-semibold">
          預估總費用：NT${totalBudget.toLocaleString()}
        </div>
      </div>

      <div className="space-y-3">
        {days.map((day) => (
          <DayCard key={day.day} dayPlan={day} />
        ))}
      </div>
    </div>
  );
}
