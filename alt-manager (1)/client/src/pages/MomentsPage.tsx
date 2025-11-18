import { useState } from 'react';
import { Target, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { momentsAPI } from '@/lib/api';
import MomentCard from '@/components/moments/MomentCard';
import MomentRunner from '@/components/moments/MomentRunner';

const MomentsPage = () => {
  const [selectedMoment, setSelectedMoment] = useState<string | null>(null);
  const [showRunner, setShowRunner] = useState(false);

  // Fetch all moments
  const { data: momentsData, isLoading } = useQuery({
    queryKey: ['moments'],
    queryFn: async () => {
      const response = await momentsAPI.getMoments();
      return response.data.moments;
    },
  });

  // Fetch user progress
  const { data: progressData } = useQuery({
    queryKey: ['moments-progress'],
    queryFn: async () => {
      const response = await momentsAPI.getProgress();
      return response.data.progress;
    },
  });

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
                <span>Choose a scenario that matches your current challenges</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">2.</span>
                <span>Read the situation and respond as you would in real life</span>
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
            {progressData?.reduce((acc: number, p: any) => acc + (p.score || 0), 0) / (progressData?.filter((p: any) => p.score).length || 1) || 0}
          </div>
          <div className="text-sm text-slate-600">Avg Score</div>
        </div>
      </div>

      {/* Moments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {momentsData && momentsData.length > 0 ? (
          momentsData.map((moment: any) => (
            <MomentCard
              key={moment.id}
              moment={moment}
              onStart={() => {
                setSelectedMoment(String(moment.id));
                setShowRunner(true);
              }}
            />
          ))
        ) : (
          <div className="col-span-full card text-center py-12">
            <Target className="text-slate-300 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No moments available yet</h3>
            <p className="text-slate-600">Check back soon for new practice scenarios</p>
          </div>
        )}
      </div>

      {/* Moment Runner Modal */}
      {showRunner && selectedMoment && (
        <MomentRunner
          momentId={selectedMoment}
          onComplete={(debrief) => {
            console.log('Completed with debrief:', debrief);
          }}
          onClose={() => {
            setShowRunner(false);
            setSelectedMoment(null);
          }}
        />
      )}
    </div>
  );
};

export default MomentsPage;
