import React from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { NoBrandGate } from './components/layout/NoBrandGate';
import { Bot } from 'lucide-react';

// Feature Modules (Modular Architecture)
import { DashboardModule } from './features/dashboard/DashboardModule';
import { BrandDnaModule } from './features/brandDna/BrandDnaModule';
import { ScraperOverlayModal } from './features/brandDna/ScraperOverlayModal';
import { StrategyModule } from './features/strategy/StrategyModule';
import { SeoModule } from './features/seo/SeoModule';
import { CalendarModule } from './features/calendar/CalendarModule';
import { ContentStudioModule } from './features/contentStudio/ContentStudioModule';
import { AIWebsiteBuilderModule } from './features/websiteBuilder/AIWebsiteBuilderModule';
import { QuickPostModal } from './features/contentStudio/QuickPostModal';
import { CampaignBuilderModule } from './features/campaigns/CampaignBuilderModule';
import { CreativeStudioModule } from './features/creativeStudio/CreativeStudioModule';
import { AssetLibraryModule } from './features/assetLibrary/AssetLibraryModule';
import { ApprovalsDeskModule } from './features/approvals/ApprovalsDeskModule';
import { AnalyticsModule } from './features/analytics/AnalyticsModule';
import { TeamRbacModule } from './features/teamRbac/TeamRbacModule';
import { SettingsBillingModule } from './features/settingsBilling/SettingsBillingModule';
import { SettingsModal } from './features/settingsBilling/SettingsModal';
import { AISAAssistantDrawer } from './features/aisaAssistant/AISAAssistantDrawer';
import { Login } from './features/auth/Login';
import { AdminDashboardModule } from './features/admin/AdminDashboard';
import { AdminLayout } from './components/layout/AdminLayout';
import { LandingPage } from './features/landing/LandingPage';

import { CustomPopupModal } from './components/modals/CustomPopupModal';
import { CustomToastContainer } from './components/modals/CustomToastContainer';

import { PlanGate } from './components/layout/PlanGate';

const MainContent = () => {
  const workspace = useWorkspace() || {};
  const {
    activeModule = 'landing',
    isAISAAssistantOpen = false,
    setIsAISAAssistantOpen = () => {},
    user = null,
    loginUser = () => {},
    customAlert = null,
    closeCustomAlert = () => {},
    toast = null,
    closeToast = () => {},
    activeWorkspace = null,
    isMobileMenuOpen = false
  } = workspace;

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }

    if (!user && activeModule !== 'landing' && activeModule !== 'landingpage' && window.location.pathname !== '/sign-in-create-account') {
      window.history.replaceState({ module: 'login' }, '', '/sign-in-create-account');
    }
  }, [activeModule, user]);

  if (activeModule === 'landing' || activeModule === 'landingpage') {
    return <LandingPage />;
  }

  if (!user) {
    return <Login onLoginSuccess={loginUser} />;
  }

  // If the user is our dedicated Super Admin, render the entirely separate admin flow
  if (user.role === 'SuperAdmin') {
    return <AdminLayout />;
  }

  const isWebsiteBuilder = ['websiteBuilder', 'websitebuilder', 'builder'].includes(activeModule);
  const userPlanNorm = (user?.plan || activeWorkspace?.subscriptionTier || 'agency_pro').toLowerCase();
  const isStarterUser = userPlanNorm === 'starter' || userPlanNorm === 'base' || userPlanNorm === 'free';

  if (isWebsiteBuilder && !isStarterUser) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#070A11] text-slate-100">
        <AIWebsiteBuilderModule />
      </div>
    );
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <NoBrandGate moduleName="Dashboard">
            <DashboardModule />
          </NoBrandGate>
        );
      case 'brands': return <BrandDnaModule />;
      case 'strategy':
        return (
          <NoBrandGate moduleName="Marketing Strategy & Roadmap">
            <StrategyModule />
          </NoBrandGate>
        );
      case 'seo':
        return (
          <NoBrandGate moduleName="SEO Intelligence & Brief Builder">
            <SeoModule />
          </NoBrandGate>
        );
      case 'calendar':
        return (
          <NoBrandGate moduleName="Content Calendar">
            <CalendarModule />
          </NoBrandGate>
        );
      case 'studio':
        return (
          <NoBrandGate moduleName="Content Studio">
            <ContentStudioModule />
          </NoBrandGate>
        );
      case 'websiteBuilder':
      case 'websitebuilder':
      case 'builder':
        return (
          <PlanGate moduleName="AI Website Builder" moduleId="websiteBuilder">
            <NoBrandGate moduleName="AI Website Builder">
              <AIWebsiteBuilderModule />
            </NoBrandGate>
          </PlanGate>
        );
      case 'campaigns':
        return (
          <NoBrandGate moduleName="Campaign Builder">
            <CampaignBuilderModule />
          </NoBrandGate>
        );
      case 'creative':
      case 'creativeStudio':
        return (
          <NoBrandGate moduleName="Creative Studio">
            <CreativeStudioModule />
          </NoBrandGate>
        );
      case 'assets':
        return (
          <NoBrandGate moduleName="Asset Library">
            <AssetLibraryModule />
          </NoBrandGate>
        );
      case 'approvals':
        return (
          <PlanGate moduleName="Approvals Desk" moduleId="approvals">
            <NoBrandGate moduleName="Approvals Desk">
              <ApprovalsDeskModule />
            </NoBrandGate>
          </PlanGate>
        );
      case 'analytics':
        return (
          <NoBrandGate moduleName="Analytics">
            <AnalyticsModule />
          </NoBrandGate>
        );
      case 'team': return <TeamRbacModule />;
      case 'pricing':
      case 'settings': return <SettingsBillingModule />;
      case 'adminDashboard': return <AdminDashboardModule />;
      default: return <DashboardModule />;
    }
  };

  return (
    <div className="flex h-screen aisa-dashboard-bg text-slate-900 dark:text-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header />
        <main className="p-2.5 sm:p-4 lg:p-6 flex-1 overflow-y-auto overflow-x-hidden w-full max-w-[1600px] mx-auto">
          <div key={activeModule} className="animate-in fade-in duration-200">
            {renderModule()}
          </div>
        </main>
      </div>

      {/* Feature Modals & Overlay Drawers */}
      <QuickPostModal />
      <ScraperOverlayModal />
      <AISAAssistantDrawer />
      <SettingsModal />
      <CustomPopupModal alertState={customAlert} onClose={closeCustomAlert} />
      <CustomToastContainer toastState={toast} onClose={closeToast} />

      {/* Floating AISA Assistant Toggle Button (Persistently mounted, zero-mount lag) */}
      {!isAISAAssistantOpen && (
        <button
          onClick={() => setIsAISAAssistantOpen(true)}
          className={`fixed bottom-4 right-4 sm:bottom-8 sm:right-10 z-30 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group ${
            isMobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
          }`}
          title="Open AI Ads™ Chatbot Assistant"
        >
          <img
            src="/aisa_brain_logo_hd.png?v=3"
            alt="AI Ads™ Chatbot Assistant"
            className="w-full h-full object-contain animate-brain-float transition-all"
          />
        </button>
      )}
    </div>
  );
};

export default function App() {
  return (
    <WorkspaceProvider>
      <MainContent />
    </WorkspaceProvider>
  );
}
