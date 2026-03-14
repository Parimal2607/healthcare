import { ArrowRight, CheckCircle2, Database, Globe, HeartPulse, LockKeyhole, Plug, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  "Connect patients, providers, claims, and consent in one platform.",
  "Ship interoperability workflows fast with API-first architecture.",
  "Built for healthcare trust with role-based access and audit-friendly data controls."
];

const features = [
  {
    icon: Database,
    title: "Unified Clinical Data",
    detail: "Aggregate records from EHRs, payers, and partner systems into a single operational view."
  },
  {
    icon: Plug,
    title: "Standards-Based Integrations",
    detail: "FHIR-ready integration patterns for Epic, Cerner, and other healthcare platforms."
  },
  {
    icon: LockKeyhole,
    title: "Secure Data Exchange",
    detail: "Built with role-based access patterns and secure data handling principles."
  },
  {
    icon: ShieldCheck,
    title: "Consent Management",
    detail: "Track patient data permissions clearly across organizations and use cases."
  },
  {
    icon: Globe,
    title: "Operational Visibility",
    detail: "Simple, readable interfaces for provider operations and care coordination teams."
  },
  {
    icon: HeartPulse,
    title: "Care-Centered Workflows",
    detail: "Design focused on trust, clarity, and day-to-day healthcare execution."
  }
];

const roles = [
  {
    title: "Admin",
    summary: "Manages users, role assignment, and platform-wide data governance."
  },
  {
    title: "Manager",
    summary: "Oversees operations, analytics, providers, and patient coordination workflows."
  },
  {
    title: "Member",
    summary: "Works with core patient, provider, analytics, and consent data day-to-day."
  }
];

const integrationLogos = ["Epic", "Cerner", "Allscripts", "Athenahealth", "Health Gorilla", "Redox"];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div className="space-y-4">
          <p className="text-sm font-medium text-primary">Healthcare Interoperability SaaS</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Unified Healthcare Data Platform</h1>
          <p className="text-base text-muted-foreground md:text-lg">
            Securely connect patient records, providers, and healthcare systems in one interoperable platform.
          </p>
          <div className="space-y-2">
            {highlights.map((item) => (
              <p key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-secondary" />
                <span>{item}</span>
              </p>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <a href="/register">
              <Button>
                Start Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href="/login">
              <Button variant="outline">View Platform</Button>
            </a>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Platform Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border bg-card p-3">
              <p className="text-sm text-muted-foreground">Connected Systems</p>
              <p className="text-2xl font-semibold">12+</p>
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <p className="text-sm text-muted-foreground">FHIR Endpoints</p>
              <p className="text-2xl font-semibold">34</p>
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <p className="text-sm text-muted-foreground">Consent Events</p>
              <p className="text-2xl font-semibold">8.4k</p>
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <p className="text-sm text-muted-foreground">Avg Sync Uptime</p>
              <p className="text-2xl font-semibold">99.9%</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold">Core Platform Capabilities</h2>
          <p className="text-sm text-muted-foreground">Purpose-built for healthcare teams that need reliable data exchange.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, detail }) => (
            <Card key={title}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-5 w-5 text-primary" />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-5 w-5 text-primary" />Role-Ready Team Model
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {roles.map((role) => (
                <div key={role.title} className="rounded-md border border-border bg-card p-3">
                  <p className="text-sm font-semibold text-foreground">{role.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{role.summary}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plug className="h-5 w-5 text-primary" />Integration Ecosystem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {integrationLogos.map((name) => (
                  <div key={name} className="rounded-md border border-border bg-card px-3 py-2 text-center text-sm text-muted-foreground">
                    {name}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Expand from MVP to enterprise interoperability with incremental API onboarding.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y border-border bg-card/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 px-4 py-10 md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-semibold">Ready to operationalize healthcare data exchange?</h3>
            <p className="text-sm text-muted-foreground">
              Start with role-based onboarding, secure auth, and an API-ready dashboard architecture.
            </p>
          </div>
          <a href="/register">
            <Button>
              Launch Demo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 text-sm text-muted-foreground">
        <p>PulseBridge Health Exchange</p>
        <p>2026 Healthcare SaaS MVP</p>
      </footer>
    </div>
  );
}
