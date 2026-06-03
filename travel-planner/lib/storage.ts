import { Itinerary, TripExpense, TripMember } from "@/types";

export function saveItinerary(itinerary: Itinerary): void {
  const list = getItineraries();
  const idx = list.findIndex((i) => i.id === itinerary.id);
  if (idx >= 0) list[idx] = itinerary;
  else list.push(itinerary);
  localStorage.setItem("itineraries", JSON.stringify(list));
}

export function getItineraries(): Itinerary[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("itineraries");
  return data ? JSON.parse(data) : [];
}

export function getItinerary(id: string): Itinerary | null {
  return getItineraries().find((i) => i.id === id) ?? null;
}

export function deleteItinerary(id: string): void {
  const list = getItineraries().filter((i) => i.id !== id);
  localStorage.setItem("itineraries", JSON.stringify(list));
}

export function saveExpenses(itineraryId: string, expenses: TripExpense[], members: TripMember[]): void {
  localStorage.setItem(`expenses_${itineraryId}`, JSON.stringify({ expenses, members }));
}

export function getExpenses(itineraryId: string): { expenses: TripExpense[]; members: TripMember[] } {
  if (typeof window === "undefined") return { expenses: [], members: [] };
  const data = localStorage.getItem(`expenses_${itineraryId}`);
  return data ? JSON.parse(data) : { expenses: [], members: [] };
}
