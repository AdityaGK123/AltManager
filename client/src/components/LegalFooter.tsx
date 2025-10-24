import { Link } from "wouter";

export default function LegalFooter() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-foreground mb-4" data-testid="heading-about-hipo">
              HiPo AI Coach
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Empowering Indian professionals with AI-powered career coaching. 
              Get personalized guidance from six expert coach personas designed 
              for your professional growth.
            </p>
            <p className="text-sm text-muted-foreground">
              © 2024 HiPo AI Coach. All rights reserved.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-foreground mb-3">Legal</h4>
              <div className="space-y-2">
                <Link href="/privacy-policy">
                  <span 
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline cursor-pointer transition-colors"
                    data-testid="link-privacy-policy"
                  >
                    Privacy Policy
                  </span>
                </Link>
                <Link href="/terms-of-service">
                  <span 
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline cursor-pointer transition-colors block"
                    data-testid="link-terms-service"
                  >
                    Terms of Service
                  </span>
                </Link>
                <Link href="/cookie-policy">
                  <span 
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline cursor-pointer transition-colors block"
                    data-testid="link-cookie-policy"
                  >
                    Cookie Policy
                  </span>
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>support@hipoacoach.com</p>
                <p>Bengaluru, Karnataka</p>
                <p>India</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Built with care for Indian professionals
          </div>
          <div className="flex gap-4 text-sm">
            <Link href="/privacy-policy">
              <span className="text-muted-foreground hover:text-foreground hover:underline cursor-pointer transition-colors">
                Privacy
              </span>
            </Link>
            <Link href="/terms-of-service">
              <span className="text-muted-foreground hover:text-foreground hover:underline cursor-pointer transition-colors">
                Terms
              </span>
            </Link>
            <Link href="/cookie-policy">
              <span className="text-muted-foreground hover:text-foreground hover:underline cursor-pointer transition-colors">
                Cookies
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}