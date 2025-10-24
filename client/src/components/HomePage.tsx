import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { coaches, CoachType, Coach } from "@/types/coaches";
import CoachCard from "./CoachCard";
import ProfileEdit from "./ProfileEdit";
import { 
  LogOut, 
  Settings, 
  Heart, 
  MessageCircle, 
  BarChart3, 
  Clock,
  Star,
  ChevronRight,
  Calendar
} from "lucide-react";
import hipoLogoFull from "@assets/Logo Transparency_1757867855928.png";

interface HomePageProps {
  user: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    currentRole?: string;
    industry?: string;
    customIndustry?: string;
    careerStage?: string;
    fiveYearGoal?: string;
    biggestChallenge?: string;
    workEnvironment?: string;
  };
  primaryCoaches: CoachType[];
  onSelectCoach: (coachId: CoachType) => void;
  onLogout: () => void;
  onUpdateProfile?: (profile: any) => void;
}

// Mock data - TODO: remove mock functionality
const mockRecentSessions = [
  {
    id: '1',
    coachName: coaches.leadership.name,
    coachType: 'leadership' as CoachType,
    lastMessage: 'Focus on building trust with your team first...',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    hearted: true,
  },
  {
    id: '2', 
    coachName: coaches.empathear.name,
    coachType: 'empathear' as CoachType,
    lastMessage: 'It sounds like you\'re feeling overwhelmed...',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    hearted: false,
  },
];

const mockStats = {
  totalSessions: 12,
  savedAdvice: 8,
  weeklyGoal: 2,
  currentStreak: 3,
};

export default function HomePage({ user, primaryCoaches, onSelectCoach, onLogout, onUpdateProfile }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<'coaches' | 'recent' | 'saved'>('coaches');
  
  const primaryCoachObjects = primaryCoaches.map(id => coaches[id]);
  const secondaryCoachObjects = Object.values(coaches).filter(coach => !primaryCoaches.includes(coach.id));

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={hipoLogoFull} 
                alt="HiPo AI Coach"
                className="h-8 w-auto"
              />
            </div>
            
            <div className="hidden md:flex items-center gap-2 ml-8">
              <Button 
                variant={activeTab === 'coaches' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('coaches')}
                data-testid="tab-coaches"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Coaches
              </Button>
              <Button 
                variant={activeTab === 'recent' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('recent')}
                data-testid="tab-recent"
              >
                <Clock className="w-4 h-4 mr-2" />
                Recent
              </Button>
              <Button 
                variant={activeTab === 'saved' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('saved')}
                data-testid="tab-saved"
              >
                <Heart className="w-4 h-4 mr-2" />
                Saved
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Avatar data-testid="avatar-user">
              <AvatarImage src={user.profileImageUrl} />
              <AvatarFallback>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-sm">
              <p className="font-medium text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-muted-foreground text-xs">{user.email}</p>
            </div>
            
            {onUpdateProfile && (
              <ProfileEdit
                user={{
                  firstName: user.firstName || "",
                  lastName: user.lastName || "",
                  email: user.email || "",
                  currentRole: user.currentRole || "",
                  industry: user.industry || "",
                  customIndustry: user.customIndustry || "",
                  careerStage: user.careerStage || "",
                  fiveYearGoal: user.fiveYearGoal || "",
                  biggestChallenge: user.biggestChallenge || "",
                  workEnvironment: user.workEnvironment || "",
                }}
                onSave={onUpdateProfile}
                trigger={
                  <Button variant="ghost" size="icon" data-testid="button-edit-profile">
                    <Settings className="w-4 h-4" />
                  </Button>
                }
              />
            )}
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready for your next coaching session? Your coaches are here to help you grow.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{mockStats.totalSessions}</p>
            <p className="text-sm text-muted-foreground">Total Sessions</p>
          </Card>
          <Card className="p-4 text-center">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{mockStats.savedAdvice}</p>
            <p className="text-sm text-muted-foreground">Saved Advice</p>
          </Card>
          <Card className="p-4 text-center">
            <BarChart3 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{mockStats.currentStreak}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </Card>
          <Card className="p-4 text-center">
            <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{mockStats.weeklyGoal}</p>
            <p className="text-sm text-muted-foreground">Weekly Goal</p>
          </Card>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden flex gap-2 mb-6 p-1 bg-muted rounded-lg">
          <Button 
            variant={activeTab === 'coaches' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('coaches')}
            className="flex-1"
          >
            Coaches
          </Button>
          <Button 
            variant={activeTab === 'recent' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('recent')}
            className="flex-1"
          >
            Recent
          </Button>
          <Button 
            variant={activeTab === 'saved' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('saved')}
            className="flex-1"
          >
            Saved
          </Button>
        </div>

        {/* Coaches Tab */}
        {activeTab === 'coaches' && (
          <div className="space-y-8">
            {/* Primary Coaches */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-heading font-bold text-foreground">
                  Your Primary Coaches
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {primaryCoachObjects.map(coach => (
                  <CoachCard
                    key={coach.id}
                    coach={coach}
                    onSelect={onSelectCoach}
                    isPrimary={true}
                  />
                ))}
              </div>
            </div>

            {/* Secondary Coaches */}
            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
                Other Available Coaches
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {secondaryCoachObjects.map(coach => (
                  <CoachCard
                    key={coach.id}
                    coach={coach}
                    onSelect={onSelectCoach}
                    isCompact={true}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Tab */}
        {activeTab === 'recent' && (
          <div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
              Recent Conversations
            </h2>
            <div className="space-y-4">
              {mockRecentSessions.map(session => (
                <Card key={session.id} className="p-4 hover-elevate cursor-pointer"
                      onClick={() => onSelectCoach(session.coachType)}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${coaches[session.coachType].color} flex-shrink-0`}>
                      <img 
                        src={coaches[session.coachType].avatar} 
                        alt={session.coachName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {coaches[session.coachType].title} - {session.coachName}
                        </h3>
                        {session.hearted && (
                          <Heart className="w-4 h-4 text-red-500 fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {session.lastMessage}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(session.timestamp)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && (
          <div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
              Saved Advice
            </h2>
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${coaches.leadership.color} flex-shrink-0`}>
                    <img 
                      src={coaches.leadership.avatar} 
                      alt={coaches.leadership.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">Leadership Coach</Badge>
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                    </div>
                    <p className="text-sm text-foreground mb-2">
                      "Focus on building trust with your team first. Trust is the foundation of all effective leadership. 
                      Start by being transparent about challenges and involving your team in problem-solving."
                    </p>
                    <p className="text-xs text-muted-foreground">Saved 2 hours ago</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}