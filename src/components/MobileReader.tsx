import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Copy, 
  Check, 
  Share2, 
  Lock,
  LayoutGrid,
  BookOpen,
  ArrowRight,
  X,
  FileText
} from 'lucide-react';
import { GazetteData, GazetteRuleItem } from '../data/niyamawaliData';
import { PWAInstallButton } from './PWAInstallButton';
import { AboutPrivacyModal } from './AboutPrivacyModal';

interface Props {
  data: GazetteData;
  onOpenAdmin?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  textScale: number;
  onIncreaseText: () => void;
  onDecreaseText: () => void;
}

interface FlattenedRule extends GazetteRuleItem {
  chapter_number: string;
  chapter_title: string;
  globalIndex: number;
}

export const MobileReader: React.FC<Props> = ({
  data,
  onOpenAdmin,
  theme,
  onToggleTheme,
  textScale,
  onIncreaseText,
  onDecreaseText
}) => {
  // Flatten all rules across chapters into a single 0-indexed list for effortless 1-by-1 navigation
  const allRules: FlattenedRule[] = useMemo(() => {
    const list: FlattenedRule[] = [];
    let idx = 0;
    data.chapters.forEach(ch => {
      ch.rules.forEach(r => {
        list.push({
          ...r,
          chapter_number: ch.chapter_number,
          chapter_title: ch.chapter_title,
          globalIndex: idx
        });
        idx++;
      });
    });
    return list;
  }, [data]);

  // View Mode: 'dashboard' (Chapter Cards) or 'rule' (Single Rule Screen)
  const [viewMode, setViewMode] = useState<'dashboard' | 'rule'>('dashboard');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Bookmarks in localStorage
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('niyamawali_bookmarks_list');
      return saved ? JSON.parse(saved) : ['१', '२', '४', '५', '६', '१२', '२२'];
    } catch {
      return ['१', '२', '४', '५', '६', '१२', '२२'];
    }
  });

  const currentRule = allRules[currentIndex] || allRules[0];
  const totalRules = allRules.length;
  const isBookmarked = bookmarks.includes(currentRule?.rule_number || '');

  const toggleBookmark = () => {
    if (!currentRule) return;
    const rNum = currentRule.rule_number;
    setBookmarks(prev => {
      const updated = prev.includes(rNum) ? prev.filter(x => x !== rNum) : [...prev, rNum];
      try {
        localStorage.setItem('niyamawali_bookmarks_list', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  // Keyboard Navigation (ArrowLeft / ArrowRight) in rule view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'rule') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalRules, viewMode]);

  // Touch Swipe gestures for smooth mobile navigation
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (viewMode !== 'rule') return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (viewMode !== 'rule' || touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    touchStartX.current = null;
  };

  const goToNext = () => {
    if (currentIndex < totalRules - 1) {
      setCurrentIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openRuleByIndex = (index: number) => {
    setCurrentIndex(index);
    setViewMode('rule');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openChapterFirstRule = (chapterNumber: string) => {
    const foundIdx = allRules.findIndex(r => r.chapter_number === chapterNumber);
    if (foundIdx !== -1) {
      openRuleByIndex(foundIdx);
    }
  };

  const handleCopy = () => {
    if (!currentRule) return;
    let text = `[नियम ${currentRule.rule_number}: ${currentRule.rule_title}]\n`;
    if (currentRule.content) text += `${currentRule.content}\n`;
    if (currentRule.sub_rules) text += currentRule.sub_rules.join('\n') + '\n';
    if (currentRule.definitions) {
      currentRule.definitions.forEach(d => {
        text += `• ${d.key}: ${d.description}\n`;
      });
    }
    text += `\n(सरकारी निर्णय प्रक्रिया (सरलीकरण तथा डिजिटल बनाउने) सम्बन्धी नियमावली, २०८३)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!currentRule) return;
    const text = `नियम ${currentRule.rule_number}: ${currentRule.rule_title}\n\nसरकारी निर्णय प्रक्रिया नियमावली, २०८३`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentRule.rule_title,
          text,
          url: window.location.href,
        });
      } catch (e) {}
    } else {
      handleCopy();
    }
  };

  // Search Results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return allRules.filter(r => {
      const inNum = r.rule_number.includes(q);
      const inTitle = r.rule_title.toLowerCase().includes(q);
      const inContent = r.content?.toLowerCase().includes(q) || false;
      const inSubs = r.sub_rules?.some(s => s.toLowerCase().includes(q)) || false;
      const inDefs = r.definitions?.some(d => d.key.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)) || false;
      return inNum || inTitle || inContent || inSubs || inDefs;
    });
  }, [allRules, searchQuery]);

  return (
    <div 
      className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* Top Header Bar */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md px-2.5 sm:px-6 py-2 flex items-center justify-between gap-1.5 sm:gap-3 select-none w-full max-w-full overflow-hidden ${
        theme === 'dark' ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200 shadow-xs'
      }`}>
        
        {/* App Title & View Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-shrink">
          <div 
            onClick={() => setViewMode('dashboard')}
            className="px-2 sm:px-2.5 py-1 rounded-lg bg-[#003893] text-white font-black text-[11px] sm:text-xs tracking-tight shadow-xs hover:brightness-110 active:scale-95 transition cursor-pointer select-none flex-shrink-0"
            title="e-Nirnaya ड्यासबोर्ड"
          >
            e-Nirnaya
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xs sm:text-sm font-extrabold tracking-tight truncate max-w-[90px] min-[380px]:max-w-[130px] sm:max-w-xs md:max-w-md">
              {data.title}
            </h1>
            <p className="text-[10px] font-semibold text-red-600 dark:text-red-400 truncate">
              {viewMode === 'dashboard' 
                ? '५ परिच्छेद, ५१ नियम' 
                : `नियम ${currentRule?.rule_number} / ${totalRules}`}
            </p>
          </div>
        </div>

        {/* Controls: Dashboard Switch, Search, A- A+, Theme */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          
          {/* Dashboard / Rule Mode Switcher */}
          <button
            onClick={() => setViewMode(viewMode === 'dashboard' ? 'rule' : 'dashboard')}
            className={`flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer flex-shrink-0 ${
              viewMode === 'dashboard'
                ? 'bg-red-700 text-white border-red-700 shadow-xs'
                : theme === 'dark'
                ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title={viewMode === 'dashboard' ? 'नियम पठन मोड' : 'परिच्छेद ड्यासबोर्ड'}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {viewMode === 'dashboard' ? 'नियम पढ्नुहोस्' : 'ड्यासबोर्ड'}
            </span>
          </button>

          {/* Search Button */}
          <button
            onClick={() => setShowSearchModal(true)}
            className={`p-1.5 rounded-lg border text-xs transition cursor-pointer flex-shrink-0 ${
              theme === 'dark' 
                ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200' 
                : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="नियम खोज्नुहोस्"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Text Size A- A+ */}
          <div className={`flex items-center rounded-lg border text-xs font-bold flex-shrink-0 ${
            theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100'
          }`}>
            <button
              onClick={onDecreaseText}
              className="px-1.5 py-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-l-lg transition cursor-pointer text-[11px]"
              title="अक्षर सानो (A-)"
            >
              A-
            </button>
            <span className="text-[10px] opacity-40">|</span>
            <button
              onClick={onIncreaseText}
              className="px-1.5 py-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-r-lg transition cursor-pointer text-[11px]"
              title="अक्षर ठूलो (A+)"
            >
              A+
            </button>
          </div>

          {/* Color Theme: Light / Dark Only */}
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded-lg border text-xs transition cursor-pointer flex-shrink-0 ${
              theme === 'dark'
                ? 'border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700'
                : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title={theme === 'dark' ? 'उज्यालो मोड (Light)' : 'रात्री मोड (Dark)'}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

        </div>

      </header>

      {/* DASHBOARD VIEW: परिच्छेद कार्डहरू (Chapter Cards) */}
      {viewMode === 'dashboard' && (
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-6 space-y-5 animate-in fade-in duration-200">
          
          {/* Gazette Banner Card */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-900'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-current/10">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#003893] text-white font-black text-[11px] sm:text-xs tracking-tight shadow-xs select-none">
                e-Nirnaya
              </span>
              <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
                <span className="opacity-75">नेराप: <strong>{data.published_date}</strong> (नं. {data.gazette_number})</span>
                <span className="opacity-30">|</span>
                <button
                  onClick={() => setShowAboutModal(true)}
                  className="font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                  title="हाम्रो बारेमा र गोपनीयता नीति"
                >
                  About & Privacy
                </button>
              </div>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-red-700 dark:text-red-400">
              {data.title}
            </h2>
            <p className="mt-1 text-xs sm:text-sm opacity-90 italic">
              "{data.preamble}"
            </p>
          </div>

          {/* Dashboard Title & Quick Stats */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-sm sm:text-base font-extrabold tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-red-600" />
              <span>नियमावलीका परिच्छेदहरू (Chapters Overview)</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20">
              कुल ५१ नियमहरू
            </span>
          </div>

          {/* 5 Chapter Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.chapters.map((chapter) => {
              const ruleCount = chapter.rules.length;
              const firstRule = chapter.rules[0]?.rule_number;
              const lastRule = chapter.rules[chapter.rules.length - 1]?.rule_number;

              return (
                <div
                  key={chapter.chapter_number}
                  className={`rounded-2xl border p-4 sm:p-5 transition hover:scale-[1.01] hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3 ${
                    theme === 'dark'
                      ? 'bg-slate-900/90 border-slate-800 hover:border-red-500/50'
                      : 'bg-white border-slate-200 hover:border-red-300 shadow-xs'
                  }`}
                  onClick={() => openChapterFirstRule(chapter.chapter_number)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-red-700 text-white shadow-2xs">
                        परिच्छेद-{chapter.chapter_number}
                      </span>
                      <span className="text-xs font-semibold opacity-70">
                        नियम {firstRule} देखि {lastRule} ({ruleCount} नियम)
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold tracking-tight">
                      {chapter.chapter_title}
                    </h4>

                    {/* Preview of rules inside */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {chapter.rules.slice(0, 5).map((r) => (
                        <button
                          key={r.rule_number}
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetIdx = allRules.findIndex(x => x.rule_number === r.rule_number);
                            if (targetIdx !== -1) openRuleByIndex(targetIdx);
                          }}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition cursor-pointer truncate max-w-[200px] ${
                            theme === 'dark'
                              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-red-700 hover:text-white'
                              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-red-600 hover:text-white'
                          }`}
                          title={`नियम ${r.rule_number}: ${r.rule_title}`}
                        >
                          नियम {r.rule_number}: {r.rule_title}
                        </button>
                      ))}
                      {chapter.rules.length > 5 && (
                        <span className="text-[11px] font-semibold opacity-60 px-1.5 py-0.5">
                          + थप {chapter.rules.length - 5} वटा...
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-current/10 flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400">
                    <span>यो परिच्छेद पढ्नुहोस्</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dashboard Footer with About & Privacy */}
          <footer className="pt-6 pb-8 border-t border-current/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-75">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#003893] text-white font-black text-[10px]">
                e-Nirnaya
              </span>
              <span>नेपाल सरकार | डिजिटल निर्णय नियमावली, २०८३</span>
            </div>
            <button
              onClick={() => setShowAboutModal(true)}
              className="font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <span>About & Privacy (हाम्रो बारेमा र गोपनीयता)</span>
            </button>
          </footer>

        </main>
      )}

      {/* SINGLE RULE VIEW: Screen मा एउटा नियम देखाउने (< > Navigation) */}
      {viewMode === 'rule' && (
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 flex flex-col justify-start animate-in fade-in duration-200">
          
          {/* Chapter Header Pill & Back to Dashboard button */}
          <div className="flex items-center justify-between text-xs mb-3">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold border transition cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-red-400 hover:bg-slate-800'
                  : 'bg-red-50 border-red-200 text-red-900 hover:bg-red-100'
              }`}
              title="परिच्छेद ड्यासबोर्डमा फर्कनुहोस्"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>परिच्छेद-{currentRule?.chapter_number}: {currentRule?.chapter_title}</span>
            </button>

            <span className="text-[11px] font-semibold opacity-60">
              नियम {currentIndex + 1} / {totalRules}
            </span>
          </div>

          {/* Preamble Card if on Rule 1 */}
          {currentIndex === 0 && (
            <div className={`mb-4 p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
            }`}>
              <p className="font-semibold text-red-600 dark:text-red-400 mb-1">
                नेपाल राजपत्र मिति: {data.published_date} (नं. {data.gazette_number})
              </p>
              <p className="italic">"{data.preamble}"</p>
            </div>
          )}

          {/* Single Rule Card Container */}
          {currentRule && (
            <div className={`rounded-2xl border p-5 sm:p-7 shadow-xs space-y-4 flex-1 transition-all ${
              theme === 'dark' 
                ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-slate-950/40' 
                : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
            }`}>
              
              {/* Rule Header Bar with Number & Tools */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-current/10">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-red-700 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
                    {currentRule.rule_number}
                  </span>
                  <h2 
                    className="font-bold tracking-tight leading-snug"
                    style={{ fontSize: `${1.15 * textScale}rem` }}
                  >
                    {currentRule.rule_title}
                  </h2>
                </div>

                {/* Action Icons: Bookmark, Copy, Share */}
                <div className="flex items-center gap-1 flex-shrink-0 opacity-80">
                  <button
                    onClick={toggleBookmark}
                    className={`p-1.5 rounded-lg hover:bg-current/10 transition cursor-pointer ${
                      isBookmarked ? 'text-amber-500 fill-amber-500' : ''
                    }`}
                    title="बुकमार्क"
                  >
                    {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-500" /> : <Bookmark className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-current/10 transition cursor-pointer"
                    title="नियम कपी गर्नुहोस्"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-1.5 rounded-lg hover:bg-current/10 transition cursor-pointer"
                    title="शेयर"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rule Body with scalable text size */}
              <div 
                className="space-y-3.5 leading-relaxed font-sans"
                style={{ fontSize: `${textScale}rem` }}
              >
                
                {/* Content text */}
                {currentRule.content && (
                  <p className="whitespace-pre-line leading-relaxed font-normal opacity-95">
                    {currentRule.content}
                  </p>
                )}

                {/* Sub-rules list */}
                {currentRule.sub_rules && currentRule.sub_rules.length > 0 && (
                  <div className="space-y-2.5">
                    {currentRule.sub_rules.map((sub, idx) => (
                      <div 
                        key={idx}
                        className={`p-3.5 rounded-xl border leading-relaxed ${
                          theme === 'dark' 
                            ? 'bg-slate-800/60 border-slate-700/60 text-slate-200' 
                            : 'bg-slate-50 border-slate-200/80 text-slate-800'
                        }`}
                      >
                        {sub}
                      </div>
                    ))}
                  </div>
                )}

                {/* Definitions list (Rule 2) */}
                {currentRule.definitions && currentRule.definitions.length > 0 && (
                  <div className="space-y-2.5">
                    {currentRule.definitions.map((def, idx) => (
                      <div 
                        key={idx}
                        className={`p-3.5 rounded-xl border space-y-1 ${
                          theme === 'dark' 
                            ? 'bg-slate-800/60 border-slate-700/60 text-slate-200' 
                            : 'bg-slate-50 border-slate-200/80 text-slate-800'
                        }`}
                      >
                        <div className="font-extrabold text-red-600 dark:text-red-400">
                          {def.key} :
                        </div>
                        <p className="opacity-90 leading-relaxed font-normal">
                          {def.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tables if any (Rule 29, 30) */}
                {currentRule.table && (
                  <div className="overflow-x-auto pt-1">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse rounded-xl overflow-hidden border border-current/20">
                      <thead className="bg-current/10 font-bold">
                        <tr>
                          {currentRule.table.headers.map((h, hIdx) => (
                            <th key={hIdx} className="p-2.5 border-b border-current/20">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-current/10">
                        {currentRule.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-current/5">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2.5 align-top">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* Rule View Sub-Footer */}
          <div className="mt-3 pt-3 border-t border-current/10 flex items-center justify-between text-[11px] opacity-70">
            <span>e-Nirnaya | नेपाल राजपत्र २०८३</span>
            <button
              onClick={() => setShowAboutModal(true)}
              className="font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
            >
              About & Privacy
            </button>
          </div>

        </main>
      )}

      {/* Bottom Fixed Navigation Bar (< नियम ...   नियम ... >) - ONLY shown in rule reading view */}
      {viewMode === 'rule' && (() => {
        const prevRule = allRules[currentIndex - 1];
        const nextRule = allRules[currentIndex + 1];

        return (
          <footer className={`sticky bottom-0 z-30 border-t backdrop-blur-md px-3 sm:px-6 py-2.5 select-none ${
            theme === 'dark' ? 'bg-slate-900/95 border-slate-800 shadow-xl' : 'bg-white/95 border-slate-200 shadow-lg'
          }`}>
            <div className="max-w-3xl mx-auto grid grid-cols-2 gap-2 sm:gap-3">
              
              {/* Previous Button (< नियम ...) */}
              {prevRule ? (
                <button
                  onClick={goToPrev}
                  className={`flex items-center gap-1.5 sm:gap-2 p-2.5 sm:py-3 sm:px-3.5 rounded-xl border transition cursor-pointer text-left overflow-hidden group ${
                    theme === 'dark'
                      ? 'bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-slate-100 hover:border-slate-600'
                      : 'bg-slate-100 hover:bg-slate-200/80 border-slate-300 text-slate-800'
                  }`}
                  title={`नियम ${prevRule.rule_number}: ${prevRule.rule_title}`}
                >
                  <ChevronLeft className="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400 group-hover:-translate-x-0.5 transition-transform" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-bold truncate block leading-tight">
                      नियम {prevRule.rule_number}: {prevRule.rule_title}
                    </span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setViewMode('dashboard')}
                  className={`flex items-center gap-2 p-2.5 sm:py-3 sm:px-3.5 rounded-xl border cursor-pointer ${
                    theme === 'dark' ? 'border-slate-800 bg-slate-900 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-700'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs font-bold truncate">ड्यासबोर्डमा फर्कनुहोस्</span>
                </button>
              )}

              {/* Next Button (नियम ... >) */}
              {nextRule ? (
                <button
                  onClick={goToNext}
                  className="flex items-center justify-between gap-1.5 sm:gap-2 p-2.5 sm:py-3 sm:px-3.5 rounded-xl border border-red-700 bg-red-700 hover:bg-red-800 text-white transition cursor-pointer text-right overflow-hidden group shadow-md"
                  title={`नियम ${nextRule.rule_number}: ${nextRule.rule_title}`}
                >
                  <div className="min-w-0 flex-1 text-right">
                    <span className="text-xs sm:text-sm font-bold truncate block leading-tight">
                      नियम {nextRule.rule_number}: {nextRule.rule_title}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 flex-shrink-0 text-white group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={() => setViewMode('dashboard')}
                  className={`flex items-center justify-end gap-2 p-2.5 sm:py-3 sm:px-3.5 rounded-xl border border-red-700 bg-red-700 text-white cursor-pointer`}
                >
                  <span className="text-xs font-bold truncate">समाप्त (ड्यासबोर्ड)</span>
                  <ChevronRight className="w-5 h-5 flex-shrink-0" />
                </button>
              )}

            </div>
          </footer>
        );
      })()}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className={`w-full max-w-xl rounded-2xl border p-4 sm:p-5 shadow-2xl max-h-[85vh] flex flex-col ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            <div className="flex items-center justify-between pb-3 border-b border-current/10">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Search className="w-4 h-4 text-red-600" />
                <span>नियमहरूमा खोज्नुहोस्</span>
              </h3>
              <button 
                onClick={() => setShowSearchModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3">
              <input
                type="text"
                autoFocus
                placeholder="नियम नम्बर, परिभाषा वा शीर्षक खोज्नुहोस्..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            {/* Results list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {searchQuery && searchResults.length === 0 ? (
                <div className="p-8 text-center text-xs opacity-60">
                  कुनै नियम फेला परेन ।
                </div>
              ) : (
                searchResults.map(r => (
                  <div
                    key={r.rule_number}
                    onClick={() => {
                      openRuleByIndex(r.globalIndex);
                      setShowSearchModal(false);
                      setSearchQuery('');
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer hover:border-red-500 ${
                      theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-red-600 dark:text-red-400">नियम {r.rule_number}: {r.rule_title}</span>
                      <span className="text-[10px] opacity-60">परिच्छेद {r.chapter_number}</span>
                    </div>
                    {r.content && (
                      <p className="text-xs opacity-75 line-clamp-1 mt-1">{r.content}</p>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* About & Privacy Policy Modal */}
      <AboutPrivacyModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        theme={theme}
      />

    </div>
  );
};
