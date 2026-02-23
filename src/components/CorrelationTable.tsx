import type { CorrelationResult } from '@/lib/kcAnalysis';

interface CorrelationTableProps {
  correlations: CorrelationResult[];
}

export function CorrelationTable({ correlations }: CorrelationTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="py-3 pr-4 text-left font-semibold text-foreground">Correlation</th>
            <th className="py-3 px-4 text-right font-semibold text-foreground">r</th>
            <th className="py-3 px-4 text-right font-semibold text-foreground">p-value</th>
            <th className="py-3 pl-4 text-right font-semibold text-foreground">n</th>
          </tr>
        </thead>
        <tbody>
          {correlations.map((c) => (
            <tr key={c.label} className="border-b border-border/50">
              <td className="py-3 pr-4 text-foreground">{c.label}</td>
              <td className={`py-3 px-4 text-right font-mono ${c.p < 0.05 ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                {c.r.toFixed(3)}
              </td>
              <td className={`py-3 px-4 text-right font-mono ${c.p < 0.05 ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                {c.p < 0.001 ? '<0.001' : c.p.toFixed(3)}
              </td>
              <td className="py-3 pl-4 text-right font-mono text-muted-foreground">{c.n}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted-foreground">
        Bold values indicate statistical significance (p &lt; 0.05)
      </p>
    </div>
  );
}
