import React, { useState } from 'react';
import { X, ShieldCheck, Info, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
}

export const AboutPrivacyModal: React.FC<Props> = ({ isOpen, onClose, theme }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'privacy'>('about');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-lg rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${
          theme === 'dark' 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header Bar */}
        <div className={`px-5 py-4 border-b flex items-center justify-between gap-3 ${
          theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg bg-[#003893] text-white font-black text-xs tracking-tight shadow-xs select-none">
              e-Nirnaya
            </span>
            <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
              About & Privacy
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className={`px-5 pt-3 border-b flex gap-4 text-xs sm:text-sm font-bold ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'about'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>हाम्रो बारेमा (About)</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>गोपनीयता नीति (Privacy)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm leading-relaxed">
          
          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <div className={`p-4 rounded-xl border ${
                theme === 'dark' ? 'bg-slate-800/60 border-slate-700/60' : 'bg-red-50/60 border-red-100 text-slate-800'
              }`}>
                <h4 className="font-extrabold text-sm sm:text-base text-red-700 dark:text-red-400 mb-1">
                  सरकारी निर्णय प्रक्रिया (सरलीकरण तथा डिजिटल बनाउने) सम्बन्धी नियमावली, २०८३
                </h4>
                <p className="opacity-80 text-xs">
                  नेपाल राजपत्र मिति: २०८३/०१/१२ (नेराप खण्ड ७४, संख्या ०१)
                </p>
              </div>

              <div>
                <h5 className="font-bold text-xs uppercase tracking-wider opacity-60 mb-1.5">
                  प्रणालीको उद्देश्य (System Purpose)
                </h5>
                <p className="opacity-90">
                  यो वेब एप्लिकेसन नेपाल सरकारका सम्पूर्ण मन्त्रालय, विभाग, आयोग, सचिवालय तथा मातहतका निकायहरूमा 
                  कामकारबाही, टिप्पणी, फाइल व्यवस्थापन र निर्णय प्रक्रियालाई द्रुत, कागजविहीन, पारदर्शी र 
                  आधुनिक डिजिटल प्रणालीमा रूपान्तरण गर्न जारी गरिएको आधिकारिक नियमावलीको सहज अध्ययन तथा 
                  दैनिक सन्दर्भका लागि विकास गरिएको हो ।
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <h5 className="font-bold text-xs uppercase tracking-wider opacity-60">
                  प्रमुख विशेषताहरू (Key Highlights)
                </h5>
                
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span><strong>५ परिच्छेद र ५१ नियमहरू:</strong> नियमावलीका सम्पूर्ण नियम, उपनियम र प्रष्ट्याइँहरू दुरुस्त रूपमा उपलब्ध ।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span><strong>पूर्ण रूपमा अफलाइन (Offline PWA):</strong> एक पटक लोड भएपछि इन्टरनेट नभएको अवस्थामा पनि सम्पूर्ण नियमहरू अध्ययन गर्न सकिने ।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span><strong>द्रुत खोजी (Instant Search):</strong> कुनै पनि नियम नम्बर, शब्द वा शीर्षक तत्काल खोज्न सकिने ।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span><strong>बुकमार्क र सेयर:</strong> आफूलाई आवश्यक नियम बुकमार्क गर्न वा सहकर्मीसँग कपी गरी साझा गर्न सकिने ।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span><strong>अनुकूलन (A- / A+ & Dark Mode):</strong> आँखालाई सहज हुने रात्री मोड र फन्ट साइज परिवर्तन गर्ने सुविधा ।</span>
                  </div>
                </div>
              </div>

              <div className={`p-3 rounded-xl border text-[11px] opacity-75 ${
                theme === 'dark' ? 'bg-slate-800/40 border-slate-700/40' : 'bg-slate-100 border-slate-200'
              }`}>
                <strong>कानुनी सूचना:</strong> यो एप नियमावलीको सहज पठन तथा कार्य सम्पादन सहजीकरणका लागि तयार गरिएको डिजिटल संस्करण हो। आधिकारिक कानुनी प्रयोजनका लागि नेपाल राजपत्रमा प्रकाशित मुद्रित प्रतिलाई नै प्रामाणिक मानिनेछ।
              </div>

            </div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                theme === 'dark' ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <ShieldCheck className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm">
                    १००% गोपनीयता सुरक्षित (Privacy by Design)
                  </h4>
                  <p className="text-[11px] opacity-90">
                    यस एपले तपाईंको कुनै पनि व्यक्तिगत डाटा सङ्कलन गर्दैन ।
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider opacity-60 mb-1">
                    १. कुनै व्यक्तिगत विवरण सङ्कलन हुँदैन (No Personal Data Collection)
                  </h5>
                  <p className="opacity-90">
                    यस एप प्रयोग गर्नका लागि कुनै दर्ता (Sign-up), लगइन, नाम, इमेल वा फोन नम्बर आवश्यक पर्दैन। 
                    हामी प्रयोगकर्ताको कुनै पनि व्यक्तिगत वा डिभाइस पहिचान सम्बन्धी डाटा सङ्कलन वा बाह्य सर्भरमा पठाउँदैनौं।
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider opacity-60 mb-1">
                    २. स्थानीय उपकरण भण्डारण (Local Storage Only)
                  </h5>
                  <p className="opacity-90">
                    तपाईंले चयन गर्नुभएको डार्क/लाइट थिम, फन्ट साइजको प्राथमिकता (A-/A+), र बुकमार्क गरिएका नियमहरू 
                    तपाईंकै मोबाइल वा कम्प्युटरको ब्राउजर (Local Storage) भित्र मात्र सुरक्षित रहन्छन्। 
                    ब्राउजरको क्यास मेटाएमा वा रिसेट गरेमा ती डाटा स्वतः हट्छन्।
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider opacity-60 mb-1">
                    ३. तेस्रो-पक्ष ट्र्याकिङ र विज्ञापन रहित (No Ads or Tracking)
                  </h5>
                  <p className="opacity-90">
                    यस अनुप्रयोगमा कुनै पनि तेस्रो पक्षीय विज्ञापन (Ads), व्यावसायिक एनालिटिक्स वा प्रयोगकर्ता 
                    ट्र्याक गर्ने कुकीजहरू समावेश गरिएका छैनन्। यो विशुद्ध सरकारी नियमावली पठन सेवा हो।
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider opacity-60 mb-1">
                    ४. सार्वजनिक कानुन तथा सुरक्षा (Public Legal Document)
                  </h5>
                  <p className="opacity-90">
                    नेपाल राजपत्रमा प्रकाशित सार्वजनिक कानुन तथा नियमावलीलाई सर्वसाधारण, निजामती कर्मचारी तथा 
                    अध्येताहरूका लागि खुला पहुँचयोग्य बनाइएको छ। 
                  </p>
                </div>
              </div>

              <div className={`p-3 rounded-xl border text-[11px] opacity-75 ${
                theme === 'dark' ? 'bg-slate-800/40 border-slate-700/40' : 'bg-slate-100 border-slate-200'
              }`}>
                गोपनीयता नीति सम्बन्धी थप जिज्ञासाका लागि नेपाल सरकारको सूचना प्रविधि तथा कानुनी निर्देशिका बमोजिम हुनेछ।
              </div>

            </div>
          )}

        </div>

        {/* Footer Close */}
        <div className={`px-5 py-3 border-t flex items-center justify-between gap-2 text-xs ${
          theme === 'dark' ? 'border-slate-800 bg-slate-900/50 text-slate-400' : 'border-slate-100 bg-slate-50/50 text-slate-500'
        }`}>
          <span>e-Nirnaya | डिजिटल निर्णय प्रणाली</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 font-bold text-white transition cursor-pointer shadow-xs"
          >
            बन्द गर्नुहोस्
          </button>
        </div>

      </div>
    </div>
  );
};
