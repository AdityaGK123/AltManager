import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface MomentRunnerProps {
  momentId: string;
  onComplete: (debrief: any) => void;
  onClose: () => void;
}

type Step = 'safety' | 'caselet' | 'roleplay' | 'debrief' | 'apply';

export default function MomentRunner({ momentId, onComplete, onClose }: MomentRunnerProps) {
  const [step, setStep] = useState<Step>('safety');
  const [sessionId, setSessionId] = useState<string>('');
  const [safetyFraming, setSafetyFraming] = useState('');
  const [caselet, setCaselet] = useState('');
  const [expectedTurns, setExpectedTurns] = useState(3);
  const [turnCount, setTurnCount] = useState(0);
  const [transcript, setTranscript] = useState<Array<{ role: string; content: string }>>([]);
  const [userInput, setUserInput] = useState('');
  const [chips, setChips] = useState<{ good: string[]; risky: string[] }>({ good: [], risky: [] });
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [debrief, setDebrief] = useState<any>(null);
  const token = useAuthStore((state) => state.token);
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
      setSafetyFraming(response.data.safetyFraming);
      setCaselet(response.data.caselet);
      setExpectedTurns(response.data.expectedTurns);
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
    setTranscript(prev => [...prev, { role: 'user', content }]);

    try {
      const response = await axios.post(
        `${API_URL}/api/moments/${momentId}/response`,
        { sessionId, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add AI response
      setTranscript(prev => [...prev, { role: 'ai', content: response.data.reply }]);
      setChips(response.data.chips);
      setTurnCount(response.data.turnCount);

      // Check if complete
      if (response.data.isComplete) {
        console.log('[MomentRunner] Conversation complete, generating debrief...');
        setTimeout(() => generateDebrief(), 1000);
      } else {
        console.log(`[MomentRunner] Turn ${response.data.turnCount}/${response.data.expectedTurns || expectedTurns}`);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDebrief = async () => {
    try {
      setLoading(true);
      setStep('debrief');

      const response = await axios.post(
        `${API_URL}/api/moments/${momentId}/debrief`,
        { sessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDebrief(response.data.debrief);
    } catch (error) {
      console.error('Failed to generate debrief:', error);
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Progress Bar */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
          <div className="flex items-center justify-between text-white mb-2">
            <span className="text-sm font-semibold">
              {step === 'safety' && 'Step 1: Psychological Safety'}
              {step === 'caselet' && 'Step 2: Scenario'}
              {step === 'roleplay' && `Step 3: Role-Play (Turn ${turnCount}/${expectedTurns})`}
              {step === 'debrief' && 'Step 4: Debrief'}
              {step === 'apply' && 'Step 5: Apply'}
            </span>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              ✕
            </button>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  step === 'safety' ? 20 :
                  step === 'caselet' ? 40 :
                  step === 'roleplay' ? 60 :
                  step === 'debrief' ? 80 : 100
                }%`
              }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Safety Framing */}
            {step === 'safety' && (
              <motion.div
                key="safety"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    🛡️ Before We Start
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {safetyFraming || 'Loading...'}
                  </p>
                </div>
                <button
                  onClick={() => setStep('caselet')}
                  disabled={!safetyFraming}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Got it, let's practice
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* Step 2: Caselet */}
            {step === 'caselet' && (
              <motion.div
                key="caselet"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    📋 Your Scenario
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {caselet}
                  </p>
                </div>
                <button
                  onClick={() => setStep('roleplay')}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Start Role-Play
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* Step 3: Role-Play */}
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
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-xl ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-4 rounded-xl">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chips */}
                {(chips.good.length > 0 || chips.risky.length > 0) && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {chips.good.length > 0 && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <p className="text-xs font-semibold text-green-800 mb-2">✓ What's Good</p>
                        {chips.good.map((chip, idx) => (
                          <p key={idx} className="text-sm text-green-700">{chip}</p>
                        ))}
                      </div>
                    )}
                    {chips.risky.length > 0 && (
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <p className="text-xs font-semibold text-orange-800 mb-2">⚠ What's Risky</p>
                        {chips.risky.map((chip, idx) => (
                          <p key={idx} className="text-sm text-orange-700">{chip}</p>
                        ))}
                      </div>
                    )}
                  </div>
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

            {/* Step 4: Debrief */}
            {step === 'debrief' && debrief && (
              <motion.div
                key="debrief"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Score */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full text-white text-4xl font-bold mb-4">
                    {debrief.score}/4
                  </div>
                  <p className="text-gray-600">
                    {debrief.score === 4 && 'Excellent! 🎉'}
                    {debrief.score === 3 && 'Good work! 👍'}
                    {debrief.score === 2 && 'Basic - room to grow 📈'}
                    {debrief.score === 1 && 'Needs work 💪'}
                    {debrief.score === 0 && 'Practice more 🔄'}
                  </p>
                </div>

                {/* Strengths */}
                {debrief.strengths && debrief.strengths.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <h4 className="font-bold text-green-900 mb-2">✓ What's Good</h4>
                    {debrief.strengths.map((s: string, idx: number) => (
                      <p key={idx} className="text-sm text-green-800">{s}</p>
                    ))}
                  </div>
                )}

                {/* Improvements */}
                {debrief.improvements && debrief.improvements.length > 0 && (
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <h4 className="font-bold text-orange-900 mb-2">⚠ What's Risky</h4>
                    {debrief.improvements.map((i: string, idx: number) => (
                      <p key={idx} className="text-sm text-orange-800 mb-1">{i}</p>
                    ))}
                  </div>
                )}

                {/* Exemplar */}
                {debrief.exemplarRewrite && (
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <h4 className="font-bold text-purple-900 mb-2">✨ Ideal Version</h4>
                    <p className="text-sm text-purple-800 italic">{debrief.exemplarRewrite}</p>
                  </div>
                )}

                {/* Micro-Habit */}
                {debrief.microHabit && (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-2">🎯 Micro-Habit</h4>
                    <p className="text-sm text-blue-800">{debrief.microHabit}</p>
                  </div>
                )}

                {/* Templates */}
                {debrief.templates && debrief.templates.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-2">📋 Copy-Paste Templates</h4>
                    {debrief.templates.map((t: string, idx: number) => (
                      <div key={idx} className="bg-white p-2 rounded mb-2 text-sm text-gray-700 font-mono">
                        {t}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      onComplete(debrief);
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
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
