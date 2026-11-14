import React, { useState } from 'react';
import { BodyMetricEntry, WeightUnit } from '../types/workout';
import { 
  Scale, 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  Plus, 
  FileText, 
  Ruler, 
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

interface BodyMetricsProps {
  metrics: BodyMetricEntry[];
  unit: WeightUnit;
  userHeightCm: number;
  onAddMetric: (entry: BodyMetricEntry) => void;
  onOpenTrainerReport: () => void;
}

export const BodyMetrics: React.FC<BodyMetricsProps> = ({
  metrics,
  unit,
  userHeightCm,
  onAddMetric,
  onOpenTrainerReport
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [metricDate, setMetricDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightInput, setWeightInput] = useState<number>(79.1);
  const [bodyFatInput, setBodyFatInput] = useState<number>(14.7);
  const [waistInput, setWaistInput] = useState<number>(80.8);
  const [chestInput, setChestInput] = useState<number>(104.5);
  const [armsInput, setArmsInput] = useState<number>(38.0);
  const [thighsInput, setThighsInput] = useState<number>(62.4);
  const [notesInput, setNotesInput] = useState<string>('');

  // Sorted ascending for charts
  const sortedMetrics = [...metrics].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const latest = sortedMetrics[sortedMetrics.length - 1];
  const oldest = sortedMetrics[0];

  const formatWeight = (kg: number): number => {
    if (unit === 'lbs') {
      return Math.round(kg * 2.20462 * 10) / 10;
    }
    return Math.round(kg * 10) / 10;
  };

  const toKg = (val: number): number => {
    if (unit === 'lbs') {
      return Math.round((val / 2.20462) * 10) / 10;
    }
    return val;
  };

  // Total changes
  const weightDeltaKg = latest && oldest ? Math.round((latest.weightKg - oldest.weightKg) * 10) / 10 : 0;
  const bodyFatDelta = latest?.bodyFatPct && oldest?.bodyFatPct
    ? Math.round((latest.bodyFatPct - oldest.bodyFatPct) * 10) / 10
    : 0;

  // BMI classification
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-400' };
    if (bmi < 24.9) return { label: 'Normal / Athletic', color: 'text-emerald-400' };
    if (bmi < 29.9) return { label: 'Overweight / Muscle Density', color: 'text-blue-400' };
    return { label: 'Class I Obesity', color: 'text-red-400' };
  };

  const bmiMeta = latest ? getBMICategory(latest.bmi) : { label: 'Normal', color: 'text-emerald-400' };

  // SVG Chart points for weight
  const svgWidth = 650;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingY = 25;

  const weightValues = sortedMetrics.map((m) => formatWeight(m.weightKg));
  const minW = weightValues.length > 0 ? Math.floor(Math.min(...weightValues) - 1) : 70;
  const maxW = weightValues.length > 0 ? Math.ceil(Math.max(...weightValues) + 1) : 85;
  const rangeW = maxW - minW || 1;

  const pointsW = weightValues
    .map((val, idx) => {
      const x = paddingX + (idx / Math.max(1, weightValues.length - 1)) * (svgWidth - paddingX * 2);
      const y = svgHeight - paddingY - ((val - minW) / rangeW) * (svgHeight - paddingY * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const handleSaveMetric = () => {
    const heightM = userHeightCm / 100;
    const computedBMI = Math.round((weightInput / (heightM * heightM)) * 10) / 10;

    const newEntry: BodyMetricEntry = {
      id: `bm-${Date.now()}`,
      date: metricDate,
      weightKg: toKg(weightInput),
      bodyFatPct: bodyFatInput || undefined,
      heightCm: userHeightCm,
      bmi: computedBMI,
      calorieTarget: latest ? latest.calorieTarget : 2450,
      proteinGrams: latest ? latest.proteinGrams : 175,
      carbsGrams: latest ? latest.carbsGrams : 260,
      fatGrams: latest ? latest.fatGrams : 65,
      waistCm: waistInput || undefined,
      chestCm: chestInput || undefined,
      armsCm: armsInput || undefined,
      thighsCm: thighsInput || undefined,
      notes: notesInput
    };

    onAddMetric(newEntry);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase flex items-center gap-2">
              <Scale className="w-5 h-5 text-orange-500" />
              <span>Body Metrics &amp; Anthropometry</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Record scale weight, body fat %, calculated BMI, circumferences, and calorie targets over time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenTrainerReport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-orange-400" />
              <span>Generate Trainer Report</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-950 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Weigh-In</span>
            </button>
          </div>
        </div>

        {/* High Level KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Current Weight
            </div>
            <div className="font-mono-numbers text-2xl font-extrabold text-white mt-1">
              {latest ? `${formatWeight(latest.weightKg)} ${unit}` : '—'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              {weightDeltaKg <= 0 ? (
                <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                  <TrendingDown className="w-3.5 h-3.5" /> {formatWeight(Math.abs(weightDeltaKg))} {unit}
                </span>
              ) : (
                <span className="text-orange-400 flex items-center gap-0.5 font-bold">
                  <TrendingUp className="w-3.5 h-3.5" /> +{formatWeight(weightDeltaKg)} {unit}
                </span>
              )}
              <span>since start</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Body Fat %
            </div>
            <div className="font-mono-numbers text-2xl font-extrabold text-amber-400 mt-1">
              {latest?.bodyFatPct ? `${latest.bodyFatPct}%` : '—'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              {bodyFatDelta <= 0 ? (
                <span className="text-emerald-400 font-bold">
                  {bodyFatDelta}%
                </span>
              ) : (
                <span className="text-red-400 font-bold">+{bodyFatDelta}%</span>
              )}
              <span>total change</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Calculated BMI
            </div>
            <div className="font-mono-numbers text-2xl font-extrabold text-white mt-1">
              {latest ? latest.bmi : '—'}
            </div>
            <div className={`text-[11px] font-semibold mt-1 ${bmiMeta.color}`}>
              {bmiMeta.label}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Caloric Budget
            </div>
            <div className="font-mono-numbers text-2xl font-extrabold text-orange-400 mt-1">
              {latest ? `${latest.calorieTarget} kcal` : '—'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              P: {latest?.proteinGrams}g · C: {latest?.carbsGrams}g · F: {latest?.fatGrams}g
            </div>
          </div>
        </div>
      </div>

      {/* SVG Weight Progression Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-athletic text-xl font-bold tracking-wide text-white uppercase flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Body Weight Trend Curve</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Consistent weigh-ins showing lean recomposition trajectory.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Height: {userHeightCm} cm
          </span>
        </div>

        <div className="mt-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[500px]">
            {/* Grid lines */}
            {[0, 0.33, 0.66, 1].map((pct, idx) => {
              const y = paddingY + pct * (svgHeight - paddingY * 2);
              const val = Math.round(maxW - pct * rangeW);
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 4}
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="JetBrains Mono"
                    textAnchor="end"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Path line */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsW}
            />

            {/* Circles and date labels */}
            {sortedMetrics.map((m, idx) => {
              const val = formatWeight(m.weightKg);
              const x = paddingX + (idx / Math.max(1, sortedMetrics.length - 1)) * (svgWidth - paddingX * 2);
              const y = svgHeight - paddingY - ((val - minW) / rangeW) * (svgHeight - paddingY * 2);

              return (
                <g key={m.id}>
                  <circle cx={x} cy={y} r={5} fill="#10b981" stroke="#0f172a" strokeWidth="2" />
                  <text
                    x={x}
                    y={y - 8}
                    fill="#fff"
                    fontSize="10"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {val}
                  </text>
                  <text
                    x={x}
                    y={svgHeight - 6}
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="Plus Jakarta Sans"
                    textAnchor="middle"
                  >
                    {new Date(m.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Historical Measurements Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h3 className="font-athletic text-xl font-bold tracking-wide text-white uppercase mb-3">
          Historical Log &amp; Circumference Changes
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Weight</th>
                <th className="py-2.5 px-3">Body Fat</th>
                <th className="py-2.5 px-3">BMI</th>
                <th className="py-2.5 px-3">Waist (cm)</th>
                <th className="py-2.5 px-3">Chest (cm)</th>
                <th className="py-2.5 px-3">Arms (cm)</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
              {[...sortedMetrics].reverse().map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/30 text-slate-300">
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-white">
                    {formatWeight(entry.weightKg)} {unit}
                  </td>
                  <td className="py-2.5 px-3 text-amber-400 font-semibold">
                    {entry.bodyFatPct ? `${entry.bodyFatPct}%` : '—'}
                  </td>
                  <td className="py-2.5 px-3">{entry.bmi}</td>
                  <td className="py-2.5 px-3">{entry.waistCm || '—'}</td>
                  <td className="py-2.5 px-3">{entry.chestCm || '—'}</td>
                  <td className="py-2.5 px-3">{entry.armsCm || '—'}</td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px] max-w-xs truncate">
                    {entry.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Metric Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase">
                Record Body Metrics
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={metricDate}
                  onChange={(e) => setMetricDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Scale Weight ({unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightInput}
                  onChange={(e) => setWeightInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Body Fat %
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFatInput}
                  onChange={(e) => setBodyFatInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Waist Circumference (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={waistInput}
                  onChange={(e) => setWaistInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Chest (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={chestInput}
                  onChange={(e) => setChestInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Arms (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={armsInput}
                  onChange={(e) => setArmsInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Thighs (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={thighsInput}
                  onChange={(e) => setThighsInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Weigh-In Notes / Condition
              </label>
              <textarea
                rows={2}
                placeholder="E.g., Morning weigh-in, fasted, well rested."
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMetric}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-orange-950"
              >
                Save Weigh-In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
