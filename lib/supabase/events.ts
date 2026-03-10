import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/database";
import type { Event } from "@/lib/types/content";

type EventRow = Tables<"events">;

export interface EventFilters {
  city?: string;
  type?: string;
  period?: string;
}

function toEvent(row: EventRow): Event {
  return {
    ...row,
    is_past: new Date(row.event_date) < new Date(),
    city: row.city as Event["city"],
    event_type: row.event_type as Event["event_type"],
  };
}

export async function getEvents(filters: EventFilters = {}): Promise<Event[]> {
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select("*")
    .eq("published", true)
    .order("event_date", { ascending: true });

  if (filters.city) {
    query = query.eq("city", filters.city);
  }
  if (filters.type) {
    query = query.eq("event_type", filters.type);
  }
  if (filters.period === "upcoming") {
    query = query.gte("event_date", new Date().toISOString());
  }
  if (filters.period === "past") {
    query = query.lt("event_date", new Date().toISOString());
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data.map(toEvent);
}
