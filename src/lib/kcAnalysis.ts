// Types
export interface RawAssignment {
  assignment_id: string;
  average_score: number;
  kc_list: string[];
}

export interface AssignmentMetrics {
  assignment_id: string;
  average_score: number;
  kcs: string[];
  num_kcs: number;
  added_kcs: string[];
  removed_kcs: string[];
  num_added: number;
  num_removed: number;
  score_change: number | null;
  is_problematic: boolean;
}

export interface CorrelationResult {
  label: string;
  r: number;
  p: number;
  n: number;
}

export interface AnalysisResult {
  assignments: AssignmentMetrics[];
  correlations: CorrelationResult[];
  problematicAssignments: AssignmentMetrics[];
  kcStats: KCStat[];
}

export interface KCStat {
  kc: string;
  num_assignments: number;
  avg_score: number;
}

// Parse CSV
export function parseCSV(text: string, separator: string): RawAssignment[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have a header and at least one data row');

  const header = parseCSVLine(lines[0]);
  const idIdx = header.findIndex(h => h.trim().toLowerCase() === 'assignment_id');
  const scoreIdx = header.findIndex(h => h.trim().toLowerCase() === 'average_score');
  const kcIdx = header.findIndex(h => h.trim().toLowerCase() === 'kc_list');

  if (idIdx === -1 || scoreIdx === -1 || kcIdx === -1) {
    throw new Error('CSV must contain columns: assignment_id, average_score, kc_list');
  }

  return lines.slice(1).filter(l => l.trim()).map(line => {
    const cols = parseCSVLine(line);
    const score = parseFloat(cols[scoreIdx]);
    if (isNaN(score)) throw new Error(`Invalid score for assignment: ${cols[idIdx]}`);
    const kcRaw = cols[kcIdx]?.trim() || '';
    const kcs = kcRaw ? kcRaw.split(separator).map(k => k.trim()).filter(Boolean) : [];
    return { assignment_id: cols[idIdx]?.trim(), average_score: score, kc_list: kcs };
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// Compute metrics
export function computeMetrics(raw: RawAssignment[]): AssignmentMetrics[] {
  return raw.map((a, i) => {
    const prevKCs = i > 0 ? new Set(raw[i - 1].kc_list) : new Set<string>();
    const currKCs = new Set(a.kc_list);
    const added = a.kc_list.filter(k => !prevKCs.has(k));
    const removed = i > 0 ? raw[i - 1].kc_list.filter(k => !currKCs.has(k)) : [];
    const scoreChange = i > 0 ? a.average_score - raw[i - 1].average_score : null;
    const isProblematic = added.length === 0 && scoreChange !== null && scoreChange < 0;

    return {
      assignment_id: a.assignment_id,
      average_score: a.average_score,
      kcs: a.kc_list,
      num_kcs: a.kc_list.length,
      added_kcs: added,
      removed_kcs: removed,
      num_added: added.length,
      num_removed: removed.length,
      score_change: scoreChange,
      is_problematic: isProblematic,
    };
  });
}

// Pearson correlation
function pearson(x: number[], y: number[]): { r: number; p: number } {
  const n = x.length;
  if (n < 3) return { r: 0, p: 1 };
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const xi = x[i] - mx, yi = y[i] - my;
    num += xi * yi;
    dx += xi * xi;
    dy += yi * yi;
  }
  if (dx === 0 || dy === 0) return { r: 0, p: 1 };
  const r = num / Math.sqrt(dx * dy);
  // t-test for significance
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  const p = tTestPValue(t, n - 2);
  return { r, p };
}

// Approximate two-tailed p-value from t-distribution
function tTestPValue(t: number, df: number): number {
  const x = df / (df + t * t);
  const p = incompleteBeta(x, df / 2, 0.5);
  return p;
}

function incompleteBeta(x: number, a: number, b: number): number {
  // Simple numerical approximation using continued fraction
  const lbeta = lgamma(a) + lgamma(b) - lgamma(a + b);
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta) / a;
  // Use Lentz's continued fraction
  let f = 1, c = 1, d = 0;
  for (let i = 0; i <= 200; i++) {
    let m = i >> 1;
    let num: number;
    if (i === 0) num = 1;
    else if (i % 2 === 0) {
      num = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m));
    } else {
      num = -((a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1));
    }
    d = 1 + num * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    d = 1 / d;
    c = 1 + num / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    f *= c * d;
    if (Math.abs(c * d - 1) < 1e-8) break;
  }
  return front * (f - 1);
}

function lgamma(x: number): number {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x, tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) ser += c[j] / ++y;
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

// KC statistics
function computeKCStats(assignments: AssignmentMetrics[]): KCStat[] {
  const kcMap = new Map<string, { scores: number[]; count: number }>();
  for (const a of assignments) {
    for (const kc of a.kcs) {
      if (!kcMap.has(kc)) kcMap.set(kc, { scores: [], count: 0 });
      const entry = kcMap.get(kc)!;
      entry.scores.push(a.average_score);
      entry.count++;
    }
  }
  return Array.from(kcMap.entries())
    .map(([kc, data]) => ({
      kc,
      num_assignments: data.count,
      avg_score: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
    }))
    .sort((a, b) => a.avg_score - b.avg_score);
}

// Full analysis
export function runAnalysis(raw: RawAssignment[]): AnalysisResult {
  const assignments = computeMetrics(raw);

  // Correlations
  const correlations: CorrelationResult[] = [];

  // Exp 1.1: NKC vs AC
  {
    const x = assignments.map(a => a.num_kcs);
    const y = assignments.map(a => a.average_score);
    const { r, p } = pearson(x, y);
    correlations.push({ label: 'Number of KCs vs Average Score', r, p, n: x.length });
  }

  // Exp 1.2: NKCAdded vs ACDiff, NKCRemoved vs ACDiff
  {
    const withDiff = assignments.filter(a => a.score_change !== null);
    const added = withDiff.map(a => a.num_added);
    const removed = withDiff.map(a => a.num_removed);
    const diff = withDiff.map(a => a.score_change!);

    const r1 = pearson(added, diff);
    correlations.push({ label: 'Added KCs vs Score Change', r: r1.r, p: r1.p, n: added.length });

    const r2 = pearson(removed, diff);
    correlations.push({ label: 'Removed KCs vs Score Change', r: r2.r, p: r2.p, n: removed.length });
  }

  const problematicAssignments = assignments.filter(a => a.is_problematic);
  const kcStats = computeKCStats(assignments);

  return { assignments, correlations, problematicAssignments, kcStats };
}
