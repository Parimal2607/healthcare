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

interface ProviderRow {
  id: string;
  provider_code: string;
  name: string;
  specialty: string;
  organization: string;
  patients_managed: number;
  status: "active" | "onboarding" | "inactive";
}

interface ProviderForm {
  provider_code: string;
  name: string;
  specialty: string;
  organization: string;
  patients_managed: string;
  status: "active" | "onboarding" | "inactive";
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const pageSize = 8;

const emptyForm: ProviderForm = {
  provider_code: "",
  name: "",
  specialty: "",
  organization: "",
  patients_managed: "0",
  status: "active"
};

export function ProviderTable() {
  const { user } = useAuthUser();
  const { toastSuccess, toastError } = useToast();
  const role = user?.role ?? "member";
  const canCreateOrEdit = role === "admin" || role === "manager";
  const canDelete = role === "admin";

  const [data, setData] = useState<ProviderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState<ProviderForm>(emptyForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 400);
  const debouncedStatusFilter = useDebouncedValue(statusFilter, 250);

  const loadProviders = async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (debouncedStatusFilter !== "all") params.set("status", debouncedStatusFilter);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      const response = await fetch(`/api/providers?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as { providers?: ProviderRow[]; pagination?: PaginationMeta; error?: string };

      if (!response.ok) {
        const message = payload.error ?? "Unable to load providers.";
        setError(message);
        toastError("Failed to load providers", message);
        setData([]);
        return;
      }

      setData(payload.providers ?? []);
      setTotal(payload.pagination?.total ?? 0);
      setTotalPages(payload.pagination?.totalPages ?? 1);
    } catch {
      setError("Unable to load providers.");
      toastError("Failed to load providers", "Please retry.");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProviders();
  }, [debouncedSearch, debouncedStatusFilter, page]);

  const startEdit = (row: ProviderRow) => {
    setEditingCode(row.provider_code);
    setForm({
      provider_code: row.provider_code,
      name: row.name,
      specialty: row.specialty,
      organization: row.organization,
      patients_managed: String(row.patients_managed),
      status: row.status
    });
    setIsDialogOpen(true);
  };

  const startCreate = () => {
    setEditingCode(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const saveProvider = async () => {
    if (!canCreateOrEdit) return;
    setIsSaving(true);
    setError("");

    try {
      const body = {
        provider_code: form.provider_code,
        name: form.name,
        specialty: form.specialty,
        organization: form.organization,
        patients_managed: Number(form.patients_managed),
        status: form.status
      };

      const method = editingCode ? "PATCH" : "POST";
      const url = editingCode ? `/api/providers?providerCode=${editingCode}` : "/api/providers";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        const message = payload.error ?? "Unable to save provider.";
        setError(message);
        toastError("Save failed", message);
        return;
      }

      setEditingCode(null);
      setForm(emptyForm);
      setIsDialogOpen(false);
      toastSuccess(editingCode ? "Provider updated" : "Provider added");
      await loadProviders();
    } catch {
      setError("Unable to save provider.");
      toastError("Save failed", "Please retry.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProvider = async (providerCode: string) => {
    if (!canDelete) return;

    try {
      const response = await fetch(`/api/providers?providerCode=${providerCode}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        const message = payload.error ?? "Unable to delete provider.";
        setError(message);
        toastError("Delete failed", message);
        return;
      }

      toastSuccess("Provider deleted");
      await loadProviders();
    } catch {
      setError("Unable to delete provider.");
      toastError("Delete failed", "Please retry.");
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Provider Directory</CardTitle>
          <div className="flex w-full gap-2 sm:w-auto">
            <Input
              placeholder="Search providers"
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
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">all</SelectItem>
                <SelectItem value="active">active</SelectItem>
                <SelectItem value="onboarding">onboarding</SelectItem>
                <SelectItem value="inactive">inactive</SelectItem>
              </SelectContent>
            </Select>
            {canCreateOrEdit ? <Button onClick={startCreate}>Add Provider</Button> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading providers...</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {!isLoading && !error ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider Name</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Patients Managed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>{provider.name}</TableCell>
                    <TableCell>{provider.specialty}</TableCell>
                    <TableCell>{provider.organization}</TableCell>
                    <TableCell>{provider.patients_managed}</TableCell>
                    <TableCell>
                      <Badge variant={provider.status === "active" ? "secondary" : "outline"}>{provider.status}</Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      {canCreateOrEdit ? (
                        <Button size="sm" variant="outline" onClick={() => startEdit(provider)}>
                          Edit
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <Button size="sm" variant="destructive" onClick={() => void deleteProvider(provider.provider_code)}>
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
        title={editingCode ? "Update Provider" : "Add Provider"}
        description="Add or update provider details."
        submitLabel={editingCode ? "Update Provider" : "Add Provider"}
        isSubmitting={isSaving}
        onSubmit={() => void saveProvider()}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Provider Code"
            value={form.provider_code}
            onChange={(event) => setForm((prev) => ({ ...prev, provider_code: event.target.value }))}
            disabled={Boolean(editingCode)}
          />
          <Input placeholder="Name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          <Input
            placeholder="Specialty"
            value={form.specialty}
            onChange={(event) => setForm((prev) => ({ ...prev, specialty: event.target.value }))}
          />
          <Input
            placeholder="Organization"
            value={form.organization}
            onChange={(event) => setForm((prev) => ({ ...prev, organization: event.target.value }))}
          />
          <Input
            type="number"
            placeholder="Patients Managed"
            value={form.patients_managed}
            onChange={(event) => setForm((prev) => ({ ...prev, patients_managed: event.target.value }))}
          />
          <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as ProviderForm["status"] }))}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">active</SelectItem>
              <SelectItem value="onboarding">onboarding</SelectItem>
              <SelectItem value="inactive">inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CrudDialog>
    </Card>
  );
}