import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock } from 'lucide-react';

interface LiveRubricEditorProps {
  rubric: Record<string, string>;
  onSubmit: (rewrite: string) => void;
  timeLimit?: number; // seconds, default 90
}

export default function LiveRubricEditor({ rubric, onSubmit, timeLimit = 90 }: LiveRubricEditorProps) {
  const [rewrite, setRewrite] = useState('');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isActive, setIsActive] = useState(false);
  const [liveScores, setLiveScores] = useState<Record<string, boolean>>({});

  // Start timer on mount
  useEffect(() => {
    setIsActive(true);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Live rubric evaluation as user types
  useEffect(() => {
    const scores: Record<string, boolean> = {};
    const lowerRewrite = rewrite.toLowerCase();

    // Simple heuristic checks (matches backend logic)
    Object.keys(rubric).forEach(key => {
      if (key === 'hasBLUF') {
        scores[key] = /^(bluf|decision|approve|need)/i.test(rewrite.trim());
      } else if (key === 'hasDecisionAskWithTime') {
        scores[key] = /\b(by|before|at)\s+\d{1,2}(:\d{2})?\s*(am|pm|AM|PM)?\b/.test(rewrite);
      } else if (key === 'includesSingleRisk') {
        scores[key] = /(risk|lose|miss|delay|cost)/i.test(lowerRewrite);
      } else if (key === 'nextStepOwnerDate') {
        scores[key] = /\b(next|then|after).*\b(by|on|before)\b/.test(lowerRewrite);
      } else if (key === 'brevity') {
        scores[key] = rewrite.split('\n').filter(l => l.trim()).length <= 5;
      } else if (key === 'hasClusters') {
        scores[key] = /(decision|blocker|in progress|status)/i.test(lowerRewrite);
      } else if (key === 'ownersAndDates') {
        scores[key] = /@\w+|owner/.test(lowerRewrite) && /\b(by|on|before)\b/.test(lowerRewrite);
      } else if (key === 'decisionAskWithTime') {
        scores[key] = /(decide|confirm|approve).*\b(by|before)\b/.test(lowerRewrite);
      } else if (key === 'includesLinks') {
        scores[key] = /(thread|link|source|http)/i.test(lowerRewrite);
      } else if (key === 'blockersPrioritized') {
        scores[key] = /blocker/i.test(rewrite.substring(0, rewrite.length / 2));
      } else if (key === 'ownsImpact') {
        scores[key] = /(on me|my fault|i missed|i caused)/i.test(lowerRewrite);
      } else if (key === 'statesSpecificChange') {
        scores[key] = /(changed|added|implemented|now i)/i.test(lowerRewrite);
      } else if (key === 'includesEvidenceToday') {
        scores[key] = /(today|this morning|already|just)/i.test(lowerRewrite);
      } else if (key === 'preventionDefined') {
        scores[key] = /(prevent|guardrail|will|going forward)/i.test(lowerRewrite);
      } else if (key === 'followUpDated') {
        scores[key] = /\b(review|check|follow.*up).*\b(on|by|next)\b/.test(lowerRewrite);
      } else {
        scores[key] = false;
      }
    });

    setLiveScores(scores);
  }, [rewrite, rubric]);

  const passedCount = Object.values(liveScores).filter(v => v).length;
  const totalCount = Object.keys(rubric).length;
  const isPassing = passedCount >= 4;

  const handleSubmit = () => {
    if (rewrite.trim()) {
      onSubmit(rewrite);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeColor = timeLeft > 30 ? 'text-green-600' : timeLeft > 10 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-4">
      {/* Timer */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <Clock className={`w-5 h-5 ${timeColor}`} />
          <span className={`font-mono text-lg font-bold ${timeColor}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          {passedCount}/{totalCount} checks {isPassing && '✓'}
        </div>
      </div>

      {/* Live Rubric */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Live Rubric</h4>
        <div className="space-y-2">
          {Object.entries(rubric).map(([key, description]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0.5 }}
              animate={{ 
                opacity: 1,
                backgroundColor: liveScores[key] ? '#dcfce7' : 'transparent'
              }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 p-2 rounded"
            >
              {liveScores[key] ? (
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
              )}
              <span className={`text-sm ${liveScores[key] ? 'text-green-900 font-medium' : 'text-gray-600'}`}>
                {description}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div>
        <textarea
          value={rewrite}
          onChange={(e) => setRewrite(e.target.value)}
          placeholder="Rewrite your response here..."
          className="w-full h-40 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
          disabled={timeLeft === 0}
        />
        <p className="text-xs text-gray-500 mt-1">
          {rewrite.split('\n').filter(l => l.trim()).length} lines • {rewrite.length} characters
        </p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!rewrite.trim() || timeLeft === 0}
        className={`w-full py-3 rounded-xl font-semibold transition-all ${
          isPassing
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {timeLeft === 0 ? 'Time Up - Submit Anyway' : isPassing ? 'Submit (Passing!) ✓' : 'Submit Rewrite'}
      </button>

      {timeLeft === 0 && (
        <p className="text-sm text-center text-gray-600">
          Time's up! You can still submit, but try to hit the timer next time.
        </p>
      )}
    </div>
  );
}
