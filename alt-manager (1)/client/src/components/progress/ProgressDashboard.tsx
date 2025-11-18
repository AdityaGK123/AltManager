import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Flame, 
  BarChart3,
  Loader2,
  Sparkles,
  Trophy,
  Star
} from 'lucide-react';
import { momentsAPI } from '@/lib/api';
import {
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LabelList
} from 'recharts';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

interface ProgressDashboardProps {
  onNavigateToMoments?: () => void;
}

const ProgressDashboard = ({ onNavigateToMoments }: ProgressDashboardProps) => {
  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['moments-analytics'],
    queryFn: async () => {
      const response = await momentsAPI.getAnalytics();
      return response.data.analytics;
    },
  });

  // Prepare pie chart data
  const pieData = useMemo(() => {
    if (!analyticsData?.categoryStats) return [];
    return analyticsData.categoryStats.map((cat: any, index: number) => ({
      name: cat.category,
      value: cat.completedMoments,
      avgScore: cat.avgScore,
      fill: `hsl(${(index * 360) / analyticsData.categoryStats.length}, 65%, 55%)`
    }));
  }, [analyticsData]);

  // Prepare line chart data
  const lineData = useMemo(() => {
    if (!analyticsData?.progressHistory) return [];
    return analyticsData.progressHistory.map((item: any, index: number) => ({
      name: `#${index + 1}`,
      score: item.score,
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [analyticsData]);

  // Prepare bar chart data
  const barData = useMemo(() => {
    if (!analyticsData?.categoryStats) return [];
    return analyticsData.categoryStats.map((cat: any) => ({
      category: cat.category.length > 15 ? cat.category.substring(0, 15) + '...' : cat.category,
      completed: cat.completedMoments,
      avgScore: cat.avgScore
    }));
  }, [analyticsData]);

  // Calculate achievement badges
  const badges = useMemo(() => {
    if (!analyticsData) return [];
    const earned = [];
    
    if (analyticsData.totalCompleted >= 1) {
      earned.push({ id: 'first', title: 'First Steps', description: 'Completed your first moment', tier: 'bronze' });
    }
    if (analyticsData.totalCompleted >= 5) {
      earned.push({ id: 'five', title: 'Getting Started', description: '5 moments completed', tier: 'silver' });
    }
    if (analyticsData.totalCompleted >= 10) {
      earned.push({ id: 'ten', title: 'Committed Learner', description: '10 moments completed', tier: 'gold' });
    }
    if (analyticsData.streak >= 3) {
      earned.push({ id: 'streak3', title: 'Consistency Champion', description: `${analyticsData.streak} day streak`, tier: 'gold' });
    }
    if (analyticsData.avgScore >= 4.0) {
      earned.push({ id: 'highscore', title: 'High Performer', description: 'Average score above 4.0', tier: 'gold' });
    }
    if (analyticsData.topCategory && analyticsData.topCategory.avgScore >= 4.5) {
      earned.push({ 
        id: 'expert', 
        title: `${analyticsData.topCategory.name} Expert`, 
        description: `Mastered ${analyticsData.topCategory.name}`, 
        tier: 'gold' 
      });
    }
    
    return earned;
  }, [analyticsData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  if (!analyticsData || analyticsData.totalCompleted === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center">
          <BarChart3 className="text-primary-600" size={64} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">No Progress Data Yet</h3>
        <p className="text-lg text-slate-600 mb-6 max-w-md mx-auto">
          Complete Manager Moments to start tracking your growth and see beautiful analytics!
        </p>
        {onNavigateToMoments && (
          <button onClick={onNavigateToMoments} className="btn-primary">
            Start Your First Moment
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -4 }}
          className="card-glass bg-gradient-to-br from-indigo-50/50 to-indigo-100/30"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-indigo-600/80 rounded-xl flex items-center justify-center shadow-md">
              <Target className="text-white" size={24} />
            </div>
            <Sparkles className="text-indigo-600/70" size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-600 mb-1">Moments Completed</h3>
          <p className="text-4xl font-bold text-indigo-700">{analyticsData.totalCompleted}</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -4 }}
          className="card-glass bg-gradient-to-br from-teal-50/50 to-teal-100/30"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-teal-600/80 rounded-xl flex items-center justify-center shadow-md">
              <TrendingUp className="text-white" size={24} />
            </div>
            <Star className="text-teal-600/70" size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-600 mb-1">Average Score</h3>
          <p className="text-4xl font-bold text-teal-700">{analyticsData.avgScore.toFixed(1)}</p>
          <p className="text-xs text-slate-500 mt-1">out of 5.0</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -4 }}
          className="card-glass bg-gradient-to-br from-amber-50/50 to-amber-100/30"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-amber-600/80 rounded-xl flex items-center justify-center shadow-md">
              <Flame className="text-white" size={24} />
            </div>
            <Trophy className="text-amber-600/70" size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-600 mb-1">Current Streak</h3>
          <p className="text-4xl font-bold text-amber-700">{analyticsData.streak}</p>
          <p className="text-xs text-slate-500 mt-1">consecutive days</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -4 }}
          className="card-glass bg-gradient-to-br from-emerald-50/50 to-emerald-100/30"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-emerald-600/80 rounded-xl flex items-center justify-center shadow-md">
              <Award className="text-white" size={24} />
            </div>
            <Sparkles className="text-emerald-600/70" size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-600 mb-1">Top Skill</h3>
          <p className="text-lg font-bold text-emerald-700 leading-tight">
            {analyticsData.topCategory?.name || 'N/A'}
          </p>
          {analyticsData.topCategory && (
            <p className="text-xs text-slate-500 mt-1">
              Avg: {analyticsData.topCategory.avgScore.toFixed(1)}
            </p>
          )}
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart - Category Distribution */}
        <motion.div 
          variants={itemVariants} 
          className="card-glass"
          whileHover={{ y: -4 }}
        >
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <BarChart3 className="text-indigo-600" size={24} />
            <span>Category Distribution</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#64748b', strokeWidth: 1 }}
                animationBegin={0}
                animationDuration={800}
              >
                {pieData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(8px)'
                }}
                formatter={(value: any, name: any, props: any) => [
                  `${value} moments (Avg: ${props.payload.avgScore.toFixed(1)})`,
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-sm text-slate-600 mt-3 text-center">
            Distribution of completed moments by category
          </p>
        </motion.div>

        {/* Line Chart - Progress Trend */}
        <motion.div 
          variants={itemVariants} 
          className="card-glass"
          whileHover={{ y: -4 }}
        >
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="text-teal-600" size={24} />
            <span>Progress Over Time</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#64748b', fontSize: 11 }}
                stroke="#cbd5e1"
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                domain={[0, 5]} 
                tick={{ fill: '#64748b', fontSize: 11 }}
                stroke="#cbd5e1"
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(8px)'
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ fill: '#14B8A6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, fill: '#14B8A6' }}
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-sm text-slate-600 mt-3 text-center">
            Your score trend across recent moments
          </p>
        </motion.div>
      </div>

      {/* Bar Chart - Category Completion */}
      <motion.div 
        variants={itemVariants} 
        className="card-glass"
        whileHover={{ y: -4 }}
      >
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Target className="text-emerald-600" size={24} />
          <span>Moments Completed by Category</span>
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.85}/>
                <stop offset="100%" stopColor="#A5B4FC" stopOpacity={0.5}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
            <XAxis 
              dataKey="category" 
              tick={{ fill: '#64748b', fontSize: 11 }}
              stroke="#cbd5e1"
              angle={-15}
              textAnchor="end"
              height={80}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 11 }}
              stroke="#cbd5e1"
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(8px)'
              }}
              cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
            />
            <Bar 
              dataKey="completed" 
              fill="url(#barGradient)" 
              radius={[10, 10, 0, 0]}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              <LabelList 
                dataKey="completed" 
                position="top" 
                style={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-slate-600 mt-3 text-center">
          Distribution of your completed moments across categories
        </p>
      </motion.div>

      {/* Achievement Badges */}
      {badges.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-4">
          <h3 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Trophy className="text-yellow-600" size={28} />
            <span>Your Achievements</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 200
                }}
                whileHover={{ scale: 1.05, y: -4 }}
                className={`card text-center ${
                  badge.tier === 'gold' 
                    ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300' 
                    : badge.tier === 'silver'
                    ? 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300'
                    : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300'
                }`}
              >
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  badge.tier === 'gold'
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                    : badge.tier === 'silver'
                    ? 'bg-gradient-to-br from-slate-300 to-slate-500'
                    : 'bg-gradient-to-br from-orange-400 to-orange-600'
                }`}>
                  <Award className="text-white" size={32} />
                </div>
                <h4 className="font-bold text-slate-900 mb-1">{badge.title}</h4>
                <p className="text-sm text-slate-600">{badge.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProgressDashboard;
