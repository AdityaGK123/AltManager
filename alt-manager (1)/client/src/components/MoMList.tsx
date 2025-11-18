import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Target, 
  Lightbulb, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Loader2
} from 'lucide-react';
import { analysisAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface MoM {
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

export default function MoMList() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: momsData, isLoading, error } = useQuery({
    queryKey: ['moms'],
    queryFn: async () => {
      const response = await analysisAPI.getMoMs({ limit: 50 });
      return response.data.moms || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds when page is active
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800">Failed to load Minutes of Meeting</p>
        <p className="text-red-600 text-sm mt-2">Please try refreshing the page</p>
      </div>
    );
  }

  if (!momsData || momsData.length === 0) {
    return (
      <div className="bg-slate-50 rounded-xl p-12 text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Minutes of Meeting Yet</h3>
        <p className="text-slate-600 mb-6">
          Have meaningful conversations with your AI manager to generate insights and action items.
        </p>
        <a
          href="/chat"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Start a Conversation
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Minutes of Meeting
        </h2>
        <span className="text-sm text-slate-500">
          {momsData.length} session{momsData.length !== 1 ? 's' : ''}
        </span>
      </div>

      {momsData.map((mom: MoM, index: number) => (
        <motion.div
          key={mom.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <button
            onClick={() => setExpandedId(expandedId === mom.id ? null : mom.id)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex-1 text-left">
              <h3 className="font-bold text-slate-900 text-lg mb-1">{mom.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-slate-500">
                <span className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {new Date(mom.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                {mom.emotionalTone && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                    {mom.emotionalTone}
                  </span>
                )}
              </div>
            </div>
            {expandedId === mom.id ? (
              <ChevronUp className="text-slate-400" size={20} />
            ) : (
              <ChevronDown className="text-slate-400" size={20} />
            )}
          </button>

          {/* Expanded Content */}
          {expandedId === mom.id && (
            <div className="px-6 pb-6 space-y-6 border-t border-slate-100">
              {/* Summary */}
              <div className="pt-4">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                  <FileText size={16} className="mr-2 text-primary-600" />
                  Summary
                </h4>
                <p className="text-slate-700 leading-relaxed">{mom.summary}</p>
              </div>

              {/* Action Items */}
              {mom.actionItems && mom.actionItems.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                    <Target size={16} className="mr-2 text-green-600" />
                    Action Items
                  </h4>
                  <ul className="space-y-2">
                    {mom.actionItems.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="inline-block w-6 h-6 bg-green-100 text-green-700 rounded-full text-xs flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Insights */}
              {mom.insights && mom.insights.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                    <Lightbulb size={16} className="mr-2 text-yellow-600" />
                    Key Insights
                  </h4>
                  <ul className="space-y-2">
                    {mom.insights.map((insight: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-yellow-500 mr-3 mt-1">💡</span>
                        <span className="text-slate-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Blindspots */}
              {mom.blindspots && mom.blindspots.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                    <Eye size={16} className="mr-2 text-orange-600" />
                    Potential Blindspots
                  </h4>
                  <ul className="space-y-2">
                    {mom.blindspots.map((blindspot: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-orange-500 mr-3 mt-1">👁️</span>
                        <span className="text-slate-700">{blindspot}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Development Areas */}
              {mom.developmentAreas && mom.developmentAreas.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Development Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {mom.developmentAreas.map((area: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
