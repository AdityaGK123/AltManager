import { motion } from 'framer-motion';
import { Play, TrendingUp, Award } from 'lucide-react';

interface MomentCardProps {
  moment: {
    id: number;
    title: string;
    description: string;
    skillFocus?: string;
    difficulty: number;
    cluster?: string;
    category?: string;
    userProgress?: {
      score: number;
      status: string;
    } | null;
  };
  onStart: () => void;
}

export default function MomentCard({ moment, onStart }: MomentCardProps) {
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty === 1) return 'bg-green-100 text-green-800';
    if (difficulty === 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty === 1) return 'Beginner';
    if (difficulty === 2) return 'Intermediate';
    return 'Advanced';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer transition-all"
      onClick={onStart}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(moment.difficulty)}`}>
              {getDifficultyLabel(moment.difficulty)}
            </span>
            {(moment.category || moment.cluster) && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                {moment.category || moment.cluster}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {moment.title.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {moment.description}
          </p>
        </div>
      </div>

      {/* Skill Focus */}
      {moment.skillFocus && (
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <span className="text-sm text-gray-700">
            <strong>Focus:</strong> {moment.skillFocus}
          </span>
        </div>
      )}

      {/* Progress */}
      {moment.userProgress && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <Award className="w-5 h-5 text-green-600" />
          <span className="text-sm font-semibold text-green-800">
            Last Score: {moment.userProgress.score}/4
          </span>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStart();
        }}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5" />
        {moment.userProgress ? 'Practice Again' : 'Start Practice'}
      </button>
    </motion.div>
  );
}
