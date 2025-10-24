import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Bell, Mail, Calendar, MessageSquare } from "lucide-react";

interface NotificationPreferences {
  emailNotifications: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
  coachingReminders: boolean;
}

export default function NotificationsSettings() {
  const { toast } = useToast();

  // Fetch current notification preferences
  const { data: preferences, isLoading } = useQuery<NotificationPreferences>({
    queryKey: ['/api/user/notifications'],
  });

  // Local state for form
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences>({
    emailNotifications: preferences?.emailNotifications ?? true,
    marketingEmails: preferences?.marketingEmails ?? false,
    weeklyDigest: preferences?.weeklyDigest ?? true,
    coachingReminders: preferences?.coachingReminders ?? true,
  });

  // Update preferences when fetched data changes
  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  // Mutation to update preferences
  const updatePreferences = useMutation({
    mutationFn: async (data: NotificationPreferences) => {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update notification preferences');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/notifications'] });
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed", 
        description: "There was an error updating your preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (key: keyof NotificationPreferences) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    updatePreferences.mutate(localPreferences);
  };

  const hasChanges = preferences && (
    preferences.emailNotifications !== localPreferences.emailNotifications ||
    preferences.marketingEmails !== localPreferences.marketingEmails ||
    preferences.weeklyDigest !== localPreferences.weeklyDigest ||
    preferences.coachingReminders !== localPreferences.coachingReminders
  );

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl p-6">
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-4 bg-muted rounded animate-pulse w-32" />
                    <div className="h-3 bg-muted rounded animate-pulse w-48" />
                  </div>
                  <div className="h-6 w-11 bg-muted rounded-full animate-pulse" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notification Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage how and when you receive communications from HiPo AI Coach
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Email Preferences
            </CardTitle>
            <CardDescription>
              Control which emails you receive from us
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Essential Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email-notifications" className="flex items-center gap-2 text-base font-medium">
                  <Mail className="h-4 w-4" />
                  Essential Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Account security, password resets, and important updates
                </p>
              </div>
              <Switch
                id="email-notifications"
                data-testid="toggle-email-notifications"
                checked={localPreferences.emailNotifications}
                onCheckedChange={() => handleToggle('emailNotifications')}
              />
            </div>

            <Separator />

            {/* Marketing Emails */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="marketing-emails" className="flex items-center gap-2 text-base font-medium">
                  <MessageSquare className="h-4 w-4" />
                  Marketing Communications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Product updates, feature announcements, and promotional content
                </p>
              </div>
              <Switch
                id="marketing-emails"
                data-testid="toggle-marketing-emails"
                checked={localPreferences.marketingEmails}
                onCheckedChange={() => handleToggle('marketingEmails')}
              />
            </div>

            <Separator />

            {/* Weekly Digest */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="weekly-digest" className="flex items-center gap-2 text-base font-medium">
                  <Calendar className="h-4 w-4" />
                  Weekly Progress Digest
                </Label>
                <p className="text-sm text-muted-foreground">
                  Summary of your coaching progress and achievements
                </p>
              </div>
              <Switch
                id="weekly-digest"
                data-testid="toggle-weekly-digest"
                checked={localPreferences.weeklyDigest}
                onCheckedChange={() => handleToggle('weeklyDigest')}
              />
            </div>

            <Separator />

            {/* Coaching Reminders */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="coaching-reminders" className="flex items-center gap-2 text-base font-medium">
                  <Bell className="h-4 w-4" />
                  Coaching Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Gentle nudges to continue your coaching journey
                </p>
              </div>
              <Switch
                id="coaching-reminders"
                data-testid="toggle-coaching-reminders"
                checked={localPreferences.coachingReminders}
                onCheckedChange={() => handleToggle('coachingReminders')}
              />
            </div>

            {hasChanges && (
              <>
                <Separator />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSave}
                    disabled={updatePreferences.isPending}
                    data-testid="button-save-preferences"
                  >
                    {updatePreferences.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-xs text-muted-foreground">
          <p>
            Note: You can always update these preferences later. Essential notifications 
            related to your account security cannot be disabled.
          </p>
        </div>
      </div>
    </div>
  );
}