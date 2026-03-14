import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineEvent {
  id: string;
  type: string;
  date: string;
  summary: string;
}

export function PatientTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Encounter Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={event.id} className="rounded-md border border-border bg-muted p-2">
              <p className="text-sm font-medium text-foreground">
                {event.type} - {event.date}
              </p>
              <p className="text-xs text-muted-foreground">{event.summary}</p>
            </li>
          ))}
          {events.length === 0 ? <li className="text-sm text-muted-foreground">No encounter history found.</li> : null}
        </ul>
      </CardContent>
    </Card>
  );
}
