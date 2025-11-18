import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { momentsAPI } from '@/lib/api';
import { getMomentsByCategory } from '@/data/managerMomentsData';
import MomentCard from '@/components/moments/MomentCard';
import MomentRunner from '@/components/moments/MomentRunner';

const MomentsCategoryDetailPage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [selectedMoment, setSelectedMoment] = useState<string | null>(null);
  const [showRunner, setShowRunner] = useState(false);

  // Get moments for this category from static data
  const categoryMoments = category ? getMomentsByCategory(category) : [];

  // Fetch user progress
  const { data: progressData } = useQuery({
    queryKey: ['moments-progress'],
    queryFn: async () => {
      const response = await momentsAPI.getProgress();
      return response.data.progress;
    },
  });

  // Enrich moments with user progress
  const enrichedMoments = categoryMoments.map((moment) => ({
    ...moment,
    userProgress: progressData?.find((p: any) => p.momentId === moment.id) || null
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/moments')}
        className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Categories</span>
      </button>

      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
          {category} Moments
        </h1>
        <p className="text-lg text-slate-600">
          Practice {categoryMoments.length} scenarios to master {category?.toLowerCase()} skills
        </p>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-2xl font-bold gradient-text mb-1">
            {categoryMoments.length}
          </div>
          <div className="text-sm text-slate-600">Total</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold gradient-text mb-1">
            {enrichedMoments.filter((m: any) => m.userProgress?.status === 'completed').length}
          </div>
          <div className="text-sm text-slate-600">Completed</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold gradient-text mb-1">
            {enrichedMoments.filter((m: any) => m.userProgress?.status === 'in_progress').length}
          </div>
          <div className="text-sm text-slate-600">In Progress</div>
        </div>
      </div>

      {/* Moments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrichedMoments.length > 0 ? (
          enrichedMoments.map((moment: any) => (
            <MomentCard
              key={moment.id}
              moment={moment}
              onStart={() => {
                setSelectedMoment(moment.id);
                setShowRunner(true);
              }}
            />
          ))
        ) : (
          <div className="col-span-full card text-center py-12">
            <Target className="text-slate-300 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No moments in this category yet
            </h3>
            <p className="text-slate-600 mb-6">
              Check back soon for new practice scenarios
            </p>
            <button
              onClick={() => navigate('/moments')}
              className="btn-secondary"
            >
              Browse Other Categories
            </button>
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

export default MomentsCategoryDetailPage;
