import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, X, Users, MessageCircle, Settings, Heart, BarChart, Sparkles } from 'lucide-react';

interface QuickTourProps {
  onClose: () => void;
  onGetStarted: () => void;
}

const tourSteps = [
  {
    id: 1,
    title: "Welcome to HiPo AI Coach",
    icon: Sparkles,
    content: "Your personal career coaching platform designed specifically for Indian professionals. Get expert guidance whenever you need it.",
    highlights: [
      "6 specialized AI coaches",
      "5-minute focused conversations", 
      "Available 24/7 in your pocket"
    ]
  },
  {
    id: 2,
    title: "Meet Your AI Coaches",
    icon: Users,
    content: "Choose from 6 expert coaches, each specializing in different aspects of your professional journey.",
    highlights: [
      "Leadership & Management coaching",
      "Career growth & strategy guidance", 
      "Work-life balance support",
      "Communication & conflict resolution",
      "EmpathEAR - your 3 AM friend",
      "Performance optimization & productivity"
    ]
  },
  {
    id: 3,
    title: "Smart Conversations",
    icon: MessageCircle,
    content: "Have focused 5-minute conversations that provide actionable insights and practical advice.",
    highlights: [
      "Context-aware responses",
      "Industry-specific guidance",
      "Cultural sensitivity built-in",
      "Follow-up questions and clarifications"
    ]
  },
  {
    id: 4,
    title: "Save & Organize",
    icon: Heart,
    content: "Keep track of valuable advice and insights with our built-in saving system.",
    highlights: [
      "Heart conversations you find valuable",
      "Access saved advice anytime",
      "Build your personal coaching library",
      "Share insights with your team (optional)"
    ]
  },
  {
    id: 5,
    title: "Personalized Experience",
    icon: Settings,
    content: "Your profile and preferences help our AI coaches provide more relevant and targeted advice.",
    highlights: [
      "Industry-specific recommendations",
      "Career stage appropriate guidance",
      "Cultural context awareness",
      "Personalized coaching styles"
    ]
  },
  {
    id: 6,
    title: "Track Your Growth",
    icon: BarChart,
    content: "Monitor your professional development journey with insights and progress tracking.",
    highlights: [
      "Conversation history & themes",
      "Progress insights every 15 days",
      "Goal achievement tracking",
      "Coaching effectiveness metrics"
    ]
  },
  {
    id: 7,
    title: "Ready to Begin?",
    icon: Sparkles,
    content: "Start your coaching journey today. Complete a quick onboarding to get matched with the right coaches for your needs.",
    highlights: [
      "2-minute onboarding process",
      "Immediate access to all coaches",
      "Start with any conversation topic",
      "Get instant, actionable advice"
    ]
  }
];

export default function QuickTour({ onClose, onGetStarted }: QuickTourProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  const step = tourSteps.find(s => s.id === currentStep)!;
  const isFirst = currentStep === 1;
  const isLast = currentStep === tourSteps.length;
  const progress = (currentStep / tourSteps.length) * 100;

  const handleNext = () => {
    if (isLast) {
      onClose(); // Close the tour first
      onGetStarted(); // Then start onboarding
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="relative">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="text-xs">
              Step {currentStep} of {tourSteps.length}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSkip}
              data-testid="button-close-tour"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <Progress value={progress} className="mb-4" />
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <StepIcon className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-heading">{step.title}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            {step.content}
          </p>

          <div className="space-y-2">
            {step.highlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-sm text-foreground">{highlight}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={handlePrev}
              disabled={isFirst}
              data-testid="button-tour-prev"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                onClick={handleSkip}
                data-testid="button-skip-tour"
              >
                Skip Tour
              </Button>
              <Button 
                onClick={handleNext}
                data-testid="button-tour-next"
              >
                {isLast ? 'Get Started' : 'Next'}
                {!isLast && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}