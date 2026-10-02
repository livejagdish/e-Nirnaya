import React, { useState } from 'react';
import { 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Code, 
  Sliders, 
  Plus, 
  Trash2, 
  Copy, 
  FileJson,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { GazetteData } from '../data/niyamawaliData';

interface Props {
  data: GazetteData;
  onSaveData: (newData: GazetteData) => void;
  onResetToDefault: () => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<Props> = ({
  data,
  onSaveData,
  onResetToDefault,
  onClose
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('enirnaya_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Editor State
  const [activeTab, setActiveTab] = useState<'json' | 'visual'>('json');
  const [jsonText, setJsonText] = useState(() => JSON.stringify(data, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Visual Editing State
  const [editableData, setEditableData] = useState<GazetteData>(JSON.parse(JSON.stringify(data)));
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number>(0);
  const [selectedRuleIdx, setSelectedRuleIdx] = useState<number>(0);

  // Verify password (default: admin123)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('enirnaya_admin_auth', 'true');
      setAuthError(null);
    } else {
      setAuthError('गलत पासवर्ड !');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('enirnaya_admin_auth');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Handle JSON Textarea change
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    try {
      JSON.parse(val);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  // Format / Beautify JSON
  const handleBeautify = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setJsonError(null);
    } catch (err: any) {
      setJsonError('अमान्य JSON ढाँचा: ' + err.message);
    }
  };

  // Save from JSON editor
  const handleSaveJson = () => {
    try {
      const parsed: GazetteData = JSON.parse(jsonText);
      if (!parsed.title || !parsed.chapters) {
        throw new Error('JSON मा "title" र "chapters" अनिवार्य हुनुपर्छ ।');
      }
      onSaveData(parsed);
      setEditableData(JSON.parse(JSON.stringify(parsed)));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  // Copy JSON
  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download JSON
  const handleDownloadJson = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'niyamawali_2083.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Upload JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        setJsonText(JSON.stringify(parsed, null, 2));
        setEditableData(parsed);
        setJsonError(null);
      } catch (err: any) {
        setJsonError('फाइल लोड गर्दा त्रुटि: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Save Visual Form changes
  const handleSaveVisual = () => {
    onSaveData(editableData);
    setJsonText(JSON.stringify(editableData, null, 2));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const currentChapter = editableData.chapters[selectedChapterIdx];
  const currentRule = currentChapter?.rules[selectedRuleIdx];

  // If not authenticated, show full-page ADMIN login screen (NOT a dialogbox overlay)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
        
        {/* Top bar with back to site */}
        <div className="w-full max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>मुख्य पृष्ठ</span>
          </button>
        </div>

        {/* Centered Login Card */}
        <div className="w-full max-w-sm mx-auto my-auto bg-slate-900 border border-slate-800 rounded-2xl p-7 shadow-2xl">
          
          {/* Header as requested: "ADMIN" */}
          <div className="mb-6 text-center">
            <h1 className="text-xl font-black tracking-widest text-white">
              ADMIN
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              {/* Label as requested: "PASSWORD" and blank placeholder */}
              <label className="block text-xs font-bold tracking-wider text-slate-300 mb-1.5 uppercase">
                PASSWORD
              </label>
              <input
                type="password"
                autoFocus
                required
                placeholder=""
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-400 font-medium text-center">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-xs font-bold tracking-wider uppercase text-white transition cursor-pointer shadow-md"
            >
              LOGIN
            </button>
          </form>

        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-600">
          नेपाल सरकार | ई-निर्णय नियमावली व्यवस्थापन
        </div>

      </div>
    );
  }

  // Full-page Admin Panel (NOT a dialogbox overlay)
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col animate-in fade-in duration-150">
      
      {/* Top Navbar */}
      <header className="px-4 sm:px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 flex-shrink-0 select-none">
        
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
            title="पठन पृष्ठमा फर्कनुहोस्"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">पठन पृष्ठमा फर्कनुहोस्</span>
            <span className="sm:hidden">फर्कनुहोस्</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 rounded-lg bg-[#003893] text-white font-black text-[11px] tracking-tight shadow-xs select-none">
              e-Nirnaya
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                <span>ADMIN PANEL</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-normal hidden sm:inline">
                  AUTHENTICATED
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* View Switcher & Logout */}
        <div className="flex items-center gap-2">
          
          <div className="flex bg-slate-950 rounded-xl p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => {
                setActiveTab('json');
                setJsonText(JSON.stringify(editableData, null, 2));
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'json' ? 'bg-red-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>JSON Editor</span>
            </button>

            <button
              onClick={() => {
                try {
                  const parsed = JSON.parse(jsonText);
                  setEditableData(parsed);
                  setActiveTab('visual');
                } catch (e) {
                  alert('कृपया पहिले JSON मा भएको त्रुटि सच्याउनुहोस् ।');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'visual' ? 'bg-red-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Visual Form</span>
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 transition cursor-pointer text-xs"
            title="लगआउट"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">लगआउट</span>
          </button>

        </div>

      </header>

      {/* Action Toolbar */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs flex-shrink-0">
        
        <div className="flex items-center gap-2">
          <button
            onClick={activeTab === 'json' ? handleSaveJson : handleSaveVisual}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition shadow-sm cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>परिवर्तन सुरक्षित गर्नुहोस् (Save)</span>
          </button>

          {activeTab === 'json' && (
            <button
              onClick={handleBeautify}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700 cursor-pointer"
            >
              ब्युटिफाई (Format)
            </button>
          )}

          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'कपी भयो' : 'कपी JSON'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>अपलोड JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>डाउनलोड JSON</span>
          </button>

          <button
            onClick={() => {
              if (confirm('के तपाईं राजपत्रको आधिकारिक पूर्वनिर्धारित नियमावली डाटामा रिसेट गर्न चाहनुहुन्छ?')) {
                onResetToDefault();
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-medium border border-rose-800/80 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>मूल डाटामा रिसेट</span>
          </button>
        </div>

      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="bg-emerald-950 border-b border-emerald-800 px-4 py-2 text-xs font-semibold text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>नियमावली डाटा सुरक्षित भयो ! सबै परिवर्तनहरू मुख्य पृष्ठमा अद्यावधिक भइसकेका छन् ।</span>
        </div>
      )}

      {jsonError && (
        <div className="bg-rose-950 border-b border-rose-800 px-4 py-2 text-xs font-mono text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span className="truncate">{jsonError}</span>
        </div>
      )}

      {/* Full-Height Body Container */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
        
        {/* JSON Editor Tab */}
        {activeTab === 'json' && (
          <div className="flex-1 flex flex-col">
            <div className="mb-2 text-xs text-slate-400 flex items-center justify-between">
              <span>नियमावलीको पूर्ण JSON संरचना (UTF-8 Devanagari Validated):</span>
              <span className="font-mono text-[11px] text-slate-500">
                {data.chapters.length} Chapters | 51 Rules
              </span>
            </div>
            <textarea
              value={jsonText}
              onChange={handleJsonChange}
              className="flex-1 w-full bg-slate-900 text-slate-200 font-mono text-xs sm:text-sm p-4 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600 resize-none overflow-y-auto leading-relaxed"
              spellCheck={false}
            />
          </div>
        )}

        {/* Visual Form Tab */}
        {activeTab === 'visual' && (
          <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
            
            {/* Chapters & Rules Sidebar */}
            <div className="w-full md:w-80 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col overflow-y-auto space-y-4">
              <div className="space-y-1.5">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  परिच्छेदहरू ({editableData.chapters.length})
                </span>
                <div className="space-y-1">
                  {editableData.chapters.map((ch, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => {
                        setSelectedChapterIdx(cIdx);
                        setSelectedRuleIdx(0);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold truncate transition cursor-pointer ${
                        selectedChapterIdx === cIdx ? 'bg-red-700 text-white shadow-xs' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      परिच्छेद {ch.chapter_number}: {ch.chapter_title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 space-y-1.5 pt-3 border-t border-slate-800">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  नियमहरू ({currentChapter?.rules.length || 0})
                </span>
                <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                  {currentChapter?.rules.map((r, rIdx) => (
                    <button
                      key={rIdx}
                      onClick={() => setSelectedRuleIdx(rIdx)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs truncate transition cursor-pointer ${
                        selectedRuleIdx === rIdx 
                          ? 'bg-red-600/20 text-red-300 border border-red-500/40 font-bold' 
                          : 'hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      नियम {r.rule_number}: {r.rule_title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Rule Content Form */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-y-auto space-y-4">
              {currentRule ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-slate-400 mb-1">नियम नं.</label>
                      <input
                        type="text"
                        value={currentRule.rule_number}
                        onChange={(e) => {
                          const updated = { ...editableData };
                          updated.chapters[selectedChapterIdx].rules[selectedRuleIdx].rule_number = e.target.value;
                          setEditableData(updated);
                        }}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-amber-300"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-400 mb-1">नियमको शीर्षक</label>
                      <input
                        type="text"
                        value={currentRule.rule_title}
                        onChange={(e) => {
                          const updated = { ...editableData };
                          updated.chapters[selectedChapterIdx].rules[selectedRuleIdx].rule_title = e.target.value;
                          setEditableData(updated);
                        }}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      मुख्य व्यहोरा (Content)
                    </label>
                    <textarea
                      rows={4}
                      value={currentRule.content || ''}
                      onChange={(e) => {
                        const updated = { ...editableData };
                        updated.chapters[selectedChapterIdx].rules[selectedRuleIdx].content = e.target.value;
                        setEditableData(updated);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200"
                    />
                  </div>

                  {currentRule.sub_rules && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300">
                          उपनियमहरू ({currentRule.sub_rules.length})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...editableData };
                            const sr = updated.chapters[selectedChapterIdx].rules[selectedRuleIdx].sub_rules || [];
                            sr.push(`(${sr.length + 1}) नयाँ उपनियम...`);
                            updated.chapters[selectedChapterIdx].rules[selectedRuleIdx].sub_rules = sr;
                            setEditableData(updated);
                          }}
                          className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>थप्नुहोस्</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {currentRule.sub_rules.map((sub, sIdx) => (
                          <div key={sIdx} className="flex gap-2">
                            <textarea
                              rows={2}
                              value={sub}
                              onChange={(e) => {
                                const updated = { ...editableData };
                                if (updated.chapters[selectedChapterIdx].rules[selectedRuleIdx].sub_rules) {
                                  updated.chapters[selectedChapterIdx].rules[selectedRuleIdx].sub_rules![sIdx] = e.target.value;
                                  setEditableData(updated);
                                }
                              }}
                              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = { ...editableData };
                                updated.chapters[selectedChapterIdx].rules[selectedRuleIdx].sub_rules?.splice(sIdx, 1);
                                setEditableData(updated);
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs">
                  कुनै नियम छनौट गर्नुहोस् ।
                </div>
              )}
            </div>

          </div>
        )}

      </main>

    </div>
  );
};
