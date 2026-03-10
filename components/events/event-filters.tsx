"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Event } from "@/lib/types/content";

type CityToken = { label: string; bg: string; text: string };
const CITY_CONFIG: Record<NonNullable<Event["city"]>, CityToken> = {
  lille: { label: "Lille", bg: "#14532d", text: "#86efac" },
  paris: { label: "Paris", bg: "#1e3a5f", text: "#93c5fd" },
  lyon: { label: "Lyon", bg: "#7f1d1d", text: "#fca5a5" },
  bordeaux: { label: "Bordeaux", bg: "#4c0519", text: "#fda4af" },
  nantes: { label: "Nantes", bg: "#134e4a", text: "#5eead4" },
  bruxelles: { label: "Bruxelles", bg: "#713f12", text: "#fde68a" },
  londres: { label: "Londres", bg: "#1e293b", text: "#94a3b8" },
  remote: { label: "Remote", bg: "#581c87", text: "#d8b4fe" },
};

const CITY_GROUPS: { label: string; cities: NonNullable<Event["city"]>[] }[] = [
  { label: "France", cities: ["lille", "paris", "lyon", "bordeaux", "nantes"] },
  { label: "International", cities: ["bruxelles", "londres"] },
  { label: "Remote", cities: ["remote"] },
];

const TYPE_LABELS: Record<Event["event_type"], string> = {
  meetup: "Meetup",
  webinar: "Webinar",
  workshop: "Workshop",
  conference: "Conférence",
  hackathon: "Hackathon",
  "demo-day": "Demo Day",
  formation: "Formation",
};

const PERIOD_OPTIONS = [
  { value: "all", label: "Tous" },
  { value: "upcoming", label: "À venir" },
  { value: "past", label: "Passés" },
];

interface EventFiltersProps {
  allEvents: Event[];
}

export function EventFilters({ allEvents }: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCity = searchParams.get("city");
  const activeType = searchParams.get("type");
  const activePeriod = searchParams.get("period") ?? "all";

  const hasActiveFilter = !!activeCity || !!activeType || activePeriod !== "all";

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    router.push(`/events${query ? `?${query}` : ""}`);
  }

  function resetFilters() {
    router.push("/events");
  }

  const availableCities = Array.from(
    new Set(allEvents.map((e) => e.city).filter((c): c is NonNullable<Event["city"]> => c !== null))
  );

  const availableTypes = Array.from(
    new Set(allEvents.map((e) => e.event_type))
  );

  function countByCity(city: string) {
    return allEvents.filter((e) => e.city === city).length;
  }

  function countByType(type: string) {
    return allEvents.filter((e) => e.event_type === type).length;
  }

  return (
    <div className="space-y-4 mb-8">
      {/* Ville */}
      {availableCities.length > 0 && (
        <div className="flex flex-wrap items-start gap-2">
          <span className="text-sm text-muted-foreground w-16 shrink-0 pt-1">Ville</span>
          <div className="flex flex-col gap-3">
            {CITY_GROUPS.map((group) => {
              const groupCities = group.cities.filter((c) => availableCities.includes(c));
              if (groupCities.length === 0) return null;
              return (
                <div key={group.label}>
                  <span className="text-xs text-muted-foreground block mb-1">{group.label}</span>
                  <div className="flex flex-wrap gap-2">
                    {groupCities.map((city) => {
                      const config = CITY_CONFIG[city];
                      const isActive = activeCity === city;
                      return (
                        <button
                          key={city}
                          onClick={() => updateParam("city", isActive ? null : city)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-opacity",
                            isActive ? "opacity-100 ring-2 ring-white/30" : "opacity-70 hover:opacity-100"
                          )}
                          style={{ backgroundColor: config.bg, color: config.text }}
                        >
                          {config.label}
                          <span className="text-xs opacity-75">({countByCity(city)})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Type */}
      {availableTypes.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground w-16 shrink-0">Type</span>
          <div className="flex flex-wrap gap-2">
            {availableTypes.map((type) => {
              const isActive = activeType === type;
              return (
                <button
                  key={type}
                  onClick={() => updateParam("type", isActive ? null : type)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  {TYPE_LABELS[type]}
                  <span className="text-xs opacity-75">({countByType(type)})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Période */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground w-16 shrink-0">Période</span>
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map((option) => {
            const isActive = activePeriod === option.value;
            return (
              <button
                key={option.value}
                onClick={() => updateParam("period", option.value)}
                className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      {hasActiveFilter && (
        <div className="pt-1">
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground hover:text-foreground h-auto py-1 px-2">
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
}
