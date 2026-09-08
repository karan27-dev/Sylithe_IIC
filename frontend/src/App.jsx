import React, { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// --- COMPONENTS (always needed, keep eager) ---
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import AnnouncementBanner from './components/AnnouncementBanner';
import ErrorBoundary from './ErrorBoundary';
import AntiInspect from './components/AntiInspect';

// --- LAZY PAGES (loaded only when the route is visited) ---
const Signup                = lazy(() => import('./pages/Signup'));
const Login                 = lazy(() => import('./pages/Login'));
const LulcClassification    = lazy(() => import('./pages/solutions/methodology/LulcClassification'));
const ChmModel              = lazy(() => import('./pages/solutions/methodology/ChmModel'));
const DcabModel             = lazy(() => import('./pages/solutions/methodology/DcabModel'));
const AgbCalculation        = lazy(() => import('./pages/solutions/methodology/AgbCalculation'));
const ChmDashboard          = lazy(() => import('./pages/solutions/methodology/ChmDashboard'));
const BiocharCarbonRemoval  = lazy(() => import('./pages/project-types/BiocharCarbonRemoval'));
const ArrCarbonProjects     = lazy(() => import('./pages/project-types/ArrCarbonProjects'));
const ReddPlus              = lazy(() => import('./pages/project-types/ReddPlus'));
const ProjectsRegistry      = lazy(() => import('./pages/ProjectsRegistry'));
const Dashboard             = lazy(() => import('./pages/Dashboard'));
const TermsOfService        = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy         = lazy(() => import('./pages/PrivacyPolicy'));
const AboutUs               = lazy(() => import('./pages/AboutUs'));
const Platform              = lazy(() => import('./pages/Platform'));
const Insights              = lazy(() => import('./pages/Insights'));
const BlogPost              = lazy(() => import('./pages/insights/BlogPost'));
const WhatWeOffer           = lazy(() => import('./pages/WhatWeOffer'));
const ForBuyers             = lazy(() => import('./pages/ForBuyers'));
const TreeProfile           = lazy(() => import('./pages/TreeProfile'));
const CorporateDashboard    = lazy(() => import('./pages/dashboards/CorporateDashboard'));
const InvestorDashboard     = lazy(() => import('./pages/dashboards/InvestorDashboard'));
const DeveloperDashboard    = lazy(() => import('./pages/dashboards/DeveloperDashboard'));
const ProjectDevHub         = lazy(() => import('./pages/dashboards/ProjectDevHub'));
const GovernmentDashboard   = lazy(() => import('./pages/dashboards/GovernmentDashboard'));
const AdminPanel            = lazy(() => import('./pages/admin/AdminPanel'));

// --- HOME ---
const Home = () => <HeroSection />;

// Simple full-page loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#F1F1F1]">
    <div className="w-8 h-8 border-4 border-[#08292f] border-t-transparent rounded-full animate-spin" />
  </div>
);

