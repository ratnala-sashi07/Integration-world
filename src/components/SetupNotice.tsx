import { Settings } from "lucide-react";

export function SetupNotice() {
  return (
    <div className="card p-8 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-brand-100 text-brand-600">
        <Settings size={22} />
      </div>
      <h3 className="text-lg font-semibold">Almost there — connect your services</h3>
      <p className="text-muted mt-2 max-w-md mx-auto text-sm">
        Add your Supabase, Stripe and Mux keys to{" "}
        <code className="rounded bg-black/5 px-1.5 py-0.5">.env.local</code> and run the
        SQL migration. See <code className="rounded bg-black/5 px-1.5 py-0.5">README.md</code>{" "}
        for the 10-minute setup. Once configured, your courses appear here.
      </p>
    </div>
  );
}
