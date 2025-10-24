import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { coaches, CoachType, getCoachRecommendations } from "@/types/coaches";
import { Star, ArrowRight, RotateCcw } from "lucide-react";

interface CoachRecommendationProps {
  userProfile: {
    firstName: string;
    lastName: string;
    biggestChallenge: string;
  };
  onContinue: (primaryCoaches: CoachType[]) => void;
  onModifyRecommendations: () => void;
}

export default function CoachRecommendation({ 
  userProfile, 
  onContinue, 
  onModifyRecommendations 
}: CoachRecommendationProps) {
  const recommendedCoaches = getCoachRecommendations(userProfile.biggestChallenge);
  const primaryCoaches = [recommendedCoaches[0], 'empathear' as CoachType]; // EmpathEAR is always primary
  const secondaryCoaches = Object.keys(coaches).filter(
    id => !primaryCoaches.includes(id as CoachType)
  ) as CoachType[];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">🎯</span>
        </div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
          Your Personalized Coaching Experience
        </h1>
        <p className="text-muted-foreground">
          Based on your profile and challenges, here are your recommended coaches
        </p>
      </div>

      <Card className="p-8 mb-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-heading font-bold text-foreground">
              YOUR PRIMARY COACHES
            </h2>
            <Badge variant="secondary">Featured on homepage</Badge>
          </div>
          <p className="text-muted-foreground mb-6">
            These coaches will be featured on your homepage for quick access based on your biggest challenge: <strong>{userProfile.biggestChallenge}</strong>
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {primaryCoaches.map(coachId => {
              const coach = coaches[coachId];
              const isRecommended = coachId !== 'empathear';
              
              return (
                <Card key={coachId} className={`p-6 ${isRecommended ? 'ring-2 ring-primary' : ''}`}>
                  {isRecommended && (
                    <Badge variant="default" className="mb-4">
                      Perfect match for your challenge
                    </Badge>
                  )}
                  {coachId === 'empathear' && (
                    <Badge variant="secondary" className="mb-4">
                      Always available for support
                    </Badge>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${coach.color} flex-shrink-0`}>
                      <img 
                        src={coach.avatar} 
                        alt={coach.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{coach.icon}</span>
                        <h3 className="text-xl font-heading font-semibold text-foreground">
                          {coach.title} - {coach.name}
                        </h3>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {coach.description}
                      </p>
                      {isRecommended && (
                        <p className="text-sm text-primary font-medium">
                          Why we recommend: Perfect match for your goal of {userProfile.biggestChallenge === 'leadership' ? 'leading teams' : 'career advancement'} and your current challenges
                        </p>
                      )}
                      {coachId === 'empathear' && (
                        <p className="text-sm text-muted-foreground">
                          Always available for: Stress management, emotional processing, and work-life balance support
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <RotateCcw className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-heading font-semibold text-foreground">
              YOUR SECONDARY COACHES
            </h2>
            <Badge variant="outline">Available when needed</Badge>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {secondaryCoaches.map(coachId => {
              const coach = coaches[coachId];
              return (
                <Card key={coachId} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${coach.color} flex-shrink-0`}>
                      <img 
                        src={coach.avatar} 
                        alt={coach.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">
                        {coach.title} - {coach.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {coach.specialties[0]}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            You can switch to any coach anytime, but we'll feature your primary coaches on your homepage for quick access.
          </p>
        </div>
      </Card>

      <div className="flex justify-center gap-4">
        <Button 
          variant="outline"
          onClick={onModifyRecommendations}
          data-testid="button-modify-recommendations"
        >
          Modify Recommendations
        </Button>
        <Button 
          onClick={() => onContinue(primaryCoaches)}
          size="lg"
          data-testid="button-continue-to-homepage"
        >
          Continue to Homepage
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}