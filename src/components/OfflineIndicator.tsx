import React from 'react';
import { WifiOff, CloudCheck } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface Props {
  lang?: 'ne' | 'en';
}

export const OfflineIndicator: React.FC<Props> = ({ lang = 'ne' }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600/95 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white shadow-xl border border-amber-400/40 animate-bounce duration-1000">
      <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
      <div>
        <p className="font-bold">
          {lang === 'ne' ? 'अफलाइन मोड (Offline Mode)' : 'Offline Mode Active'}
        </p>
        <p className="text-[11px] text-amber-100 font-normal">
          {lang === 'ne' 
            ? 'स्थानीय सुरक्षित डाटाबाट चल्दैछ। नयाँ निर्णयहरू अनलाइन हुनासाथ स्वतः सिंक हुनेछ।'
            : 'Working from offline cache. Changes will auto-sync when connected.'}
        </p>
      </div>
    </div>
  );
};
