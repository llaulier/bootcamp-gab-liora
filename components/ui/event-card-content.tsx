import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";

export interface EventCardContentProps {
  date: string;
  title: string;
  registrationUrl: string;
}

export function EventCardContent({
  date,
  title,
  registrationUrl,
}: EventCardContentProps) {
  return (
    <CardContent className="p-4">
      <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
        <Calendar className="h-4 w-4" />
        <span>{date}</span>
      </div>
      <h3 className="font-heading text-lg font-semibold mb-3 text-white">
        {title}
      </h3>
      <Button asChild className="w-full">
        <Link href={registrationUrl}>
          S&apos;inscrire
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </CardContent>
  );
}
