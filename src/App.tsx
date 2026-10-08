/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import WorkDetail from './pages/WorkDetail';
import NotFound from './pages/NotFound';
import { FilmGrain } from './components/ui/FilmGrain';
import { ToastProvider } from './components/ui/Toast';
import { ScrollProgress, IntroLoader, CustomCursor } from './components/public';
import { FloatingWhatsApp } from './components/public/FloatingWhatsApp';
import { useSettings } from './hooks/useSettings';
import { useWorks } from './hooks/useWorks';

// Admin code is strictly lazy-loaded in its own isolated chunk.
// The public site never imports admin code directly.
const AdminProtected = React.lazy(() => import('./pages/admin/AdminProtected'));

function AppRoutes() {
  const { settings } = useSettings();
  const { works } = useWorks();

  return (
    <>
      <Routes>
        {/* Public Home Page with Anchor Sections */}
        <Route path="/" element={<Home />} />

        {/* Work Item Detail Route */}
        <Route path="/work/:slug" element={<WorkDetail />} />

        {/* Protected Admin Area (Lazy loaded in separate chunk) */}
        <Route
          path="/admin/*"
          element={
            <Suspense
              fallback={
                <div className="min-h-screen bg-[#0B0B0C] text-[#F1EEE6] flex items-center justify-center font-mono text-xs uppercase tracking-widest text-[#8A877F]">
                  Loading Terminal...
                </div>
              }
            >
              <AdminProtected />
            </Suspense>
          }
        />

        {/* Elegant 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Floating Action WhatsApp Button (Context-aware, suppressed on Admin & Modals) */}
      <FloatingWhatsApp settings={settings} works={works} />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      {/* Intro Title Card Loader (First visit per session, skippable) */}
      <IntroLoader />

      {/* Thin Brass Scroll Progress Line */}
      <ScrollProgress />

      {/* Desktop Custom Cursor Ring ("VIEW" / "PLAY") */}
      <CustomCursor />

      {/* Global Cinematic Film Grain & Vignette Overlay */}
      <FilmGrain />

      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  );
}
