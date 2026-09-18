import Link from "next/link";
import ModuleShell from "@/components/shared/ModuleShell";
import ConnectivityBanner from "@/components/field-ops/ConnectivityBanner";
import IssueCaptureForm from "@/components/field-ops/IssueCaptureForm";
import CanvassingRouteOptimizer from "@/components/field-ops/CanvassingRouteOptimizer";
import PollingAgentToolkit from "@/components/field-ops/PollingAgentToolkit";

export default function FieldOpsPage() {
  return (
    <ModuleShell
      title="Field Operations App"
      subtitle="Canvassing, issue capture, and the real-time election-day command centre."
      color="#e85d2c"
    >
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/election-day" className="block rounded-xl border-l-4 border-co-red bg-white p-4 shadow-sm hover:shadow-md">
          <div className="text-sm font-semibold text-co-navy">Open Single-LGA Monitor &rarr;</div>
          <div className="mt-1 text-xs text-zinc-500">Live simulation of agent check-ins, incidents, and results collation for any of Kwara's 16 LGAs.</div>
        </Link>
        <Link href="/command-center" className="block rounded-xl border-l-4 border-co-purple bg-white p-4 shadow-sm hover:shadow-md">
          <div className="text-sm font-semibold text-co-navy">Open Kwara State Command Center &rarr;</div>
          <div className="mt-1 text-xs text-zinc-500">The same election day, watched across all 16 Kwara LGAs at once.</div>
        </Link>
      </div>

      <ConnectivityBanner />

      <div className="mb-4">
        <IssueCaptureForm />
      </div>

      <div className="mb-4">
        <CanvassingRouteOptimizer />
      </div>

      <div>
        <PollingAgentToolkit />
      </div>
    </ModuleShell>
  );
}
