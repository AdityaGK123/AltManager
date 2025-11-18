import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, TrendingUp, Lightbulb, Target } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { momentsAPI } from '@/lib/api';

const MomentDetailPage = () => {
  const { momentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'intro' | 'scenario' | 'response' | 'debrief'>('intro');
  const [userResponse, setUserResponse] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);

  // Fetch moment details
  const { data: momentData, isLoading } = useQuery({
    queryKey: ['moment', momentId],
    queryFn: async () => {
      const response = await momentsAPI.getMoments();
      return response.data.moments.find((m: any) => m.id === parseInt(momentId!));
    },
  });

  // Start moment
  const startMomentMutation = useMutation({
    mutationFn: () => momentsAPI.startMoment(parseInt(momentId!)),
    onSuccess: () => {
      setStep('scenario');
    },
  });

  // Submit response
  const submitMomentMutation = useMutation({
    mutationFn: (response: string) => momentsAPI.submitMoment(parseInt(momentId!), { response }),
    onSuccess: (data) => {
      setEvaluation(data.data.evaluation);
      setStep('debrief');
      queryClient.invalidateQueries({ queryKey: ['moments-progress'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!momentData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Moment not found</h2>
          <button onClick={() => navigate('/moments')} className="btn-primary mt-4">
            Back to Moments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/moments')}
        className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Moments</span>
      </button>

      {/* Intro Step */}
      {step === 'intro' && (
        <div className="animate-fade-in">
          <div className="card mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Psychological Safety</h3>
                <p className="text-slate-700">
                  This is a practice space. There are no wrong answers. The goal is to learn and improve. 
                  Take your time and respond naturally.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">{momentData.title}</h1>
            <p className="text-lg text-slate-600 mb-6">{momentData.description}</p>

            {momentData.learningObjectives && (
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center space-x-2">
                  <Target size={20} className="text-primary-600" />
                  <span>What you'll practice:</span>
                </h3>
                <ul className="space-y-2">
                  {(momentData.learningObjectives as string[]).map((objective: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-primary-600 mt-1">•</span>
                      <span className="text-slate-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => startMomentMutation.mutate()}
              disabled={startMomentMutation.isPending}
              className="btn-primary w-full"
            >
              {startMomentMutation.isPending ? 'Starting...' : 'Start Practice'}
            </button>
          </div>
        </div>
      )}

      {/* Scenario Step */}
      {step === 'scenario' && (
        <div className="animate-fade-in">
          <div className="card mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">The Situation</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap mb-6">
              {momentData.scenario}
            </p>

            {momentData.artifact && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-slate-900 mb-3">Artifact:</h3>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                    {JSON.stringify(momentData.artifact, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Your Response</h3>
            <p className="text-slate-600 mb-4">
              How would you handle this situation? Write your response below.
            </p>
            <textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              className="input-field min-h-[200px] mb-4"
              placeholder="Type your response here..."
            />
            <button
              onClick={() => submitMomentMutation.mutate(userResponse)}
              disabled={!userResponse.trim() || submitMomentMutation.isPending}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {submitMomentMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={20} />
                  <span>Submit Response</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Debrief Step */}
      {step === 'debrief' && evaluation && (
        <div className="animate-fade-in space-y-6">
          {/* Score */}
          <div className="card text-center bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Score</h2>
            <div className="text-6xl font-bold gradient-text mb-2">{evaluation.score}</div>
            <p className="text-slate-600">out of 100</p>
          </div>

          {/* Strengths */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {evaluation.strengths.map((strength: string, index: number) => (
                <li key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-slate-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Target className="text-yellow-600" size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Areas for Improvement</h3>
            </div>
            <ul className="space-y-3">
              {evaluation.improvements.map((improvement: string, index: number) => (
                <li key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-600 font-bold flex-shrink-0">→</span>
                  <span className="text-slate-700">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Examples */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Lightbulb className="text-blue-600" size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Better Approaches</h3>
            </div>
            <ul className="space-y-3">
              {evaluation.examples.map((example: string, index: number) => (
                <li key={index} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <span className="text-slate-700">{example}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/moments')}
              className="btn-secondary flex-1"
            >
              Back to Moments
            </button>
            <button
              onClick={() => {
                setStep('intro');
                setUserResponse('');
                setEvaluation(null);
              }}
              className="btn-primary flex-1"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MomentDetailPage;
