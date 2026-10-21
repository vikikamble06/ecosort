import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JudgeDemoBar } from './components/JudgeDemoBar';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';

import { LandingPage } from './pages/LandingPage';
import { ScannerPage } from './pages/ScannerPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { RecyclingLocatorPage } from './pages/RecyclingLocatorPage';
import { PickupSchedulerPage } from './pages/PickupSchedulerPage';
import { ImpactPage } from './pages/ImpactPage';
import { WasteHistoryPage } from './pages/WasteHistoryPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage onNavigate={setActiveTab} />;
      case 'scanner':
        return <ScannerPage onNavigate={setActiveTab} />;
      case 'knowledge':
        return <KnowledgeBasePage onNavigate={setActiveTab} />;
      case 'locator':
        return <RecyclingLocatorPage onNavigate={setActiveTab} />;
      case 'pickup':
        return <PickupSchedulerPage onNavigate={setActiveTab} />;
      case 'impact':
        return <ImpactPage onNavigate={setActiveTab} />;
      case 'history':
        return <WasteHistoryPage onNavigate={setActiveTab} />;
      case 'admin':
        return <AdminDashboardPage onNavigate={setActiveTab} />;
      default:
        return <LandingPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9] text-[#111827]">
      {/* Competition Judge Walkthrough Bar */}
      <JudgeDemoBar onNavigate={setActiveTab} activeTab={activeTab} />

      {/* Main Responsive Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Active Page View */}
      <main className="flex-1 flex flex-col">
        {renderActivePage()}
      </main>

      {/* Authentication Modal */}
      <AuthModal />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
