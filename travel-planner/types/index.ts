export interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  category: "food" | "attraction" | "transport" | "accommodation" | "other";
  estimatedCost: number;
}

export interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
}

export interface Itinerary {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: DayPlan[];
  totalBudget: number;
  createdAt: string;
}

export interface TripExpense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  participants: string[];
  category: string;
  date: string;
}

export interface TripMember {
  id: string;
  name: string;
}
