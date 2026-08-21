export default function SettingsPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your CyberYoshi preferences.
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Appearance
          </h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Dark mode is enabled. Theme toggle coming in a future update.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Data Management
          </h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Clear scan history and local application data.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            About
          </h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-1">
            <p className="text-sm font-medium">CyberYoshi</p>
            <p className="text-sm text-muted-foreground">Version 0.1.0</p>
            <p className="text-sm text-muted-foreground">
              A lightweight cybersecurity toolkit.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
