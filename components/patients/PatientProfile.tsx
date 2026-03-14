import type { Patient } from "@/types/patient.types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PatientProfile({ patient }: { patient: Patient }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        <p>
          <span className="text-muted-foreground">ID:</span> {patient.id}
        </p>
        <p>
          <span className="text-muted-foreground">Name:</span> {patient.name}
        </p>
        <p>
          <span className="text-muted-foreground">Age:</span> {patient.age}
        </p>
        <p>
          <span className="text-muted-foreground">Gender:</span> {patient.gender}
        </p>
        <p>
          <span className="text-muted-foreground">Last Visit:</span> {patient.lastVisit}
        </p>
        <p>
          <span className="text-muted-foreground">Status:</span>{" "}
          <Badge variant={patient.status === "Critical" ? "destructive" : "secondary"}>{patient.status}</Badge>
        </p>
      </CardContent>
    </Card>
  );
}
