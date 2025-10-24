import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CookiePolicy() {
  const [consentGiven, setConsentGiven] = useState(() => {
    return localStorage.getItem('cookie-consent') === 'accepted';
  });

  const handleAcceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setConsentGiven(true);
  };

  const handleRejectCookies = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    // Remove non-essential cookies
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('session-') && key !== 'cookie-consent') {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    setConsentGiven(false);
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

      {!consentGiven && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                We use cookies to enhance your experience. By continuing to use our site, you accept our cookie policy.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleRejectCookies}
                data-testid="button-reject-cookies"
              >
                Reject Non-Essential
              </Button>
              <Button 
                size="sm" 
                onClick={handleAcceptCookies}
                data-testid="button-accept-cookies"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-8" data-testid="heading-cookie-policy">
            Cookie Policy
          </h1>
          
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> December 14, 2024<br />
            <strong>Last Updated:</strong> December 14, 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit our website. They help us provide you with a better experience by remembering your preferences and improving our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
            <p className="mb-4">
              HiPo AI Coach uses cookies for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Functionality:</strong> Enable core features like user authentication and session management</li>
              <li><strong>User Preferences:</strong> Remember your settings, theme preferences, and language choices</li>
              <li><strong>Analytics:</strong> Understand how you interact with our platform to improve our services</li>
              <li><strong>Security:</strong> Protect against fraud and enhance platform security</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
            
            <div className="space-y-6">
              <div className="border border-border rounded-lg p-6">
                <h3 className="text-xl font-medium mb-3 text-green-700 dark:text-green-400">Essential Cookies (Always Active)</h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  These cookies are necessary for the website to function and cannot be disabled.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2">Cookie Name</th>
                        <th className="text-left py-2">Purpose</th>
                        <th className="text-left py-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="py-2 font-mono">session-token</td>
                        <td className="py-2">User authentication and login state</td>
                        <td className="py-2">Session (until browser closes)</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2 font-mono">csrf-token</td>
                        <td className="py-2">Security protection against cross-site attacks</td>
                        <td className="py-2">Session</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono">cookie-consent</td>
                        <td className="py-2">Remember your cookie preferences</td>
                        <td className="py-2">1 year</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border border-border rounded-lg p-6">
                <h3 className="text-xl font-medium mb-3 text-blue-700 dark:text-blue-400">Preference Cookies</h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  These cookies remember your choices and preferences to provide a personalized experience.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2">Cookie Name</th>
                        <th className="text-left py-2">Purpose</th>
                        <th className="text-left py-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="py-2 font-mono">theme-preference</td>
                        <td className="py-2">Remember light/dark mode preference</td>
                        <td className="py-2">1 year</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2 font-mono">coach-preferences</td>
                        <td className="py-2">Remember your preferred coaches and settings</td>
                        <td className="py-2">30 days</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono">onboarding-state</td>
                        <td className="py-2">Save progress during onboarding process</td>
                        <td className="py-2">7 days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border border-border rounded-lg p-6">
                <h3 className="text-xl font-medium mb-3 text-orange-700 dark:text-orange-400">Analytics Cookies</h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  These cookies help us understand how you use our platform so we can improve it.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2">Cookie Name</th>
                        <th className="text-left py-2">Purpose</th>
                        <th className="text-left py-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="py-2 font-mono">_ga</td>
                        <td className="py-2">Google Analytics - track user interactions</td>
                        <td className="py-2">2 years</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2 font-mono">_ga_*</td>
                        <td className="py-2">Google Analytics - session tracking</td>
                        <td className="py-2">2 years</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono">platform-analytics</td>
                        <td className="py-2">Internal usage analytics (anonymized)</td>
                        <td className="py-2">90 days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
            <p className="mb-4">
              We work with trusted third-party services that may set their own cookies:
            </p>
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Google Analytics</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Helps us understand user behavior and improve our platform.
                </p>
                <p className="text-xs text-muted-foreground">
                  Learn more: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Privacy Policy</a>
                </p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Google Fonts</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Provides web fonts for better typography experience.
                </p>
                <p className="text-xs text-muted-foreground">
                  Learn more: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Privacy Policy</a>
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Managing Your Cookie Preferences</h2>
            
            <div className="bg-muted p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-4">Cookie Consent Manager</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Current status: <span className="font-semibold">{consentGiven ? 'All cookies accepted' : 'Only essential cookies active'}</span>
              </p>
              <div className="flex gap-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleRejectCookies}
                  data-testid="button-manage-reject-cookies"
                >
                  Use Only Essential Cookies
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleAcceptCookies}
                  data-testid="button-manage-accept-cookies"
                >
                  Accept All Cookies
                </Button>
              </div>
            </div>

            <h3 className="text-xl font-medium mb-3">Browser Settings</h3>
            <p className="mb-4">
              You can also manage cookies through your browser settings. Here's how to do it in popular browsers:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Safari → Preferences → Privacy → Cookies and website data</li>
              <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              <strong>Note:</strong> Disabling essential cookies may affect the functionality of our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Mobile Applications</h2>
            <p className="mb-4">
              Currently, HiPo AI Coach operates as a web application. Future mobile app versions will have separate privacy settings that respect your device's privacy controls.
            </p>
            <p className="text-sm text-muted-foreground">
              Mobile app cookie policies will be updated here when applicable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p className="mb-4">Cookie data is retained for different periods based on type:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Deleted after specified duration (7 days to 2 years)</li>
              <li><strong>Analytics Data:</strong> Aggregated and anonymized after processing</li>
              <li><strong>Consent Records:</strong> Kept for legal compliance purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy to reflect changes in our practices, legal requirements, or to provide greater clarity. We will notify you of significant changes by:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Updating the "Last Updated" date at the top of this policy</li>
              <li>Sending email notifications for major changes</li>
              <li>Displaying a notification banner on our platform</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p className="mb-4">
              If you have questions about our use of cookies, please contact us:
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
              <Link href="/privacy-policy" className="hover:text-foreground hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-foreground hover:underline">
                Terms of Service
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