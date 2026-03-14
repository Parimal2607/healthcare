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

interface ConsentRow {
  id: string;
  consent_code: string;
  patient_name: string;
  organization: string;
  permission: string;
  status: "Granted" | "Pending" | "Revoked";
  granted_date: string;
}

interface ConsentForm {
  consent_code: string;
  patient_name: string;
  organization: string;
  permission: string;
  status: "Granted" | "Pending" | "Revoked";
  granted_date: string;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const pageSize = 8;

const emptyForm: ConsentForm = {
  consent_code: "",
  patient_name: "",
  organization: "",
  permission: "",
  status: "Granted",
  granted_date: ""
};

export function ConsentTable() {
  const { user } = useAuthUser();
  const { toastSuccess, toastError } = useToast();
  const role = user?.role ?? "member";
  const canCreateOrEdit = role === "admin" || role === "manager";
  const canDelete = role === "admin";

  const [data, setData] = useState<ConsentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState<ConsentForm>(emptyForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 400);
  const debouncedStatusFilter = useDebouncedValue(statusFilter, 250);

  const loadConsents = async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (debouncedStatusFilter !== "all") params.set("status", debouncedStatusFilter);
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      const response = await fetch(`/api/consents?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as { consents?: ConsentRow[]; pagination?: PaginationMeta; error?: string };

      if (!response.ok) {
        const message = payload.error ?? "Unable to load consent data.";
        setError(message);
        toastError("Failed to load consents", message);
        setData([]);
        return;
      }

      setData(payload.consents ?? []);
      setTotal(payload.pagination?.total ?? 0);
      setTotalPages(payload.pagination?.totalPages ?? 1);
    } catch {
      setError("Unable to load consent data.");
      toastError("Failed to load consents", "Please retry.");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadConsents();
  }, [debouncedStatusFilter, debouncedSearch, page]);

  const startEdit = (row: ConsentRow) => {
    setEditingCode(row.consent_code);
    setForm({
      consent_code: row.consent_code,
      patient_name: row.patient_name,
      organization: row.organization,
      permission: row.permission,
      status: row.status,
      granted_date: row.granted_date
    });
    setIsDialogOpen(true);
  };

  const startCreate = () => {
    setEditingCode(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const saveConsent = async () => {
    if (!canCreateOrEdit) return;
    setIsSaving(true);
    setError("");

    try {
      const method = editingCode ? "PATCH" : "POST";
      const url = editingCode ? `/api/consents?consentCode=${editingCode}` : "/api/consents";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        const message = payload.error ?? "Unable to save consent.";
        setError(message);
        toastError("Save failed", message);
        return;
      }

      setEditingCode(null);
      setForm(emptyForm);
      setIsDialogOpen(false);
      toastSuccess(editingCode ? "Consent updated" : "Consent added");
      await loadConsents();
    } catch {
      setError("Unable to save consent.");
      toastError("Save failed", "Please retry.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteConsent = async (consentCode: string) => {
    if (!canDelete) return;

    try {
      const response = await fetch(`/api/consents?consentCode=${consentCode}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        const message = payload.error ?? "Unable to delete consent.";
        setError(message);
        toastError("Delete failed", message);
        return;
      }

      toastSuccess("Consent deleted");
      await loadConsents();
    } catch {
      setError("Unable to delete consent.");
      toastError("Delete failed", "Please retry.");
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Consent Records</CardTitle>
          <div className="flex w-full gap-2 sm:w-auto">
            <Input
              placeholder="Search consent"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
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
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">all</SelectItem>
                <SelectItem value="Granted">Granted</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
            {canCreateOrEdit ? <Button onClick={startCreate}>Add Consent</Button> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading consent data...</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {!isLoading && !error ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Permission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Granted Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((consent) => (
                  <TableRow key={consent.id}>
                    <TableCell>{consent.patient_name}</TableCell>
                    <TableCell>{consent.organization}</TableCell>
                    <TableCell>{consent.permission}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          consent.status === "Granted" ? "secondary" : consent.status === "Pending" ? "outline" : "destructive"
                        }
                      >
                        {consent.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{consent.granted_date}</TableCell>
                    <TableCell className="flex gap-2">
                      {canCreateOrEdit ? (
                        <Button size="sm" variant="outline" onClick={() => startEdit(consent)}>
                          Edit
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <Button size="sm" variant="destructive" onClick={() => void deleteConsent(consent.consent_code)}>
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
        title={editingCode ? "Update Consent" : "Add Consent"}
        description="Add or update consent details."
        submitLabel={editingCode ? "Update Consent" : "Add Consent"}
        isSubmitting={isSaving}
        onSubmit={() => void saveConsent()}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Consent Code"
            value={form.consent_code}
            onChange={(event) => setForm((prev) => ({ ...prev, consent_code: event.target.value }))}
            disabled={Boolean(editingCode)}
          />
          <Input
            placeholder="Patient Name"
            value={form.patient_name}
            onChange={(event) => setForm((prev) => ({ ...prev, patient_name: event.target.value }))}
          />
          <Input
            placeholder="Organization"
            value={form.organization}
            onChange={(event) => setForm((prev) => ({ ...prev, organization: event.target.value }))}
          />
          <Input
            placeholder="Permission"
            value={form.permission}
            onChange={(event) => setForm((prev) => ({ ...prev, permission: event.target.value }))}
          />
          <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as ConsentForm["status"] }))}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Granted">Granted</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Revoked">Revoked</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={form.granted_date}
            onChange={(event) => setForm((prev) => ({ ...prev, granted_date: event.target.value }))}
          />
        </div>
      </CrudDialog>
    </Card>
  );
}