import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { AssignmentMetrics } from '@/lib/kcAnalysis';

interface KCPerformanceChartProps {
  assignments: AssignmentMetrics[];
}

export function KCPerformanceChart({ assignments }: KCPerformanceChartProps) {
  const data = assignments.map((a, i) => ({
    index: i + 1,
    id: a.assignment_id,
    num_kcs: a.num_kcs,
    avg_score_scaled: parseFloat((a.average_score * 10).toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 88%)" />
        <XAxis dataKey="index" label={{ value: 'Assignment Index', position: 'insideBottom', offset: -3, style: { fontSize: 12 } }} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ backgroundColor: 'hsl(0 0% 100%)', border: '1px solid hsl(220 15% 88%)', borderRadius: '6px', fontSize: 12 }}
          formatter={(value: number, name: string) => {
            if (name === 'avg_score_scaled') return [(value / 10).toFixed(3), 'Avg Score'];
            return [value, name === 'num_kcs' ? 'Number of KCs' : name];
          }}
          labelFormatter={(v) => `Assignment ${v}`}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => v === 'num_kcs' ? 'Number of KCs' : 'Avg Score × 10'} />
        <Bar dataKey="num_kcs" fill="hsl(220 60% 50%)" opacity={0.7} />
        <Line dataKey="avg_score_scaled" stroke="hsl(38 90% 55%)" strokeWidth={2} dot={{ r: 3, fill: 'hsl(38 90% 55%)' }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

interface KCChangeChartProps {
  assignments: AssignmentMetrics[];
}

export function KCChangeChart({ assignments }: KCChangeChartProps) {
  const data = assignments.slice(1).map((a, i) => ({
    index: i + 2,
    id: a.assignment_id,
    added: a.num_added,
    removed: -a.num_removed,
    score_diff_scaled: parseFloat(((a.score_change ?? 0) * 10).toFixed(2)),
    is_problematic: a.is_problematic,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 88%)" />
        <XAxis dataKey="index" label={{ value: 'Assignment Index', position: 'insideBottom', offset: -3, style: { fontSize: 12 } }} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ backgroundColor: 'hsl(0 0% 100%)', border: '1px solid hsl(220 15% 88%)', borderRadius: '6px', fontSize: 12 }}
          formatter={(value: number, name: string) => {
            if (name === 'score_diff_scaled') return [(value / 10).toFixed(3), 'Score Change'];
            if (name === 'removed') return [Math.abs(value), 'Removed KCs'];
            return [value, 'Added KCs'];
          }}
          labelFormatter={(v) => `Assignment ${v}`}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => {
          if (v === 'added') return 'KCs Added';
          if (v === 'removed') return 'KCs Removed';
          return 'Score Change × 10';
        }} />
        <ReferenceLine y={0} stroke="hsl(220 10% 70%)" />
        <Line dataKey="added" stroke="hsl(220 70% 50%)" strokeWidth={2} dot={{ r: 3, fill: 'hsl(220 70% 50%)' }} />
        <Line dataKey="removed" stroke="hsl(30 90% 55%)" strokeWidth={2} dot={{ r: 3, fill: 'hsl(30 90% 55%)' }} />
        <Bar
          dataKey="score_diff_scaled"
          fill="hsl(220 10% 70%)"
          opacity={0.5}
          shape={(props: any) => {
            const { x, y, width, height, payload } = props;
            const fill = payload.is_problematic ? 'hsl(0 72% 51%)' : 'hsl(220 10% 70%)';
            const rectY = height < 0 ? y + height : y;
            const rectH = Math.abs(height);
            return <rect x={x} y={rectY} width={width} height={rectH} fill={fill} opacity={payload.is_problematic ? 0.85 : 0.4} rx={1} />;
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
