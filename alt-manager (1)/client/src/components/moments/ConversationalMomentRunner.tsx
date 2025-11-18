import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, ArrowRight, Loader2, Sparkles, TrendingUp, Award } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ConversationalMomentRunnerProps {
  momentId: string;
  onComplete: (feedback: any) => void;
  onClose: () => void;
}

type Step = 'greeting' | 'safety' | 'caselet' | 'roleplay' | 'feedback' | 'celebration';

export default function ConversationalMomentRunner({
  momentId,
  onComplete,
  onClose,
}: ConversationalMomentRunnerProps) {
  const [step, setStep] = useState<Step>('greeting');
  const [sessionId, setSessionId] = useState<string>('');
  const [completionId, setCompletionId] = useState<number>(0);
  const [greeting, setGreeting] = useState('');
  const [safetyFraming, setSafetyFraming] = useState('');
  const [caselet, setCaselet] = useState('');
  const [stakeholderRole, setStakeholderRole] = useState('');
  const [expectedTurns, setExpectedTurns] = useState(3);
  const [turnCount, setTurnCount] = useState(0);
  const [transcript, setTranscript] = useState<Array<{ role: string; content: string }>>([]);
  const [userInput, setUserInput] = useState('');
  const [chips, setChips] = useState<{ good: string[]; risky: string[] }>({ good: [], risky: [] });
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [xpUpdate, setXpUpdate] = useState<any>(null);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startMoment();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const startMoment = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/moments/${momentId}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSessionId(response.data.sessionId);
      setCompletionId(response.data.completionId);
      setSafetyFraming(response.data.safetyFraming);
      setCaselet(response.data.caselet);
      setStakeholderRole(response.data.stakeholderRole);
      setExpectedTurns(response.data.expectedTurns);

      // Generate personalized greeting
      const userName = (user as any)?.firstName || user?.email?.split('@')[0] || 'there';
      setGreeting(`Hey ${userName}, ready to practice? Let's make this count! 💪`);

      setTimeout(() => setStep('safety'), 1500);
    } catch (error) {
      console.error('Failed to start moment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || loading) return;

    const content = userInput.trim();
    setUserInput('');
    setLoading(true);

    // Add user message to transcript
    setTranscript((prev) => [...prev, { role: 'user', content }]);

    try {
      const response = await axios.post(
        `${API_URL}/api/moments/${momentId}/response`,
        { sessionId, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add AI response
      setTranscript((prev) => [...prev, { role: 'ai', content: response.data.reply }]);
      setChips(response.data.chips);
      setTurnCount(response.data.turnCount);

      // Check if complete
      if (response.data.isComplete) {
        console.log('[MomentRunner] Conversation complete, generating feedback...');
        setTimeout(() => generateFeedback(), 1000);
      } else {
        console.log(`[MomentRunner] Turn ${response.data.turnCount}/${response.data.expectedTurns}`);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFeedback = async () => {
    try {
      setLoading(true);
      setStep('feedback');

      const response = await axios.post(
        `${API_URL}/api/moments/${momentId}/coach`,
        { sessionId, completionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFeedback(response.data.feedback);
      setXpUpdate(response.data.xp);
      setNewBadges(response.data.badges || []);

      // Show celebration if badges earned or high score
      if (response.data.badges?.length > 0 || response.data.feedback.score >= 80) {
        setTimeout(() => setStep('celebration'), 2000);
      }
    } catch (error) {
      console.error('Failed to generate feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input not supported in your browser');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUserInput(transcript);
    };

    recognition.start();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 70) return 'from-blue-500 to-indigo-600';
    if (score >= 50) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🎉';
    if (score >= 70) return '👍';
    if (score >= 50) return '📈';
    return '💪';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Progress Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
          <div className="flex items-center justify-between text-white mb-2">
            <span className="text-sm font-semibold">
              {step === 'greeting' && 'Welcome!'}
              {step === 'safety' && 'Step 1: Psychological Safety'}
              {step === 'caselet' && 'Step 2: Your Scenario'}
              {step === 'roleplay' && `Step 3: Practice (Turn ${turnCount}/${expectedTurns})`}
              {step === 'feedback' && 'Step 4: Your Coaching Feedback'}
              {step === 'celebration' && '🎉 Celebration!'}
            </span>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              ✕
            </button>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  step === 'greeting'
                    ? 10
                    : step === 'safety'
                    ? 20
                    : step === 'caselet'
                    ? 40
                    : step === 'roleplay'
                    ? 60
                    : step === 'feedback'
                    ? 80
                    : 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* Greeting */}
            {step === 'greeting' && (
              <motion.div
                key="greeting"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-4xl"
                >
                  👋
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900">{greeting}</h2>
                <p className="text-gray-600 max-w-md">
                  I'm your AI manager coach. Let's work through this scenario together.
                </p>
              </motion.div>
            )}

            {/* Safety Framing */}
            {step === 'safety' && (
              <motion.div
                key="safety"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    🛡️ Before We Start
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{safetyFraming}</p>
                </div>
                <button
                  onClick={() => setStep('caselet')}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Got it, let's practice
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* Caselet */}
            {step === 'caselet' && (
              <motion.div
                key="caselet"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    📋 Your Scenario
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{caselet}</p>
                </div>
                <button
                  onClick={() => {
                    setStep('roleplay');
                    // Add initial AI message
                    setTranscript([
                      {
                        role: 'ai',
                        content: `I'm playing the role of ${stakeholderRole}. Let's begin!`,
                      },
                    ]);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Start Role-Play
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* Role-Play */}
            {step === 'roleplay' && (
              <motion.div
                key="roleplay"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Transcript */}
                <div className="space-y-3 mb-4">
                  {transcript.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-xl ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {msg.role === 'ai' && (
                          <p className="text-xs font-semibold mb-1 opacity-70">
                            {stakeholderRole}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-4 rounded-xl flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                        <span className="text-sm text-gray-600">Your manager is thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chips */}
                {(chips.good.length > 0 || chips.risky.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-4 mb-4"
                  >
                    {chips.good.length > 0 && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <p className="text-xs font-semibold text-green-800 mb-2">✓ What's Good</p>
                        {chips.good.map((chip, idx) => (
                          <p key={idx} className="text-sm text-green-700">
                            {chip}
                          </p>
                        ))}
                      </div>
                    )}
                    {chips.risky.length > 0 && (
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <p className="text-xs font-semibold text-orange-800 mb-2">⚠ What's Risky</p>
                        {chips.risky.map((chip, idx) => (
                          <p key={idx} className="text-sm text-orange-700">
                            {chip}
                          </p>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Input */}
                {turnCount < expectedTurns && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleVoiceInput}
                      className={`p-3 rounded-xl transition-all ${
                        isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your response..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      disabled={loading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!userInput.trim() || loading}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Feedback */}
            {step === 'feedback' && feedback && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Score Card */}
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.6 }}
                    className={`inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br ${getScoreColor(
                      feedback.score
                    )} rounded-full text-white text-5xl font-bold mb-4 shadow-xl`}
                  >
                    {feedback.score}
                  </motion.div>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {getScoreEmoji(feedback.score)} {feedback.score >= 90 && 'Excellent!'}
                    {feedback.score >= 70 && feedback.score < 90 && 'Great work!'}
                    {feedback.score >= 50 && feedback.score < 70 && 'Good effort!'}
                    {feedback.score < 50 && 'Keep practicing!'}
                  </p>
                  <p className="text-gray-600 mb-4">{feedback.feedback}</p>

                  {/* XP Earned */}
                  {xpUpdate && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2"
                    >
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      <span className="font-semibold text-indigo-900">
                        +{feedback.xpEarned} XP earned!
                      </span>
                      {xpUpdate.leveledUp && (
                        <span className="text-sm text-indigo-600">
                          🎉 Level {xpUpdate.newLevel}!
                        </span>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Strengths */}
                {feedback.strengths && feedback.strengths.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-green-50 p-4 rounded-xl border border-green-200"
                  >
                    <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Here's where you excelled 💪
                    </h4>
                    {feedback.strengths.map((s: string, idx: number) => (
                      <p key={idx} className="text-sm text-green-800 mb-1">
                        • {s}
                      </p>
                    ))}
                  </motion.div>
                )}

                {/* Improvements */}
                {feedback.improvements && feedback.improvements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-orange-50 p-4 rounded-xl border border-orange-200"
                  >
                    <h4 className="font-bold text-orange-900 mb-2">One area to refine ✍️</h4>
                    {feedback.improvements.map((i: string, idx: number) => (
                      <p key={idx} className="text-sm text-orange-800 mb-1">
                        • {i}
                      </p>
                    ))}
                  </motion.div>
                )}

                {/* Exemplar */}
                {feedback.exemplarRewrite && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-purple-50 p-4 rounded-xl border border-purple-200"
                  >
                    <h4 className="font-bold text-purple-900 mb-2">✨ Ideal Version</h4>
                    <p className="text-sm text-purple-800 italic">{feedback.exemplarRewrite}</p>
                  </motion.div>
                )}

                {/* Micro-Habit */}
                {feedback.microHabit && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-blue-50 p-4 rounded-xl border border-blue-200"
                  >
                    <h4 className="font-bold text-blue-900 mb-2">🎯 Try This Next Time</h4>
                    <p className="text-sm text-blue-800">{feedback.microHabit}</p>
                  </motion.div>
                )}

                {/* Templates */}
                {feedback.templates && feedback.templates.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                  >
                    <h4 className="font-bold text-gray-900 mb-2">📋 Copy-Paste Templates</h4>
                    {feedback.templates.map((t: string, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white p-2 rounded mb-2 text-sm text-gray-700 font-mono"
                      >
                        {t}
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* New Badges */}
                {newBadges.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border-2 border-yellow-300"
                  >
                    <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      New Badge{newBadges.length > 1 ? 's' : ''} Earned!
                    </h4>
                    {newBadges.map((badge: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{badge.icon}</span>
                        <div>
                          <p className="font-semibold text-gray-900">{badge.badgeName}</p>
                          <p className="text-sm text-gray-600">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      onComplete(feedback);
                      onClose();
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all"
                  >
                    Practice Again
                  </button>
                </div>
              </motion.div>
            )}

            {/* Celebration */}
            {step === 'celebration' && (
              <motion.div
                key="celebration"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-6"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: 2,
                  }}
                  className="text-8xl"
                >
                  🎉
                </motion.div>
                <h2 className="text-4xl font-bold text-gray-900">Amazing Work!</h2>
                <p className="text-xl text-gray-600 max-w-md">
                  You're building real skills. Keep this momentum going!
                </p>
                <button
                  onClick={() => {
                    onComplete(feedback);
                    onClose();
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Continue
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
