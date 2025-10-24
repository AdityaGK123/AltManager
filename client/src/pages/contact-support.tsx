import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Send, MessageCircle, Mail, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingStates";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

const CATEGORIES = [
  { value: "general", label: "General Question" },
  { value: "technical", label: "Technical Issue" },
  { value: "billing", label: "Billing & Account" },
  { value: "coaching", label: "Coaching Support" },
  { value: "feature", label: "Feature Request" },
  { value: "bug", label: "Bug Report" },
];

export default function ContactSupport() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });
  
  const { toast } = useToast();
  const { handleApiError } = useErrorHandler();

  const submitContactForm = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
        variant: "default",
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: "",
      });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Please fill in all required fields",
        description: "All fields except category are required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.includes('@')) {
      toast({
        title: "Invalid email address",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    submitContactForm.mutate(formData);
  };

  const handleInputChange = (field: keyof ContactFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to HiPo AI Coach
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="heading-contact-support">
                  <MessageCircle className="w-5 h-5" />
                  Contact Support
                </CardTitle>
                <p className="text-muted-foreground">
                  Have a question or need help? We're here to assist you. Send us a message and we'll get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-name">Name *</Label>
                      <Input
                        id="contact-name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange('name')}
                        placeholder="Your full name"
                        required
                        data-testid="input-contact-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Email *</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        placeholder="your@email.com"
                        required
                        data-testid="input-contact-email"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contact-category">Category</Label>
                    <Select value={formData.category} onValueChange={handleCategoryChange}>
                      <SelectTrigger id="contact-category" data-testid="select-contact-category">
                        <SelectValue placeholder="Select a category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="contact-subject">Subject *</Label>
                    <Input
                      id="contact-subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleInputChange('subject')}
                      placeholder="Brief description of your issue or question"
                      required
                      data-testid="input-contact-subject"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact-message">Message *</Label>
                    <Textarea
                      id="contact-message"
                      value={formData.message}
                      onChange={handleInputChange('message')}
                      placeholder="Please provide as much detail as possible so we can help you effectively..."
                      rows={6}
                      required
                      data-testid="textarea-contact-message"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={submitContactForm.isPending}
                    data-testid="button-submit-contact"
                  >
                    {submitContactForm.isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information & FAQ */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Other Ways to Reach Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Email Support</h4>
                  <p className="text-muted-foreground">
                    For urgent matters, you can also email us directly at:
                  </p>
                  <a 
                    href="mailto:support@hipoaicoach.com" 
                    className="text-primary hover:underline font-medium"
                    data-testid="link-email-support"
                  >
                    support@hipoaicoach.com
                  </a>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Response Times</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• General inquiries: Within 24 hours</li>
                    <li>• Technical issues: Within 12 hours</li>
                    <li>• Billing questions: Within 24 hours</li>
                    <li>• Urgent matters: Within 4 hours</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">How do I change my notification preferences?</h4>
                  <p className="text-muted-foreground text-sm">
                    Go to your profile settings and update your notification preferences under the "Communication" section.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Can I switch between different AI coaches?</h4>
                  <p className="text-muted-foreground text-sm">
                    Yes! You can access all 6 coaches from your home dashboard and switch between them anytime.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">How is my data protected?</h4>
                  <p className="text-muted-foreground text-sm">
                    We use enterprise-grade security measures. Read our{" "}
                    <Link href="/privacy-policy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>{" "}
                    for full details.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Can I delete my account and data?</h4>
                  <p className="text-muted-foreground text-sm">
                    Yes, you can request account deletion through this contact form. We'll permanently remove all your data within 30 days.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}