"use client";

import { useEffect, useState } from "react";
import { Activity, Plug } from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useToast } from "@/hooks/useToast";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CrudDialog } from "@/components/common/CrudDialog";
import { TablePagination } from "@/components/common/TablePagination";

interface IntegrationRow {
  id: string;
  vendor: string;
  status: "Connected" | "Syncing" | "Disconnected";
  last_sync: string | null;
  health: "Healthy" | "Warning" | "Critical";
}

interface IntegrationForm {
  vendor: string;
  status: "Connected" | "Syncing" | "Disconnected";
  last_sync: string;
  health: "Healthy" | "Warning" | "Critical";
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const pageSize = 9;

const emptyForm: IntegrationForm = {
  vendor: "",
  status: "Connected",
  last_sync: "",
  health: "Healthy"
};

function mapStatusBadge(status: IntegrationRow["status"]) {
  if (status === "Connected") return "secondary" as const;
  if (status === "Syncing") return "outline" as const;
  return "destructive" as const;
}

export default function IntegrationsPage() {
  const { user } = useAuthUser();
  const { toastSuccess, toastError } = useToast();
  const role = user?.role ?? "member";
  const canCreateOrEdit = role === "admin" || role === "manager";
  const canDelete = role === "admin";

  const [data, setData] = useState<IntegrationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");
  const [editingVendor, setEditingVendor] = useState<string | null>(null);
  const [form, setForm] = useState<IntegrationForm>(emptyForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 400);
  const debouncedStatusFilter = useDebouncedValue(statusFilter, 250);
  const debouncedHealthFilter = useDebouncedValue(healthFilter, 250);

  const loadIntegrations = async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (debouncedStatusFilter !== "all") params.set("status", debouncedStatusFilter);
      if (debouncedHealthFilter !== "all") params.set("health", debouncedHealthFilter);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      const response = await fetch(`/api/integrations?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as { integrations?: IntegrationRow[]; pagination?: PaginationMeta; error?: string };

      if (!response.ok) {
        const message = payload.error ?? "Unable to load integrations.";
        setError(message);
        toastError("Failed to load integrations", message);
        setData([]);
        return;
      }

      setData(payload.integrations ?? []);
      setTotal(payload.pagination?.total ?? 0);
      setTotalPages(payload.pagination?.totalPages ?? 1);
    } catch {
      setError("Unable to load integrations.");
      toastError("Failed to load integrations", "Please retry.");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadIntegrations();
  }, [debouncedSearch, debouncedStatusFilter, debouncedHealthFilter, page]);

  const startEdit = (row: IntegrationRow) => {
    setEditingVendor(row.vendor);
    setForm({
      vendor: row.vendor,
      status: row.status,
      last_sync: row.last_sync ? row.last_sync.slice(0, 16) : "",
      health: row.health
    });
    setIsDialogOpen(true);
  };

  const startCreate = () => {
    setEditingVendor(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const saveIntegration = async () => {
    if (!canCreateOrEdit) return;
    setIsSaving(true);
    setError("");

    try {
      const method = editingVendor ? "PATCH" : "POST";
      const url = editingVendor ? `/api/integrations?vendor=${editingVendor}` : "/api/integrations";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          vendor: form.vendor,
          status: form.status,
          health: form.health,
          last_sync: form.last_sync ? new Date(form.last_sync).toISOString() : null
        })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        const message = payload.error ?? "Unable to save integration.";
        setError(message);
        toastError("Save failed", message);
        return;
      }

      setEditingVendor(null);
      setForm(emptyForm);
      setIsDialogOpen(false);
      toastSuccess(editingVendor ? "Integration updated" : "Integration added");
      await loadIntegrations();
    } catch {
      setError("Unable to save integration.");
      toastError("Save failed", "Please retry.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteIntegration = async (vendor: string) => {
    if (!canDelete) return;

    try {
      const response = await fetch(`/api/integrations?vendor=${vendor}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        const message = payload.error ?? "Unable to delete integration.";
        setError(message);
        toastError("Delete failed", message);
        return;
      }

      toastSuccess("Integration deleted");
      await loadIntegrations();
    } catch {
      setError("Unable to delete integration.");
      toastError("Delete failed", "Please retry.");
    }
  };

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold text-foreground">Integrations</h1>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Filter and Manage Integrations</CardTitle>
          <div className="flex flex-col gap-2 md:flex-row">
            <Input
              placeholder="Search vendor"
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
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">all</SelectItem>
                <SelectItem value="Connected">Connected</SelectItem>
                <SelectItem value="Syncing">Syncing</SelectItem>
                <SelectItem value="Disconnected">Disconnected</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={healthFilter}
              onValueChange={(value) => {
                setHealthFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">all</SelectItem>
                <SelectItem value="Healthy">Healthy</SelectItem>
                <SelectItem value="Warning">Warning</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            {canCreateOrEdit ? <Button onClick={startCreate}>Add Integration</Button> : null}
          </div>
        </CardHeader>
      </Card>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading integrations...</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!isLoading && !error ? (
        <>
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Plug className="h-4 w-4" />
                      {item.vendor}
                    </span>
                    <Badge variant={mapStatusBadge(item.status)}>{item.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Last Sync: {item.last_sync ? new Date(item.last_sync).toLocaleString() : "Never"}</p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    Connection Health: {item.health}
                  </p>
                  <div className="pt-2 flex gap-2">
                    {canCreateOrEdit ? (
                      <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                        Edit
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <Button size="sm" variant="destructive" onClick={() => void deleteIntegration(item.vendor)}>
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
            onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          />
        </>
      ) : null}

      <CrudDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingVendor ? "Update Integration" : "Add Integration"}
        description="Add or update integration connection details."
        submitLabel={editingVendor ? "Update Integration" : "Add Integration"}
        isSubmitting={isSaving}
        onSubmit={() => void saveIntegration()}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Vendor"
            value={form.vendor}
            onChange={(event) => setForm((prev) => ({ ...prev, vendor: event.target.value }))}
            disabled={Boolean(editingVendor)}
          />
          <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as IntegrationForm["status"] }))}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Connected">Connected</SelectItem>
              <SelectItem value="Syncing">Syncing</SelectItem>
              <SelectItem value="Disconnected">Disconnected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={form.health} onValueChange={(value) => setForm((prev) => ({ ...prev, health: value as IntegrationForm["health"] }))}>
            <SelectTrigger>
              <SelectValue placeholder="Health" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Healthy">Healthy</SelectItem>
              <SelectItem value="Warning">Warning</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="datetime-local"
            value={form.last_sync}
            onChange={(event) => setForm((prev) => ({ ...prev, last_sync: event.target.value }))}
          />
        </div>
      </CrudDialog>
    </div>
  );
}