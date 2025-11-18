import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Target, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { userAPI, skillsAPI, goalsAPI } from '@/lib/api';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { getGreeting } from '@/lib/utils';

const HomePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { setProfile } = useUserStore();

  // Fetch user profile
  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      setProfile(response.data.profile);
      return response.data;
    },
  });

  // Fetch skills
  const { data: skillsData } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const response = await skillsAPI.getSkills();
      return response.data.skills;
    },
  });

  // Fetch goals
  const { data: goalsData } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await goalsAPI.getGoals();
      return response.data.goals;
    },
  });

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (profileData && !profileData.profile.onboardingCompleted) {
      navigate('/onboarding');
    }
  }, [profileData, navigate]);

  const quickActions = [
    {
      icon: MessageSquare,
      title: 'Ask for Guidance',
      description: 'Chat with your AI manager',
      color: 'from-blue-500 to-cyan-500',
      action: () => navigate('/chat'),
    },
    {
      icon: Target,
      title: 'Manager Moment',
      description: 'Practice workplace scenarios',
      color: 'from-purple-500 to-pink-500',
      action: () => navigate('/moments'),
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'View your growth journey',
      color: 'from-green-500 to-emerald-500',
      action: () => navigate('/progress'),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}! 👋
        </h1>
        <p className="text-lg text-slate-600">
          Ready to level up your career today?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="card hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-left group"
          >
            <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <action.icon className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{action.title}</h3>
            <p className="text-slate-600 mb-4">{action.description}</p>
            <div className="flex items-center text-primary-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
              <span>Get started</span>
              <ArrowRight size={18} className="ml-2" />
            </div>
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold gradient-text mb-1">
            {profileData?.profile.level || 1}
          </div>
          <div className="text-sm text-slate-600">Current Level</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold gradient-text mb-1">
            {skillsData?.length || 0}
          </div>
          <div className="text-sm text-slate-600">Skills Tracked</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold gradient-text mb-1">
            {goalsData?.length || 0}
          </div>
          <div className="text-sm text-slate-600">Active Goals</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold gradient-text mb-1">
            {profileData?.profile.experiencePoints || 0}
          </div>
          <div className="text-sm text-slate-600">XP Earned</div>
        </div>
      </div>

      {/* Recent Activity / Tips */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Sparkles className="text-accent-500" size={24} />
          <h2 className="text-2xl font-bold text-slate-900">Manager's Tip</h2>
        </div>
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6 border border-primary-100">
          <p className="text-slate-700 leading-relaxed mb-4">
            <strong>Start your day with clarity:</strong> Before diving into tasks, spend 5 minutes 
            identifying your top 3 priorities. This simple habit helps you stay focused and makes 
            you look more organized to your team.
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <MessageSquare size={18} />
            <span>Ask me more</span>
          </button>
        </div>
      </div>

      {/* Career Goals Section */}
      {goalsData && goalsData.length > 0 && (
        <div className="card mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Active Goals</h2>
          <div className="space-y-4">
            {goalsData.slice(0, 3).map((goal: any) => (
              <div key={goal.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-sm text-slate-600 mt-1">{goal.description}</p>
                  )}
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold gradient-text">{goal.progress}%</div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/progress')}
            className="btn-secondary w-full mt-4"
          >
            View All Goals
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
