import type { Metadata } from "next";
import { Calendar } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { EventFilters } from "@/components/events/event-filters";
import { getEvents } from "@/lib/supabase/events";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Meetups, webinars et workshops GenAI. Rejoins la communaute GAB.",
};

interface EventsPageProps {
  searchParams: Promise<{ city?: string; type?: string; period?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { city, type, period } = await searchParams;

  const [allEvents, filtered] = await Promise.all([
    getEvents(),
    getEvents({ city, type, period }),
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mb-10">
        <h1 className="font-heading text-3xl font-bold mb-4">Events</h1>
        <p className="text-lg text-muted-foreground">
          Meetups, webinars et workshops avec des experts GenAI. Participe en
          direct ou regarde les replays.
        </p>
      </div>

      <Suspense>
        <EventFilters allEvents={allEvents} />
      </Suspense>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border/50 p-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Aucun event ne correspond à ces filtres.
          </p>
          <Button asChild variant="outline">
            <Link href="/events">Réinitialiser les filtres</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
