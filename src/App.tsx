import React, { useState, useCallback, Suspense, lazy } from 'react';
import { AnalysisResult } from './types';
import HomeScreen from './screens/HomeScreen';
import { Home, History, User, Search } from 'lucide-react';
import { cn } from './utils/cn';

// Lazy load screens to reduce initial bundle size
const ImportVideoScreen = lazy(() => import('./screens/ImportVideoScreen'));
const ProcessingScreen = lazy(() => import('./screens/ProcessingScreen'));
const AnalyticsResultScreen = lazy(() => import('./screens/AnalyticsResultScreen'));
const HistoryScreen = lazy(() => import('./screens/HistoryScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
const ThumbnailEditorScreen = lazy(() => import('./screens/ThumbnailEditorScreen'));
const ResearchScreen = lazy(() => import('./screens/ResearchScreen'));

export type Screen = 'home' | 'import' | 'processing' | 'result' | 'history' | 'profile' | 'editor' | 'research';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  const handleVideoSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setCurrentScreen('processing');
  }, []);

  const handleAnalysisComplete = useCallback((result: AnalysisResult) => {
    setCurrentResult(result);
    setHistory(prev => [result, ...prev]);
    setCurrentScreen('result');
  }, []);

  const handleSelectResult = useCallback((r: AnalysisResult) => {
    setCurrentResult(r);
    setCurrentScreen('result');
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNewAnalysis={() => setCurrentScreen('import')} recentAnalyses={history.slice(0, 3)} onSelectResult={handleSelectResult} onOpenResearch={() => setCurrentScreen('research')} />;
      case 'import':
        return <ImportVideoScreen onVideoSelect={handleVideoSelect} onBack={() => setCurrentScreen('home')} />;
      case 'processing':
        return <ProcessingScreen file={selectedFile!} onComplete={handleAnalysisComplete} />;
      case 'result':
        return <AnalyticsResultScreen result={currentResult!} onBack={() => setCurrentScreen('home')} onOpenEditor={() => setCurrentScreen('editor')} />;
      case 'history':
        return <HistoryScreen history={history} onSelectResult={handleSelectResult} />;
      case 'profile':
        return <ProfileScreen />;
      case 'editor':
        return <ThumbnailEditorScreen thumbnailBase64={currentResult!.thumbnailBase64} onBack={() => setCurrentScreen('result')} />;
      case 'research':
        return <ResearchScreen />;
      default:
        return <HomeScreen onNewAnalysis={() => setCurrentScreen('import')} recentAnalyses={history.slice(0, 3)} onSelectResult={handleSelectResult} onOpenResearch={() => setCurrentScreen('research')} />;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-bg text-text flex flex-col font-sans">
      <main className={cn("flex-1 overflow-y-auto", ['home', 'history', 'profile', 'research'].includes(currentScreen) ? "pb-20 md:pb-0" : "")}>
        <Suspense fallback={
          <div className="min-h-[100dvh] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          {renderScreen()}
        </Suspense>
      </main>

      {/* Mobile Bottom Nav */}
      {['home', 'history', 'profile', 'research'].includes(currentScreen) && (
        <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-light p-4 flex justify-around items-center md:hidden z-50">
          <NavButton icon={<Home size={24} />} label="Início" active={currentScreen === 'home'} onClick={() => setCurrentScreen('home')} />
          <NavButton icon={<Search size={24} />} label="Pesquisa" active={currentScreen === 'research'} onClick={() => setCurrentScreen('research')} />
          <NavButton icon={<History size={24} />} label="Histórico" active={currentScreen === 'history'} onClick={() => setCurrentScreen('history')} />
          <NavButton icon={<User size={24} />} label="Perfil" active={currentScreen === 'profile'} onClick={() => setCurrentScreen('profile')} />
        </nav>
      )}
    </div>
  );
}

const NavButton = React.memo(function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-colors",
        active ? "text-primary" : "text-text-muted hover:text-text"
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
});
