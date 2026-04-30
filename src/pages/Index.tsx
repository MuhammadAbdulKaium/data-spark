import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Tag,
  Activity,
  DollarSign,
  Copy,
  Wand2,
  PlayCircle,
} from "lucide-react";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1KTFUyHHiIorhrBR1YDOtX5Njyl19EJi09StopuF3kew/preview";
const WEBHOOK_URL =
  "https://abdul125kaium125.app.n8n.cloud/webhook/crm-transform";

const ACTIONS = [
  { label: "Fix Name", action: "fix_name", icon: User },
  { label: "Clean Email", action: "clean_email", icon: Mail },
  { label: "Normalize Phone", action: "normalize_phone", icon: Phone },
  { label: "Standardize City", action: "standardize_city", icon: MapPin },
  { label: "Standardize Source", action: "standardize_source", icon: Tag },
  { label: "Standardize Status", action: "standardize_status", icon: Activity },
  { label: "Convert Budget", action: "convert_budget", icon: DollarSign },
  { label: "Detect Duplicates", action: "detect_duplicates", icon: Copy },
  { label: "Fill Missing", action: "fill_missing", icon: Wand2 },
  { label: "Run All", action: "run_all", icon: PlayCircle, primary: true },
] as Array<{ label: string; action: string; icon: typeof User; primary?: boolean }>;

const Index = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const runAction = async (action: string, label: string) => {
    if (loading) return;
    setLoading(action);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Small delay so Google Sheet has time to reflect the changes
      await new Promise((r) => setTimeout(r, 10000));
      setIframeKey((k) => k + 1);
      setLastAction(action);
      toast.success(`${label} completed`, {
        description: "Sheet refreshed with latest data.",
      });
    } catch (e) {
      toast.error("Something went wrong. Please try again.", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="border-b"
        style={{ background: "var(--gradient-header)" }}
      >
        <div className="container py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground tracking-tight">
            CRM Data Transformation
          </h1>
          <p className="text-primary-foreground/70 mt-2">
            Clean, standardize, and enrich your lead data with one click.
          </p>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        {/* Action buttons */}
        <section
          className="bg-card rounded-xl p-5 border"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Transformations
            </h2>
            {lastAction && (
              <span className="text-xs text-muted-foreground">
                Last:{" "}
                <span className="text-foreground font-medium">
                  {ACTIONS.find((a) => a.action === lastAction)?.label}
                </span>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {ACTIONS.map(({ label, action, icon: Icon, primary }) => {
              const isLoading = loading === action;
              const isLast = lastAction === action;
              return (
                <Button
                  key={action}
                  onClick={() => runAction(action, label)}
                  disabled={!!loading}
                  variant={primary ? "default" : "secondary"}
                  className={`gap-2 transition-all ${
                    primary
                      ? "shadow-md hover:shadow-lg hover:scale-[1.02]"
                      : ""
                  } ${isLast ? "ring-2 ring-primary ring-offset-2" : ""}`}
                  style={
                    primary
                      ? {
                          background: "var(--gradient-primary)",
                          color: "hsl(var(--primary-foreground))",
                        }
                      : undefined
                  }
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  {label}
                </Button>
              );
            })}
          </div>
        </section>

        {/* Sheet */}
        <section
          className="bg-card rounded-xl border overflow-hidden relative"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between px-5 py-3 border-b bg-secondary/40">
            <h2 className="text-sm font-semibold text-foreground">
              Lead Data (Live View)
            </h2>
            <span className="text-xs text-muted-foreground">
              Auto-refreshes after each action
            </span>
          </div>
          <div className="relative">
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={`${SHEET_URL}?t=${iframeKey}`}
              className="w-full block"
              style={{ height: "600px", border: 0 }}
              title="CRM Lead Data"
            />
            {loading && (
              <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 animate-in fade-in">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-foreground">
                  Processing{" "}
                  <span className="text-primary">
                    {ACTIONS.find((a) => a.action === loading)?.label}
                  </span>
                  ...
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
