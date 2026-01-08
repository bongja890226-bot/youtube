
import React, { useState, useCallback } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Zap, 
  Youtube, 
  RotateCcw, 
  Copy, 
  Check, 
  ArrowRight, 
  Layout, 
  Sparkles,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Lightbulb,
  FileText
} from 'lucide-react';
import { analyzeScriptAndSuggestTopics, generateNewScript } from './geminiService';
import { WorkflowStep, AnalysisResponse, GeneratedScript } from './types';

const App: React.FC = () => {
  const [viralScript, setViralScript] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [step, setStep] = useState<WorkflowStep>(WorkflowStep.INPUT_SCRIPT);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [finalScript, setFinalScript] = useState<GeneratedScript | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartAnalysis = async () => {
    if (!viralScript.trim()) {
      setError('분석할 대본을 입력해주세요.');
      return;
    }
    setError(null);
    setStep(WorkflowStep.ANALYZING);
    try {
      const data = await analyzeScriptAndSuggestTopics(viralScript);
      setAnalysisData(data);
      setStep(WorkflowStep.SELECT_TOPIC);
    } catch (err) {
      console.error(err);
      setError('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
      setStep(WorkflowStep.INPUT_SCRIPT);
    }
  };

  const handleTopicSelect = async (topic: string) => {
    if (!analysisData) return;
    setStep(WorkflowStep.GENERATING);
    try {
      const script = await generateNewScript(analysisData.analysis, topic);
      setFinalScript(script);
      setStep(WorkflowStep.RESULT);
    } catch (err) {
      console.error(err);
      setError('대본 생성 중 오류가 발생했습니다.');
      setStep(WorkflowStep.SELECT_TOPIC);
    }
  };

  const handleCopy = useCallback(() => {
    if (!finalScript) return;
    const fullText = `
제목: ${finalScript.title}
도입부(Hook): ${finalScript.hook}

${finalScript.sections.map(s => `[${s.heading}]\n${s.content}\n(연출: ${s.visualDirection})`).join('\n\n')}

마무리: ${finalScript.cta}
    `.trim();
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [finalScript]);

  const reset = () => {
    setStep(WorkflowStep.INPUT_SCRIPT);
    setViralScript('');
    setAnalysisData(null);
    setFinalScript(null);
    setCustomTopic('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <nav className="sticky top-0 z-50 glass-morphism border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-red-600 p-1.5 rounded-lg shadow-sm">
              <Youtube className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">
              바이럴튜브<span className="text-red-600">설계자</span>
            </span>
          </div>
          <button 
            onClick={reset}
            className="text-slate-500 hover:text-red-600 transition-colors flex items-center space-x-1 text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span>처음부터 다시</span>
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-12 space-x-4">
          {[
            { s: WorkflowStep.INPUT_SCRIPT, label: '대본 입력' },
            { s: WorkflowStep.SELECT_TOPIC, label: '주제 선택' },
            { s: WorkflowStep.RESULT, label: '대본 완성' }
          ].map((item, idx) => (
            <React.Fragment key={idx}>
              <div className={`flex flex-col items-center ${
                (step === item.s || (idx === 0 && step === WorkflowStep.ANALYZING) || (idx === 1 && step === WorkflowStep.GENERATING))
                ? 'text-red-600' : 'text-slate-300'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 ${
                  (step === item.s || (idx === 0 && step === WorkflowStep.ANALYZING) || (idx === 1 && step === WorkflowStep.GENERATING))
                  ? 'bg-red-600 text-white' : 'bg-slate-200'
                }`}>
                  {idx + 1}
                </div>
                <span className="text-xs font-semibold">{item.label}</span>
              </div>
              {idx < 2 && <div className="w-12 h-px bg-slate-200 mb-4"></div>}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Input */}
        {step === WorkflowStep.INPUT_SCRIPT && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-red-50 p-2 rounded-xl text-red-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">떡상한 대본을 복붙하세요</h2>
                  <p className="text-slate-500">AI가 해당 영상의 성공 구조를 낱낱이 분석합니다.</p>
                </div>
              </div>
              <textarea 
                className="w-full h-80 p-6 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 resize-none text-slate-700 bg-slate-50 transition-all text-lg leading-relaxed"
                placeholder="유튜브 영상의 스크립트나 자막 내용을 이곳에 붙여넣으세요..."
                value={viralScript}
                onChange={(e) => setViralScript(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm mt-3 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {error}</p>}
              <button 
                onClick={handleStartAnalysis}
                className="w-full mt-8 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center space-x-2 transition-all group"
              >
                <span>구조 분석 시작하기</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* Loading States */}
        {(step === WorkflowStep.ANALYZING || step === WorkflowStep.GENERATING) && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-xl font-bold text-slate-800">
              {step === WorkflowStep.ANALYZING ? '성공 공식을 분석하는 중...' : '새로운 대본을 집필하는 중...'}
            </h2>
            <p className="text-slate-500 mt-2">잠시만 기다려 주세요. 떡상의 기운을 담고 있습니다.</p>
          </div>
        )}

        {/* Step 2: Topic Selection */}
        {step === WorkflowStep.SELECT_TOPIC && analysisData && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Analysis Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-amber-500" /> 후킹 및 페이싱
                </h3>
                <div className="space-y-4 text-sm leading-relaxed text-slate-600">
                  <p><strong className="text-slate-900 block mb-1">도입부 전략:</strong> {analysisData.analysis.viralHook}</p>
                  <p><strong className="text-slate-900 block mb-1">전개 속도:</strong> {analysisData.analysis.pacingStyle}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                  <Layout className="w-4 h-4 mr-2 text-blue-500" /> 시청 지속 요소
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysisData.analysis.retentionTriggers.map((t, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-4 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysisData.analysis.structureBreakdown}>
                      <Bar dataKey="timingWeight" fill="#e2e8f0" radius={[4, 4, 0, 0]}>
                        {analysisData.analysis.structureBreakdown.map((_, i) => (
                          <Cell key={i} fill={i % 2 === 0 ? '#ef4444' : '#cbd5e1'} />
                        ))}
                      </Bar>
                      <Tooltip />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Topic Selection */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-amber-500 p-2 rounded-xl">
                  <Lightbulb className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">다음 영상 주제를 정해볼까요?</h2>
                  <p className="text-slate-400">분석된 스타일에 가장 잘 어울리는 주제들입니다.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {analysisData.suggestedTopics.map((topic, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleTopicSelect(topic)}
                    className="group bg-slate-800 hover:bg-red-600 p-4 rounded-xl text-left border border-slate-700 hover:border-red-400 transition-all flex items-center justify-between"
                  >
                    <span className="font-medium text-lg">{topic}</span>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-800">
                <p className="text-sm font-semibold text-slate-400 mb-3">또는 직접 주제 입력하기:</p>
                <div className="flex space-x-2">
                  <input 
                    type="text"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    placeholder="작성하고 싶은 나만의 주제를 입력하세요..."
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                  />
                  <button 
                    onClick={() => handleTopicSelect(customTopic)}
                    disabled={!customTopic.trim()}
                    className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {step === WorkflowStep.RESULT && finalScript && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-100 p-2 rounded-xl">
                    <FileText className="text-red-600 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl leading-none">완성된 유튜브 대본</h3>
                    <p className="text-xs text-slate-500 mt-1 italic">떡상한 영상의 구조를 완벽하게 계승했습니다.</p>
                  </div>
                </div>
                <button 
                  onClick={handleCopy}
                  className="flex items-center space-x-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '복사됨!' : '대본 전체 복사'}</span>
                </button>
              </div>

              <div className="p-8 space-y-12">
                {/* Title & Hook */}
                <div className="space-y-4">
                  <span className="px-3 py-1 bg-red-100 text-red-600 rounded text-xs font-bold tracking-widest uppercase">AI 추천 제목</span>
                  <h1 className="text-3xl font-extrabold text-slate-900">{finalScript.title}</h1>
                  
                  <div className="p-6 bg-slate-900 rounded-2xl border-l-8 border-red-600 relative overflow-hidden group">
                    <h4 className="text-red-500 text-xs font-bold uppercase tracking-widest mb-2">도입부 (HOOK)</h4>
                    <p className="text-white text-xl font-medium leading-relaxed italic">"{finalScript.hook}"</p>
                  </div>
                </div>

                {/* Sections */}
                <div className="space-y-12">
                  {finalScript.sections.map((section, idx) => (
                    <div key={idx} className="relative pl-8 border-l-2 border-slate-100 group">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-slate-200 group-hover:border-red-500 transition-colors"></div>
                      <h4 className="text-slate-900 font-bold text-xl mb-4">{section.heading}</h4>
                      <div className="space-y-4">
                        <div className="bg-slate-50 rounded-2xl p-6 text-slate-700 leading-relaxed text-lg whitespace-pre-wrap border border-slate-100 shadow-sm">
                          {section.content}
                        </div>
                        <div className="flex items-start space-x-3 bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                          <Layout className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-1">연출 가이드</span>
                            <p className="text-sm text-slate-600 italic">{section.visualDirection}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                  <h4 className="text-red-600 text-xs font-bold uppercase tracking-widest mb-2">마무리 및 CTA</h4>
                  <p className="text-slate-900 font-semibold text-lg">{finalScript.cta}</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <button 
                onClick={reset}
                className="text-slate-400 hover:text-slate-900 transition-colors font-medium text-sm flex items-center justify-center mx-auto space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>새로운 영상 기획하러 가기</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center text-slate-400 text-xs mt-10">
        <p>© 2024 바이럴튜브 설계자. 모든 분석은 Gemini 3.0 Pro 엔진에 의해 처리됩니다.</p>
      </footer>
    </div>
  );
};

export default App;
