"use client";

import { useEffect, useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useToast } from "@/hooks/useToast";
import { CrudDialog } from "@/components/common/CrudDialog";
import { TablePagination } from "@/components/common/TablePagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PlatformIntegration {
  id: string;
  platform: "Epic" | "Cerner" | "Allscripts" | "FHIR Sandbox";
  environment: "sandbox" | "staging" | "production";
  baseUrl: string;
  clientId: string;
  connectionMode: "oauth2" | "api_key" | "service_account";
  status: "Connected" | "Syncing" | "Disconnected" | "Error";
  syncFrequency: "realtime" | "hourly" | "daily" | "weekly";
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IntegrationForm {
  platform: PlatformIntegration["platform"];
  environment: PlatformIntegration["environment"];
  baseUrl: string;
  clientId: string;
  connectionMode: PlatformIntegration["connectionMode"];
  status: PlatformIntegration["status"];
  syncFrequency: PlatformIntegration["syncFrequency"];
  isEnabled: boolean;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const defaultForm: IntegrationForm = {
  platform: "Epic",
  environment: "sandbox",
  baseUrl: "",
  clientId: "",
  connectionMode: "oauth2",
  status: "Disconnected",
  syncFrequency: "daily",
  isEnabled: true
};

export function PlatformIntegrationManager() {
  const { user } = useAuthUser();
  const { toastError, toastSuccess } = useToast();

  const role = user?.role ?? "member";
  const canCreateOrEdit = role === "admin" || role === "manager";
  const canDelete = role === "admin";

  const [items, setItems] = useState<PlatformIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const debouncedSearch = useDebouncedValue(search, 400);
  const debouncedPlatform = useDebouncedValue(platformFilter, 250);
  const debouncedStatus = useDebouncedValue(statusFilter, 250);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<IntegrationForm>(defaultForm);

  const load = async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (debouncedPlatform !== "all") params.set("platform", debouncedPlatform);
      if (debouncedStatus !== "all") params.set("status", debouncedStatus);
      params.set("page", String(page));
      params.set("pageSize", "6");

      const response = await fetch(`/api/platform-integrations?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as {
        integrations?: PlatformIntegration[];
        pagination?: PaginationMeta;
        error?: string;
      };

      if (!response.ok) {
        const message = payload.error ?? "Unable to load platform integrations.";
        setError(message);
        toastError("Integration load failed", message);
        setItems([]);
        return;
      }

      setItems(payload.integrations ?? []);
      setTotal(payload.pagination?.total ?? 0);
      setTotalPages(payload.pagination?.totalPages ?? 1);
    } catch {
      setError("Unable to load platform integrations.");
      toastError("Integration load failed", "Please retry.");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [debouncedSearch, debouncedPlatform, debouncedStatus, page]);

  const startCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const startEdit = (row: PlatformIntegration) => {
    setEditingId(row.id);
    setForm({
      platform: row.platform,
      environment: row.environment,
      baseUrl: row.baseUrl,
      clientId: row.clientId,
      connectionMode: row.connectionMode,
      status: row.status,
      syncFrequency: row.syncFrequency,
      isEnabled: row.isEnabled
    });
    setIsDialogOpen(true);
  };

  const save = async () => {
    if (!canCreateOrEdit) return;
    setIsSaving(true);
    setError("");

    try {
      const method = editingId ? "PATCH" : "POST";
      const query = editingId ? `?id=${editingId}` : "";
      const response = await fetch(`/api/platform-integrations${query}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        const message = payload.error ?? "Unable to save platform integration.";
        setError(message);
        toastError("Integration save failed", message);
        return;
      }

      toastSuccess(editingId ? "Platform integration updated" : "Platform integration added");
      setIsDialogOpen(false);
      setEditingId(null);
      setForm(defaultForm);
      await load();
    } catch {
      setError("Unable to save platform integration.");
      toastError("Integration save failed", "Please retry.");
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!canDelete) return;

    const response = await fetch(`/api/platform-integrations?id=${id}`, { method: "DELETE" });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      const message = payload.error ?? "Unable to delete platform integration.";
      setError(message);
      toastError("Integration delete failed", message);
      return;
    }

    toastSuccess("Platform integration deleted");
    await load();
  };

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Platform Integrations</CardTitle>
          <div className="flex w-full gap-2 sm:w-auto">
            <Input
              placeholder="Search platform or client ID"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Select
              value={platformFilter}
              onValueChange={(value) => {
                setPlatformFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40"><SelectValue placeholder="Platform" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">all</SelectItem>
                <SelectItem value="Epic">Epic</SelectItem>
                <SelectItem value="Cerner">Cerner</SelectItem>
                <SelectItem value="Allscripts">Allscripts</SelectItem>
                <SelectItem value="FHIR Sandbox">FHIR Sandbox</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">all</SelectItem>
                <SelectItem value="Connected">Connected</SelectItem>
                <SelectItem value="Syncing">Syncing</SelectItem>
                <SelectItem value="Disconnected">Disconnected</SelectItem>
                <SelectItem value="Error">Error</SelectItem>
              </SelectContent>
            </Select>
            {canCreateOrEdit ? <Button onClick={startCreate}>Add Platform</Button> : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading integrations...</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {!isLoading && !error ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sync</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.platform}</TableCell>
                    <TableCell>{row.environment}</TableCell>
                    <TableCell>{row.clientId}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === "Connected" ? "secondary" : row.status === "Error" ? "destructive" : "outline"}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.syncFrequency}</TableCell>
                    <TableCell>{row.isEnabled ? "yes" : "no"}</TableCell>
                    <TableCell className="flex gap-2">
                      {canCreateOrEdit ? <Button size="sm" variant="outline" onClick={() => startEdit(row)}>Edit</Button> : null}
                      {canDelete ? <Button size="sm" variant="destructive" onClick={() => void remove(row.id)}>Delete</Button> : null}
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
        title={editingId ? "Update Platform Integration" : "Add Platform Integration"}
        description="Configure healthcare platform connectivity settings."
        submitLabel={editingId ? "Update" : "Create"}
        isSubmitting={isSaving}
        onSubmit={() => void save()}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Select value={form.platform} onValueChange={(v) => setForm((p) => ({ ...p, platform: v as IntegrationForm["platform"] }))}>
            <SelectTrigger><SelectValue placeholder="Platform" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Epic">Epic</SelectItem>
              <SelectItem value="Cerner">Cerner</SelectItem>
              <SelectItem value="Allscripts">Allscripts</SelectItem>
              <SelectItem value="FHIR Sandbox">FHIR Sandbox</SelectItem>
            </SelectContent>
          </Select>
          <Select value={form.environment} onValueChange={(v) => setForm((p) => ({ ...p, environment: v as IntegrationForm["environment"] }))}>
            <SelectTrigger><SelectValue placeholder="Environment" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sandbox">sandbox</SelectItem>
              <SelectItem value="staging">staging</SelectItem>
              <SelectItem value="production">production</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Base URL" value={form.baseUrl} onChange={(e) => setForm((p) => ({ ...p, baseUrl: e.target.value }))} />
          <Input placeholder="Client ID" value={form.clientId} onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value }))} />
          <Select value={form.connectionMode} onValueChange={(v) => setForm((p) => ({ ...p, connectionMode: v as IntegrationForm["connectionMode"] }))}>
            <SelectTrigger><SelectValue placeholder="Connection Mode" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="oauth2">oauth2</SelectItem>
              <SelectItem value="api_key">api_key</SelectItem>
              <SelectItem value="service_account">service_account</SelectItem>
            </SelectContent>
          </Select>
          <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as IntegrationForm["status"] }))}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Connected">Connected</SelectItem>
              <SelectItem value="Syncing">Syncing</SelectItem>
              <SelectItem value="Disconnected">Disconnected</SelectItem>
              <SelectItem value="Error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Select value={form.syncFrequency} onValueChange={(v) => setForm((p) => ({ ...p, syncFrequency: v as IntegrationForm["syncFrequency"] }))}>
            <SelectTrigger><SelectValue placeholder="Sync Frequency" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">realtime</SelectItem>
              <SelectItem value="hourly">hourly</SelectItem>
              <SelectItem value="daily">daily</SelectItem>
              <SelectItem value="weekly">weekly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(form.isEnabled)} onValueChange={(v) => setForm((p) => ({ ...p, isEnabled: v === "true" }))}>
            <SelectTrigger><SelectValue placeholder="Enabled" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">enabled</SelectItem>
              <SelectItem value="false">disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CrudDialog>
    </Card>
  );
}