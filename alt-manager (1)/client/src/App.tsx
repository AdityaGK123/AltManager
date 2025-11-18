import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuthStore } from './store/authStore';

// Lazy load all pages for code splitting and faster initial load
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const MomentsCategoriesPage = lazy(() => import('./pages/MomentsCategoriesPage'));
const MomentsCategoryDetailPage = lazy(() => import('./pages/MomentsCategoryDetailPage'));
const MomentDetailPage = lazy(() => import('./pages/MomentDetailPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const MomPage = lazy(() => import('./pages/MomPage'));
const Layout = lazy(() => import('./components/Layout'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-600 font-medium">Loading...</p>
    </div>
  </div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="chat/:conversationId" element={<ChatPage />} />
            <Route path="moments" element={<MomentsCategoriesPage />} />
            <Route path="moments/category/:category" element={<MomentsCategoryDetailPage />} />
            <Route path="moments/:momentId" element={<MomentDetailPage />} />
            <Route path="progress" element={<Navigate to="/analytics" replace />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="moms" element={<MomPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
