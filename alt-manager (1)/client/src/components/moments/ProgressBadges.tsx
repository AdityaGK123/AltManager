import { motion } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Badge {
  id: number;
  badgeName: string;
  badgeSlug: string;
  level: string;
  category: string;
  description: string;
  icon: string;
  xpValue: number;
  achievedAt: Date;
  earned?: boolean;
  progress?: number;
  total?: number;
  progressPercent?: number;
}

interface XPData {
  totalXp: number;
  currentLevel: number;
  xpToNextLevel: number;
  categoryXp: Record<string, number>;
  streakDays: number;
  lastPracticeDate: Date | null;
}

interface ProgressBadgesProps {
  category?: string;
  compact?: boolean;
}

export default function ProgressBadges({ category, compact = false }: ProgressBadgesProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [xpData, setXpData] = useState<XPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchProgress();
  }, [category]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const [badgesRes, progressRes] = await Promise.all([
        axios.get(`${API_URL}/api/badges${category ? `?category=${category}` : ''}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setBadges(badgesRes.data.badgeProgress || []);
      setXpData(progressRes.data.xp);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze':
        return 'from-amber-600 to-amber-800';
      case 'silver':
        return 'from-gray-400 to-gray-600';
      case 'gold':
        return 'from-yellow-400 to-yellow-600';
      case 'platinum':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const xpProgress = xpData
    ? ((xpData.totalXp % 100) / 100) * 100
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-gray-900">Level {xpData?.currentLevel || 1}</span>
          </div>
          <div className="text-sm text-gray-600">
            {xpData?.totalXp || 0} XP
          </div>
        </div>
        <div className="w-full bg-white/50 rounded-full h-2 mb-3">
          <motion.div
            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Trophy className="w-4 h-4" />
          <span>{badges.filter(b => b.earned).length} badges earned</span>
          {xpData && xpData.streakDays > 0 && (
            <>
              <span className="mx-1">•</span>
              <span className="text-orange-600 font-semibold">
                🔥 {xpData.streakDays} day streak
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* XP and Level Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">Level {xpData?.currentLevel || 1}</h3>
            <p className="text-indigo-100">
              {xpData?.totalXp || 0} XP • {xpData?.xpToNextLevel || 100} to next level
            </p>
          </div>
          <div className="bg-white/20 p-4 rounded-full">
            <Star className="w-8 h-8" />
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-3 mb-4">
          <motion.div
            className="bg-white h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        {/* Streak */}
        {xpData && xpData.streakDays > 0 && (
          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-semibold">{xpData.streakDays} Day Streak!</p>
              <p className="text-sm text-indigo-100">Keep practicing daily to maintain your streak</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Badges Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Your Badges</h3>
          <span className="text-sm text-gray-600">
            {badges.filter(b => b.earned).length} / {badges.length} earned
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.badgeSlug || index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                setSelectedBadge(badge);
                setShowBadgeModal(true);
              }}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                badge.earned
                  ? 'bg-gradient-to-br ' + getLevelColor(badge.level) + ' border-transparent shadow-lg hover:scale-105'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Badge Icon */}
              <div className="text-center mb-2">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-3xl ${
                    badge.earned ? 'bg-white/20' : 'bg-gray-200'
                  }`}
                >
                  {badge.icon || '🏆'}
                </div>
              </div>

              {/* Badge Name */}
              <h4
                className={`text-sm font-bold text-center mb-1 ${
                  badge.earned ? 'text-white' : 'text-gray-900'
                }`}
              >
                {badge.badgeName}
              </h4>

              {/* Progress Bar (if not earned) */}
              {!badge.earned && badge.total && badge.total > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full"
                      style={{ width: `${badge.progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 text-center mt-1">
                    {badge.progress} / {badge.total}
                  </p>
                </div>
              )}

              {/* Earned Badge Indicator */}
              {badge.earned && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 bg-white rounded-full p-1"
                >
                  <Trophy className="w-4 h-4 text-yellow-500" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Badge Detail Modal */}
      {showBadgeModal && selectedBadge && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowBadgeModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="text-center">
              <div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-4xl mb-4 ${
                  selectedBadge.earned
                    ? 'bg-gradient-to-br ' + getLevelColor(selectedBadge.level)
                    : 'bg-gray-200'
                }`}
              >
                {selectedBadge.icon || '🏆'}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedBadge.badgeName}
              </h3>
              <p className="text-gray-600 mb-4">{selectedBadge.description}</p>

              {selectedBadge.earned ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 font-semibold">✓ Badge Earned!</p>
                  <p className="text-sm text-green-600">+{selectedBadge.xpValue} XP</p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-gray-700 font-semibold mb-2">Progress</p>
                  {selectedBadge.total && selectedBadge.total > 0 ? (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${selectedBadge.progressPercent}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedBadge.progress} / {selectedBadge.total} completed
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">Keep practicing to unlock!</p>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowBadgeModal(false)}
                className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
