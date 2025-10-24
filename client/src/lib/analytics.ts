// Business Validation Analytics for HiPo AI Coach
// Tracks key metrics for validating with 100 Indian professionals

interface UserProfile {
  userId?: string;
  industry?: string;
  careerStage?: string;
  role?: string;
  location?: string;
}

interface AnalyticsEvent {
  event: string;
  category: 'engagement' | 'conversion' | 'performance' | 'retention';
  properties?: Record<string, any>;
  timestamp?: number;
}

// Performance metrics for Indian mobile users (3G optimization)
interface PerformanceMetrics {
  loadTime: number;
  interactionDelay: number;
  networkType?: string;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
}

class BusinessAnalytics {
  private userId: string | null = null;
  private userProfile: UserProfile = {};
  private sessionStart: number = Date.now();

  // Initialize analytics with user context
  setUser(userId: string, profile: UserProfile) {
    this.userId = userId;
    this.userProfile = profile;
    
    // Track user profile for business validation
    this.track('user_identified', 'engagement', {
      userId,
      ...profile,
      sessionStart: this.sessionStart
    });
  }

  // Core tracking function
  track(event: string, category: AnalyticsEvent['category'], properties: Record<string, any> = {}) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      properties: {
        // Built-in fields first, then custom properties to avoid overwriting
        userId: this.userId,
        userProfile: this.userProfile,
        timestamp: Date.now(),
        sessionDuration: Date.now() - this.sessionStart,
        url: window.location.pathname,
        userAgent: navigator.userAgent,
        connectionType: (navigator as any).connection?.effectiveType || 'unknown',
        // Custom properties override built-ins if needed
        ...properties
      },
      timestamp: Date.now()
    };

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', analyticsEvent);
    }

    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', event, {
        event_category: category,
        ...properties
      });
    }

    // Store via service worker for background sync
    this.storeEvent(analyticsEvent);
  }

  // Business Validation: Onboarding funnel tracking
  trackOnboardingStep(step: string, stepData: Record<string, any> = {}) {
    this.track(`onboarding_${step}`, 'conversion', {
      onboardingStep: step,
      ...stepData
    });
  }

  // Business Validation: Coach interaction tracking
  trackCoachInteraction(coachType: string, action: string, context: Record<string, any> = {}) {
    this.track(`coach_${action}`, 'engagement', {
      coachType,
      action,
      ...context
    });
  }

  // Business Validation: Chat engagement depth
  trackChatEngagement(metrics: {
    messageCount: number;
    sessionDuration: number;
    coachType: string;
    satisfaction?: number;
  }) {
    this.track('chat_session_complete', 'engagement', {
      ...metrics,
      engagementScore: this.calculateEngagementScore(metrics)
    });
  }

  // Performance tracking for Indian mobile users
  trackPerformance(component: string, metrics: PerformanceMetrics) {
    this.track(`performance_${component}`, 'performance', {
      component,
      ...metrics,
      // Flag slow performance for Indian users (>3s is concerning for 3G)
      isSlowForTarget: metrics.loadTime > 3000
    });
  }

  // Business Validation: Retention tracking
  trackRetention(daysSinceSignup: number, action: string) {
    this.track(`retention_day_${daysSinceSignup}`, 'retention', {
      daysSinceSignup,
      action,
      retentionMilestone: this.getRetentionMilestone(daysSinceSignup)
    });
  }

  // Page view tracking with business context
  trackPageView(page: string, context: Record<string, any> = {}) {
    const loadTime = performance.now();
    
    this.track('page_view', 'engagement', {
      page,
      loadTime,
      ...context
    });

    // Track performance for critical pages
    if (['landing', 'onboarding', 'chat'].includes(page)) {
      this.trackPerformance(page, {
        loadTime,
        interactionDelay: 0, // Will be updated on first interaction
        deviceType: this.getDeviceType()
      });
    }
  }

  // Helper functions
  private calculateEngagementScore(metrics: { messageCount: number; sessionDuration: number }): number {
    // Simple engagement score: messages per minute * duration factor
    const messagesPerMinute = metrics.messageCount / (metrics.sessionDuration / 60000);
    const durationFactor = Math.min(metrics.sessionDuration / 300000, 1); // Cap at 5 minutes
    return Math.round(messagesPerMinute * durationFactor * 100) / 100;
  }

  private getRetentionMilestone(days: number): string {
    if (days === 1) return 'day_1_return';
    if (days === 7) return 'week_1_return';
    if (days === 30) return 'month_1_return';
    return 'long_term_user';
  }

  public getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|android/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  private storeEvent(event: AnalyticsEvent) {
    try {
      // Send to service worker for IndexedDB storage and background sync
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'ANALYTICS_EVENT',
          payload: event
        });
      } else {
        // Fallback to localStorage if service worker not available
        this.storeEventLocally(event);
      }
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
      // Fallback to localStorage
      this.storeEventLocally(event);
    }
  }

  private storeEventLocally(event: AnalyticsEvent) {
    try {
      const stored = localStorage.getItem('hipo_analytics_events');
      const events = stored ? JSON.parse(stored) : [];
      events.push(event);
      
      // Keep only last 50 events to prevent storage bloat (reduced from 100)
      if (events.length > 50) {
        events.splice(0, events.length - 50);
      }
      
      localStorage.setItem('hipo_analytics_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to store analytics event locally:', error);
    }
  }

  // Get stored events for batch sending
  getStoredEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem('hipo_analytics_events');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Clear stored events after successful sending
  clearStoredEvents() {
    try {
      localStorage.removeItem('hipo_analytics_events');
    } catch (error) {
      console.warn('Failed to clear stored analytics events:', error);
    }
  }

  // Trigger background sync for analytics
  syncOfflineEvents() {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_ANALYTICS'
        });
      }
    } catch (error) {
      console.warn('Failed to trigger analytics sync:', error);
    }
  }
}

// Global analytics instance
export const analytics = new BusinessAnalytics();

// Convenience hooks for React components
export const useAnalytics = () => {
  return {
    track: analytics.track.bind(analytics),
    trackOnboardingStep: analytics.trackOnboardingStep.bind(analytics),
    trackCoachInteraction: analytics.trackCoachInteraction.bind(analytics),
    trackChatEngagement: analytics.trackChatEngagement.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    setUser: analytics.setUser.bind(analytics)
  };
};

// Initialize performance observer for automatic performance tracking
if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
  const perfObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'navigation') {
        const navEntry = entry as PerformanceNavigationTiming;
        analytics.trackPerformance('page_load', {
          loadTime: navEntry.loadEventEnd - navEntry.fetchStart,
          interactionDelay: navEntry.domInteractive - navEntry.fetchStart,
          deviceType: analytics.getDeviceType()
        });
      }
    });
  });
  
  try {
    perfObserver.observe({ entryTypes: ['navigation'] });
  } catch (error) {
    console.warn('Performance observer not supported:', error);
  }
}

// Export types for use in components
export type { UserProfile, AnalyticsEvent, PerformanceMetrics };