'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PARAMETERS = [
  'Parameter 1',
  'Parameter 2',
  'Parameter 3',
  'Parameter 4',
  'Parameter 5',
  'Parameter 6',
] as const;

type FormValues = [string, string, string, string, string, string];

export default function Home() {
  const [values, setValues] = useState<FormValues>(['', '', '', '', '', '']);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (index: number, value: string) => {
    const next = [...values] as FormValues;
    next[index] = value;
    setValues(next);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const numericValues = values.map((v) => (v === '' ? 0 : Number(v)));

      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: numericValues }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Calculation failed. Please try again.');
      }

      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">Calculator</h1>
            <p className="text-blue-100 text-sm mt-1">
              Enter your parameters and get an instant result.
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {PARAMETERS.map((label, i) => (
                  <div key={label}>
                    <label
                      htmlFor={`param-${i}`}
                      className="block text-sm font-medium text-slate-600 mb-1.5"
                    >
                      {label}
                    </label>
                    <input
                      id={`param-${i}`}
                      type="number"
                      value={values[i]}
                      onChange={(e) => handleChange(i, e.target.value)}
                      placeholder="0"
                      step="any"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-300
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                 transition-shadow duration-150 hover:border-slate-300"
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full py-3 px-6 rounded-xl font-semibold text-white text-sm
                           bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                           disabled:opacity-60 disabled:cursor-not-allowed
                           transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Calculating…
                  </span>
                ) : (
                  'Calculate'
                )}
              </button>
            </form>

            {/* Result / Error */}
            <AnimatePresence mode="wait">
              {result !== null && !error && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
                    Result
                  </p>
                  <p className="text-4xl font-bold text-blue-600 break-all">{result}</p>
                </motion.div>
              )}

              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-1">
                    Error
                  </p>
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Results are computed in Google Sheets and returned in real time.
        </p>
      </div>
    </main>
  );
}
