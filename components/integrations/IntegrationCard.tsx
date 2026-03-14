import { Activity, Plug } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IntegrationCardProps {
  name: string;
  status: "Connected" | "Pending" | "Issue";
  lastSync: string;
  health: string;
}

export function IntegrationCard({ name, status, lastSync, health }: IntegrationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2"><Plug className="h-4 w-4" />{name}</span>
          <Badge variant={status === "Connected" ? "secondary" : status === "Pending" ? "outline" : "destructive"}>{status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p className="text-muted-foreground">Last Sync: {lastSync}</p>
        <p className="flex items-center gap-2 text-muted-foreground"><Activity className="h-4 w-4" />Connection Health: {health}</p>
      </CardContent>
    </Card>
  );
}


