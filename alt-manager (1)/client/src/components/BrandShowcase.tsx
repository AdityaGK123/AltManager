/**
 * HiPo Brand Showcase Component
 * 
 * This component demonstrates the HiPo logo in various contexts
 * following brand guidelines. Use this for design review and testing.
 * 
 * To view: Import and render in any page during development
 */

import React from 'react';

const BrandShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-montserrat font-bold text-slate-900 mb-2">
            HiPo Brand Integration Showcase
          </h1>
          <p className="text-lg font-karla text-slate-600">
            Logo usage examples following brand guidelines
          </p>
        </div>

        {/* Standard Logo on White Background */}
        <section className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-montserrat font-bold text-slate-900 mb-6">
            Standard Logo - White Background
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Large */}
            <div className="text-center">
              <p className="font-karla text-sm text-slate-600 mb-4">Large (Desktop)</p>
              <div className="flex justify-center items-center h-32 bg-slate-50 rounded-lg">
                <img 
                  src="/hipo-logo.svg" 
                  alt="HiPo Logo - Large"
                  className="h-12"
                  style={{ padding: '2px 8px' }}
                />
              </div>
              <p className="font-karla text-xs text-slate-500 mt-2">48px height</p>
            </div>

            {/* Medium */}
            <div className="text-center">
              <p className="font-karla text-sm text-slate-600 mb-4">Medium (Tablet)</p>
              <div className="flex justify-center items-center h-32 bg-slate-50 rounded-lg">
                <img 
                  src="/hipo-logo.svg" 
                  alt="HiPo Logo - Medium"
                  className="h-10"
                  style={{ padding: '2px 8px' }}
                />
              </div>
              <p className="font-karla text-xs text-slate-500 mt-2">40px height</p>
            </div>

            {/* Small */}
            <div className="text-center">
              <p className="font-karla text-sm text-slate-600 mb-4">Small (Mobile)</p>
              <div className="flex justify-center items-center h-32 bg-slate-50 rounded-lg">
                <img 
                  src="/hipo-logo.svg" 
                  alt="HiPo Logo - Small"
                  className="h-8"
                  style={{ padding: '2px 8px' }}
                />
              </div>
              <p className="font-karla text-xs text-slate-500 mt-2">32px height</p>
            </div>
          </div>
        </section>

        {/* White Logo on Royal Blue Background */}
        <section className="bg-hipo-blue rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-montserrat font-bold text-white mb-6">
            White Variant - Royal Blue Background
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Large */}
            <div className="text-center">
              <p className="font-karla text-sm text-white/80 mb-4">Large (Desktop)</p>
              <div className="flex justify-center items-center h-32 bg-white/10 rounded-lg">
                <img 
                  src="/hipo-logo-white.svg" 
                  alt="HiPo Logo White - Large"
                  className="h-12"
                  style={{ padding: '2px 8px' }}
                />
              </div>
              <p className="font-karla text-xs text-white/70 mt-2">48px height</p>
            </div>

            {/* Medium */}
            <div className="text-center">
              <p className="font-karla text-sm text-white/80 mb-4">Medium (Tablet)</p>
              <div className="flex justify-center items-center h-32 bg-white/10 rounded-lg">
                <img 
                  src="/hipo-logo-white.svg" 
                  alt="HiPo Logo White - Medium"
                  className="h-10"
                  style={{ padding: '2px 8px' }}
                />
              </div>
              <p className="font-karla text-xs text-white/70 mt-2">40px height</p>
            </div>

            {/* Small */}
            <div className="text-center">
              <p className="font-karla text-sm text-white/80 mb-4">Small (Mobile)</p>
              <div className="flex justify-center items-center h-32 bg-white/10 rounded-lg">
                <img 
                  src="/hipo-logo-white.svg" 
                  alt="HiPo Logo White - Small"
                  className="h-8"
                  style={{ padding: '2px 8px' }}
                />
              </div>
              <p className="font-karla text-xs text-white/70 mt-2">32px height</p>
            </div>
          </div>
        </section>

        {/* Header Simulation */}
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <h2 className="text-2xl font-montserrat font-bold text-slate-900 p-8 pb-4">
            Header Integration
          </h2>
          <div className="border-t border-slate-200">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <img 
                  src="/hipo-logo.svg" 
                  alt="HiPo"
                  className="h-10"
                  style={{ padding: '2px 8px' }}
                />
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-montserrat font-bold text-slate-900">
                    ALT Manager
                  </h3>
                  <p className="text-xs font-karla text-slate-500">Powered by HiPo</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-karla text-sm text-slate-600">Navigation Items →</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Simulation */}
        <section className="bg-hipo-blue rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-montserrat font-bold text-white mb-6">
            Footer Integration
          </h2>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 bg-white/10 rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <img 
                src="/hipo-logo-white.svg" 
                alt="HiPo"
                className="h-10"
                style={{ padding: '2px 8px' }}
              />
              <div className="flex flex-col">
                <span className="font-montserrat font-bold text-sm text-white">HiPo</span>
                <span className="font-karla text-xs text-white/80">
                  High Potential Career Assessment
                </span>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="font-karla text-sm text-white/90">
                © 2025 HiPo. All rights reserved.
              </p>
              <p className="font-karla text-xs text-white/70 mt-1">
                Empowering GenZ professionals to reach their potential
              </p>
            </div>
          </div>
        </section>

        {/* Brand Colors */}
        <section className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-montserrat font-bold text-slate-900 mb-6">
            Brand Colors
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Royal Blue */}
            <div className="text-center">
              <div className="h-24 bg-hipo-blue rounded-lg mb-2"></div>
              <p className="font-montserrat font-semibold text-sm text-slate-900">Royal Blue</p>
              <p className="font-karla text-xs text-slate-600">#4C62E3</p>
              <p className="font-karla text-xs text-slate-500">Primary</p>
            </div>

            {/* Coral */}
            <div className="text-center">
              <div className="h-24 bg-hipo-coral rounded-lg mb-2"></div>
              <p className="font-montserrat font-semibold text-sm text-slate-900">Coral</p>
              <p className="font-karla text-xs text-slate-600">#EE7D79</p>
              <p className="font-karla text-xs text-slate-500">Primary</p>
            </div>

            {/* White */}
            <div className="text-center">
              <div className="h-24 bg-white border-2 border-slate-200 rounded-lg mb-2"></div>
              <p className="font-montserrat font-semibold text-sm text-slate-900">White</p>
              <p className="font-karla text-xs text-slate-600">#FFFFFF</p>
              <p className="font-karla text-xs text-slate-500">Primary</p>
            </div>

            {/* Grey */}
            <div className="text-center">
              <div className="h-24 bg-hipo-grey rounded-lg mb-2"></div>
              <p className="font-montserrat font-semibold text-sm text-slate-900">Grey</p>
              <p className="font-karla text-xs text-slate-600">#D5D5D5</p>
              <p className="font-karla text-xs text-slate-500">Secondary</p>
            </div>

            {/* Black */}
            <div className="text-center">
              <div className="h-24 bg-hipo-black rounded-lg mb-2"></div>
              <p className="font-montserrat font-semibold text-sm text-white">Black</p>
              <p className="font-karla text-xs text-white">#000000</p>
              <p className="font-karla text-xs text-white/70">Secondary</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-montserrat font-bold text-slate-900 mb-6">
            Brand Typography
          </h2>
          <div className="space-y-6">
            {/* Montserrat */}
            <div>
              <p className="font-karla text-sm text-slate-600 mb-2">Montserrat Display (Headings)</p>
              <p className="font-montserrat text-4xl font-bold text-slate-900">
                The quick brown fox jumps
              </p>
              <p className="font-montserrat text-2xl font-semibold text-slate-700 mt-2">
                Over the lazy dog
              </p>
            </div>

            {/* Karla */}
            <div>
              <p className="font-karla text-sm text-slate-600 mb-2">Karla (Body Text)</p>
              <p className="font-karla text-lg text-slate-900">
                The quick brown fox jumps over the lazy dog. This is body text in Karla font.
              </p>
              <p className="font-karla text-base text-slate-700 mt-2">
                Designed for readability and clarity in digital interfaces.
              </p>
            </div>
          </div>
        </section>

        {/* Clear Space Guidelines */}
        <section className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-montserrat font-bold text-slate-900 mb-6">
            Clear Space Guidelines
          </h2>
          <div className="bg-slate-50 rounded-lg p-8 relative">
            <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-dashed border-hipo-coral opacity-50"></div>
            <div className="flex justify-center items-center h-32">
              <img 
                src="/hipo-logo.svg" 
                alt="HiPo Logo with Clear Space"
                className="h-12"
                style={{ padding: '2px 8px' }}
              />
            </div>
            <p className="font-karla text-sm text-slate-600 text-center mt-4">
              Minimum clear space: 5% of logo width, 20% of logo length
            </p>
            <p className="font-karla text-xs text-slate-500 text-center mt-1">
              (Shown as dashed coral border)
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default BrandShowcase;
