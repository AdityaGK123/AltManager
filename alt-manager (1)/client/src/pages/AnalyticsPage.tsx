import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Eye, 
  Target, 
  Calendar,
  RefreshCw,
  BarChart3,
  Brain,
  Lightbulb,
  FileText
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import MoMList from '../components/MoMList';
import ProgressDashboard from '../components/progress/ProgressDashboard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface DashboardData {
  momCount: number;
  latestTrend: any;
  latestBlindspot: any;
  latestProgress: any;
  hasData: boolean;
}

interface MomentsAnalytics {
  totalCompleted: number;
  totalAvailable: number;
}

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [momentsAnalytics, setMomentsAnalytics] = useState<MomentsAnalytics>({ totalCompleted: 0, totalAvailable: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'moms' | 'trends' | 'blindspots' | 'progress'>('moms');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();

    // Refetch when window regains focus (e.g., after chat)
    const handleFocus = () => {
      console.log('[Analytics] Window focused, refetching dashboard...');
      fetchDashboard();
    };

    // Poll for updates every 30 seconds when page is active
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchDashboard();
      }
    }, 30000);

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(pollInterval);
    };
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashboardRes, momentsRes, analyticsRes] = await Promise.all([
        axios.get(`${API_URL}/api/analysis/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/moments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/moments/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      
      setDashboard(dashboardRes.data.dashboard);
      
      // Calculate total available moments and completed moments
      const totalAvailable = momentsRes.data.moments?.length || 0;
      const totalCompleted = analyticsRes.data.analytics?.totalCompleted || 0;
      setMomentsAnalytics({ totalCompleted, totalAvailable });
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = async (type: 'trends' | 'blindspots' | 'progress') => {
    try {
      setGenerating(true);
      setError(null);
      await axios.post(
        `${API_URL}/api/analysis/${type}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchDashboard();
    } catch (err: any) {
      console.error(`Failed to generate ${type} analysis:`, err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || `Failed to generate ${type} analysis. Please try again.`;
      setError(errorMessage);
      
      // Auto-dismiss error after 8 seconds
      setTimeout(() => setError(null), 8000);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!dashboard?.hasData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-6 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Analytics Data Yet
          </h2>
          <p className="text-gray-600 mb-8">
            Start chatting with ALT Manager to generate Minutes of Meeting and unlock powerful insights about your growth journey.
          </p>
          <a
            href="/chat"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Start a Conversation
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
        >
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="flex-shrink-0 text-red-600 hover:text-red-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </motion.div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📊 Analytics Dashboard
        </h1>
        <p className="text-gray-600">
          Track your progress, identify patterns, and uncover growth opportunities
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white"
        >
          <Calendar className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-sm opacity-90 mb-1">Total Sessions</p>
          <p className="text-3xl font-bold">{dashboard.momCount}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-100"
        >
          <TrendingUp className="w-8 h-8 mb-3 text-green-600" />
          <p className="text-sm text-gray-600 mb-1">Trends Analysis</p>
          <p className="text-2xl font-bold text-gray-900">
            {dashboard.latestTrend ? '✓ Available' : 'Generate'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-100"
        >
          <Eye className="w-8 h-8 mb-3 text-orange-600" />
          <p className="text-sm text-gray-600 mb-1">Blindspots</p>
          <p className="text-2xl font-bold text-gray-900">
            {dashboard.latestBlindspot ? '✓ Available' : 'Generate'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-100"
        >
          <Target className="w-8 h-8 mb-3 text-blue-600" />
          <p className="text-sm text-gray-600 mb-1">Progress Report</p>
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-gray-900">
                {momentsAnalytics.totalCompleted}/{momentsAnalytics.totalAvailable}
              </span>
              <span className="text-sm text-gray-500">
                {momentsAnalytics.totalAvailable > 0 
                  ? Math.round((momentsAnalytics.totalCompleted / momentsAnalytics.totalAvailable) * 100) 
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ 
                  width: `${momentsAnalytics.totalAvailable > 0 
                    ? (momentsAnalytics.totalCompleted / momentsAnalytics.totalAvailable) * 100 
                    : 0}%` 
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('moms')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'moms'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-5 h-5 inline-block mr-2" />
              Minutes of Meeting
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'progress'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Target className="w-5 h-5 inline-block mr-2" />
              Progress Analysis
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'trends'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-5 h-5 inline-block mr-2" />
              Trends & Themes
            </button>
            <button
              onClick={() => setActiveTab('blindspots')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'blindspots'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Eye className="w-5 h-5 inline-block mr-2" />
              Blindspots Deep-Dive
            </button>
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'moms' && <MoMList />}
          {activeTab === 'progress' && (
            <ProgressDashboard onNavigateToMoments={() => navigate('/moments')} />
          )}
          {activeTab === 'trends' && (
            <TrendsAnalysisView
              data={dashboard.latestTrend}
              onGenerate={() => generateAnalysis('trends')}
              generating={generating}
            />
          )}
          {activeTab === 'blindspots' && (
            <BlindspotAnalysisView
              data={dashboard.latestBlindspot}
              onGenerate={() => generateAnalysis('blindspots')}
              generating={generating}
            />
          )}
        </div>
      </div>
    </div>
  );
}


function TrendsAnalysisView({ data, onGenerate, generating }: any) {
  if (!data) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Generate Trends Analysis
        </h3>
        <p className="text-gray-600 mb-6">
          Identify recurring themes and emotional patterns across your sessions
        </p>
        <button
          onClick={onGenerate}
          disabled={generating}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {generating ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5 mr-2" />
              Generate Analysis
            </>
          )}
        </button>
      </div>
    );
  }

  const areas = data.primaryDevelopmentAreas || [];
  const themes = data.contentThemeClusters || [];
  const emotional = data.emotionalTrajectory || {};
  const insights = data.summaryInsights || [];

  return (
    <div className="space-y-8">
      {/* Primary Development Areas */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          🎯 Primary Development Areas
        </h3>
        <div className="space-y-3">
          {areas.map((area: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{area.area}</p>
                <p className="text-sm text-gray-600">{area.pattern}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600">{area.percentage}%</p>
                <p className="text-xs text-gray-500">{area.frequency} sessions</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Themes */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          💡 Content Theme Clusters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themes.map((theme: any, idx: number) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200"
            >
              <h4 className="font-bold text-gray-900 mb-2">{theme.themeName}</h4>
              <p className="text-sm text-gray-600 mb-3">
                <strong>Evolution:</strong> {theme.evolution}
              </p>
              <div className="space-y-1">
                {theme.sampleTopics?.map((topic: string, i: number) => (
                  <p key={i} className="text-xs text-gray-700">• {topic}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emotional Trajectory */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          😊 Emotional Trajectory
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-700 mb-2">Dominant Emotions:</p>
            <p className="text-gray-600">{emotional.dominantEmotions?.join(', ')}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-2">Trend Direction:</p>
            <p className="text-gray-600">{emotional.trendDirection}</p>
          </div>
        </div>
      </div>

      {/* Summary Insights */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          <Lightbulb className="w-6 h-6 inline-block mr-2 text-yellow-500" />
          Key Insights
        </h3>
        <div className="space-y-3">
          {insights.map((insight: string, idx: number) => (
            <div key={idx} className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlindspotAnalysisView({ data, onGenerate, generating }: any) {
  if (!data) {
    return (
      <div className="text-center py-12">
        <Eye className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Generate Blindspot Analysis
        </h3>
        <p className="text-gray-600 mb-6">
          Uncover hidden patterns, assumptions, and growth opportunities
        </p>
        <button
          onClick={onGenerate}
          disabled={generating}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {generating ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5 mr-2" />
              Generate Analysis
            </>
          )}
        </button>
      </div>
    );
  }

  const recurring = data.recurringBlindspots || [];
  const strengths = data.unrecognizedStrengths || [];
  const blockers = data.growthBlockers || [];
  const hypotheses = data.developmentHypotheses || [];

  return (
    <div className="space-y-8">
      {/* Recurring Blindspots */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          🔍 Recurring Blindspots
        </h3>
        <div className="space-y-4">
          {recurring.map((item: any, idx: number) => (
            <div
              key={idx}
              className="bg-orange-50 rounded-xl p-5 border border-orange-200"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-gray-900">{item.pattern}</h4>
                <span className="text-sm font-semibold text-orange-600">
                  {item.frequency}x
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Context:</strong> {item.context}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Impact:</strong> {item.impact}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Unrecognized Strengths */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          ✨ Unrecognized Strengths
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strengths.map((item: any, idx: number) => (
            <div
              key={idx}
              className="bg-green-50 rounded-xl p-5 border border-green-200"
            >
              <h4 className="font-bold text-gray-900 mb-2">{item.strength}</h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Evidence:</strong> {item.evidence}
              </p>
              <p className="text-sm text-gray-600 italic">
                Why not seen: {item.whyNotSeen}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Blockers */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          🚧 Growth Blockers
        </h3>
        <div className="space-y-3">
          {blockers.map((item: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-red-50 rounded-lg p-4 border border-red-200"
            >
              <div className="flex-1">
                <span className="inline-block px-2 py-1 bg-red-200 text-red-800 text-xs font-semibold rounded mb-2">
                  {item.type}
                </span>
                <p className="text-gray-900">{item.blocker}</p>
              </div>
              <div className="ml-4">
                <div className="w-12 h-12 rounded-full bg-red-200 flex items-center justify-center">
                  <span className="text-lg font-bold text-red-800">{item.severity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Development Hypotheses */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          💡 Development Hypotheses
        </h3>
        <div className="space-y-3">
          {hypotheses.map((hypothesis: string, idx: number) => (
            <div key={idx} className="flex items-start">
              <span className="text-purple-600 font-bold mr-3">{idx + 1}.</span>
              <p className="text-gray-700">{hypothesis}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
