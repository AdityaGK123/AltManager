import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coach, CoachType } from "@/types/coaches";
import { MessageCircle, Star } from "lucide-react";
import { getScreenReaderText, handleKeyboardActivation } from "@/utils/accessibility";

interface CoachCardProps {
  coach: Coach;
  onSelect: (coachId: CoachType) => void;
  isPrimary?: boolean;
  isCompact?: boolean;
}

export default function CoachCard({ coach, onSelect, isPrimary = false, isCompact = false }: CoachCardProps) {
  const screenReaderText = getScreenReaderText.coachCard(coach.name, coach.title, coach.specialties);

  const handleClick = () => {
    onSelect(coach.id);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    handleKeyboardActivation(event, handleClick);
  };

  return (
    <Card 
      className={`relative hover-elevate ${isCompact ? 'p-4' : 'p-6'} cursor-pointer focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none`} 
      onClick={handleClick}
      onKeyDown={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={screenReaderText}
      aria-describedby={`coach-description-${coach.id}`}
      data-testid={`card-coach-${coach.id}`}>
      {isPrimary && (
        <Badge variant="secondary" className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
          <Star className="w-3 h-3 mr-1" />
          Primary
        </Badge>
      )}
      
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 ${isCompact ? 'w-12 h-12' : 'w-16 h-16'} rounded-full overflow-hidden bg-gradient-to-br ${coach.color}`}>
          <img 
            src={coach.avatar} 
            alt={`Professional headshot of ${coach.name}, ${coach.title} specializing in ${coach.specialties[0]}`}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg" role="img" aria-label={`${coach.title} coach icon`} aria-hidden="true">{coach.icon}</span>
            <h3 className={`font-heading font-semibold ${isCompact ? 'text-base' : 'text-lg'} text-foreground`} id={`coach-name-${coach.id}`}>
              {coach.title} - {coach.name}
            </h3>
          </div>
          
          <p className={`text-muted-foreground mb-3 ${isCompact ? 'text-sm line-clamp-2' : 'text-sm'}`} id={`coach-description-${coach.id}`}>
            {coach.description}
          </p>
          
          {!isCompact && (
            <div className="flex flex-wrap gap-1 mb-4" role="list" aria-label="Coach specialties">
              {coach.specialties.slice(0, 3).map((specialty, index) => (
                <Badge key={index} variant="outline" className="text-xs" role="listitem">
                  {specialty}
                </Badge>
              ))}
              {coach.specialties.length > 3 && (
                <span className="text-xs text-muted-foreground" aria-label={`and ${coach.specialties.length - 3} more specialties`}>
                  +{coach.specialties.length - 3} more
                </span>
              )}
            </div>
          )}
          
          <Button 
            size="sm" 
            className="w-full"
            aria-label={`Start coaching conversation with ${coach.name}, ${coach.title}`}
            aria-describedby={`coach-name-${coach.id} coach-description-${coach.id}`}
            data-testid={`button-start-chat-${coach.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(coach.id);
            }}
          >
            <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
            Start Conversation
          </Button>
        </div>
      </div>
    </Card>
  );
}