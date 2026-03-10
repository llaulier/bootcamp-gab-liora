export interface Article {
  id: string
  slug: string
  title: string
  content: string | null
  excerpt: string | null
  category: string | null
  tags: string[] | null
  featured_image: string | null
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Resource {
  id: string
  slug: string
  title: string
  content: string | null
  type: "guide" | "skill" | "template" | "prompt"
  parcours: string[] | null
  difficulty: "beginner" | "intermediate" | "advanced" | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  slug: string
  title: string
  description: string | null
  event_date: string
  event_end_date: string | null
  location: string | null
  city: "lille" | "paris" | "lyon" | "bordeaux" | "nantes" | "bruxelles" | "londres" | "remote" | null
  image_url: string | null
  registration_url: string | null
  replay_url: string | null
  is_past: boolean
  event_type: "meetup" | "webinar" | "workshop" | "conference" | "hackathon" | "demo-day" | "formation"
  capacity: number | null
  published: boolean
  created_at: string
  updated_at: string
}
