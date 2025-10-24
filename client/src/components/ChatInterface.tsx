import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Coach } from "@/types/coaches";
import { Send, Heart, ArrowLeft } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isHearted?: boolean;
}

interface ChatInterfaceProps {
  coach: Coach;
  sessionId: string;
  onBack: () => void;
  onHeartMessage: (messageId: string) => void;
}

export default function ChatInterface({ coach, sessionId, onBack, onHeartMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Query to load existing session messages
  const { data: session, isLoading } = useQuery<any>({
    queryKey: ['/api/coaching-sessions', sessionId],
    enabled: !!sessionId,
  });
  
  // Initialize messages when session data is loaded
  useEffect(() => {
    if (session?.messages && Array.isArray(session.messages)) {
      setMessages(session.messages);
      
      // Update ref counts based on existing messages
      const userMsgs = session.messages.filter((msg: Message) => msg.isUser);
      const aiMsgs = session.messages.filter((msg: Message) => !msg.isUser);
      const hearted = session.messages.filter((msg: Message) => msg.isHearted);
      
      userMessageCountRef.current = userMsgs.length;
      aiMessageCountRef.current = aiMsgs.length;
      heartedCountRef.current = hearted.length;
    } else if (!isLoading) {
      // If no existing messages, show welcome message
      const welcomeMessage = {
        id: 'welcome_1',
        content: `Hello! I'm ${coach.name}, your ${coach.title.toLowerCase()}. I'm here to help you with ${coach.specialties[0].toLowerCase()} and more. What's on your mind today?`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      aiMessageCountRef.current = 1;
    }
  }, [session, isLoading, coach.name, coach.title, coach.specialties]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [sessionStart] = useState(Date.now());
  const [messageCount, setMessageCount] = useState(0);
  
  // Use refs to track live counts for accurate session completion metrics
  const userMessageCountRef = useRef(0);
  const aiMessageCountRef = useRef(1); // Seeded with initial AI greeting
  const heartedCountRef = useRef(0);
  const hasTrackedRef = useRef(false);

  // Track chat session completion on component unmount only
  useEffect(() => {
    return () => {
      // Prevent duplicate emissions
      if (hasTrackedRef.current) return;
      hasTrackedRef.current = true;
      
      // Business Validation: Track chat session completion metrics (using live refs)
      const sessionDuration = Date.now() - sessionStart;
      
      const messageCountTotal = userMessageCountRef.current + aiMessageCountRef.current;
      const satisfactionAI = aiMessageCountRef.current > 0 ? heartedCountRef.current / aiMessageCountRef.current : 0;
      
      analytics.trackChatEngagement({
        messageCount: messageCountTotal,
        sessionDuration,
        coachType: coach.id,
        satisfaction: satisfactionAI
      });
    };
  }, []); // Empty deps - cleanup only runs on unmount

  useEffect(() => {
    // Track chat session start
    analytics.trackCoachInteraction(coach.id, 'chat_started', {
      coachName: coach.name,
      coachSpecialties: coach.specialties
    });
  }, [coach.id, coach.name, coach.specialties]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Mutation for sending messages to the AI coach
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', `/api/coaching-sessions/${sessionId}/chat`, { message });
      return await response.json();
    },
    onSuccess: (data: any) => {
      // Add both user and AI messages to the chat
      if (data.userMessage && data.coachMessage) {
        setMessages(prev => [...prev, data.userMessage, data.coachMessage]);
        setIsTyping(false);
        
        // Update AI message count for accurate satisfaction tracking
        aiMessageCountRef.current += 1;
      }
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      setIsTyping(false);
      
      // Add error message
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content: "I'm sorry, I'm having trouble processing your message right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const sendMessage = async () => {
    if (!inputValue.trim() || sendMessageMutation.isPending) return;

    const messageText = inputValue.trim();
    setInputValue('');
    setMessageCount(prev => prev + 1);
    
    // Update live ref for accurate session tracking
    userMessageCountRef.current += 1;
    
    // Business Validation: Track user message engagement
    analytics.trackCoachInteraction(coach.id, 'message_sent', {
      messageLength: messageText.length,
      messageCount: userMessageCountRef.current,
      sessionDuration: Date.now() - sessionStart
    });
    
    setIsTyping(true);
    sendMessageMutation.mutate(messageText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleHeart = (messageId: string) => {
    setMessages(prev => {
      const newMessages = prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isHearted: !msg.isHearted }
          : msg
      );
      
      // Business Validation: Track heart interactions for message usefulness
      const message = newMessages.find(msg => msg.id === messageId);
      if (message) {
        // Update live ref for accurate session tracking
        if (message.isHearted) {
          heartedCountRef.current += 1;
        } else {
          heartedCountRef.current = Math.max(0, heartedCountRef.current - 1);
        }
        
        analytics.trackCoachInteraction(coach.id, message.isHearted ? 'message_hearted' : 'message_unhearted', {
          messageId,
          messageLength: message.content.length, // Length only - no content for privacy
          isUserMessage: message.isUser,
          sessionDuration: Date.now() - sessionStart
        });
      }
      
      return newMessages;
    });
    onHeartMessage(messageId);
  };


  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b bg-card">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          data-testid="button-back-to-coaches"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${coach.color} flex-shrink-0`}>
          <img 
            src={coach.avatar} 
            alt={coach.name}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="font-heading font-semibold text-lg text-foreground">
            {coach.name}
          </h2>
          <p className="text-sm text-muted-foreground">{coach.title}</p>
        </div>
        
        <Badge variant="outline" className="text-xs">
          5 min session
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!message.isUser && (
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${coach.color} flex-shrink-0`}>
                  <img 
                    src={coach.avatar} 
                    alt={coach.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              )}
              
              <div className={`max-w-md ${message.isUser ? 'order-first' : ''}`}>
                <Card className={`p-3 ${
                  message.isUser 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-card text-card-foreground'
                }`}>
                  <p className="text-sm leading-relaxed">
                    {message.content}
                  </p>
                </Card>
                
                {!message.isUser && (
                  <div className="flex items-center gap-2 mt-2 ml-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 text-xs ${message.isHearted ? 'text-red-500' : 'text-muted-foreground'}`}
                      onClick={() => toggleHeart(message.id)}
                      data-testid={`button-heart-${message.id}`}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${message.isHearted ? 'fill-current' : ''}`} />
                      {message.isHearted ? 'Saved' : 'Save'}
                    </Button>
                    
                  </div>
                )}
                
                <span className="text-xs text-muted-foreground ml-1 mt-1 block">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${coach.color} flex-shrink-0`}>
                <img 
                  src={coach.avatar} 
                  alt={coach.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <Card className="p-3 bg-card">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask ${coach.name} anything about ${coach.specialties[0].toLowerCase()}...`}
            className="flex-1 min-h-[44px] max-h-32 resize-none"
            data-testid="textarea-message-input"
          />
          <Button 
            onClick={sendMessage}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}