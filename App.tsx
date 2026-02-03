
import React, { useState, useRef, useEffect } from 'react';
import { TaskType, ContentConfig } from './types';
import CustomSelect from './components/CustomSelect';
import { generateContent, verifyLanguage } from './services/geminiService';

const LANGUAGES = [
  'Italiano', 'Inglese', 'Spagnolo', 'Francese', 'Tedesco', 'Portoghese', 'Russo', 'Cinese', 'Giapponese', 'Arabo', 'Olandese', 'Polacco', 'Greco', 'Turco', 'Hindi', 'Coreano', 'Svedese', 'Norvegese'
];

const App: React.FC = () => {
  const [config, setConfig] = useState<ContentConfig>({
    task: TaskType.REWRITE,
    tone: 'Scelta AI',
    length: 'Standard',
    audience: 'Tutti',
    objective: '',
    sourceLanguage: '',
    targetLanguage: '',
    keywords: '',
    description: '',
    useEmoji: 'Scelta AI'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [isQuotaError, setIsQuotaError] = useState(false);
  
  const resultRef = useRef<HTMLDivElement>(null);
  const hasPopulatedRef = useRef(false);

  useEffect(() => {
    if (result && !isLoading && resultRef.current && !hasPopulatedRef.current) {
      resultRef.current.innerHTML = result;
      hasPopulatedRef.current = true;
    }
  }, [result, isLoading]);

  const handleOpenKeySelector = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setError(null);
      setIsQuotaError(false);
    }
  };

  const handleGenerate = async () => {
    if (!config.sourceLanguage || !config.targetLanguage) {
      setError("Seleziona entrambe le lingue prima di procedere.");
      return;
    }
    if (!config.description.trim()) {
      setError("Inserisci il testo da tradurre.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setIsQuotaError(false);
    setResult("");
    hasPopulatedRef.current = false;

    try {
      const verification = await verifyLanguage(config.description, config.sourceLanguage);
      
      if (!verification.matches) {
        setError(`La lingua del testo inserito non sembra essere ${config.sourceLanguage}. Rilevato: ${verification.detectedLanguage}. Per favore controlla la selezione.`);
        setIsLoading(false);
        return;
      }

      const text = await generateContent(config);
      setResult(text);
    } catch (err: any) {
      if (err.message === "QUOTA_EXHAUSTED") {
        setError("Hai esaurito la quota gratuita per questa operazione.");
        setIsQuotaError(true);
      } else {
        setError("Errore durante il processo. Riprova.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (resultRef.current) {
      const currentContent = resultRef.current.innerText;
      navigator.clipboard.writeText(currentContent);
      
      setShowCopyFeedback(true);
      setTimeout(() => {
        setShowCopyFeedback(false);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white pt-[60px] px-[20px] pb-20 font-['Roboto'] font-normal text-[#000000]">
      
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        
        {/* Intestazione Superiore - Solo Titolo con padding di 0px */}
        <div className="flex flex-col items-center mb-10 animate-fade-in">
          <h1 className="text-[36px] font-black text-[#000000] tracking-tighter lowercase text-center leading-tight py-0">
            che cosa vuoi tradurre?
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          
          {/* Colonna Sinistra: Input */}
          <div className="w-full lg:w-1/2 flex flex-col space-y-4">
            <div className="w-full">
              <CustomSelect
                label="Lingua di partenza"
                value={config.sourceLanguage}
                options={LANGUAGES}
                onChange={(val) => setConfig({ ...config, sourceLanguage: val })}
              />
            </div>

            <div className="relative w-full h-[455px] bg-white rounded-[18px] border border-gray-200 shadow-sm hover:border-[#701280] focus-within:border-[#701280] transition-all flex flex-col overflow-hidden">
              {!config.description && (
                <div className="absolute top-6 left-6 text-[15px] font-normal text-[#707070] pointer-events-none select-none animate-fade-in leading-relaxed">
                  Inserisci il testo da tradurre...
                </div>
              )}
              <textarea
                className="w-full flex-1 text-[#000000] focus:outline-none resize-none text-[16px] leading-relaxed bg-transparent font-normal p-6 m-0 overflow-y-auto custom-scrollbar"
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
              />
            </div>
          </div>

          {/* Colonna Destra: Output */}
          <div className="w-full lg:w-1/2 flex flex-col space-y-4 relative">
            
            {/* Notifica di copia */}
            {showCopyFeedback && (
              <div className="absolute -top-[52px] left-1/2 -translate-x-1/2 z-[9999] animate-fade-in pointer-events-none w-full max-w-[440px] px-4">
                <div className="bg-white border border-gray-100 shadow-[0_12px_45px_rgba(0,0,0,0.08)] rounded-[22px] px-6 py-4 flex items-center justify-between pointer-events-auto">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center border border-[#10b981]/10">
                      <i className="fa-solid fa-check text-[#10b981] text-[14px]"></i>
                    </div>
                    <span className="text-[16px] font-normal text-[#000000] tracking-tight">Testo copiato con successo</span>
                  </div>
                  <button 
                    onClick={() => setShowCopyFeedback(false)} 
                    className="w-8 h-8 flex items-center justify-center text-[#000000]/25 hover:text-[#000000] transition-colors"
                  >
                    <i className="fa-solid fa-xmark text-[18px]"></i>
                  </button>
                </div>
              </div>
            )}

            <div className="w-full">
              <CustomSelect
                label="Lingua di arrivo"
                value={config.targetLanguage}
                options={LANGUAGES}
                onChange={(val) => setConfig({ ...config, targetLanguage: val })}
              />
            </div>

            <div className="relative w-full h-[455px] bg-white rounded-[18px] border border-gray-200 shadow-sm transition-all flex flex-col overflow-hidden">
              {!result && !isLoading ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200 text-3xl">
                    <i className="fa-solid fa-language"></i>
                  </div>
                  <p className="text-[15px] font-normal max-w-[280px] leading-relaxed opacity-60">
                    Seleziona le lingue e scrivi il testo. La traduzione apparirà qui.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-6 pt-6 mb-4 animate-fade-in">
                    <span className="text-[12px] font-bold text-[#701280] uppercase tracking-wider">
                      {isLoading ? (
                        <span>traduzione in corso<span className="dots"></span></span>
                      ) : (
                        "Traduzione"
                      )}
                    </span>
                    
                    {result && !isLoading && (
                      <button 
                        onClick={handleCopy}
                        className="text-[#701280] hover:text-[#5a0e66] border border-[#701280]/20 transition-all text-[13px] flex items-center gap-1.5 font-medium px-4 py-1.5 rounded-[12px] hover:bg-purple-50 active:scale-95 shadow-sm"
                      >
                        <i className="fa-regular fa-copy"></i> Copia
                      </button>
                    )}
                  </div>

                  <div className="flex-1 px-6 pb-6 overflow-hidden">
                    <div 
                      ref={resultRef}
                      contentEditable={!!result && !isLoading}
                      suppressContentEditableWarning={true}
                      className={`
                        w-full h-full text-[#000000] focus:outline-none text-[16px] leading-relaxed bg-transparent font-normal p-0 m-0
                        prose prose-purple max-w-none outline-none cursor-text animate-fade-in overflow-y-auto custom-scrollbar
                        ${isLoading ? 'opacity-30 blur-[1px] pointer-events-none' : 'opacity-100'}
                      `}
                      onBlur={(e) => setResult(e.currentTarget.innerHTML)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-4">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className={`
              w-full py-5 bg-[#701280] text-[#FFFFFF] rounded-[22px] flex items-center justify-center gap-[12px] 
              font-medium text-[14px] uppercase tracking-wider transition-all duration-200 
              hover:brightness-110 active:scale-[0.99] shadow-xl shadow-purple-200/40
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isLoading ? 'animate-pulse' : ''}
            `}
          >
            {isLoading && (
              <i className="fa-solid fa-circle-notch animate-spin text-[20px]"></i>
            )}
            {isLoading ? 'Traduzione...' : 'Traduci Testo'}
          </button>

          {error && (
            <div className="p-5 bg-red-50 border border-red-100 text-red-600 rounded-[22px] flex flex-col sm:flex-row items-center justify-between gap-4 text-[14px] font-normal animate-fade-in leading-relaxed">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-circle-exclamation flex-shrink-0"></i>
                <span>{error}</span>
              </div>
              {isQuotaError && (
                <button 
                  onClick={handleOpenKeySelector}
                  className="bg-red-600 text-white px-4 py-2 rounded-[14px] text-[12px] font-bold uppercase tracking-tight hover:bg-red-700 transition-colors shadow-sm"
                >
                  Usa la tua API Key (GCP)
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default App;
