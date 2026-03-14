"use client";

import { useEffect, useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useToast } from "@/hooks/useToast";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CrudDialog } from "@/components/common/CrudDialog";
import { TablePagination } from "@/components/common/TablePagination";

interface ObservationRow {
  id: string;
  observation_code: string;
  type: string;
  value: string;
  unit: string | null;
  date: string;
}

interface ObservationForm {
  observation_code: string;
  patient_code: string;
  type: string;
  value: string;
  unit: string;
  date: string;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const pageSize = 8;

const emptyForm: ObservationForm = {
  observation_code: "",
  patient_code: "",
  type: "",
  value: "",
  unit: "",
  date: ""
};

export function ObservationTable() {
  const { user } = useAuthUser();
  const { toastSuccess, toastError } = useToast();
  const role = user?.role ?? "member";
  const canCreateOrEdit = role === "admin" || role === "manager";
  const canDelete = role === "admin";

  const [rows, setRows] = useState<ObservationRow[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [patientCodeFilter, setPatientCodeFilter] = useState("");
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState<ObservationForm>(emptyForm);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const debouncedPatientCodeFilter = useDebouncedValue(patientCodeFilter, 400);

  const loadObservations = async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (debouncedPatientCodeFilter.trim()) params.set("patientCode", debouncedPatientCodeFilter.trim());
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      const response = await fetch(`/api/observations?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as { observations?: ObservationRow[]; pagination?: PaginationMeta; error?: string };

      if (!response.ok) {
        const message = payload.error ?? "Unable to load observations.";
        setError(message);
        toastError("Failed to load observations", message);
        return;
      }

      setRows(payload.observations ?? []);
      setTotal(payload.pagination?.total ?? 0);
      setTotalPages(payload.pagination?.totalPages ?? 1);
    } catch {
      setError("Unable to load observations.");
      toastError("Failed to load observations", "Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadObservations();
  }, [debouncedPatientCodeFilter, page]);

  const startEdit = (row: ObservationRow) => {
    setEditingCode(row.observation_code);
    setForm({
      observation_code: row.observation_code,
      patient_code: "",
      type: row.type,
      value: row.value,
      unit: row.unit ?? "",
      date: row.date
    });
    setIsDialogOpen(true);
  };

  const startCreate = () => {
    setEditingCode(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const saveObservation = async () => {
    if (!canCreateOrEdit) return;
    setIsSaving(true);
    setError("");

    try {
      const method = editingCode ? "PATCH" : "POST";
      const url = editingCode ? `/api/observations?observationCode=${editingCode}` : "/api/observations";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, unit: form.unit || null })
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        const message = payload.error ?? "Unable to save observation.";
        setError(message);
        toastError("Save failed", message);
        return;
      }

      setEditingCode(null);
      setForm(emptyForm);
      setIsDialogOpen(false);
      toastSuccess(editingCode ? "Observation updated" : "Observation added");
      await loadObservations();
    } finally {
      setIsSaving(false);
    }
  };

  const deleteObservation = async (observationCode: string) => {
    if (!canDelete) return;
    const response = await fetch(`/api/observations?observationCode=${observationCode}`, { method: "DELETE" });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      const message = payload.error ?? "Unable to delete observation.";
      setError(message);
      toastError("Delete failed", message);
      return;
    }
    toastSuccess("Observation deleted");
    await loadObservations();
  };

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle>Observations</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Patient code"
            value={patientCodeFilter}
            onChange={(e) => {
              setPatientCodeFilter(e.target.value);
              setPage(1);
            }}
          />
          {canCreateOrEdit ? <Button onClick={startCreate}>Add Observation</Button> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading observations...</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {!isLoading && !error ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.observation_code}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.value}</TableCell>
                    <TableCell>{row.unit ?? "-"}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell className="flex gap-2">
                      {canCreateOrEdit ? <Button size="sm" variant="outline" onClick={() => startEdit(row)}>Edit</Button> : null}
                      {canDelete ? <Button size="sm" variant="destructive" onClick={() => void deleteObservation(row.observation_code)}>Delete</Button> : null}
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
        title={editingCode ? "Update Observation" : "Add Observation"}
        description="Add or update observation details."
        submitLabel={editingCode ? "Update Observation" : "Add Observation"}
        isSubmitting={isSaving}
        onSubmit={() => void saveObservation()}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Observation Code" value={form.observation_code} onChange={(e) => setForm((p) => ({ ...p, observation_code: e.target.value }))} disabled={Boolean(editingCode)} />
          <Input placeholder="Patient Code" value={form.patient_code} onChange={(e) => setForm((p) => ({ ...p, patient_code: e.target.value }))} />
          <Input placeholder="Type" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} />
          <Input placeholder="Value" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))} />
          <Input placeholder="Unit" value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))} />
          <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
        </div>
      </CrudDialog>
    </Card>
  );
}