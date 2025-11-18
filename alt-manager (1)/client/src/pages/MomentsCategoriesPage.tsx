import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { momentsAPI } from '@/lib/api';
import { getMomentsByCategory } from '@/data/managerMomentsData';
import { 
  MessageSquare, 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  MessageCircle, 
  Heart, 
  Target,
  Zap 
} from 'lucide-react';

// Category definitions with icons and descriptions
const CATEGORIES = [
  {
    id: 'Communication',
    name: 'Communication',
    icon: MessageSquare,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Master clear, concise, and impactful communication in workplace scenarios'
  },
  {
    id: 'Organization',
    name: 'Organization',
    icon: Calendar,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Learn to prioritize, plan, and manage your workload effectively'
  },
  {
    id: 'Collaboration',
    name: 'Collaboration',
    icon: Users,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Build strong cross-team relationships and navigate team dynamics'
  },
  {
    id: 'Growth',
    name: 'Growth',
    icon: TrendingUp,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Develop self-awareness, receive feedback, and accelerate your career'
  },
  {
    id: 'Deadlines',
    name: 'Deadlines',
    icon: Clock,
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Handle time pressure, delays, and competing priorities with confidence'
  },
  {
    id: 'Feedback',
    name: 'Feedback',
    icon: MessageCircle,
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    description: 'Give and receive feedback effectively to drive performance'
  },
  {
    id: 'Wellbeing',
    name: 'Wellbeing',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    description: 'Manage stress, set boundaries, and maintain work-life balance'
  },
  {
    id: 'Team Dynamics',
    name: 'Team Dynamics',
    icon: Target,
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    description: 'Understand and navigate team culture, norms, and conflicts'
  }
];

const MomentsCategoriesPage = () => {
  const navigate = useNavigate();

  // Use static moments data for category display
  const isLoading = false;
  
  // Note: Using static moments data from managerMomentsData
  // API fetch available if needed for dynamic data

  // Fetch user progress
  const { data: progressData } = useQuery({
    queryKey: ['moments-progress'],
    queryFn: async () => {
      const response = await momentsAPI.getProgress();
      return response.data.progress;
    },
  });

  // Calculate category stats using static data
  const getCategoryStats = (categoryId: string) => {
    const categoryMoments = getMomentsByCategory(categoryId);
    const completed = categoryMoments.filter((m) => 
      progressData?.some((p: any) => p.momentId === m.id && p.status === 'completed')
    ).length;
    
    return {
      total: categoryMoments.length,
      completed
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Manager Moments</h1>
        <p className="text-lg text-slate-600">
          Practice real workplace scenarios and improve your skills
        </p>
      </div>

      {/* Info Card */}
      <div className="card mb-8 bg-gradient-to-r from-primary-50 to-accent-50 border-primary-100">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">How it works</h3>
            <ol className="space-y-2 text-slate-700">
              <li className="flex items-start">
                <span className="font-semibold mr-2">1.</span>
                <span>Choose a category that matches your development goals</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">2.</span>
                <span>Select a scenario and respond as you would in real life</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">3.</span>
                <span>Get instant feedback with strengths, improvements, and examples</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">4.</span>
                <span>Apply the learning with micro-habits and frameworks</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-2xl font-bold gradient-text mb-1">
            {progressData?.filter((p: any) => p.status === 'completed').length || 0}
          </div>
          <div className="text-sm text-slate-600">Completed</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold gradient-text mb-1">
            {progressData?.filter((p: any) => p.status === 'in_progress').length || 0}
          </div>
          <div className="text-sm text-slate-600">In Progress</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold gradient-text mb-1">
            {Math.round(progressData?.reduce((acc: number, p: any) => acc + (p.score || 0), 0) / (progressData?.filter((p: any) => p.score).length || 1)) || 0}
          </div>
          <div className="text-sm text-slate-600">Avg Score</div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Choose a Category</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((category, index) => {
          const Icon = category.icon;
          const stats = getCategoryStats(category.id);
          
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              onClick={() => navigate(`/moments/category/${category.id}`)}
              className={`card cursor-pointer transition-all ${category.bgColor} ${category.borderColor} hover:shadow-xl`}
            >
              {/* Icon Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <Icon className="text-white" size={28} />
                </div>
                {stats.total > 0 && (
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-700">
                      {stats.completed}/{stats.total}
                    </div>
                    <div className="text-xs text-slate-500">completed</div>
                  </div>
                )}
              </div>

              {/* Category Info */}
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {category.name}
              </h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {category.description}
              </p>

              {/* Progress Bar */}
              {stats.total > 0 && (
                <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${category.color} transition-all`}
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  />
                </div>
              )}

              {/* Action */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">
                  {stats.total} {stats.total === 1 ? 'moment' : 'moments'}
                </span>
                <span className={`font-semibold bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                  Explore →
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MomentsCategoriesPage;
