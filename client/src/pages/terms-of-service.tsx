import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
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
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-8" data-testid="heading-terms-service">
            Terms of Service
          </h1>
          
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> December 14, 2024<br />
            <strong>Last Updated:</strong> December 14, 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              Welcome to HiPo AI Coach ("Service," "Platform," "we," "our," or "us"). These Terms of Service ("Terms") govern your use of our AI coaching platform designed for Indian professionals. By accessing or using our Service, you agree to be bound by these Terms and our Privacy Policy.
            </p>
            <p className="mt-4">
              If you do not agree to these Terms, please do not use our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="mb-4">
              HiPo AI Coach provides AI-powered career coaching services through six distinct coach personas, offering personalized guidance for Indian professionals aged 25-40 years with 5+ years of experience.
            </p>
            <h3 className="text-xl font-medium mb-3">Our Service includes:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personalized AI coaching conversations</li>
              <li>Career guidance and development recommendations</li>
              <li>Professional growth strategies and insights</li>
              <li>Chat history and conversation summaries</li>
              <li>User profile and preference management</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Eligibility and Account Requirements</h2>
            <h3 className="text-xl font-medium mb-3">3.1 Eligibility</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You must be at least 18 years old to use our Service</li>
              <li>You must be a working professional with legitimate career development goals</li>
              <li>You must provide accurate and complete information during registration</li>
              <li>You must comply with all applicable laws in your jurisdiction</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">3.2 Account Security</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>We reserve the right to suspend accounts that show signs of unauthorized access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use Policy</h2>
            <h3 className="text-xl font-medium mb-3">4.1 Permitted Uses</h3>
            <p className="mb-4">You may use our Service for:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Professional career development and coaching</li>
              <li>Seeking guidance on workplace challenges and growth</li>
              <li>Personal professional skill enhancement</li>
              <li>Career planning and strategy development</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">4.2 Prohibited Uses</h3>
            <p className="mb-4">You agree NOT to use our Service for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Harmful Content:</strong> Sharing content that is abusive, threatening, defamatory, or discriminatory</li>
              <li><strong>Illegal Activities:</strong> Any activities that violate applicable laws or regulations</li>
              <li><strong>Spam or Abuse:</strong> Sending unsolicited messages, excessive requests, or system abuse</li>
              <li><strong>Reverse Engineering:</strong> Attempting to access, modify, or reverse engineer our AI models</li>
              <li><strong>Data Mining:</strong> Automated extraction of data or content from our platform</li>
              <li><strong>Impersonation:</strong> Pretending to be someone else or providing false information</li>
              <li><strong>Commercial Resale:</strong> Reselling or redistributing our services without authorization</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. AI Coaching Disclaimer</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-lg mb-4">
              <h3 className="text-xl font-medium mb-3 text-yellow-800 dark:text-yellow-200">Important AI Limitations</h3>
              <ul className="list-disc pl-6 space-y-2 text-yellow-700 dark:text-yellow-300">
                <li><strong>AI-Generated Content:</strong> All coaching advice is generated by artificial intelligence and should not replace professional human counseling</li>
                <li><strong>No Professional Advice:</strong> Our Service does not provide licensed professional counseling, legal, financial, or medical advice</li>
                <li><strong>Personal Judgment:</strong> Always use your own professional judgment when acting on AI-generated recommendations</li>
                <li><strong>Context Limitations:</strong> AI responses are based on general patterns and may not account for specific circumstances</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property Rights</h2>
            <h3 className="text-xl font-medium mb-3">6.1 Our Content</h3>
            <p className="mb-4">
              The HiPo AI Coach platform, including all software, designs, text, graphics, and AI models, is owned by us and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without written permission.
            </p>

            <h3 className="text-xl font-medium mb-3">6.2 Your Content</h3>
            <p className="mb-4">
              You retain ownership of the content you provide (professional information, chat messages, profile data). By using our Service, you grant us a limited license to use this content to provide and improve our coaching services.
            </p>

            <h3 className="text-xl font-medium mb-3">6.3 AI-Generated Content</h3>
            <p>
              Content generated by our AI coaches during your sessions is created specifically for you. You may use this content for your personal professional development, but may not redistribute it commercially without permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Payment and Subscription Terms</h2>
            <p className="mb-4">
              <em>Note: HiPo AI Coach is currently in MVP validation phase. Future pricing terms will be updated here when applicable.</em>
            </p>
            <h3 className="text-xl font-medium mb-3">7.1 Future Pricing</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>All pricing changes will be communicated 30 days in advance</li>
              <li>Existing users will receive grandfathered pricing protection</li>
              <li>Refund policies will be clearly outlined when payment features are launched</li>
              <li>Subscription cancellation options will be available at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Privacy and Data Protection</h2>
            <p className="mb-4">
              Your privacy is important to us. Please review our <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link> to understand how we collect, use, and protect your personal information.
            </p>
            <h3 className="text-xl font-medium mb-3">Key Privacy Commitments:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>We do not sell your personal data to third parties</li>
              <li>Your coaching conversations are processed securely</li>
              <li>You have control over your data and can request deletion</li>
              <li>We comply with applicable data protection laws</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimers and Limitations of Liability</h2>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-lg mb-4">
              <h3 className="text-xl font-medium mb-3 text-red-800 dark:text-red-200">Service Disclaimers</h3>
              <ul className="list-disc pl-6 space-y-2 text-red-700 dark:text-red-300">
                <li><strong>No Warranties:</strong> Our Service is provided "as is" without warranties of any kind</li>
                <li><strong>No Guarantees:</strong> We do not guarantee specific career outcomes or results</li>
                <li><strong>AI Limitations:</strong> AI responses may contain inaccuracies or biases</li>
                <li><strong>Availability:</strong> We do not guarantee uninterrupted access to our Service</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium mb-3">Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or data, whether in action of contract, tort, or otherwise, arising from your use of our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <h3 className="text-xl font-medium mb-3">10.1 Termination by You</h3>
            <p className="mb-4">
              You may terminate your account at any time by contacting us at support@hipoacoach.com. Upon termination, your access to the Service will cease, but these Terms will continue to apply to your past use.
            </p>

            <h3 className="text-xl font-medium mb-3">10.2 Termination by Us</h3>
            <p>
              We may suspend or terminate your access to our Service if you violate these Terms, engage in prohibited activities, or if we reasonably believe such action is necessary to protect our Service or other users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of significant changes by email or through our platform. Your continued use of our Service after such changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law and Disputes</h2>
            <p className="mb-4">
              These Terms are governed by the laws of India. Any disputes arising from your use of our Service will be resolved in accordance with Indian jurisdiction.
            </p>
            <h3 className="text-xl font-medium mb-3">Dispute Resolution</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>We encourage resolving disputes through direct communication first</li>
              <li>Formal disputes will be handled through Indian arbitration procedures</li>
              <li>You may contact us at legal@hipoacoach.com for dispute resolution</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p className="mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="bg-muted p-6 rounded-lg">
              <p><strong>HiPo AI Coach</strong></p>
              <p>Email: <strong>legal@hipoacoach.com</strong></p>
              <p>Support: <strong>support@hipoacoach.com</strong></p>
              <p>Address: Bengaluru, Karnataka, India</p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="/privacy-policy" className="hover:text-foreground hover:underline">
                Privacy Policy
              </Link>
              <Link href="/cookie-policy" className="hover:text-foreground hover:underline">
                Cookie Policy
              </Link>
              <Link href="/" className="hover:text-foreground hover:underline">
                Back to HiPo AI Coach
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}