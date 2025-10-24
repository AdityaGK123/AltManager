import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User, UserCircle, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  currentRole: string;
  industry: string;
  customIndustry?: string;
  careerStage: string;
  fiveYearGoal: string;
  biggestChallenge: string;
  workEnvironment: string;
}

interface ProfileEditProps {
  user: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
  trigger?: React.ReactNode;
}

const industries = [
  "Technology & IT",
  "Banking & Financial Services",
  "Consulting & Professional Services", 
  "Manufacturing & Engineering",
  "Healthcare & Pharmaceuticals",
  "Education & Training",
  "Government & Public Sector",
  "Startups & Entrepreneurship",
  "Other"
];

const careerStages = [
  { value: "0-3", label: "0-3 years (Individual contributor, early career)" },
  { value: "3-5", label: "3-5 years (Experienced contributor, aspiring to management)" },
  { value: "5-10", label: "5-10 years (First-time manager, leading teams)" },
  { value: "10-15", label: "10-15 years (Manager of managers, functional leadership)" },
  { value: "15+", label: "15+ years (Senior leader, aiming for executive/CEO roles)" },
];

const challenges = [
  { value: "leadership", label: "Building leadership skills and executive presence" },
  { value: "career", label: "Planning career advancement and transitions" },
  { value: "strategic", label: "Developing strategic thinking and vision" },
  { value: "performance", label: "Improving productivity and performance" },
  { value: "stress", label: "Managing stress and emotional wellbeing" },
  { value: "balance", label: "Achieving work-life integration" },
];

const workEnvironments = [
  { value: "startup", label: "Startup (high growth, ambiguous roles, fast-paced)" },
  { value: "corporate", label: "Corporate (structured, hierarchical, process-driven)" },
  { value: "mnc", label: "MNC (global dynamics, cultural mix, matrix reporting)" },
  { value: "service", label: "Service Company (client-facing, delivery pressure, billable hours)" },
  { value: "government", label: "Government/PSU (bureaucratic, stable, policy-driven)" },
  { value: "consulting", label: "Consulting (project-based, travel, client management)" },
];

export default function ProfileEdit({ user, onSave, trigger }: ProfileEditProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(user);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const updateFormData = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate required fields
      if (!formData.firstName?.trim() || !formData.lastName?.trim() || !formData.currentRole?.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (name and current role).",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Validate custom industry if "Other" is selected
      if (formData.industry === 'Other' && !formData.customIndustry?.trim()) {
        toast({
          title: "Validation Error", 
          description: "Please specify your custom industry.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      await onSave(formData);
      setIsEditing(false);
      setIsOpen(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(user); // Reset to original data
    setIsEditing(false);
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" data-testid="button-edit-profile">
      <UserCircle className="w-4 h-4 mr-2" />
      Edit Profile
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Basic Information */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              {!isEditing && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  data-testid="button-start-editing"
                >
                  Edit
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      data-testid="input-edit-first-name"
                      value={formData.firstName}
                      onChange={(e) => updateFormData("firstName", e.target.value)}
                      placeholder="Your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      data-testid="input-edit-last-name"
                      value={formData.lastName}
                      onChange={(e) => updateFormData("lastName", e.target.value)}
                      placeholder="Your last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Email cannot be changed for security reasons
                  </p>
                </div>

                <div>
                  <Label htmlFor="currentRole">Current Role *</Label>
                  <Input
                    id="currentRole"
                    data-testid="input-edit-current-role"
                    value={formData.currentRole}
                    onChange={(e) => updateFormData("currentRole", e.target.value)}
                    placeholder="e.g., Software Engineer, Marketing Manager"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Name:</span>
                  <span>{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span>{formData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Current Role:</span>
                  <span>{formData.currentRole}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Professional Context */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Professional Context</h3>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label>Industry/Sector</Label>
                  <Select 
                    value={formData.industry} 
                    onValueChange={(value) => {
                      updateFormData("industry", value);
                      if (value !== 'Other') {
                        updateFormData("customIndustry", "");
                      }
                    }}
                  >
                    <SelectTrigger data-testid="select-edit-industry">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {formData.industry === 'Other' && (
                    <div className="mt-2">
                      <Input
                        data-testid="input-edit-custom-industry"
                        value={formData.customIndustry || ""}
                        onChange={(e) => updateFormData("customIndustry", e.target.value)}
                        placeholder="Please specify your industry"
                        maxLength={50}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label>Career Stage</Label>
                  <RadioGroup 
                    value={formData.careerStage}
                    onValueChange={(value) => updateFormData("careerStage", value)}
                    className="mt-2"
                  >
                    {careerStages.map(stage => (
                      <div key={stage.value} className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={stage.value} 
                          id={`edit-${stage.value}`}
                          data-testid={`radio-edit-career-stage-${stage.value}`}
                        />
                        <Label htmlFor={`edit-${stage.value}`} className="text-sm">
                          {stage.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label>Work Environment</Label>
                  <RadioGroup 
                    value={formData.workEnvironment}
                    onValueChange={(value) => updateFormData("workEnvironment", value)}
                    className="mt-2"
                  >
                    {workEnvironments.map(env => (
                      <div key={env.value} className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={env.value} 
                          id={`edit-${env.value}`}
                          data-testid={`radio-edit-work-env-${env.value}`}
                        />
                        <Label htmlFor={`edit-${env.value}`} className="text-sm">
                          {env.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Industry:</span>
                  <span>
                    {formData.industry === 'Other' ? formData.customIndustry : formData.industry}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Career Stage:</span>
                  <span>
                    {careerStages.find(s => s.value === formData.careerStage)?.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Work Environment:</span>
                  <span>
                    {workEnvironments.find(e => e.value === formData.workEnvironment)?.label}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Goals & Challenges */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Goals & Challenges</h3>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fiveYearGoal">5-Year Professional Goal</Label>
                  <Textarea
                    id="fiveYearGoal"
                    data-testid="textarea-edit-five-year-goal"
                    value={formData.fiveYearGoal}
                    onChange={(e) => updateFormData("fiveYearGoal", e.target.value)}
                    placeholder="What do you want to achieve in the next 5 years?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Biggest Current Challenge</Label>
                  <RadioGroup 
                    value={formData.biggestChallenge}
                    onValueChange={(value) => updateFormData("biggestChallenge", value)}
                    className="mt-2"
                  >
                    {challenges.map(challenge => (
                      <div key={challenge.value} className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={challenge.value} 
                          id={`edit-challenge-${challenge.value}`}
                          data-testid={`radio-edit-challenge-${challenge.value}`}
                        />
                        <Label htmlFor={`edit-challenge-${challenge.value}`} className="text-sm">
                          {challenge.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className="font-medium">5-Year Goal:</span>
                  <p className="text-sm mt-1">{formData.fiveYearGoal}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Current Challenge:</span>
                  <Badge variant="outline">
                    {challenges.find(c => c.value === formData.biggestChallenge)?.label}
                  </Badge>
                </div>
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSaving}
                data-testid="button-cancel-edit"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                data-testid="button-save-profile"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}