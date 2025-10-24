import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { liveRegionManager } from "@/utils/accessibility";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

interface OnboardingData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  currentRole: string;
  industry: string;
  customIndustry?: string;
  careerStage: string;
  fiveYearGoal: string;
  biggestChallenge: string;
  workEnvironment: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  defaultData?: OnboardingData | null;
}

const steps = [
  { id: 1, title: "Create Account", description: "Set up your profile and account" },
  { id: 2, title: "Career Context", description: "Your professional background" },
  { id: 3, title: "Goals & Challenges", description: "What you want to achieve" },
  { id: 4, title: "Work Environment", description: "Your workplace dynamics" },
];

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
  { value: "leadership", label: "Building leadership skills and executive presence → Leadership Coach" },
  { value: "career", label: "Planning career advancement and transitions → Career Coach" },
  { value: "strategic", label: "Developing strategic thinking and vision → HiPo Coach" },
  { value: "performance", label: "Improving productivity and performance → Performance Coach" },
  { value: "stress", label: "Managing stress and emotional wellbeing → EmpathEAR" },
  { value: "balance", label: "Achieving work-life integration → Life Coach" },
];

const workEnvironments = [
  { value: "startup", label: "Startup (high growth, ambiguous roles, fast-paced)" },
  { value: "corporate", label: "Corporate (structured, hierarchical, process-driven)" },
  { value: "mnc", label: "MNC (global dynamics, cultural mix, matrix reporting)" },
  { value: "service", label: "Service Company (client-facing, delivery pressure, billable hours)" },
  { value: "government", label: "Government/PSU (bureaucratic, stable, policy-driven)" },
  { value: "consulting", label: "Consulting (project-based, travel, client management)" },
];

