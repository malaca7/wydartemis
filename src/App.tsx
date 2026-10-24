import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ModalProvider } from './context/ModalContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PendingFeatureModal } from './components/common/PendingFeatureModal';
import { HomePage } from './pages/HomePage';
import { GameInfoPage } from './pages/GameInfoPage';
import { NewsPage } from './pages/NewsPage';
import { RankingPage } from './pages/RankingPage';
import { DownloadPage } from './pages/DownloadPage';
import { ShopPage } from './pages/ShopPage';
import { CommunityPage } from './pages/CommunityPage';
import { PlayerAreaPage } from './pages/PlayerAreaPage';

// Scroll to top helper on route navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  return (
    <ModalProvider>
      <HashRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-[#07080c] text-[#ede3cc] selection:bg-[#c99738]/30 selection:text-[#ffd978]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/o-jogo" element={<GameInfoPage />} />
              <Route path="/noticias" element={<NewsPage />} />
              <Route path="/ranking" element={<RankingPage />} />
              <Route path="/download" element={<DownloadPage />} />
              <Route path="/loja" element={<ShopPage />} />
              <Route path="/comunidade" element={<CommunityPage />} />
              <Route path="/area-jogador" element={<PlayerAreaPage />} />
              {/* Fallback to Home */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
          <PendingFeatureModal />
        </div>
      </HashRouter>
    </ModalProvider>
  );
};

export default App;
