/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 * Supports screen readers, keyboard navigation, and color contrast
 */

// Screen reader announcements
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Clean up after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Keyboard event handlers
export const handleKeyboardActivation = (
  event: React.KeyboardEvent,
  callback: () => void
) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback();
  }
};

// Focus management
export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleTabKey = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  element.addEventListener('keydown', handleTabKey);
  
  // Focus first element
  firstElement?.focus();
  
  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

// Color contrast checker (basic implementation)
export const checkColorContrast = (foreground: string, background: string): boolean => {
  // Convert colors to RGB and calculate contrast ratio
  // This is a simplified implementation - in production you'd use a proper color contrast library
  const getLuminance = (color: string): number => {
    // Simplified luminance calculation
    // In production, use a proper color library like chroma-js
    return 0.5; // Placeholder - always returns middle luminance
  };
  
  const fgLuminance = getLuminance(foreground);
  const bgLuminance = getLuminance(background);
  
  const contrastRatio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                       (Math.min(fgLuminance, bgLuminance) + 0.05);
  
  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  return contrastRatio >= 4.5;
};

// Skip link functionality
export const createSkipLink = (targetId: string, text: string = 'Skip to main content') => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-medium focus:decoration-none';
  skipLink.setAttribute('data-testid', 'skip-link');
  
  return skipLink;
};

// ARIA live region manager
class LiveRegionManager {
  private static instance: LiveRegionManager;
  private politeRegion: HTMLElement;
  private assertiveRegion: HTMLElement;
  
  private constructor() {
    this.politeRegion = this.createLiveRegion('polite');
    this.assertiveRegion = this.createLiveRegion('assertive');
  }
  
  public static getInstance(): LiveRegionManager {
    if (!LiveRegionManager.instance) {
      LiveRegionManager.instance = new LiveRegionManager();
    }
    return LiveRegionManager.instance;
  }
  
  private createLiveRegion(priority: 'polite' | 'assertive'): HTMLElement {
    const region = document.createElement('div');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    region.id = `live-region-${priority}`;
    document.body.appendChild(region);
    return region;
  }
  
  public announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const region = priority === 'polite' ? this.politeRegion : this.assertiveRegion;
    region.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      region.textContent = '';
    }, 500);
  }
}

export const liveRegionManager = LiveRegionManager.getInstance();

// Keyboard navigation helpers
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End'
} as const;

// Screen reader text utilities
export const getScreenReaderText = {
  coachCard: (name: string, title: string, expertise: string[]) => 
    `${name}, ${title}. Specializes in ${expertise.join(', ')}. Click to start coaching session.`,
  
  chatMessage: (sender: string, message: string, timestamp: string) =>
    `Message from ${sender} at ${timestamp}: ${message}`,
    
  navigationButton: (action: string, context?: string) =>
    `${action}${context ? ` ${context}` : ''}`,
    
  progressIndicator: (current: number, total: number, context: string) =>
    `Step ${current} of ${total} in ${context}`,
    
  errorMessage: (field: string, error: string) =>
    `Error in ${field}: ${error}`,
    
  successMessage: (action: string) =>
    `Success: ${action} completed`
};

// Focus visible utilities
export const addFocusVisibleSupport = () => {
  // Add focus-visible polyfill behavior
  let hadKeyboardEvent = true;
  let keyboardThrottleTimeout: NodeJS.Timeout;
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey || e.altKey || e.ctrlKey) return;
    hadKeyboardEvent = true;
  };
  
  const handlePointerDown = () => {
    hadKeyboardEvent = false;
  };
  
  const handleFocus = (e: FocusEvent) => {
    if (hadKeyboardEvent || (e.target as HTMLElement)?.matches?.(':focus-visible')) {
      (e.target as HTMLElement)?.classList?.add('focus-visible');
    }
  };
  
  const handleBlur = (e: FocusEvent) => {
    (e.target as HTMLElement)?.classList?.remove('focus-visible');
  };
  
  document.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('mousedown', handlePointerDown, true);
  document.addEventListener('pointerdown', handlePointerDown, true);
  document.addEventListener('touchstart', handlePointerDown, true);
  document.addEventListener('focus', handleFocus, true);
  document.addEventListener('blur', handleBlur, true);
};

// Initialize accessibility features
export const initializeAccessibility = () => {
  // Add skip links
  const mainContent = document.getElementById('main-content') || document.querySelector('main');
  if (mainContent && !mainContent.id) {
    mainContent.id = 'main-content';
  }
  
  if (mainContent && !document.querySelector('[data-testid="skip-link"]')) {
    const skipLink = createSkipLink('main-content');
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
  
  // Initialize live regions
  liveRegionManager;
  
  // Add focus visible support
  addFocusVisibleSupport();
  
  // Add reduced motion support
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--animation-duration', '0s');
    document.documentElement.classList.add('reduce-motion');
  }
};