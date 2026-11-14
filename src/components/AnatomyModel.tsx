import React, { useState } from 'react';
import { MuscleGroup } from '../types/workout';
import { MUSCLE_GROUPS } from '../data/exercises';
import { Target, Layers, Info } from 'lucide-react';

interface AnatomyModelProps {
  selectedMuscle: MuscleGroup | null;
  onSelectMuscle: (muscle: MuscleGroup | null) => void;
}

export const AnatomyModel: React.FC<AnatomyModelProps> = ({
  selectedMuscle,
  onSelectMuscle
}) => {
  const [viewAngle, setViewAngle] = useState<'both' | 'front' | 'back'>('both');
  const [showChartModal, setShowChartModal] = useState(false);

  const anteriorMuscles: MuscleGroup[] = ['Chest', 'Shoulders', 'Biceps', 'Quads', 'Core', 'Forearms'];
  const posteriorMuscles: MuscleGroup[] = ['Back', 'Triceps', 'Hamstrings', 'Glutes', 'Calves'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-500" />
            <h3 className="font-athletic text-xl font-bold tracking-wide text-white uppercase">
              Anatomical Muscle Selector
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tap a muscle group to filter exercises, inspect target biomechanics, or construct targeted routines.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewAngle('both')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewAngle === 'both' ? 'bg-orange-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Regions
            </button>
            <button
              onClick={() => setViewAngle('front')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewAngle === 'front' ? 'bg-orange-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Anterior (Front)
            </button>
            <button
              onClick={() => setViewAngle('back')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewAngle === 'back' ? 'bg-orange-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Posterior (Back)
            </button>
          </div>

          <button
            onClick={() => setShowChartModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            title="View Full Medical Muscle Chart"
          >
            <Layers className="w-3.5 h-3.5 text-orange-400" />
            <span>Chart View</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Diagram + Muscle Selector Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-center">
        {/* Left / Center: Anatomical Visual Display */}
        <div className="lg:col-span-6 relative bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-center min-h-[300px]">
          <div className="relative w-full max-w-[420px] aspect-[4/3] rounded-lg overflow-hidden border border-slate-800 group shadow-inner">
            <img
              src="/src/assets/images/anatomy_muscles_chart_1794312109129.jpg"
              alt="Anatomical muscle chart illustration"
              className="w-full h-full object-cover object-center filter saturate-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

            {/* Active Muscle Overlay Badge */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3.5 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-orange-500/40" />
                <span className="text-xs font-semibold text-white">
                  {selectedMuscle ? `Focus: ${selectedMuscle}` : 'Select a muscle below'}
                </span>
              </div>
              {selectedMuscle && (
                <button
                  onClick={() => onSelectMuscle(null)}
                  className="text-[11px] text-orange-400 hover:text-orange-300 underline font-medium"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2.5">
            <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>High-precision kinesiology reference with primary &amp; synergist muscle mapping.</span>
          </div>
        </div>

        {/* Right: Interactive Muscle Selector Grid */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {(viewAngle === 'both' || viewAngle === 'front') && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                <span>Anterior Chain (Front)</span>
                <span className="h-px bg-slate-800 flex-1" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {anteriorMuscles.map((muscle) => {
                  const isSelected = selectedMuscle === muscle;
                  return (
                    <button
                      key={muscle}
                      onClick={() => onSelectMuscle(isSelected ? null : muscle)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg text-left transition-all border ${
                        isSelected
                          ? 'bg-orange-500/20 border-orange-500 text-orange-300 shadow-sm shadow-orange-950'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold">{muscle}</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {muscle === 'Chest' && 'Pecs & sternal head'}
                        {muscle === 'Shoulders' && 'Anterior & lateral delts'}
                        {muscle === 'Biceps' && 'Short & long head'}
                        {muscle === 'Quads' && 'Rectus femoris & vastus'}
                        {muscle === 'Core' && 'Abs, obliques & TVA'}
                        {muscle === 'Forearms' && 'Flexors & grip'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(viewAngle === 'both' || viewAngle === 'back') && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                <span>Posterior Chain (Back)</span>
                <span className="h-px bg-slate-800 flex-1" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {posteriorMuscles.map((muscle) => {
                  const isSelected = selectedMuscle === muscle;
                  return (
                    <button
                      key={muscle}
                      onClick={() => onSelectMuscle(isSelected ? null : muscle)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg text-left transition-all border ${
                        isSelected
                          ? 'bg-orange-500/20 border-orange-500 text-orange-300 shadow-sm shadow-orange-950'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold">{muscle}</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {muscle === 'Back' && 'Lats, rhomboids & traps'}
                        {muscle === 'Triceps' && 'Lateral, medial & long head'}
                        {muscle === 'Hamstrings' && 'Biceps femoris & semitendinosus'}
                        {muscle === 'Glutes' && 'Gluteus maximus & medius'}
                        {muscle === 'Calves' && 'Gastrocnemius & soleus'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick All / Reset */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Showing: <strong className="text-white">{selectedMuscle || 'All Muscle Groups'}</strong></span>
            {selectedMuscle && (
              <button
                onClick={() => onSelectMuscle(null)}
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
              >
                Reset to Show All ({MUSCLE_GROUPS.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full Anatomical Chart Modal */}
      {showChartModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase">
                  Comparative Human Muscular Anatomy Chart
                </h3>
                <p className="text-xs text-slate-400">Male and Female Anterior and Posterior Kinetic Chains</p>
              </div>
              <button
                onClick={() => setShowChartModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 rounded-xl overflow-hidden border border-slate-800">
              <img
                src="/src/assets/images/anatomy_muscles_chart_1794312109129.jpg"
                alt="Detailed Muscular System Anatomy Chart"
                className="w-full h-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowChartModal(false)}
                className="px-5 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Close Anatomy Reference
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
