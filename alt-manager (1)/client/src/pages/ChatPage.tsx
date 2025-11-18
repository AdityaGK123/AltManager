import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Mic, MicOff, Plus, Loader2, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import { autoGenerateAnalytics } from '@/lib/analytics-trigger';
import { useToast, ToastContainer } from '@/components/Toast';

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEndingChat, setIsEndingChat] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-IN';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Fetch conversations
  const { data: conversationsData } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await chatAPI.getConversations();
      return response.data.conversations;
    },
  });

  // Fetch messages for current conversation
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      const response = await chatAPI.getMessages(parseInt(conversationId));
      return response.data.messages;
    },
    enabled: !!conversationId,
  });

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: chatAPI.createConversation,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      navigate(`/chat/${response.data.conversation.id}`);
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId) throw new Error('No conversation selected');
      return chatAPI.sendMessage(parseInt(conversationId), { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessage('');
      setErrorMessage(null);
    },
    onError: (error: any) => {
      console.error('Send message error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to send message. Please try again.';
      setErrorMessage(errorMsg);
      
      // Auto-dismiss error after 5 seconds
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    },
  });

  // End conversation mutation
  const endConversationMutation = useMutation({
    mutationFn: async () => {
      if (!conversationId) throw new Error('No conversation selected');
      return chatAPI.endConversation(parseInt(conversationId));
    },
    onSuccess: async (response) => {
      console.log('Conversation ended, MoM generated:', response.data.mom);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['moms'] });
      
      // Auto-generate analytics in background (non-blocking)
      // This runs asynchronously and won't block navigation
      toast.info('Generating analytics insights...', 3000);
      
      autoGenerateAnalytics()
        .then(() => {
          console.log('[Chat] Analytics auto-generation completed');
          toast.success('Analytics insights generated successfully!', 4000);
          // Invalidate analytics queries to refresh the data
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          queryClient.invalidateQueries({ queryKey: ['trends'] });
          queryClient.invalidateQueries({ queryKey: ['blindspots'] });
          queryClient.invalidateQueries({ queryKey: ['progress'] });
        })
        .catch((error) => {
          console.error('[Chat] Analytics auto-generation failed:', error);
          toast.warning('Trends analysis temporarily unavailable. You can generate it manually from the Analytics page.', 6000);
        });
      
      // Navigate to Analytics page to view the MoM
      navigate('/analytics');
    },
    onError: (error: any) => {
      console.error('End conversation error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to end conversation. Please try again.';
      setErrorMessage(errorMsg);
      setIsEndingChat(false);
      
      // Show toast notification for better visibility
      toast.error(errorMsg, 8000);
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  const handleSend = () => {
    if (!message.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(message);
  };

  const handleEndChat = () => {
    if (!conversationId) return;
    if (confirm('End this conversation and generate Minutes of Meeting?\n\nYou\'ll be redirected to Analytics to view the summary.')) {
      setIsEndingChat(true);
      endConversationMutation.mutate();
    }
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleNewChat = () => {
    createConversationMutation.mutate({ title: 'New Conversation' });
  };

  // If no conversation selected, show conversation list or create first one
  if (!conversationId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Chat with Your Manager</h1>
          <p className="text-slate-600">Get guidance, advice, and support anytime</p>
        </div>

        <div className="card">
          {conversationsData && conversationsData.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-900">Recent Conversations</h2>
                <button onClick={handleNewChat} className="btn-primary flex items-center space-x-2">
                  <Plus size={18} />
                  <span>New Chat</span>
                </button>
              </div>
              {conversationsData.slice(0, 5).map((conv: any) => (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/chat/${conv.id}`)}
                  className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-left transition-colors"
                >
                  <div className="font-semibold text-slate-900">{conv.title}</div>
                  <div className="text-sm text-slate-500 mt-1">
                    {formatRelativeTime(conv.updatedAt)}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Start Your First Conversation</h3>
              <p className="text-slate-600 mb-6">
                Your AI manager is ready to help you navigate your career
              </p>
              <button onClick={handleNewChat} className="btn-primary flex items-center space-x-2 mx-auto">
                <Plus size={18} />
                <span>Start Chatting</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      <div className="min-h-full flex flex-col w-full">
        <div className="max-w-4xl mx-auto w-full min-h-full flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-bold text-slate-900">Your AI Manager</h2>
            <p className="text-sm text-slate-500">Always here to help</p>
          </div>
          <div className="flex items-center space-x-2">
            {conversationId && messagesData && messagesData.length >= 2 && (
              <button 
                onClick={handleEndChat} 
                disabled={isEndingChat || endConversationMutation.isPending}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                title="End conversation and generate Minutes of Meeting"
              >
                {isEndingChat || endConversationMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span className="hidden sm:inline">Ending...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span className="hidden sm:inline">End Chat & Generate MoM</span>
                  </>
                )}
              </button>
            )}
            <button onClick={handleNewChat} className="btn-secondary flex items-center space-x-2">
              <Plus size={18} />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messagesLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
          ) : messagesData && messagesData.length > 0 ? (
            messagesData.map((msg: any) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      msg.role === 'user' ? 'text-white/70' : 'text-slate-400'
                    }`}
                  >
                    {formatRelativeTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center mb-4">
                <Send className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Start the conversation</h3>
              <p className="text-slate-600">Ask me anything about your career, goals, or challenges</p>
            </div>
          )}
          {sendMessageMutation.isPending && (
            <div className="flex justify-start animate-slide-up">
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          {errorMessage && (
            <div className="flex justify-center animate-slide-up">
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 max-w-[80%]">
                <p className="text-red-800 font-semibold mb-1">⚠️ Error</p>
                <p className="text-red-700 text-sm">{errorMessage}</p>
                <button 
                  onClick={() => setErrorMessage(null)}
                  className="text-red-600 text-xs mt-2 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 px-4 py-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleVoiceInput}
              className={`p-3 rounded-xl transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 input-field"
              disabled={sendMessageMutation.isPending}
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default ChatPage;
