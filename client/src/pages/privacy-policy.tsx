import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold mb-8" data-testid="heading-privacy-policy">
            Privacy Policy
          </h1>
          
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> December 14, 2024<br />
            <strong>Last Updated:</strong> December 14, 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Welcome to HiPo AI Coach ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our AI coaching platform designed for Indian professionals.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium mb-3">2.1 Personal Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, password (encrypted)</li>
              <li><strong>Professional Profile:</strong> Job title, industry, career stage, experience level</li>
              <li><strong>Goal Information:</strong> Career objectives, challenges, preferences</li>
              <li><strong>Communication Data:</strong> Chat conversations with AI coaches, feedback, ratings</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">2.2 Technical Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Usage Data:</strong> How you interact with our platform, features used, session duration</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
              <li><strong>Cookies:</strong> Essential cookies for functionality, preferences, and analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>AI Coaching:</strong> Provide personalized career guidance and recommendations</li>
              <li><strong>Account Management:</strong> Create and maintain your account, authenticate access</li>
              <li><strong>Communication:</strong> Send important updates, respond to inquiries</li>
              <li><strong>Platform Improvement:</strong> Analyze usage patterns to enhance our services</li>
              <li><strong>Legal Compliance:</strong> Meet legal obligations and protect against fraud</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
            <p className="mb-4">
              We <strong>do not sell, rent, or trade</strong> your personal information to third parties. We may share your data only in these limited circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> Trusted partners who help operate our platform (hosting, analytics, email services)</li>
              <li><strong>Legal Requirements:</strong> When required by law, court orders, or to protect our legal rights</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of our company</li>
              <li><strong>Safety Protection:</strong> To protect the safety and security of our users and platform</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. AI and Data Processing</h2>
            <p className="mb-4">
              <strong>AI Model Integration:</strong> We use Google's Gemini AI to power our coaching conversations. Your chat data is processed to generate personalized responses and maintain conversation context.
            </p>
            <p className="mb-4">
              <strong>Data Anonymization:</strong> Personal identifiers are removed from data used for AI training and improvement. We implement privacy-preserving techniques to protect your identity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
            <p className="mb-4">We implement industry-standard security measures to protect your data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Encryption:</strong> Data is encrypted in transit and at rest using TLS/SSL protocols</li>
              <li><strong>Access Controls:</strong> Strict access controls and authentication for our team</li>
              <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
              <li><strong>Secure Infrastructure:</strong> Cloud hosting with enterprise-grade security standards</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
            <p className="mb-4">Under applicable privacy laws, you have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data we hold</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to certain processing of your data</li>
              <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at <strong>privacy@hipoacoach.com</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
            <p>
              We retain your personal data only as long as necessary to provide our services and comply with legal obligations. Account information is retained while your account is active. Chat history and coaching data may be retained for up to 3 years for service improvement, unless you request earlier deletion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking</h2>
            <p className="mb-4">
              We use cookies and similar technologies for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for platform functionality and security</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
            </ul>
            <p className="mt-4">
              You can manage cookie preferences through your browser settings. See our <Link href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link> for detailed information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
            <p>
              Your data may be processed and stored in countries outside India, including the United States, where our cloud infrastructure partners are located. We ensure appropriate safeguards are in place to protect your data in accordance with applicable privacy laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Children's Privacy</h2>
            <p>
              Our platform is designed for working professionals aged 18 and above. We do not knowingly collect personal information from children under 18. If we become aware that we have collected such information, we will take steps to delete it promptly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes by email or through our platform. Your continued use of our services after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
            <p className="mb-4">
              If you have questions about this privacy policy or our data practices, please contact us:
            </p>
            <div className="bg-muted p-6 rounded-lg">
              <p><strong>HiPo AI Coach</strong></p>
              <p>Email: <strong>privacy@hipoacoach.com</strong></p>
              <p>Support: <strong>support@hipoacoach.com</strong></p>
              <p>Address: Bengaluru, Karnataka, India</p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="/terms-of-service" className="hover:text-foreground hover:underline">
                Terms of Service
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