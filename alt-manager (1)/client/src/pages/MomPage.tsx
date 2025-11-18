import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Download, 
  Plus,
  FileText,
  TrendingUp,
  Eye,
  Lightbulb,
  Target,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Mom {
  id: number;
  title: string;
  date: string;
  summary: string;
  developmentAreas: string[];
  emotionalTone: string;
  actionItems: string[];
  insights: string[];
  blindspots: string[];
  createdAt: string;
}

export default function MomPage() {
  const [moms, setMoms] = useState<Mom[]>([]);
  const [selectedMom, setSelectedMom] = useState<Mom | null>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchMoms();
  }, []);

  const fetchMoms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/analysis/moms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMoms(response.data.moms);
      if (response.data.moms.length > 0 && !selectedMom) {
        setSelectedMom(response.data.moms[0]);
      }
    } catch (error) {
      console.error('Failed to fetch MoMs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="w-8 h-8 animate-pulse mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading Minutes of Meeting...</p>
        </div>
      </div>
    );
  }

  if (moms.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-6 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Minutes of Meeting Yet
          </h2>
          <p className="text-gray-600 mb-8">
            After each conversation with ALT Manager, generate a MoM to capture key insights, action items, and blindspots.
          </p>
          <Link
            to="/chat"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Start a Conversation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📝 Minutes of Meeting
          </h1>
          <p className="text-gray-600">
            Review your coaching sessions and track development insights
          </p>
        </div>
        <Link
          to="/analytics"
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          View Analytics
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MoM List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">
              All Sessions ({moms.length})
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {moms.map((mom) => (
                <button
                  key={mom.id}
                  onClick={() => setSelectedMom(mom)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedMom?.id === mom.id
                      ? 'bg-indigo-50 border-2 border-indigo-600'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <p className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                    {mom.title.split('|')[0].trim()}
                  </p>
                  <div className="flex items-center text-xs text-gray-600">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(mom.date).toLocaleDateString('en-GB')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MoM Detail */}
        {selectedMom && (
          <div className="lg:col-span-2">
            <motion.div
              key={selectedMom.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">
                      {selectedMom.title.split('|')[0].trim()}
                    </h2>
                    <div className="flex items-center text-indigo-100">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(selectedMom.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>

                {/* Development Areas */}
                <div className="flex flex-wrap gap-2">
                  {selectedMom.developmentAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                    Summary
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedMom.summary}
                  </p>
                </div>

                {/* Emotional Tone */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">
                    😊 Emotional Tone
                  </h3>
                  <p className="text-gray-700">{selectedMom.emotionalTone}</p>
                </div>

                {/* Action Items */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    Action Items
                  </h3>
                  <div className="space-y-2">
                    {selectedMom.actionItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {idx + 1}
                        </span>
                        <p className="text-gray-700 flex-1">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insights */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                    Key Insights
                  </h3>
                  <div className="space-y-3">
                    {selectedMom.insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                      >
                        <p className="text-gray-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blindspots */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-orange-600" />
                    Blindspots Identified
                  </h3>
                  <div className="space-y-3">
                    {selectedMom.blindspots.map((blindspot, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-orange-50 rounded-lg border border-orange-200"
                      >
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-orange-600 mr-3 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700">{blindspot}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
