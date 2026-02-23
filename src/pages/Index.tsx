import { useState, useMemo } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { CorrelationTable } from '@/components/CorrelationTable';
import { KCPerformanceChart, KCChangeChart } from '@/components/Charts';
import { AssignmentTable, KCStatsTable } from '@/components/DataTables';
import { parseCSV, runAnalysis, type AnalysisResult } from '@/lib/kcAnalysis';
import { AlertTriangle, BarChart3, FileSpreadsheet, Shield } from 'lucide-react';

const Index = () => {
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const [separator, setSeparator] = useState(';');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = () => {
    if (!csvContent) return;
    try {
      setError(null);
      const raw = parseCSV(csvContent, separator);
      const analysis = runAnalysis(raw);
      setResult(analysis);
    } catch (e: any) {
      setError(e.message);
      setResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <h1 className="text-2xl font-bold text-foreground font-display">
            KC Assignment Analyzer
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Analyze programming assignment difficulty using Knowledge Component metrics.
            All processing runs locally in your browser — no data leaves your device.
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>100% client-side processing</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Upload Section */}
        {!result && (
          <section className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground font-display mb-4">
                <FileSpreadsheet className="inline h-5 w-5 mr-2 -mt-0.5" />
                Upload Data
              </h2>
              <FileUpload onFileLoaded={setCsvContent} />

              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    KC Separator
                  </label>
                  <input
                    type="text"
                    value={separator}
                    onChange={(e) => setSeparator(e.target.value)}
                    className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder=";"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Character separating KCs in kc_list column
                  </p>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={!csvContent}
                  className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Analyze
                </button>
              </div>

              {error && (
                <div className="mt-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Results */}
        {result && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground font-display">
                <BarChart3 className="inline h-5 w-5 mr-2 -mt-0.5" />
                Analysis Results
              </h2>
              <button
                onClick={() => { setResult(null); setCsvContent(null); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
              >
                Upload new file
              </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryCard label="Assignments" value={result.assignments.length} />
              <SummaryCard label="Unique KCs" value={result.kcStats.length} />
              <SummaryCard label="Avg KCs/Assignment" value={(result.assignments.reduce((s, a) => s + a.num_kcs, 0) / result.assignments.length).toFixed(1)} />
              <SummaryCard label="Problematic" value={result.problematicAssignments.length} accent />
            </div>

            {/* Correlations */}
            <section className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground font-display mb-4">
                Pearson Correlations
              </h3>
              <CorrelationTable correlations={result.correlations} />
            </section>

            {/* Chart: KCs vs Performance */}
            <section className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground font-display mb-1">
                KCs vs Assignment Performance
              </h3>
              <p className="text-xs text-muted-foreground mb-4">Average score is multiplied by 10 for visual comparison (Fig. 2 from paper)</p>
              <KCPerformanceChart assignments={result.assignments} />
            </section>

            {/* Chart: KC Changes */}
            <section className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground font-display mb-1">
                KC Changes & Score Difference
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Red score bars = potentially problematic assignments (no new KCs but score drops). Fig. 3 from paper.
              </p>
              <KCChangeChart assignments={result.assignments} />
            </section>

            {/* Problematic assignments */}
            {result.problematicAssignments.length > 0 && (
              <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
                <h3 className="text-lg font-semibold text-foreground font-display mb-1 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Potentially Problematic Assignments
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  These assignments have no new KCs added but show a performance drop from the previous assignment.
                </p>
                <div className="space-y-2">
                  {result.problematicAssignments.map((a) => (
                    <div key={a.assignment_id} className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-2 text-sm">
                      <span className="font-medium text-foreground">{a.assignment_id}</span>
                      <span className="font-mono text-destructive">
                        Δ {a.score_change !== null ? a.score_change.toFixed(3) : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Assignment details table */}
            <section className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground font-display mb-4">
                All Assignments
              </h3>
              <AssignmentTable assignments={result.assignments} />
            </section>

            {/* Most Challenging KCs */}
            <section className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground font-display mb-1">
                Most Challenging Knowledge Components
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                KCs with the lowest average score across assignments
              </p>
              <KCStatsTable kcStats={result.kcStats} limit={10} />
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-6xl px-6 py-4 text-center text-xs text-muted-foreground">
          Based on "Analyzing the Difficulty of Programming Assignments with Interpretable Knowledge Component Metrics"
        </div>
      </footer>
    </div>
  );
};

function SummaryCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${accent ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card'}`}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold font-display ${accent ? 'text-destructive' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  );
}

export default Index;
