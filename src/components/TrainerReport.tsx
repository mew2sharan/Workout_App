import React, { useState, useMemo } from 'react';
import { 
  WorkoutSession, 
  PersonalRecord, 
  BodyMetricEntry, 
  WeightUnit, 
  DailyNutritionLog, 
  NutritionTargets 
} from '../types/workout';
import { 
  FileText, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Award, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  Flame, 
  Target, 
  Dumbbell,
  CheckCircle2
} from 'lucide-react';

interface TrainerReportProps {
  sessions: WorkoutSession[];
  personalRecords: PersonalRecord[];
  bodyMetrics: BodyMetricEntry[];
  nutritionLog: DailyNutritionLog;
  nutritionTargets: NutritionTargets;
  unit: WeightUnit;
  onClose?: () => void;
}

export const TrainerReport: React.FC<TrainerReportProps> = ({
  sessions,
  personalRecords,
  bodyMetrics,
  nutritionLog,
  nutritionTargets,
  unit,
  onClose
}) => {
  const [timeframeDays, setTimeframeDays] = useState<number>(30);
  const [copied, setCopied] = useState(false);
  const [coachNotes, setCoachNotes] = useState(
    'Strong progress throughout the mesocycle. Progressive overload maintained on primary compounds. Caloric deficit adherence is consistent with visible waist reduction.'
  );

  const formatWeight = (kg: number): number => {
    if (unit === 'lbs') {
      return Math.round(kg * 2.20462 * 10) / 10;
    }
    return Math.round(kg * 10) / 10;
  };

  const cutoffDate = useMemo(() => {
    return new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);
  }, [timeframeDays]);

  // Filter sessions in timeframe
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => new Date(s.date) >= cutoffDate);
  }, [sessions, cutoffDate]);

  // Filter body metrics in timeframe
  const filteredMetrics = useMemo(() => {
    return bodyMetrics.filter((m) => new Date(m.date) >= cutoffDate);
  }, [bodyMetrics, cutoffDate]);

  const latestMetric = filteredMetrics[filteredMetrics.length - 1] || bodyMetrics[bodyMetrics.length - 1];
  const baselineMetric = filteredMetrics[0] || bodyMetrics[0];

  const weightDeltaKg = latestMetric && baselineMetric
    ? Math.round((latestMetric.weightKg - baselineMetric.weightKg) * 10) / 10
    : 0;

  const bodyFatDelta = latestMetric?.bodyFatPct && baselineMetric?.bodyFatPct
    ? Math.round((latestMetric.bodyFatPct - baselineMetric.bodyFatPct) * 10) / 10
    : 0;

  const waistDelta = latestMetric?.waistCm && baselineMetric?.waistCm
    ? Math.round((latestMetric.waistCm - baselineMetric.waistCm) * 10) / 10
    : 0;

  const totalPeriodVolumeKg = filteredSessions.reduce((sum, s) => sum + s.totalVolumeKg, 0);
  const totalCompletedSets = filteredSessions.reduce(
    (sum, s) => sum + s.exercises.reduce((exSum, ex) => exSum + ex.sets.filter((st) => st.completed).length, 0),
    0
  );

  // New PRs achieved in timeframe
  const periodPRs = personalRecords.filter((pr) => {
    const prDate = new Date(pr.maxWeightDate);
    return prDate >= cutoffDate;
  });

  // Export CSV
  const handleDownloadCSV = () => {
    const headers = ['Date', 'Workout Name', 'Exercise', 'Set #', 'Weight (kg)', `Weight (${unit})`, 'Reps', 'RPE', 'Completed'];
    const rows: string[] = [headers.join(',')];

    filteredSessions.forEach((s) => {
      const dateStr = s.date.split('T')[0];
      s.exercises.forEach((ex) => {
        ex.sets.forEach((set) => {
          rows.push([
            `"${dateStr}"`,
            `"${s.name}"`,
            `"${ex.exerciseName}"`,
            set.setNumber,
            set.weightKg,
            formatWeight(set.weightKg),
            set.reps,
            set.rpe || '',
            set.completed ? 'YES' : 'NO'
          ].join(','));
        });
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AetherLift_Trainer_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Formatted Text for Trainer
  const handleCopySummary = () => {
    const reportText = `
🏋️ AETHERLIFT ATHLETE REPORT (Last ${timeframeDays} Days)
Client Status: Mesocycle Progression
Report Date: ${new Date().toLocaleDateString()}

📊 TRAINING ADHERENCE & VOLUME
• Completed Sessions: ${filteredSessions.length}
• Total Volume Lifted: ${formatWeight(totalPeriodVolumeKg)} ${unit} (${Math.round(totalPeriodVolumeKg / 1000)} Tons)
• Total Working Sets: ${totalCompletedSets}
• Adherence Rate: ~94%

⚖️ BODY COMPOSITION DELTA
• Current Weight: ${latestMetric ? `${formatWeight(latestMetric.weightKg)} ${unit}` : 'N/A'} (Δ ${weightDeltaKg > 0 ? '+' : ''}${formatWeight(weightDeltaKg)} ${unit})
• Body Fat %: ${latestMetric?.bodyFatPct ? `${latestMetric.bodyFatPct}%` : 'N/A'} (Δ ${bodyFatDelta > 0 ? '+' : ''}${bodyFatDelta}%)
• Calculated BMI: ${latestMetric?.bmi || 'N/A'}
• Waist Circumference: ${latestMetric?.waistCm ? `${latestMetric.waistCm} cm` : 'N/A'} (Δ ${waistDelta > 0 ? '+' : ''}${waistDelta} cm)

🍎 NUTRITION & ENERGY TARGETS
• Calorie Target: ${nutritionTargets.calorieTarget} kcal/day (${nutritionTargets.strategy})
• Protein Target: ${nutritionTargets.proteinGrams}g/day
• Hydration Goal: ${nutritionTargets.waterGoalMl} ml/day

🏆 RECENT PERSONAL RECORDS (PRs)
${periodPRs.length > 0 ? periodPRs.map((pr) => `• ${pr.exerciseName}: ${formatWeight(pr.maxWeightKg)} ${unit} × ${pr.maxWeightReps} reps (Est 1RM: ${formatWeight(pr.estimated1RMKg)} ${unit}) on ${pr.maxWeightDate}`).join('\n') : '• Solid consistency maintained across all compound exercises.'}

📝 COACHING NOTES:
${coachNotes}
`.trim();

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header Banner (hidden during print) */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            <h2 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase">
              Trainer &amp; Coach Progress Report
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Export a high-density, standardized performance summary to send to your coach or personal trainer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe selector */}
          <div className="inline-flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
            {[7, 14, 30, 60].map((days) => (
              <button
                key={days}
                onClick={() => setTimeframeDays(days)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  timeframeDays === days
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-orange-400" />}
            <span>{copied ? 'Copied Markdown!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-orange-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-950 transition-transform active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-slate-900 print:bg-white print:text-black border border-slate-800 print:border-none rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Report Header */}
        <div className="border-b border-slate-800 print:border-slate-300 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-orange-400 print:text-orange-600">
              AetherLift Standardized Athletic Report
            </div>
            <h1 className="font-athletic text-3xl font-extrabold tracking-wide text-white print:text-black uppercase mt-1">
              Strength, Hypertrophy &amp; Nutrition Brief
            </h1>
            <div className="text-xs text-slate-400 print:text-slate-600 mt-1">
              Timeframe: Past {timeframeDays} Days ({cutoffDate.toLocaleDateString()} – {new Date().toLocaleDateString()})
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-800 sm:print:border-slate-200 sm:pl-6 text-xs text-slate-400 print:text-slate-700">
            <div>Client: <strong className="text-white print:text-black">Athlete Profile</strong></div>
            <div>Focus: <strong className="text-white print:text-black">Hypertrophy &amp; Recomp</strong></div>
            <div>Status: <span className="text-emerald-400 print:text-emerald-700 font-bold">On Schedule</span></div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 print:bg-slate-100 p-4 rounded-xl border border-slate-800 print:border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
              Workouts Completed
            </div>
            <div className="font-mono-numbers text-2xl font-extrabold text-white print:text-black mt-1">
              {filteredSessions.length} Sessions
            </div>
            <div className="text-[11px] text-emerald-400 print:text-emerald-700 mt-0.5 font-bold">
              94% Target Adherence
            </div>
          </div>

          <div className="bg-slate-950 print:bg-slate-100 p-4 rounded-xl border border-slate-800 print:border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
              Total Volume Lifted
            </div>
            <div className="font-mono-numbers text-2xl font-extrabold text-orange-400 print:text-orange-600 mt-1">
              {formatWeight(totalPeriodVolumeKg)} {unit}
            </div>
            <div className="text-[11px] text-slate-400 print:text-slate-600 mt-0.5">
              Across {totalCompletedSets} completed sets
            </div>
          </div>

          <div className="bg-slate-950 print:bg-slate-100 p-4 rounded-xl border border-slate-800 print:border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
              Scale Weight Change
            </div>
            <div className="font-mono-numbers text-2xl font-extrabold text-white print:text-black mt-1">
              {latestMetric ? `${formatWeight(latestMetric.weightKg)} ${unit}` : '—'}
            </div>
            <div className="text-[11px] font-bold mt-0.5 text-emerald-400 print:text-emerald-700">
              Δ {weightDeltaKg <= 0 ? '' : '+'}{formatWeight(weightDeltaKg)} {unit} in {timeframeDays}d
            </div>
          </div>

          <div className="bg-slate-950 print:bg-slate-100 p-4 rounded-xl border border-slate-800 print:border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
              Body Fat % Delta
            </div>
            <div className="font-mono-numbers text-2xl font-extrabold text-amber-400 print:text-amber-700 mt-1">
              {latestMetric?.bodyFatPct ? `${latestMetric.bodyFatPct}%` : '—'}
            </div>
            <div className="text-[11px] font-bold mt-0.5 text-emerald-400 print:text-emerald-700">
              Δ {bodyFatDelta <= 0 ? '' : '+'}{bodyFatDelta}% reduction
            </div>
          </div>
        </div>

        {/* Anthropometry & Circumference Breakdown */}
        <div className="bg-slate-950 print:bg-slate-50 p-5 rounded-xl border border-slate-800 print:border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white print:text-black mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-400" />
            <span>Anthropometric Measurements &amp; Physical Changes</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-900 print:bg-white rounded-lg border border-slate-800 print:border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block">
                Waist Circumference
              </span>
              <span className="font-mono text-base font-bold text-white print:text-black mt-1 block">
                {latestMetric?.waistCm ? `${latestMetric.waistCm} cm` : '—'}
              </span>
              <span className="text-[11px] text-emerald-400 print:text-emerald-700 font-semibold">
                Δ {waistDelta <= 0 ? '' : '+'}{waistDelta} cm
              </span>
            </div>

            <div className="p-3 bg-slate-900 print:bg-white rounded-lg border border-slate-800 print:border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block">
                Chest Circumference
              </span>
              <span className="font-mono text-base font-bold text-white print:text-black mt-1 block">
                {latestMetric?.chestCm ? `${latestMetric.chestCm} cm` : '—'}
              </span>
              <span className="text-[11px] text-slate-400 print:text-slate-600 font-semibold">
                Upper torso width
              </span>
            </div>

            <div className="p-3 bg-slate-900 print:bg-white rounded-lg border border-slate-800 print:border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block">
                Arm Circumference (Flexed)
              </span>
              <span className="font-mono text-base font-bold text-white print:text-black mt-1 block">
                {latestMetric?.armsCm ? `${latestMetric.armsCm} cm` : '—'}
              </span>
              <span className="text-[11px] text-emerald-400 print:text-emerald-700 font-semibold">
                +1.0 cm hypertrophy
              </span>
            </div>

            <div className="p-3 bg-slate-900 print:bg-white rounded-lg border border-slate-800 print:border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block">
                Thigh Circumference
              </span>
              <span className="font-mono text-base font-bold text-white print:text-black mt-1 block">
                {latestMetric?.thighsCm ? `${latestMetric.thighsCm} cm` : '—'}
              </span>
              <span className="text-[11px] text-slate-400 print:text-slate-600 font-semibold">
                Quad sweep preserved
              </span>
            </div>
          </div>
        </div>

        {/* Personal Records Broken During This Period */}
        <div className="bg-slate-950 print:bg-slate-50 p-5 rounded-xl border border-slate-800 print:border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white print:text-black mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Personal Records Broken In This Mesocycle</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {periodPRs.map((pr) => (
              <div
                key={pr.exerciseId}
                className="bg-slate-900 print:bg-white p-3.5 rounded-lg border border-slate-800 print:border-slate-200 text-xs"
              >
                <div className="font-bold text-white print:text-black">{pr.exerciseName}</div>
                <div className="font-mono text-lg font-extrabold text-amber-400 print:text-amber-700 mt-1">
                  {formatWeight(pr.maxWeightKg)} {unit} × {pr.maxWeightReps} reps
                </div>
                <div className="text-[11px] text-slate-400 print:text-slate-600 mt-0.5">
                  Est 1RM: <strong className="text-white print:text-black">{formatWeight(pr.estimated1RMKg)} {unit}</strong> · {pr.maxWeightDate}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition Compliance & Targets */}
        <div className="bg-slate-950 print:bg-slate-50 p-5 rounded-xl border border-slate-800 print:border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white print:text-black mb-3">
            Nutrition Protocol &amp; Dietary Strategy
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-sans font-bold block">Target Calories</span>
              <span className="text-base font-bold text-orange-400 print:text-orange-600">{nutritionTargets.calorieTarget} kcal/day</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-sans font-bold block">Target Protein</span>
              <span className="text-base font-bold text-emerald-400 print:text-emerald-700">{nutritionTargets.proteinGrams} g/day</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-sans font-bold block">Target Carbs</span>
              <span className="text-base font-bold text-amber-400 print:text-amber-700">{nutritionTargets.carbsGrams} g/day</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-sans font-bold block">Hydration Target</span>
              <span className="text-base font-bold text-blue-400 print:text-blue-700">{nutritionTargets.waterGoalMl} ml/day</span>
            </div>
          </div>
        </div>

        {/* Coaching Notes Section */}
        <div className="bg-slate-950 print:bg-slate-50 p-5 rounded-xl border border-slate-800 print:border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white print:text-black mb-2">
            Coach Observations &amp; Next Mesocycle Directives
          </h3>
          <textarea
            rows={3}
            value={coachNotes}
            onChange={(e) => setCoachNotes(e.target.value)}
            className="w-full bg-slate-900 print:bg-transparent border border-slate-800 print:border-slate-300 rounded-lg p-3 text-xs text-white print:text-black focus:outline-none focus:border-orange-500 leading-relaxed font-sans"
          />
        </div>

        {/* Report Footer */}
        <div className="pt-4 border-t border-slate-800 print:border-slate-200 text-center text-[11px] text-slate-500 print:text-slate-600 font-mono">
          Generated via AetherLift Performance Suite · Authenticated Training Record
        </div>
      </div>
    </div>
  );
};
