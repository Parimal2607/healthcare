"use client";

import { useEffect, useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useToast } from "@/hooks/useToast";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CrudDialog } from "@/components/common/CrudDialog";
import { TablePagination } from "@/components/common/TablePagination";

interface PatientRow {
  id: string;
  patient_code: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  last_visit: string | null;
  status: "Active" | "Critical" | "Inactive";
  provider_id: string | null;
}

interface PatientForm {
  patient_code: string;
  name: string;
  age: string;
  gender: "Male" | "Female" | "Other";
  last_visit: string;
  status: "Active" | "Critical" | "Inactive";
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const pageSize = 8;

const emptyForm: PatientForm = {
  patient_code: "",
  name: "",
  age: "",
  gender: "Male",
  last_visit: "",
  status: "Active"
};

export function PatientTable() {
  const { user } = useAuthUser();
  const { toastSuccess, toastError } = useToast();
  const role = user?.role ?? "member";
  const canCreateOrEdit = role === "admin" || role === "manager";
  const canDelete = role === "admin";

  const [data, setData] = useState<PatientRow[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState<PatientForm>(emptyForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 400);
  const debouncedStatus = useDebouncedValue(status, 250);

  const loadPatients = async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (debouncedStatus !== "all") params.set("status", debouncedStatus);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      const response = await fetch(`/api/patients?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as { patients?: PatientRow[]; pagination?: PaginationMeta; error?: string };

      if (!response.ok) {
        const message = payload.error ?? "Unable to load patients.";
        setError(message);
        toastError("Failed to load patients", message);
        setData([]);
        return;
      }

      setData(payload.patients ?? []);
      setTotal(payload.pagination?.total ?? 0);
      setTotalPages(payload.pagination?.totalPages ?? 1);
    } catch {
      setError("Unable to load patients.");
      toastError("Failed to load patients", "Please retry.");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPatients();
  }, [debouncedSearch, debouncedStatus, page]);

  const startCreate = () => {
    setEditingCode(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const startEdit = (row: PatientRow) => {
    setEditingCode(row.patient_code);
    setForm({
      patient_code: row.patient_code,
      name: row.name,
      age: String(row.age),
      gender: row.gender,
      last_visit: row.last_visit ?? "",
      status: row.status
    });
    setIsDialogOpen(true);
  };

  const savePatient = async () => {
    if (!canCreateOrEdit) return;
    setIsSaving(true);
    setError("");

    try {
      const body = {
        patient_code: form.patient_code,
        name: form.name,
        age: Number(form.age),
        gender: form.gender,
        last_visit: form.last_visit || null,
        status: form.status
      };

      const method = editingCode ? "PATCH" : "POST";
      const url = editingCode ? `/api/patients?patientCode=${editingCode}` : "/api/patients";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        const message = payload.error ?? "Unable to save patient.";
        setError(message);
        toastError("Save failed", message);
        return;
      }

      setForm(emptyForm);
      setEditingCode(null);
      setIsDialogOpen(false);
      toastSuccess(editingCode ? "Patient updated" : "Patient added");
      await loadPatients();
    } catch {
      setError("Unable to save patient.");
      toastError("Save failed", "Please retry.");
    } finally {
      setIsSaving(false);
    }
  };

  const deletePatient = async (patientCode: string) => {
    if (!canDelete) return;
    setError("");

    try {
      const response = await fetch(`/api/patients?patientCode=${patientCode}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        const message = payload.error ?? "Unable to delete patient.";
        setError(message);
        toastError("Delete failed", message);
        return;
      }

      toastSuccess("Patient deleted");
      await loadPatients();
    } catch {
      setError("Unable to delete patient.");
      toastError("Delete failed", "Please retry.");
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Patient Registry</CardTitle>
          <div className="flex w-full gap-2 sm:w-auto">
            <Input
              placeholder="Search patients"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            {canCreateOrEdit ? <Button onClick={startCreate}>Add Patient</Button> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading patients...</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {!isLoading && !error ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <a className="text-primary hover:underline" href={`/patients/${patient.patient_code}`}>
                        {patient.patient_code}
                      </a>
                    </TableCell>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>{patient.last_visit ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant={patient.status === "Critical" ? "destructive" : "secondary"}>{patient.status}</Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      {canCreateOrEdit ? (
                        <Button size="sm" variant="outline" onClick={() => startEdit(patient)}>
                          Edit
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <Button size="sm" variant="destructive" onClick={() => void deletePatient(patient.patient_code)}>
                          Delete
                        </Button>
                      ) : null}
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
        title={editingCode ? "Update Patient" : "Add Patient"}
        description="Add or update patient details."
        submitLabel={editingCode ? "Update Patient" : "Add Patient"}
        isSubmitting={isSaving}
        onSubmit={() => void savePatient()}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Patient Code"
            value={form.patient_code}
            onChange={(event) => setForm((prev) => ({ ...prev, patient_code: event.target.value }))}
            disabled={Boolean(editingCode)}
          />
          <Input placeholder="Name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          <Input placeholder="Age" type="number" value={form.age} onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))} />
          <Select value={form.gender} onValueChange={(value) => setForm((prev) => ({ ...prev, gender: value as PatientForm["gender"] }))}>
            <SelectTrigger>
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={form.last_visit} onChange={(event) => setForm((prev) => ({ ...prev, last_visit: event.target.value }))} />
          <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as PatientForm["status"] }))}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CrudDialog>
    </Card>
  );
}