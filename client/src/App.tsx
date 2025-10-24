import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";
import ServerError from "@/pages/server-error";
import ContactSupport from "@/pages/contact-support";
import NotificationsSettings from "@/pages/notifications-settings";

// Import legal pages
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import CookiePolicy from "@/pages/cookie-policy";

// Import main app components - Landing page immediately, others lazy loaded
import LandingPage from "@/components/LandingPage";
import { Suspense, lazy } from "react";

// Lazy load heavy components for mobile performance (3G optimization)
import OnboardingFlow from "@/components/OnboardingFlow";
const CoachRecommendation = lazy(() => import("@/components/CoachRecommendation"));
const HomePage = lazy(() => import("@/components/HomePage"));
const ChatInterface = lazy(() => import("@/components/ChatInterface"));
const QuickTour = lazy(() => import("@/components/QuickTour"));

// Import types
import { coaches, CoachType } from "@/types/coaches";
import { useState, useEffect } from "react";
import { initializeAccessibility } from "@/utils/accessibility";
import { analytics } from "@/lib/analytics";

// Loading component for lazy-loaded components (optimized for mobile)
const LazyLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
      <p className="text-sm text-muted-foreground">Loading your experience...</p>
    </div>
  </div>
);

// Mock user data - TODO: replace with real auth
const mockUser = {
  id: '1',
  email: 'demo@example.com',
  firstName: 'Demo',
  lastName: 'User',
  profileImageUrl: undefined,
};

type AppState = 'landing' | 'onboarding' | 'recommendations' | 'home' | 'chat';

interface OnboardingData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  currentRole: string;
  industry: string;
  careerStage: string;
  fiveYearGoal: string;
  biggestChallenge: string;
  workEnvironment: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

