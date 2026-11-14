import React from 'react';
import { User } from 'firebase/auth';
import { WeightUnit } from '../types/workout';
import { GoogleSignInButton } from './GoogleSignInButton';
import { Cloud, Dumbbell, Plus } from 'lucide-react';

export type ActiveNavTab =
  | 'active-workout'
  | 'guided-programs'
  | 'plans-adherence'
  | 'exercise-library'
  | 'exercise-analytics'
  | 'personal-records'
  | 'nutrition-tracker'
  | 'body-metrics'
  | 'trainer-report'
  | 'cloud-sync';

interface NavbarProps {
  currentTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  unit: WeightUnit;
  onToggleUnit: () => void;
  isWorkoutInProgress: boolean;
  onStartNewWorkout: () => void;
  googleUser?: User | null;
  needsAuth?: boolean;
  isLoggingIn?: boolean;
  onGoogleLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  unit,
  onToggleUnit,
  isWorkoutInProgress,
  onStartNewWorkout,
  googleUser,
  needsAuth = true,
  isLoggingIn = false,
  onGoogleLogin
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onSelectTab('active-workout')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-950 group-hover:scale-105 transition-transform">
                <Dumbbell className="w-4 h-4 fill-current" />
              </div>
              <span className="font-athletic text-2xl font-black tracking-wider text-white whitespace-nowrap uppercase">
                Aether<span className="text-orange-500">Lift</span>
              </span>
            </button>
          </div>

          {/* Zone 2: Clean single-line nav links */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs font-semibold text-slate-300">
            <button
              onClick={() => onSelectTab('active-workout')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentTab === 'active-workout'
                  ? 'text-orange-400 border-b-2 border-orange-500 font-bold'
                  : 'hover:text-white'
              }`}
            >
              Live Logger
            </button>

            <button
              onClick={() => onSelectTab('guided-programs')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentTab === 'guided-programs'
                  ? 'text-orange-400 border-b-2 border-orange-500 font-bold'
                  : 'hover:text-white'
              }`}
            >
              Programs
            </button>

            <button
              onClick={() => onSelectTab('nutrition-tracker')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentTab === 'nutrition-tracker'
                  ? 'text-orange-400 border-b-2 border-orange-500 font-bold'
                  : 'hover:text-white'
              }`}
            >
              Nutrition
            </button>

            <button
              onClick={() => onSelectTab('plans-adherence')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentTab === 'plans-adherence'
                  ? 'text-orange-400 border-b-2 border-orange-500 font-bold'
                  : 'hover:text-white'
              }`}
            >
              Plans
            </button>

            <button
              onClick={() => onSelectTab('exercise-library')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentTab === 'exercise-library'
                  ? 'text-orange-400 border-b-2 border-orange-500 font-bold'
                  : 'hover:text-white'
              }`}
            >
              Library
            </button>

            <button
              onClick={() => onSelectTab('exercise-analytics')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentTab === 'exercise-analytics' || currentTab === 'personal-records'
                  ? 'text-orange-400 border-b-2 border-orange-500 font-bold'
                  : 'hover:text-white'
              }`}
            >
              Analytics &amp; PRs
            </button>

            <button
              onClick={() => onSelectTab('body-metrics')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentTab === 'body-metrics' || currentTab === 'trainer-report'
                  ? 'text-orange-400 border-b-2 border-orange-500 font-bold'
                  : 'hover:text-white'
              }`}
            >
              Body &amp; Report
            </button>

            <button
              onClick={() => onSelectTab('cloud-sync')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                currentTab === 'cloud-sync'
                  ? 'text-orange-400 border-b-2 border-orange-500 font-bold'
                  : 'hover:text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5 text-orange-400" />
              <span>Drive Sync</span>
            </button>
          </nav>

          {/* Zone 3: Quick Units Toggle + Google Account + Primary Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Unit Toggle */}
            <button
              onClick={onToggleUnit}
              className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors whitespace-nowrap"
              title="Toggle weight unit between kg and lbs"
            >
              {unit.toUpperCase()}
            </button>

            {/* Google Account / Sign-in */}
            {googleUser && !needsAuth ? (
              <button
                onClick={() => onSelectTab('cloud-sync')}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 rounded-full text-xs text-white font-semibold transition-colors whitespace-nowrap"
                title={`Connected to Google Drive (${googleUser.email})`}
              >
                {googleUser.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt={googleUser.displayName || 'Google'}
                    className="w-5 h-5 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="max-w-[96px] truncate">
                  {googleUser.displayName?.split(' ')[0] || 'Drive'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              </button>
            ) : (
              onGoogleLogin && (
                <div className="hidden sm:block">
                  <GoogleSignInButton
                    compact
                    onClick={onGoogleLogin}
                    disabled={isLoggingIn}
                    label={isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
                  />
                </div>
              )
            )}

            {/* Primary Action Button */}
            <button
              onClick={onStartNewWorkout}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-950 transition-transform active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isWorkoutInProgress ? 'Resume Workout' : 'Log Workout'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center gap-3 overflow-x-auto py-2.5 border-t border-slate-900 scrollbar-none text-xs">
          <button
            onClick={() => onSelectTab('active-workout')}
            className={`whitespace-nowrap px-3 py-1 rounded-md font-semibold ${
              currentTab === 'active-workout'
                ? 'bg-orange-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Logger
          </button>
          <button
            onClick={() => onSelectTab('guided-programs')}
            className={`whitespace-nowrap px-3 py-1 rounded-md font-semibold ${
              currentTab === 'guided-programs'
                ? 'bg-orange-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Programs
          </button>
          <button
            onClick={() => onSelectTab('nutrition-tracker')}
            className={`whitespace-nowrap px-3 py-1 rounded-md font-semibold ${
              currentTab === 'nutrition-tracker'
                ? 'bg-orange-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Nutrition
          </button>
          <button
            onClick={() => onSelectTab('plans-adherence')}
            className={`whitespace-nowrap px-3 py-1 rounded-md font-semibold ${
              currentTab === 'plans-adherence'
                ? 'bg-orange-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Plans
          </button>
          <button
            onClick={() => onSelectTab('exercise-library')}
            className={`whitespace-nowrap px-3 py-1 rounded-md font-semibold ${
              currentTab === 'exercise-library'
                ? 'bg-orange-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Library
          </button>
          <button
            onClick={() => onSelectTab('exercise-analytics')}
            className={`whitespace-nowrap px-3 py-1 rounded-md font-semibold ${
              currentTab === 'exercise-analytics'
                ? 'bg-orange-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Progression
          </button>
          <button
            onClick={() => onSelectTab('personal-records')}
            className={`whitespace-nowrap px-3 py-1 rounded-md font-semibold ${
              currentTab === 'personal-records'
                ? 'bg-orange-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            PR Hall
          </button>
          <button
            onClick={() => onSelectTab('body-metrics')}
            className={`whitespace-nowrap px-3 py-1 rounded-md font-semibold ${
              currentTab === 'body-metrics'
                ? 'bg-orange-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Body &amp; Report
          </button>
          <button
            onClick={() => onSelectTab('cloud-sync')}
            className={`whitespace-nowrap px-3 py-1 rounded-md font-semibold flex items-center gap-1 ${
              currentTab === 'cloud-sync'
                ? 'bg-orange-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Drive Sync</span>
          </button>
        </div>
      </div>
    </header>
  );
};
