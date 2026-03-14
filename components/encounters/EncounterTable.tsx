"use client";

import { useEffect, useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useToast } from "@/hooks/useToast";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CrudDialog } from "@/components/common/CrudDialog";
import { TablePagination } from "@/components/common/TablePagination";

interface EncounterRow {
  id: string;
  encounter_code: string;
  type: "Inpatient" | "Outpatient" | "Emergency";
  date: string;
  summary: string;
}

interface EncounterForm {
  encounter_code: string;
  patient_code: string;
  type: "Inpatient" | "Outpatient" | "Emergency";
  date: string;
  summary: string;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const pageSize = 8;

const emptyForm: EncounterForm = {
  encounter_code: "",
  patient_code: "",
  type: "Outpatient",
  date: "",
  summary: ""
};

export function EncounterTable() {
  const { user } = useAuthUser();
  const { toastSuccess, toastError } = useToast();
  const role = user?.role ?? "member";
  const canCreateOrEdit = role === "admin" || role === "manager";
  const canDelete = role === "admin";

  const [rows, setRows] = useState<EncounterRow[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [patientCodeFilter, setPatientCodeFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState<EncounterForm>(emptyForm);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const debouncedPatientCodeFilter = useDebouncedValue(patientCodeFilter, 400);
  const debouncedTypeFilter = useDebouncedValue(typeFilter, 250);

  const loadEncounters = async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (debouncedPatientCodeFilter.trim()) params.set("patientCode", debouncedPatientCodeFilter.trim());
      if (debouncedTypeFilter !== "all") params.set("type", debouncedTypeFilter);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      const response = await fetch(`/api/encounters?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as { encounters?: EncounterRow[]; pagination?: PaginationMeta; error?: string };

      if (!response.ok) {
        const message = payload.error ?? "Unable to load encounters.";
        setError(message);
        toastError("Failed to load encounters", message);
        return;
      }

      setRows(payload.encounters ?? []);
      setTotal(payload.pagination?.total ?? 0);
      setTotalPages(payload.pagination?.totalPages ?? 1);
    } catch {
      setError("Unable to load encounters.");
      toastError("Failed to load encounters", "Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadEncounters();
  }, [debouncedPatientCodeFilter, debouncedTypeFilter, page]);

  const startEdit = (row: EncounterRow) => {
    setEditingCode(row.encounter_code);
    setForm({ encounter_code: row.encounter_code, patient_code: "", type: row.type, date: row.date, summary: row.summary });
    setIsDialogOpen(true);
  };

  const startCreate = () => {
    setEditingCode(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const saveEncounter = async () => {
    if (!canCreateOrEdit) return;
    setIsSaving(true);
    setError("");

    try {
      const method = editingCode ? "PATCH" : "POST";
      const url = editingCode ? `/api/encounters?encounterCode=${editingCode}` : "/api/encounters";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        const message = payload.error ?? "Unable to save encounter.";
        setError(message);
        toastError("Save failed", message);
        return;
      }

      setEditingCode(null);
      setForm(emptyForm);
      setIsDialogOpen(false);
      toastSuccess(editingCode ? "Encounter updated" : "Encounter added");
      await loadEncounters();
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEncounter = async (encounterCode: string) => {
    if (!canDelete) return;
    const response = await fetch(`/api/encounters?encounterCode=${encounterCode}`, { method: "DELETE" });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      const message = payload.error ?? "Unable to delete encounter.";
      setError(message);
      toastError("Delete failed", message);
      return;
    }
    toastSuccess("Encounter deleted");
    await loadEncounters();
  };

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle>Encounters</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Patient code"
            value={patientCodeFilter}
            onChange={(e) => {
              setPatientCodeFilter(e.target.value);
              setPage(1);
            }}
          />
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">all</SelectItem>
              <SelectItem value="Inpatient">Inpatient</SelectItem>
              <SelectItem value="Outpatient">Outpatient</SelectItem>
              <SelectItem value="Emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
          {canCreateOrEdit ? <Button onClick={startCreate}>Add Encounter</Button> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading encounters...</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {!isLoading && !error ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.encounter_code}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.summary}</TableCell>
                    <TableCell className="flex gap-2">
                      {canCreateOrEdit ? <Button size="sm" variant="outline" onClick={() => startEdit(row)}>Edit</Button> : null}
                      {canDelete ? <Button size="sm" variant="destructive" onClick={() => void deleteEncounter(row.encounter_code)}>Delete</Button> : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
              onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            />
          </>
        ) : null}
      </CardContent>

      <CrudDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingCode ? "Update Encounter" : "Add Encounter"}
        description="Add or update encounter details."
        submitLabel={editingCode ? "Update Encounter" : "Add Encounter"}
        isSubmitting={isSaving}
        onSubmit={() => void saveEncounter()}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Encounter Code" value={form.encounter_code} onChange={(e) => setForm((p) => ({ ...p, encounter_code: e.target.value }))} disabled={Boolean(editingCode)} />
          <Input placeholder="Patient Code" value={form.patient_code} onChange={(e) => setForm((p) => ({ ...p, patient_code: e.target.value }))} />
          <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v as EncounterForm["type"] }))}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Inpatient">Inpatient</SelectItem>
              <SelectItem value="Outpatient">Outpatient</SelectItem>
              <SelectItem value="Emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
          <Input placeholder="Summary" value={form.summary} onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))} />
        </div>
      </CrudDialog>
    </Card>
  );
}