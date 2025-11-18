import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Briefcase, Target, MessageCircle, CheckCircle } from 'lucide-react';
import { userAPI } from '@/lib/api';
import { useUserStore } from '@/store/userStore';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const setProfile = useUserStore((state) => state.setProfile);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [roleTitle, setRoleTitle] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [careerGoals, setCareerGoals] = useState('');
  const [currentChallenges, setCurrentChallenges] = useState('');
  const [managerTone, setManagerTone] = useState<'supportive' | 'direct' | 'balanced'>('balanced');

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await userAPI.updateProfile({
        roleTitle,
        experienceYears,
        careerGoals,
        currentChallenges,
        managerTone,
        onboardingCompleted: true,
      });
      setProfile(response.data.profile);
      navigate('/');
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return roleTitle && experienceYears !== null;
    if (step === 2) return careerGoals;
    if (step === 3) return managerTone;
    return false;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full space-y-8 animate-fade-in">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  i < step
                    ? 'bg-primary-600 text-white'
                    : i === step
                    ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {i < step ? <CheckCircle size={20} /> : i}
              </div>
              {i < 3 && (
                <div
                  className={`w-16 h-1 mx-2 transition-all duration-300 ${
                    i < step ? 'bg-primary-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="card">
          {step === 1 && (
            <div className="space-y-6 animate-slide-up">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="text-primary-600" size={32} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Tell me about your role</h2>
                <p className="text-slate-600">Let's understand where you are in your career</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What's your current role?
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Software Engineer, Product Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Years of experience
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {[0, 1, 2, 3, 4].map((years) => (
                    <button
                      key={years}
                      onClick={() => setExperienceYears(years)}
                      className={`py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                        experienceYears === years
                          ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {years}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-slide-up">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="text-primary-600" size={32} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">What are your goals?</h2>
                <p className="text-slate-600">Help me understand what you want to achieve</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Career goals (select or type your own)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {[
                    'Get promoted',
                    'Switch roles',
                    'Improve communication',
                    'Lead a team',
                    'Learn new skills',
                    'Work-life balance',
                  ].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setCareerGoals(goal)}
                      className={`py-3 px-4 rounded-xl font-medium text-left transition-all duration-200 ${
                        careerGoals === goal
                          ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
                <textarea
                  value={careerGoals}
                  onChange={(e) => setCareerGoals(e.target.value)}
                  className="input-field min-h-[100px]"
                  placeholder="Or describe your career goals..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Current challenges (optional)
                </label>
                <textarea
                  value={currentChallenges}
                  onChange={(e) => setCurrentChallenges(e.target.value)}
                  className="input-field min-h-[100px]"
                  placeholder="What challenges are you facing at work?"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-slide-up">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="text-primary-600" size={32} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Choose your manager style</h2>
                <p className="text-slate-600">How would you like me to guide you?</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    value: 'supportive' as const,
                    title: 'Supportive',
                    description: 'Warm, encouraging, and empathetic. Focus on building confidence.',
                    emoji: '🤗',
                  },
                  {
                    value: 'direct' as const,
                    title: 'Direct',
                    description: 'Straightforward and action-oriented. Clear directives and honest feedback.',
                    emoji: '🎯',
                  },
                  {
                    value: 'balanced' as const,
                    title: 'Balanced',
                    description: 'Mix of empathy and directness. Supportive with accountability.',
                    emoji: '⚖️',
                  },
                ].map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => setManagerTone(tone.value)}
                    className={`w-full p-6 rounded-xl text-left transition-all duration-200 ${
                      managerTone === tone.value
                        ? 'bg-gradient-to-r from-primary-50 to-accent-50 border-2 border-primary-500 shadow-lg'
                        : 'bg-slate-50 border-2 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <span className="text-4xl">{tone.emoji}</span>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{tone.title}</h3>
                        <p className="text-slate-600">{tone.description}</p>
                      </div>
                      {managerTone === tone.value && (
                        <CheckCircle className="text-primary-600 flex-shrink-0" size={24} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="btn-ghost">
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className={`btn-primary ml-auto flex items-center space-x-2 ${
                !canProceed() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{step === 3 ? 'Complete Setup' : 'Continue'}</span>
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