// Main App Component - Handles state-based navigation for authenticated user flow
function MainApp() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [primaryCoaches, setPrimaryCoaches] = useState<CoachType[]>(['leadership', 'empathear']);
  const [selectedCoach, setSelectedCoach] = useState<CoachType | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);

  // Mutation to create a new coaching session
  const createSessionMutation = useMutation({
    mutationFn: async (coachType: CoachType) => {
      const response = await apiRequest('POST', '/api/coaching-sessions', {
        coachType,
        messages: []
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      setCurrentSessionId(data.id);
      setAppState('chat');
    },
    onError: (error) => {
      console.error('Failed to create coaching session:', error);
      // Show error to user or handle gracefully
    }
  });

  // Initialize accessibility features and analytics
  useEffect(() => {
    initializeAccessibility();
    // Track app initialization for business validation
    analytics.trackPageView('app_start', { 
      appState: 'landing',
      deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
    });
  }, []);

  const handleGetStarted = () => {
    // Business Validation: Track conversion from landing to onboarding
    analytics.track('conversion_get_started', 'conversion', {
      source: 'landing_page',
      buttonType: 'primary_cta'
    });
    setAppState('onboarding');
  };

  // Mutation for user sign-up during onboarding
  const signUpMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      const response = await apiRequest('POST', '/api/auth/signup', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        termsAccepted: data.termsAccepted,
        privacyAccepted: data.privacyAccepted,
      });
      return { signUpResponse: await response.json(), onboardingData: data };
    },
    onSuccess: async (data: { signUpResponse: any; onboardingData: OnboardingData }) => {
      // After successful signup, sign in to establish session
      try {
        const signInResponse = await apiRequest('POST', '/api/auth/signin', {
          email: data.onboardingData.email,
          password: data.onboardingData.password,
          rememberMe: false,
        });
        
        if (signInResponse.ok) {
          // Save profile data after successful authentication
          const profileData = {
            currentRole: data.onboardingData.currentRole,
            industry: data.onboardingData.industry,
            careerStage: data.onboardingData.careerStage,
            fiveYearGoal: data.onboardingData.fiveYearGoal,
            biggestChallenge: data.onboardingData.biggestChallenge,
            workEnvironment: data.onboardingData.workEnvironment,
            // primaryCoaches will be set later from coach recommendations
          };
          
          const profileResponse = await apiRequest('PUT', '/api/user/profile', profileData);
          
          if (profileResponse.ok) {
            // Business Validation: Track successful onboarding completion 
            analytics.setUser(data.signUpResponse.userId, {
              industry: data.onboardingData.industry,
              careerStage: data.onboardingData.careerStage,
              role: data.onboardingData.currentRole,
              location: 'India' // Target market
            });
            analytics.trackOnboardingStep('completed', data.onboardingData);
            
            setOnboardingData(data.onboardingData);
            setAppState('recommendations');
          } else {
            console.error('Failed to save profile data');
            // TODO: Show error to user
          }
        } else {
          console.error('Sign in failed after signup');
          // TODO: Show error to user
        }
      } catch (error) {
        console.error('Error during post-signup flow:', error);
        // TODO: Show error to user
      }
    },
    onError: (error: any) => {
      console.error('Sign up failed:', error);
      // TODO: Show error to user
    }
  });

  const handleOnboardingComplete = (data: OnboardingData) => {
    signUpMutation.mutate(data);
  };

  // Mutation to save primary coaches after recommendation selection
  const savePrimaryCoachesMutation = useMutation({
    mutationFn: async (coaches: CoachType[]) => {
      const response = await apiRequest('PUT', '/api/user/profile', {
        primaryCoaches: coaches,
      });
      return { coaches, response: await response.json() };
    },
    onSuccess: (data: { coaches: CoachType[]; response: any }) => {
      setPrimaryCoaches(data.coaches);
      setAppState('home');
    },
    onError: (error: any) => {
      console.error('Failed to save primary coaches:', error);
      // TODO: Show error to user but still proceed to home
      setPrimaryCoaches([]);
      setAppState('home');
    }
  });

  const handleRecommendationsComplete = (coaches: CoachType[]) => {
    savePrimaryCoachesMutation.mutate(coaches);
  };

  const handleSelectCoach = (coachId: CoachType) => {
    // Business Validation: Track coach selection for engagement analysis
    analytics.trackCoachInteraction(coachId, 'selected', {
      fromPage: 'home',
      coachName: coaches[coachId].name,
      coachType: coachId
    });
    
    setSelectedCoach(coachId);
    // Create a new coaching session for this coach
    createSessionMutation.mutate(coachId);
  };

  const handleBackToHome = () => {
    setSelectedCoach(null);
    setCurrentSessionId(null);
    setAppState('home');
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/signout';
  };

  if (showTour) {
    return (
      <Suspense fallback={<LazyLoadingFallback />}>
        <QuickTour 
          onClose={() => setShowTour(false)}
          onGetStarted={handleGetStarted}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen">
      {appState === 'landing' && (
        <LandingPage
          onGetStarted={handleGetStarted}
          onTakeTour={() => setShowTour(true)}
        />
      )}

      {appState === 'onboarding' && (
        <OnboardingFlow 
          onComplete={handleOnboardingComplete} 
          defaultData={onboardingData}
        />
      )}

      {appState === 'recommendations' && onboardingData && (
        <Suspense fallback={<LazyLoadingFallback />}>
          <CoachRecommendation
            userProfile={{
              firstName: onboardingData.firstName,
              lastName: onboardingData.lastName,
              biggestChallenge: onboardingData.biggestChallenge,
            }}
            onContinue={handleRecommendationsComplete}
            onModifyRecommendations={() => setAppState('onboarding')}
          />
        </Suspense>
      )}

      {appState === 'home' && (
        <Suspense fallback={<LazyLoadingFallback />}>
          <HomePage
            user={mockUser}
            primaryCoaches={primaryCoaches}
            onSelectCoach={handleSelectCoach}
            onLogout={handleLogout}
          />
        </Suspense>
      )}

      {appState === 'chat' && selectedCoach && (
        <Suspense fallback={<LazyLoadingFallback />}>
          {currentSessionId ? (
            <ChatInterface
              coach={coaches[selectedCoach]}
              sessionId={currentSessionId}
              onBack={handleBackToHome}
              onHeartMessage={(messageId) => console.log(`Hearted message: ${messageId}`)}
            />
          ) : (
            <LazyLoadingFallback />
          )}
        </Suspense>
      )}
    </div>
  );
}

// App Component - Handles URL-based routing
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Switch>
            {/* Legal pages - URL-based routing */}
            <Route path="/privacy-policy" component={PrivacyPolicy} />
            <Route path="/terms-of-service" component={TermsOfService} />
            <Route path="/cookie-policy" component={CookiePolicy} />
            <Route path="/server-error" component={ServerError} />
            <Route path="/contact-support" component={ContactSupport} />
            <Route path="/settings/notifications" component={NotificationsSettings} />
            
            {/* Main app - state-based navigation */}
            <Route path="/" component={MainApp} />
            
            {/* 404 page */}
            <Route component={NotFound} />
          </Switch>
        </ErrorBoundary>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;