/* --------------------------------------------------
   Private Route Guard
--------------------------------------------------- */
function PrivateRoute({ children, proOnly = false }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (proOnly) {
    if (user.tier !== 'pro') {
      return (
        <div className="relative w-full h-screen overflow-hidden font-sans">
          <div className="w-full h-full blur-md pointer-events-none select-none">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm z-50">
            <div className="max-w-sm w-full mx-4 bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#FFF7ED] border-2 border-[#fed7aa] flex items-center justify-center mx-auto mb-5 text-3xl">
                🔒
              </div>
              <h2 className="text-xl font-bold text-[#0F172A] mb-2">Access Restricted</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                For more access contact{' '}
                <a href="mailto:info@sylithe.com" className="text-[#08292f] font-semibold underline">
                  info@sylithe.com
                </a>
              </p>
              <a
                href="mailto:info@sylithe.com?subject=Request for Full Access - Sylithe"
                className="block w-full bg-[#08292f] text-white py-3 rounded-xl font-bold hover:bg-[#062125] transition-all shadow-md mb-3 text-sm"
              >
                Contact info@sylithe.com
              </a>
              <a
                href="/projects"
                className="block w-full border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all text-sm"
              >
                Back to Project Registry
              </a>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
}

/* --------------------------------------------------
   Layout wrapper (controls Navbar / Footer visibility)
--------------------------------------------------- */
function Layout({ children }) {
  const location = useLocation();
  const bannerRef = React.useRef(null);
  const [bannerH, setBannerH] = React.useState(0);

  const isFullScreenApp =
    location.pathname === '/chm-verification' ||
    location.pathname === '/signup' ||
    location.pathname === '/dashboard' ||
    location.pathname === '/projects' ||
    location.pathname.startsWith('/dashboard/') ||
    location.pathname.startsWith('/admin') ||
    location.pathname === '/dashboard/project-hub' ||
    location.pathname === '/tree';

  const showBanner = !isFullScreenApp;

  // Measure banner height so the fixed navbar + page content can sit below it.
  // The banner wraps to multiple lines on mobile, so a static offset won't do.
  React.useEffect(() => {
    if (!showBanner) { setBannerH(0); return; }
    const el = bannerRef.current;
    if (!el) return;
    const update = () => setBannerH(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showBanner]);

  return (
    <div className="relative min-h-screen w-full font-sans bg-[#F1F1F1] flex flex-col">
      {showBanner && (
        <div ref={bannerRef} className="fixed top-0 left-0 right-0 z-[60]">
          <AnnouncementBanner />
        </div>
      )}
      {!isFullScreenApp && <Navbar topOffset={bannerH} />}
      <div className="flex-grow" style={showBanner ? { paddingTop: bannerH } : undefined}>
        {children}
      </div>
      {!isFullScreenApp && <Footer />}
    </div>
  );
}

/* --------------------------------------------------
   Scroll To Top Utility
--------------------------------------------------- */
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/* --------------------------------------------------
   APP
--------------------------------------------------- */
function App() {
  return (
    <AuthProvider>
      <AntiInspect />
      <Router>
        <ScrollToTop />
        <Layout>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>

                {/* --- GLOBAL ROUTES --- */}
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />

                {/* --- METHODOLOGY ROUTES --- */}
                <Route path="/methodology/lulc" element={<LulcClassification />} />
                <Route path="/methodology/chm" element={<ChmModel />} />
                <Route path="/methodology/dcab" element={<DcabModel />} />
                <Route path="/methodology/agb" element={<AgbCalculation />} />

                {/* --- PROJECT TYPES --- */}
                <Route path="/project-types/biochar" element={<BiocharCarbonRemoval />} />
                <Route path="/project-types/arr" element={<ArrCarbonProjects />} />
                <Route path="/project-types/redd" element={<ReddPlus />} />

                {/* --- ABOUT US --- */}
                <Route path="/about" element={<AboutUs />} />

                {/* --- PLATFORM --- */}
                <Route path="/platform" element={<Platform />} />

                {/* --- INSIGHTS --- */}
                <Route path="/insights" element={<Insights />} />
                <Route path="/insights/:slug" element={<BlogPost />} />

                {/* --- WHAT WE OFFER --- */}
                <Route path="/what-we-offer" element={<WhatWeOffer />} />

                {/* --- FOR BUYERS --- */}
                <Route path="/for-buyers" element={<ForBuyers />} />

                {/* --- PUBLIC TREE PROFILE (QR SCAN) --- */}
                <Route path="/tree" element={<TreeProfile />} />

                {/* --- PROTECTED ROUTES --- */}
                <Route path="/projects" element={<PrivateRoute><ProjectsRegistry /></PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute proOnly><Dashboard /></PrivateRoute>} />
                <Route path="/chm-verification" element={<PrivateRoute proOnly><ChmDashboard /></PrivateRoute>} />

                {/* Stakeholder Dashboards */}
                <Route path="/dashboard/corporate" element={<PrivateRoute proOnly><CorporateDashboard /></PrivateRoute>} />
                <Route path="/dashboard/investor" element={<PrivateRoute proOnly><InvestorDashboard /></PrivateRoute>} />
                <Route path="/dashboard/developer" element={<PrivateRoute><DeveloperDashboard /></PrivateRoute>} />
                <Route path="/dashboard/government" element={<PrivateRoute proOnly><GovernmentDashboard /></PrivateRoute>} />
                <Route path="/dashboard/project-hub" element={<PrivateRoute><ProjectDevHub /></PrivateRoute>} />

                {/* --- ADMIN --- */}
                <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />

                {/* --- LEGAL ROUTES --- */}
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />

              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
