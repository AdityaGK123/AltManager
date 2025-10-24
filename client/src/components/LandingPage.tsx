import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { coaches, CoachType } from "@/types/coaches";
import LegalFooter from "@/components/LegalFooter";
import { liveRegionManager } from "@/utils/accessibility";
import { 
  MessageCircle, 
  Heart, 
  BarChart3, 
  Users, 
  Clock,
  CheckCircle,
  Star,
  ArrowRight
} from "lucide-react";
import hipoLogoFull from "@assets/Logo Transparency_1757867855928.png";

interface LandingPageProps {
  onGetStarted: () => void;
  onTakeTour: () => void;
}

export default function LandingPage({ onGetStarted, onTakeTour }: LandingPageProps) {
  const handleGetStarted = () => {
    liveRegionManager.announce("Starting your coaching journey", "polite");
    onGetStarted();
  };

  const handleTakeTour = () => {
    liveRegionManager.announce("Starting interactive tour", "polite");
    onTakeTour();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-medium focus:no-underline"
        data-testid="skip-link"
      >
        Skip to main content
      </a>
      
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50" role="banner">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3" role="img" aria-label="HiPo AI Coach - First you aspire, then you soar">
            <img 
              src={hipoLogoFull} 
              alt="HiPo AI Coach logo"
              className="h-8 w-auto"
              aria-hidden="true"
            />
          </div>
          
          <nav role="navigation" aria-label="User account navigation">
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/api/login'}
              aria-label="Sign in to your HiPo AI Coach account"
              data-testid="button-sign-in"
            >
              Sign In
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main id="main-content" role="main">
        <section className="px-6 py-16" aria-labelledby="hero-heading">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6" role="img" aria-label="HiPo AI Coach: Pocket-friendly Personalised Coaching badge">
              <Star className="w-4 h-4 mr-1" aria-hidden="true" />
              HiPo AI Coach: Pocket-friendly Personalised Coaching
            </Badge>
            
            <h1 
              id="hero-heading"
              className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 leading-tight"
            >
              Professional coaching that{" "}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                understands your journey
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Get 6+ coaches in your pocket to advise you. Whether you're navigating workplace politics, 
              planning your next move, or balancing family expectations - get personalized coaching 
              support in 5 minutes.
            </p>
            
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
              role="group"
              aria-label="Main call to action buttons"
            >
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="text-lg px-8 py-3"
                aria-describedby="hero-heading"
                data-testid="button-start-journey"
              >
                Start Your Coaching Journey
                <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleTakeTour}
                className="text-lg px-8 py-3"
                aria-label="Take a quick interactive tour of HiPo AI Coach features"
                data-testid="button-take-tour"
              >
                Take a Quick Tour
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground" role="note">
              Join us on this journey to unlock your potential
            </p>
          </div>
        </section>

      {/* How It Works */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-heading font-bold text-center text-foreground mb-12">
            Your Coaching Experience in 3 Steps
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center hover-elevate">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">1</span>
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">Pick Your Coach</h3>
              <p className="text-muted-foreground">
                Choose based on your current challenge
              </p>
            </Card>
            
            <Card className="p-6 text-center hover-elevate">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">2</span>
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">5-Minute Conversation</h3>
              <div className="text-muted-foreground space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Ask questions, get insights</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>Save valuable advice</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 text-center hover-elevate">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">3</span>
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">Track Your Growth</h3>
              <div className="text-muted-foreground space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Review session summaries</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Deep analysis every 15 days</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Coach Lineup */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-heading font-bold text-center text-foreground mb-4">
            Meet Your 6 Personal Coaches
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            AI Coaching Suite + Your empathetic listening companion
          </p>
          
          {/* AI Coaching Suite */}
          <div className="mb-12">
            <h3 className="text-2xl font-heading font-semibold text-center mb-8 flex items-center justify-center gap-2">
              <span className="text-2xl">🎯</span>
              AI Coaching Suite (5 Coaches)
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {(Object.entries(coaches) as [CoachType, typeof coaches[CoachType]][])
                .filter(([key]) => key !== 'empathear')
                .map(([key, coach]) => (
                <Card key={key} className="p-6 hover-elevate">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${coach.color} flex-shrink-0`}>
                      <img 
                        src={coach.avatar} 
                        alt={coach.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-foreground">
                        {coach.title} – {coach.name}
                      </h4>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {coach.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
          
          {/* EmpathEAR Coach */}
          <div>
            <h3 className="text-2xl font-heading font-semibold text-center mb-8 flex items-center justify-center gap-2">
              <span className="text-2xl">💙</span>
              EmpathEAR Coach
            </h3>
            <Card className="p-8 max-w-2xl mx-auto hover-elevate bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/50 border-teal-200 dark:border-teal-800">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${coaches.empathear.color} mx-auto mb-4`}>
                  <img 
                    src={coaches.empathear.avatar} 
                    alt={coaches.empathear.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <h4 className="text-xl font-heading font-semibold mb-2 text-foreground">
                  EmpathEAR Coach – {coaches.empathear.name}
                </h4>
                <p className="text-muted-foreground mb-4">
                  {coaches.empathear.description}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {coaches.empathear.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-heading font-bold text-center text-foreground mb-12">
            Coaching That Gets You
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Understands Indian workplace dynamics",
              "Asks powerful questions (doesn't just give answers)",
              "Helps you think through problems yourself",
              "Available 24/7 in your pocket",
              "Completely confidential & secure",
              "Learns from your feedback to improve",
              "Reframes your thinking for breakthrough solutions",
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 id="cta-heading" className="text-3xl font-heading font-bold text-foreground mb-6">
            Ready to unlock your potential?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join professionals who are accelerating their careers with personalized AI coaching
          </p>
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="text-lg px-8 py-3"
            aria-describedby="cta-heading"
            data-testid="button-cta-start-journey"
          >
            Start Your Coaching Journey
            <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
          </Button>
        </div>
      </section>
      </main>

      {/* Legal Footer */}
      <LegalFooter />
    </div>
  );
}