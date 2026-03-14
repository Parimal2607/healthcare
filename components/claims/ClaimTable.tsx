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

interface ClaimRow {
  id: string;
  claim_code: string;
  patient_id: string;
  amount: number;
  status: "Approved" | "Pending" | "Denied";
  submitted_at: string;
}

interface ClaimForm {
  claim_code: string;
  patient_code: string;
  amount: string;
  status: "Approved" | "Pending" | "Denied";
  submitted_at: string;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const pageSize = 8;

const emptyForm: ClaimForm = {
  claim_code: "",
  patient_code: "",
  amount: "",
  status: "Pending",
  submitted_at: ""
};

export function ClaimTable() {
  const { user } = useAuthUser();
  const { toastSuccess, toastError } = useToast();
  const role = user?.role ?? "member";
  const canCreateOrEdit = role === "admin" || role === "manager";
  const canDelete = role === "admin";

  const [rows, setRows] = useState<ClaimRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [patientCodeFilter, setPatientCodeFilter] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState<ClaimForm>(emptyForm);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const debouncedPatientCodeFilter = useDebouncedValue(patientCodeFilter, 400);
  const debouncedStatusFilter = useDebouncedValue(statusFilter, 250);

  const loadClaims = async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (debouncedStatusFilter !== "all") params.set("status", debouncedStatusFilter);
      if (debouncedPatientCodeFilter.trim()) params.set("patientCode", debouncedPatientCodeFilter.trim());
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      const response = await fetch(`/api/claims?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as { claims?: ClaimRow[]; pagination?: PaginationMeta; error?: string };

      if (!response.ok) {
        const message = payload.error ?? "Unable to load claims.";
        setError(message);
        toastError("Failed to load claims", message);
        return;
      }

      setRows(payload.claims ?? []);
      setTotal(payload.pagination?.total ?? 0);
      setTotalPages(payload.pagination?.totalPages ?? 1);
    } catch {
      setError("Unable to load claims.");
      toastError("Failed to load claims", "Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadClaims();
  }, [debouncedStatusFilter, debouncedPatientCodeFilter, page]);

  const startEdit = (row: ClaimRow) => {
    setEditingCode(row.claim_code);
    setForm({
      claim_code: row.claim_code,
      patient_code: "",
      amount: String(row.amount),
      status: row.status,
      submitted_at: row.submitted_at
    });
    setIsDialogOpen(true);
  };

  const startCreate = () => {
    setEditingCode(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const saveClaim = async () => {
    if (!canCreateOrEdit) return;

    setIsSaving(true);
    setError("");

    try {
      const method = editingCode ? "PATCH" : "POST";
      const url = editingCode ? `/api/claims?claimCode=${editingCode}` : "/api/claims";

      const body = {
        claim_code: form.claim_code,
        patient_code: form.patient_code || undefined,
        amount: Number(form.amount),
        status: form.status,
        submitted_at: form.submitted_at
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        const message = payload.error ?? "Unable to save claim.";
        setError(message);
        toastError("Save failed", message);
        return;
      }

      setEditingCode(null);
      setForm(emptyForm);
      setIsDialogOpen(false);
      toastSuccess(editingCode ? "Claim updated" : "Claim added");
      await loadClaims();
    } catch {
      setError("Unable to save claim.");
      toastError("Save failed", "Please retry.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteClaim = async (claimCode: string) => {
    if (!canDelete) return;

    const response = await fetch(`/api/claims?claimCode=${claimCode}`, { method: "DELETE" });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      const message = payload.error ?? "Unable to delete claim.";
      setError(message);
      toastError("Delete failed", message);
      return;
    }

    toastSuccess("Claim deleted");
    await loadClaims();
  };

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle>Claims</CardTitle>
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
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">all</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Denied">Denied</SelectItem>
            </SelectContent>
          </Select>
          {canCreateOrEdit ? <Button onClick={startCreate}>Add Claim</Button> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading claims...</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {!isLoading && !error ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.claim_code}</TableCell>
                    <TableCell>{row.amount}</TableCell>
                    <TableCell><Badge variant={row.status === "Approved" ? "secondary" : row.status === "Pending" ? "outline" : "destructive"}>{row.status}</Badge></TableCell>
                    <TableCell>{row.submitted_at}</TableCell>
                    <TableCell className="flex gap-2">
                      {canCreateOrEdit ? <Button size="sm" variant="outline" onClick={() => startEdit(row)}>Edit</Button> : null}
                      {canDelete ? <Button size="sm" variant="destructive" onClick={() => void deleteClaim(row.claim_code)}>Delete</Button> : null}
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
        title={editingCode ? "Update Claim" : "Add Claim"}
        description="Add or update claim details."
        submitLabel={editingCode ? "Update Claim" : "Add Claim"}
        isSubmitting={isSaving}
        onSubmit={() => void saveClaim()}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Claim Code" value={form.claim_code} onChange={(e) => setForm((p) => ({ ...p, claim_code: e.target.value }))} disabled={Boolean(editingCode)} />
          <Input placeholder="Patient Code" value={form.patient_code} onChange={(e) => setForm((p) => ({ ...p, patient_code: e.target.value }))} />
          <Input placeholder="Amount" type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
          <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as ClaimForm["status"] }))}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Denied">Denied</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={form.submitted_at} onChange={(e) => setForm((p) => ({ ...p, submitted_at: e.target.value }))} />
        </div>
      </CrudDialog>
    </Card>
  );
}