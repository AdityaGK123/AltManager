import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Eye, Lightbulb, Copy } from 'lucide-react';

interface DebriefPanelProps {
  debrief: {
    score: number;
    right: string[];
    improve: string[];
    blindSpots: string[];
    rubricScores: Record<string, boolean>;
    exemplarRewrite: string;
    exemplarRationale: string;
    microHabit: string;
    templates: string[];
  };
  onPracticeAgain: () => void;
  onHarderVariant: () => void;
}

export default function DebriefPanel({ debrief, onPracticeAgain, onHarderVariant }: DebriefPanelProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const scoreColor = debrief.score >= 4 ? 'from-green-600 to-emerald-600' : 
                     debrief.score >= 3 ? 'from-blue-600 to-indigo-600' :
                     debrief.score >= 2 ? 'from-yellow-600 to-orange-600' : 'from-red-600 to-pink-600';

  const scoreLabel = debrief.score === 5 ? 'Perfect! 🎉' :
                     debrief.score === 4 ? 'Strong work! 👍' :
                     debrief.score === 3 ? 'Good start 📈' :
                     debrief.score === 2 ? 'Room to grow 💪' : 'Keep practicing 🔄';

  const passed = debrief.score >= 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Score */}
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br ${scoreColor} rounded-full text-white text-4xl font-bold mb-4 shadow-lg`}>
          {debrief.score}/5
        </div>
        <p className="text-lg font-semibold text-gray-700">{scoreLabel}</p>
        {passed && (
          <p className="text-sm text-green-600 mt-2">✓ Pass (4/5 required)</p>
        )}
      </div>

      {/* Rubric Checklist */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-indigo-600" />
          Rubric Checklist
        </h4>
        <div className="space-y-2">
          {Object.entries(debrief.rubricScores).map(([key, passed]) => (
            <div key={key} className="flex items-center gap-2">
              {passed ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
              )}
              <span className={`text-sm ${passed ? 'text-gray-900' : 'text-gray-500'}`}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* What's Right */}
      {debrief.right && debrief.right.length > 0 && (
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            What's Right
          </h4>
          <ul className="space-y-2">
            {debrief.right.map((item, idx) => (
              <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* What to Improve */}
      {debrief.improve && debrief.improve.length > 0 && (
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
          <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            What to Improve
          </h4>
          <ul className="space-y-3">
            {debrief.improve.map((item, idx) => {
              const parts = item.split('Micro-edit:');
              const feedback = parts[0].trim();
              const microEdit = parts[1]?.trim().replace(/['"]/g, '');
              
              return (
                <li key={idx} className="text-sm text-orange-800">
                  <p className="mb-1">{feedback}</p>
                  {microEdit && (
                    <div className="bg-white p-2 rounded border border-orange-300 font-mono text-xs text-gray-700 flex items-center justify-between">
                      <span>{microEdit}</span>
                      <button
                        onClick={() => copyToClipboard(microEdit)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Blind Spots */}
      {debrief.blindSpots && debrief.blindSpots.length > 0 && (
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
          <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Blind Spots
          </h4>
          <ul className="space-y-2">
            {debrief.blindSpots.map((item, idx) => (
              <li key={idx} className="text-sm text-purple-800 flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ideal Response */}
      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
        <h4 className="font-bold text-indigo-900 mb-3">✨ Ideal Response</h4>
        <div className="bg-white p-4 rounded-lg border border-indigo-300 mb-3">
          <p className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
            {debrief.exemplarRewrite}
          </p>
        </div>
        <p className="text-xs text-indigo-700 italic">
          Why it works: {debrief.exemplarRationale}
        </p>
      </div>

      {/* Micro-Habit */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Micro-Habit
        </h4>
        <p className="text-sm text-blue-800 font-semibold">{debrief.microHabit}</p>
      </div>

      {/* Templates */}
      {debrief.templates && debrief.templates.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h4 className="font-bold text-gray-900 mb-3">📋 Copy-Paste Templates</h4>
          <div className="space-y-2">
            {debrief.templates.map((template, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-gray-300 flex items-center justify-between">
                <span className="text-sm text-gray-700 font-mono flex-1">{template}</span>
                <button
                  onClick={() => copyToClipboard(template)}
                  className="ml-3 text-indigo-600 hover:text-indigo-800"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onPracticeAgain}
          className="flex-1 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all"
        >
          Practice Again
        </button>
        {passed && (
          <button
            onClick={onHarderVariant}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Try Harder Variant 🔥
          </button>
        )}
      </div>
    </motion.div>
  );
}
