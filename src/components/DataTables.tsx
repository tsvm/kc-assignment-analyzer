import type { AssignmentMetrics, KCStat } from '@/lib/kcAnalysis';

interface AssignmentTableProps {
  assignments: AssignmentMetrics[];
}

export function AssignmentTable({ assignments }: AssignmentTableProps) {
  return (
    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-card z-10">
          <tr className="border-b border-border">
            <th className="py-2 pr-2 text-left font-semibold text-foreground">#</th>
            <th className="py-2 px-2 text-left font-semibold text-foreground">Assignment</th>
            <th className="py-2 px-2 text-right font-semibold text-foreground">Avg Score</th>
            <th className="py-2 px-2 text-right font-semibold text-foreground">Δ Score</th>
            <th className="py-2 px-2 text-right font-semibold text-foreground"># KCs</th>
            <th className="py-2 px-2 text-right font-semibold text-foreground">+ KCs</th>
            <th className="py-2 px-2 text-right font-semibold text-foreground">− KCs</th>
            <th className="py-2 pl-2 text-center font-semibold text-foreground">Flag</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((a, i) => (
            <tr key={a.assignment_id} className={`border-b border-border/30 ${a.is_problematic ? 'bg-destructive/8' : ''}`}>
              <td className="py-2 pr-2 text-muted-foreground font-mono text-xs">{i + 1}</td>
              <td className="py-2 px-2 text-foreground font-medium truncate max-w-[200px]">{a.assignment_id}</td>
              <td className="py-2 px-2 text-right font-mono">{a.average_score.toFixed(3)}</td>
              <td className={`py-2 px-2 text-right font-mono ${a.score_change !== null && a.score_change < 0 ? 'text-chart-danger' : 'text-chart-success'}`}>
                {a.score_change !== null ? (a.score_change >= 0 ? '+' : '') + a.score_change.toFixed(3) : '—'}
              </td>
              <td className="py-2 px-2 text-right font-mono">{a.num_kcs}</td>
              <td className="py-2 px-2 text-right font-mono text-chart-success">{a.num_added > 0 ? `+${a.num_added}` : '0'}</td>
              <td className="py-2 px-2 text-right font-mono text-chart-danger">{a.num_removed > 0 ? `-${a.num_removed}` : '0'}</td>
              <td className="py-2 pl-2 text-center">{a.is_problematic ? '⚠️' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface KCStatsTableProps {
  kcStats: KCStat[];
  limit?: number;
}

export function KCStatsTable({ kcStats, limit = 10 }: KCStatsTableProps) {
  const shown = kcStats.slice(0, limit);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 pr-2 text-left font-semibold text-foreground">Knowledge Component</th>
            <th className="py-2 px-2 text-right font-semibold text-foreground">Avg Score</th>
            <th className="py-2 pl-2 text-right font-semibold text-foreground"># Assignments</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((kc) => (
            <tr key={kc.kc} className="border-b border-border/30">
              <td className="py-2 pr-2 text-foreground">{kc.kc}</td>
              <td className="py-2 px-2 text-right font-mono">{kc.avg_score.toFixed(3)}</td>
              <td className="py-2 pl-2 text-right font-mono">{kc.num_assignments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
