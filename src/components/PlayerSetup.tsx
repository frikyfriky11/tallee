import { useState, useRef, useEffect } from 'react';
import { useUmami } from '@danielgtmn/umami-react';

interface Props {
  recentPlayers: string[];
  initialNames?: string[];
  onConfirm: (names: string[]) => void;
  onReset: () => void;
}

export function PlayerSetup({ recentPlayers, initialNames, onConfirm, onReset }: Props) {
  const { track } = useUmami();
  const [inputs, setInputs] = useState<string[]>(
    initialNames && initialNames.length >= 2 ? initialNames : ['', ''],
  );
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const updateInput = (i: number, value: string) => {
    setInputs((prev) => prev.map((v, idx) => (idx === i ? value : v)));
    if (value.trim()) {
      const used = inputs.filter((_, idx) => idx !== i).map((v) => v.trim().toLowerCase());
      setSuggestions(
        recentPlayers.filter(
          (r) =>
            r.toLowerCase().startsWith(value.toLowerCase()) &&
            !used.includes(r.toLowerCase()),
        ),
      );
    } else {
      setSuggestions([]);
    }
  };

  const applySuggestion = (i: number, name: string) => {
    setInputs((prev) => prev.map((v, idx) => (idx === i ? name : v)));
    setSuggestions([]);
    setFocusedIndex(null);
    const nextEmpty = inputs.findIndex((v, idx) => idx > i && v === '');
    if (nextEmpty !== -1) {
      inputRefs.current[nextEmpty]?.focus();
    }
    track('recent-player-selected');
  };

  const addPlayer = () => {
    if (inputs.length < 10) {
      setInputs((prev) => [...prev, '']);
      setTimeout(() => inputRefs.current[inputs.length]?.focus(), 50);
    }
  };

  const removePlayer = (i: number) => {
    if (inputs.length > 2) {
      setInputs((prev) => prev.filter((_, idx) => idx !== i));
    }
  };

  const validNames = inputs.map((v) => v.trim()).filter(Boolean);
  const uniqueNames = [...new Set(validNames)];
  const canStart = uniqueNames.length >= 2;

  const handleSubmit = () => {
    if (canStart) {
      track('players-confirmed', { player_count: uniqueNames.length });
      onConfirm(uniqueNames);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-6 max-w-md mx-auto w-full">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Tallee</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Who's playing?</p>
      </div>

      <div className="flex flex-col gap-3">
        {inputs.map((val, i) => (
          <div key={i} className="relative">
            <div className="flex gap-2">
              <input
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                value={val}
                onChange={(e) => updateInput(i, e.target.value)}
                onFocus={() => {
                  setFocusedIndex(i);
                  if (val.trim()) {
                    const used = inputs
                      .filter((_, idx) => idx !== i)
                      .map((v) => v.trim().toLowerCase());
                    setSuggestions(
                      recentPlayers.filter(
                        (r) =>
                          r.toLowerCase().startsWith(val.toLowerCase()) &&
                          !used.includes(r.toLowerCase()),
                      ),
                    );
                  }
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setFocusedIndex(null);
                    setSuggestions([]);
                  }, 150);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (i === inputs.length - 1 && inputs.length < 10) {
                      addPlayer();
                    } else {
                      inputRefs.current[i + 1]?.focus();
                    }
                  }
                }}
                placeholder={`Player ${i + 1}`}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
              {inputs.length > 2 && (
                <button
                  onClick={() => removePlayer(i)}
                  className="w-12 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors"
                  aria-label="Remove player"
                >
                  ✕
                </button>
              )}
            </div>

            {focusedIndex === i && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden shadow-lg">
                {suggestions.slice(0, 5).map((s) => (
                  <button
                    key={s}
                    onMouseDown={() => applySuggestion(i, s)}
                    className="w-full text-left px-4 py-2.5 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {inputs.length < 10 && (
          <button
            onClick={addPlayer}
            className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:border-violet-500 hover:text-violet-500 dark:hover:text-violet-400 transition-colors text-sm font-medium"
          >
            + Add Player
          </button>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canStart}
          className="w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white font-semibold rounded-xl transition-colors text-lg"
        >
          {canStart ? `Start with ${uniqueNames.length} players →` : 'Enter at least 2 players'}
        </button>

        <button
          onClick={() => {
            track('setup-cancelled');
            onReset();
          }}
          className="w-full py-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 text-sm transition-colors"
        >
          Cancel &amp; start over
        </button>
      </div>
    </div>
  );
}
