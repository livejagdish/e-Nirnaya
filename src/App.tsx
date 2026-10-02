/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MobileReader } from './components/MobileReader';
import { AdminPanel } from './components/AdminPanel';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OFFICIAL_NIYAMAWALI_2083, GazetteData } from './data/niyamawaliData';

export default function App() {
  // Regulation Data with LocalStorage Persistence
  const [data, setData] = useState<GazetteData>(() => {
    try {
      const saved = localStorage.getItem('niyamawali_custom_json');
      return saved ? JSON.parse(saved) : OFFICIAL_NIYAMAWALI_2083;
    } catch {
      return OFFICIAL_NIYAMAWALI_2083;
    }
  });

  // Color Theme: Light / Dark Only
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('niyamawali_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Text Scaling: A- A+ (0.8 to 1.6 rem)
  const [textScale, setTextScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('niyamawali_text_scale');
      return saved ? parseFloat(saved) : 1.0;
    } catch {
      return 1.0;
    }
  });

  // Admin Panel modal state (also triggered by /admin or #admin)
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(() => {
    return window.location.pathname === '/admin' || window.location.hash === '#admin';
  });

  // Watch URL changes for /admin
  useEffect(() => {
    const checkAdminRoute = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        setIsAdminOpen(true);
      }
    };
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);
    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);

  const handleOpenAdmin = () => {
    setIsAdminOpen(true);
    if (window.location.pathname !== '/admin') {
      window.history.pushState(null, '', '#admin');
    }
  };

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash === '#admin') {
      window.history.pushState(null, '', window.location.pathname.replace(/\/admin\/?$/, '') || '/');
    } else if (window.location.pathname.includes('/admin')) {
      window.history.pushState(null, '', '/');
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem('niyamawali_theme', nextTheme);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleIncreaseText = () => {
    setTextScale(prev => {
      const next = Math.min(1.6, Math.round((prev + 0.1) * 10) / 10);
      try {
        localStorage.setItem('niyamawali_text_scale', next.toString());
      } catch (e) {}
      return next;
    });
  };

  const handleDecreaseText = () => {
    setTextScale(prev => {
      const next = Math.max(0.8, Math.round((prev - 0.1) * 10) / 10);
      try {
        localStorage.setItem('niyamawali_text_scale', next.toString());
      } catch (e) {}
      return next;
    });
  };

  const handleSaveData = (newData: GazetteData) => {
    setData(newData);
    try {
      localStorage.setItem('niyamawali_custom_json', JSON.stringify(newData));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const handleResetToDefault = () => {
    setData(OFFICIAL_NIYAMAWALI_2083);
    try {
      localStorage.removeItem('niyamawali_custom_json');
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  // Dedicated Full Page Admin Panel (not a dialog box or popup)
  if (isAdminOpen) {
    return (
      <AdminPanel
        data={data}
        onSaveData={handleSaveData}
        onResetToDefault={handleResetToDefault}
        onClose={handleCloseAdmin}
      />
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* 1 Rule per Screen Mobile-Optimized Reader with < > Navigation & Chapter Cards */}
      <MobileReader
        data={data}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        textScale={textScale}
        onIncreaseText={handleIncreaseText}
        onDecreaseText={handleDecreaseText}
      />

      {/* Persistent Offline PWA Indicator */}
      <OfflineIndicator lang="ne" />
    </div>
  );
}