export default function OnboardingFlow({ onComplete, defaultData }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    email: defaultData?.email || "",
    password: defaultData?.password || "",
    firstName: defaultData?.firstName || "",
    lastName: defaultData?.lastName || "",
    currentRole: defaultData?.currentRole || "",
    industry: defaultData?.industry || "",
    customIndustry: defaultData?.customIndustry || "",
    careerStage: defaultData?.careerStage || "",
    fiveYearGoal: defaultData?.fiveYearGoal || "",
    biggestChallenge: defaultData?.biggestChallenge || "",
    workEnvironment: defaultData?.workEnvironment || "",
    termsAccepted: defaultData?.termsAccepted || false,
    privacyAccepted: defaultData?.privacyAccepted || false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Refs for focus management
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  const progress = (currentStep / steps.length) * 100;

  // Announce step changes to screen readers
  useEffect(() => {
    const currentStepInfo = steps[currentStep - 1];
    const message = `Step ${currentStep} of ${steps.length}: ${currentStepInfo.title}. ${currentStepInfo.description}`;
    liveRegionManager.announce(message);
  }, [currentStep]);

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 1:
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (!formData.email.includes('@')) newErrors.email = "Please enter a valid email address";
        if (!formData.password) newErrors.password = "Password is required";
        if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!formData.currentRole.trim()) newErrors.currentRole = "Current role is required";
        if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept the Terms of Service";
        if (!formData.privacyAccepted) newErrors.privacyAccepted = "You must accept the Privacy Policy";
        break;
      case 2:
        if (!formData.industry) newErrors.industry = "Industry selection is required";
        if (!formData.careerStage) newErrors.careerStage = "Career stage selection is required";
        if (formData.industry === 'Other' && !formData.customIndustry?.trim()) {
          newErrors.customIndustry = "Please specify your industry";
        }
        break;
      case 3:
        if (!formData.fiveYearGoal.trim()) newErrors.fiveYearGoal = "Five-year goal is required";
        if (!formData.biggestChallenge) newErrors.biggestChallenge = "Please select your biggest challenge";
        break;
      case 4:
        if (!formData.workEnvironment) newErrors.workEnvironment = "Work environment selection is required";
        break;
    }
    
    setErrors(newErrors);
    return newErrors;
  };

  const focusFirstInvalidField = (newErrors: Record<string, string>) => {
    const errorFields = Object.keys(newErrors);
    const firstErrorField = errorFields[0];
    
    if (firstErrorField && fieldRefs.current[firstErrorField]) {
      setTimeout(() => {
        fieldRefs.current[firstErrorField]?.focus();
      }, 100);
    }
  };

  const nextStep = () => {
    const newErrors = validateCurrentStep();
    if (Object.keys(newErrors).length > 0) {
      const errorFields = Object.keys(newErrors);
      liveRegionManager.announce(`Please correct the following errors: ${errorFields.join(', ')}`, 'assertive');
      focusFirstInvalidField(newErrors);
      return;
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setErrors({}); // Clear errors when moving to next step
    } else {
      onComplete(formData);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: keyof OnboardingData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.email && formData.password && formData.firstName && formData.lastName && formData.currentRole && formData.termsAccepted && formData.privacyAccepted;
      case 2:
        return formData.industry && formData.careerStage && 
               (formData.industry !== 'Other' || (formData.customIndustry && formData.customIndustry.trim()));
      case 3:
        return formData.fiveYearGoal && formData.biggestChallenge;
      case 4:
        return formData.workEnvironment;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Welcome to HiPo AI Coach
          </h1>
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </span>
        </div>
        <Progress value={progress} className="w-full" />
        <p className="text-muted-foreground mt-2">
          {steps[currentStep - 1].description}
        </p>
      </div>

      <Card className="p-8">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold mb-4">
              {steps[0].title}
            </h2>
            
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                ref={(el) => (fieldRefs.current.email = el)}
                id="email"
                type="email"
                data-testid="input-email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                placeholder="your.email@company.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                required
              />
              {errors.email && (
                <p id="email-error" role="alert" className="text-sm text-destructive mt-1">
                  {errors.email}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                ref={(el) => (fieldRefs.current.password = el)}
                id="password"
                type="password"
                data-testid="input-password"
                value={formData.password}
                onChange={(e) => updateFormData("password", e.target.value)}
                placeholder="Create a secure password"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                aria-describedby={`${errors.password ? 'password-error ' : ''}password-help`}
                required
              />
              {errors.password && (
                <p id="password-error" role="alert" className="text-sm text-destructive mt-1">
                  {errors.password}
                </p>
              )}
              <p id="password-help" className="text-sm text-muted-foreground mt-1">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  ref={(el) => (fieldRefs.current.firstName = el)}
                  id="firstName"
                  data-testid="input-first-name"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  placeholder="Your first name"
                  autoComplete="given-name"
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? "firstName-error" : undefined}
                  required
                />
                {errors.firstName && (
                  <p id="firstName-error" role="alert" className="text-sm text-destructive mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  ref={(el) => (fieldRefs.current.lastName = el)}
                  id="lastName"
                  data-testid="input-last-name"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  placeholder="Your last name"
                  autoComplete="family-name"
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? "lastName-error" : undefined}
                  required
                />
                {errors.lastName && (
                  <p id="lastName-error" role="alert" className="text-sm text-destructive mt-1">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="currentRole">Current Role *</Label>
              <Input
                ref={(el) => (fieldRefs.current.currentRole = el)}
                id="currentRole"
                data-testid="input-current-role"
                value={formData.currentRole}
                onChange={(e) => updateFormData("currentRole", e.target.value)}
                placeholder="e.g., Software Engineer, Marketing Manager, Business Analyst"
                autoComplete="organization-title"
                aria-invalid={!!errors.currentRole}
                aria-describedby={`${errors.currentRole ? 'currentRole-error ' : ''}currentRole-help`}
                required
              />
              {errors.currentRole && (
                <p id="currentRole-error" role="alert" className="text-sm text-destructive mt-1">
                  {errors.currentRole}
                </p>
              )}
              <p id="currentRole-help" className="text-sm text-muted-foreground mt-1">
                Examples: Software Engineer, Marketing Manager, Business Analyst, Operations Lead, HR Partner
              </p>
            </div>
            
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-sm font-semibold text-foreground">Legal Agreements</h3>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="termsAccepted"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => updateFormData("termsAccepted", !!checked)}
                  aria-describedby={errors.termsAccepted ? "terms-error" : undefined}
                  data-testid="checkbox-terms"
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="termsAccepted" className="text-sm cursor-pointer">
                    I accept the <a href="/terms-of-service" target="_blank" className="text-primary underline">Terms of Service</a> *
                  </Label>
                  {errors.termsAccepted && (
                    <p id="terms-error" role="alert" className="text-xs text-destructive">
                      {errors.termsAccepted}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacyAccepted"
                  checked={formData.privacyAccepted}
                  onCheckedChange={(checked) => updateFormData("privacyAccepted", !!checked)}
                  aria-describedby={errors.privacyAccepted ? "privacy-error" : undefined}
                  data-testid="checkbox-privacy"
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="privacyAccepted" className="text-sm cursor-pointer">
                    I accept the <a href="/privacy-policy" target="_blank" className="text-primary underline">Privacy Policy</a> *
                  </Label>
                  {errors.privacyAccepted && (
                    <p id="privacy-error" role="alert" className="text-xs text-destructive">
                      {errors.privacyAccepted}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold mb-4">
              {steps[1].title}
            </h2>
            
            <div>
              <Label id="industry-label" htmlFor="industry">Industry/Sector *</Label>
              <Select 
                value={formData.industry} 
                onValueChange={(value) => {
                  updateFormData("industry", value);
                  if (value !== 'Other') {
                    updateFormData("customIndustry", "");
                  }
                }}
                required
              >
                <SelectTrigger 
                  ref={(el) => (fieldRefs.current.industry = el)}
                  id="industry"
                  data-testid="select-industry"
                  aria-invalid={!!errors.industry}
                  aria-describedby={errors.industry ? "industry-error" : undefined}
                  aria-labelledby="industry-label"
                >
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p id="industry-error" role="alert" className="text-sm text-destructive mt-1">
                  {errors.industry}
                </p>
              )}
              
              {formData.industry === 'Other' && (
                <div className="mt-4">
                  <Label htmlFor="customIndustry">Please specify your industry</Label>
                  <Input
                    id="customIndustry"
                    data-testid="input-custom-industry"
                    value={formData.customIndustry || ""}
                    onChange={(e) => updateFormData("customIndustry", e.target.value)}
                    placeholder="Enter your specific industry"
                    maxLength={50}
                    autoComplete="organization"
                    aria-invalid={!!errors.customIndustry}
                    aria-describedby={errors.customIndustry ? "customIndustry-error" : "customIndustry-help"}
                    required
                  />
                  {errors.customIndustry && (
                    <p id="customIndustry-error" role="alert" aria-live="assertive" className="text-sm text-destructive mt-1">
                      {errors.customIndustry}
                    </p>
                  )}
                  <p id="customIndustry-help" className="text-sm text-muted-foreground mt-1">
                    Examples: Digital Marketing, Real Estate, Renewable Energy, etc.
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <Label id="careerStage-label">Career Stage *</Label>
              <RadioGroup 
                ref={(el) => (fieldRefs.current.careerStage = el)}
                value={formData.careerStage}
                onValueChange={(value) => updateFormData("careerStage", value)}
                className="mt-2"
                aria-invalid={!!errors.careerStage}
                aria-describedby={errors.careerStage ? "careerStage-error" : undefined}
                aria-labelledby="careerStage-label"
                required
              >
                {errors.careerStage && (
                  <p id="careerStage-error" role="alert" aria-live="assertive" className="text-sm text-destructive mt-1">
                    {errors.careerStage}
                  </p>
                )}
                {careerStages.map(stage => (
                  <div key={stage.value} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={stage.value} 
                      id={stage.value}
                      data-testid={`radio-career-stage-${stage.value}`}
                    />
                    <Label htmlFor={stage.value} className="text-sm leading-relaxed">
                      {stage.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold mb-4">
              {steps[2].title}
            </h2>
            
            <div>
              <Label htmlFor="fiveYearGoal">What's your 5-year professional goal? *</Label>
              <Textarea
                ref={(el) => (fieldRefs.current.fiveYearGoal = el)}
                id="fiveYearGoal"
                data-testid="textarea-five-year-goal"
                value={formData.fiveYearGoal}
                onChange={(e) => updateFormData("fiveYearGoal", e.target.value)}
                placeholder="e.g., Lead a team of 20+ people, Become VP of Marketing, Start my own company"
                rows={3}
                aria-invalid={!!errors.fiveYearGoal}
                aria-describedby={`${errors.fiveYearGoal ? 'fiveYearGoal-error ' : ''}fiveYearGoal-help`}
                required
              />
              {errors.fiveYearGoal && (
                <p id="fiveYearGoal-error" role="alert" aria-live="assertive" className="text-sm text-destructive mt-1">
                  {errors.fiveYearGoal}
                </p>
              )}
              <p id="fiveYearGoal-help" className="text-sm text-muted-foreground mt-1">
                Examples: "Lead a team of 20+ people", "Become VP of Marketing", "Start my own company", "Transition to product management"
              </p>
            </div>
            
            <div>
              <Label id="biggestChallenge-label">What's your biggest challenge right now? *</Label>
              <p className="text-sm text-muted-foreground mb-3">
                This will help us recommend the right coach for you
              </p>
              {errors.biggestChallenge && (
                <p id="biggestChallenge-error" role="alert" aria-live="assertive" className="text-sm text-destructive mb-3">
                  {errors.biggestChallenge}
                </p>
              )}
              <RadioGroup 
                ref={(el) => (fieldRefs.current.biggestChallenge = el)}
                value={formData.biggestChallenge}
                onValueChange={(value) => updateFormData("biggestChallenge", value)}
                aria-invalid={!!errors.biggestChallenge}
                aria-describedby={errors.biggestChallenge ? "biggestChallenge-error" : undefined}
                aria-labelledby="biggestChallenge-label"
                required
              >
                {challenges.map(challenge => (
                  <div key={challenge.value} className="flex items-start space-x-2">
                    <RadioGroupItem 
                      value={challenge.value} 
                      id={challenge.value}
                      data-testid={`radio-challenge-${challenge.value}`}
                      className="mt-1"
                    />
                    <Label htmlFor={challenge.value} className="text-sm leading-relaxed">
                      {challenge.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold mb-4">
              {steps[3].title}
            </h2>
            
            <div>
              <Label id="workEnvironment-label">Work Environment *</Label>
              {errors.workEnvironment && (
                <p id="workEnvironment-error" role="alert" aria-live="assertive" className="text-sm text-destructive mt-1 mb-3">
                  {errors.workEnvironment}
                </p>
              )}
              <RadioGroup 
                ref={(el) => (fieldRefs.current.workEnvironment = el)}
                value={formData.workEnvironment}
                onValueChange={(value) => updateFormData("workEnvironment", value)}
                className="mt-3"
                aria-invalid={!!errors.workEnvironment}
                aria-describedby={errors.workEnvironment ? "workEnvironment-error" : undefined}
                aria-labelledby="workEnvironment-label"
                required
              >
                {workEnvironments.map(env => (
                  <div key={env.value} className="flex items-start space-x-2">
                    <RadioGroupItem 
                      value={env.value} 
                      id={env.value}
                      data-testid={`radio-work-env-${env.value}`}
                      className="mt-1"
                    />
                    <Label htmlFor={env.value} className="text-sm leading-relaxed">
                      {env.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 1}
            data-testid="button-previous-step"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button 
            onClick={nextStep}
            disabled={!isStepValid()}
            data-testid="button-next-step"
          >
            {currentStep === steps.length ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Setup
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}