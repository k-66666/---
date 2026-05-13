import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Presentation, ChevronLeft, ChevronRight, Mic, Eye, Bell, Loader2, Edit3, Sparkles, Upload, Maximize2, Minimize2 } from 'lucide-react';
import { slides } from '../data/slides';
import { GoogleGenAI } from '@google/genai';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

let aiClient: GoogleGenAI | null = null;
const getAI = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "missing_api_key_on_vercel" });
  }
  return aiClient;
};

export default function PPTRehearsal() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slide = slides[currentSlideIndex];
  
  // Real-time editable slide text
  const [slideText, setSlideText] = useState(slide.guide);
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);

  const [generating, setGenerating] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<{q: string, a: string} | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAlarming, setIsAlarming] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);
  const [gettingFeedback, setGettingFeedback] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [autoInterrupt, setAutoInterrupt] = useState(true); // enabled by default
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0] && entries[0].contentRect) {
        setContainerWidth(entries[0].contentRect.width - 40); // 40px for padding
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'zh-CN';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTrans = '';
        let interimTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }
        if (finalTrans) {
          setTranscript((prev) => prev + finalTrans);
        }
        setInterimTranscript(interimTrans);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          setSpeechError("🎤 麦克风权限被拒绝，请在浏览器地址栏允许麦克风访问。如果无法打开，请点击右上角在新标签页打开本应用。");
        } else if (event.error !== 'no-speech') {
          setSpeechError(`语音识别发生错误: ${event.error}`);
        }
        setIsRecording(false);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
         // Auto stop UI state if mic ends unexpectedly
         setIsRecording(false);
         setIsListening(false);
      };
    }

    return () => {
      if (containerRef.current) resizeObserver.unobserve(containerRef.current);
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync text area when slide changes (but allows user to override it locally)
  useEffect(() => {
    setSlideText(slides[currentSlideIndex].guide);
    setShowQuestion(false);
    setCurrentQuestion(null);
    if (isRecording) {
      toggleRecording();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlideIndex]);

  // Auto interrupt logic based on transcript pauses
  useEffect(() => {
    if (autoInterrupt && isRecording && transcript.length > 20 && !gettingFeedback && !generating && !showQuestion) {
      const timer = setTimeout(() => {
        triggerDynamicInterrupt(true);
      }, 4000); // 4 seconds of silence triggers interrupt
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, interimTranscript, autoInterrupt, isRecording, generating, showQuestion]);

  const toggleRecording = () => {
    setSpeechError(null);
    if (!('webkitSpeechRecognition' in window)) {
        setSpeechError("您的浏览器不支持语音识别功能，请使用 Chrome 浏览器。");
        return;
    }
    
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      setIsListening(false);
    } else {
      setTranscript('');
      setInterimTranscript('');
      setSpeechFeedback(null);
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e: any) {
        console.error(e);
        setSpeechError(e.message || "无法启动语音识别，请检查麦克风权限。如果在此预览界面中无法工作，请尝试在新标签页中打开。");
        setIsRecording(false);
        setIsListening(false);
      }
    }
  };

  const getSpeechFeedback = async () => {
    if (!transcript.trim()) return;
    setGettingFeedback(true);
    try {
      const prompt = `你是一位专门指导学生进行毕业答辩的资深导师。
学生刚刚口头演练了这一页PPT。
【幻灯片内容/要求讲稿】：
${slideText}

【学生实际的口头汇报语音识别内容】：
"${transcript}"

请你对学生的口头汇报提供一段结构清晰的反馈。主要包括三个方面：
1. 内容覆盖度：是否讲到了核心重点，有什么遗漏或明显说错的地方。
2. 语速与流畅度反馈：根据文本推断（比如是否有太多重复词、语气词、停顿等），指出其表达的清晰度。
3. 改进建议：给出1-2点具体的改进提议。

请直接用文字返回反馈，不要加多余的markdown代码块标签。可以适当使用换行或列表。`;

      const response = await getAI().models.generateContent({
         model: 'gemini-2.5-flash',
         contents: prompt,
      });
      setSpeechFeedback(response.text);
    } catch (err) {
      setSpeechFeedback("获取反馈失败，请稍后重试。");
    } finally {
      setGettingFeedback(false);
    }
  };

  const triggerDynamicInterrupt = async (isAuto = false) => {
    const textToUse = transcript.trim() || slideText.trim();
    if (!textToUse) return;
    setGenerating(true);
    setShowQuestion(false);
    setCurrentQuestion(null);
    
    try {
        const prompt = `你现在是软件工程专业毕业答辩的评委老师。学生现在正在演示这一页内容：
【第${slide.id}页 PPT标题】：${slide.title}

${transcript.trim() ? `【学生刚刚的真实口头汇报片段】：\n"${transcript}"\n\n请认真阅读他刚刚说的话，并在他演讲的过程中突然“打断”他，提出1个相关性极强、非常具体、犀利的技术或业务难点问题（必须紧紧扣住他真实的口白）` : `【学生准备的讲稿内容】：\n"${slideText}"\n\n请针对这段讲稿的内容提出1个尖锐的答辩问题`}。
并给出一份高分对应回答参考。
务必直接输出JSON格式，禁止输出多余的文字解说或者markdown符号（如 \`\`\`json ）。
你的输出必须是合法的JSON：
{
  "q": "评委打断：...",
  "a": "应对回答思路：..."
}`;

        const response = await getAI().models.generateContent({
             model: 'gemini-2.5-flash',
             contents: prompt,
             config: { responseMimeType: "application/json" }
        });
        
        const parsed = JSON.parse(response.text);
        setCurrentQuestion(parsed);
        setShowQuestion(true);
        setShowAnswer(false);
        setIsAlarming(true);
        
        if (isRecording) {
            // Pause recording when questioned
            toggleRecording();
        }

        // Turn off physical alarm shake after 2 seconds
        setTimeout(() => setIsAlarming(false), 2000);
    } catch (error) {
        console.error(error);
        alert("获取老师动态打断提问失败，请检查API设置或者网络。");
    } finally {
        setGenerating(false);
    }
  };

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-slate-900 leading-tight">
          PPT 汇报实景推演
        </h2>
        <p className="text-slate-500 mt-2">
          系统已预置了26页大纲。<strong className="text-blue-600">您可以直接将真实PPT的演讲稿/内容粘贴到右侧文本框里，覆盖原有默认内容。</strong> 老师将完全基于您输入的实时文本进行“灵魂拷问打断”。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel: Presentation View */}
        <div className={isFullscreen ? "fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md p-4 sm:p-8 md:p-12 flex flex-col transition-all duration-300" : "lg:col-span-6 flex flex-col transition-all duration-300"}>
          <div className={`bg-slate-100 rounded-2xl border-2 overflow-hidden shadow-sm flex-1 flex flex-col min-h-[400px] ${isFullscreen ? 'border-slate-600 shadow-2xl max-w-7xl mx-auto w-full' : 'border-slate-200'}`}>
            {/* Window header */}
            <div className="bg-slate-200/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              
              <div className="flex items-center space-x-3">
                <label className="bg-white/80 hover:bg-white text-slate-600 hover:text-blue-600 p-1.5 rounded shadow-sm border border-slate-200 transition-colors focus:outline-none cursor-pointer" title="重新上传PDF">
                  <Upload className="w-4 h-4"/>
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => {
                    if (e.target.files?.[0]) {
                       setPdfFile(e.target.files[0]);
                       setCurrentSlideIndex(0);
                    }
                  }} />
                </label>
                <select 
                  value={currentSlideIndex}
                  onChange={(e) => setCurrentSlideIndex(Number(e.target.value))}
                  className="bg-white border border-slate-300 text-slate-700 text-xs sm:text-sm rounded px-2 py-1 outline-none font-medium focus:border-blue-500 max-w-[200px] sm:max-w-[300px] truncate"
                >
                  {slides.map((s, idx) => (
                    <option key={s.id} value={idx}>
                      页次 {s.id}/26: {s.title}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={() => setIsFullscreen(!isFullscreen)} 
                  className="bg-white/80 hover:bg-white text-slate-600 hover:text-blue-600 p-1.5 rounded shadow-sm border border-slate-200 transition-colors focus:outline-none"
                  title={isFullscreen ? "退出放大" : "点击PPT往左边展开放大"}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4"/> : <Maximize2 className="w-4 h-4"/>}
                </button>
              </div>
            </div>

            {/* Slide Content Mockup */}
            <div ref={containerRef} className="flex-1 flex flex-col items-center justify-center text-center relative bg-slate-100/50 overflow-hidden">
               {pdfFile ? (
                 <div className="w-full h-full flex flex-col items-center justify-center relative overflow-y-auto pt-4 pb-4">
                   <Document 
                     file={pdfFile} 
                     onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                     className="max-h-full flex items-center justify-center"
                     loading={<Loader2 className="w-8 h-8 text-blue-500 animate-spin" />}
                   >
                     <Page 
                        pageNumber={Math.min(currentSlideIndex + 1, numPages || 1)} 
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        width={containerWidth}
                        className="shadow-xl rounded-lg overflow-hidden"
                     />
                   </Document>
                 </div>
               ) : (
                 <div className="p-8 sm:p-12 flex flex-col items-center justify-center h-full">
                   <h3 className="text-2xl sm:text-3xl font-black text-slate-300 mb-6">{slide.title}</h3>
                   <div className="w-20 h-1 bg-blue-200 rounded mb-8"></div>
                   <Presentation className="w-24 h-24 text-slate-300 mb-6" />
                   
                   <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 inline-flex items-center text-lg mt-4">
                      <Upload className="w-6 h-6 mr-2" />
                      上传您的 PPT (PDF格式)
                      <input type="file" accept=".pdf" className="hidden" onChange={(e) => {
                         if (e.target.files?.[0]) {
                            setPdfFile(e.target.files[0]);
                            setCurrentSlideIndex(0); // reset when new pdf uploaded
                         }
                      }} />
                   </label>
                   <p className="text-slate-500 font-medium text-sm mt-6 max-w-sm">请将您的PPT先导出或另存为 PDF 格式，点击上方按钮上传即可真实无缝放映，并辅助老师打断考核。</p>
                 </div>
               )}
            </div>

            {/* Controls */}
            <div className="bg-white border-t border-slate-200 p-4 flex items-center justify-between">
               <button 
                onClick={prevSlide}
                disabled={currentSlideIndex === 0}
                className="flex items-center px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors"
              >
                 <ChevronLeft className="w-5 h-5 mr-1" /> 上一页
               </button>
               
               <button 
                onClick={nextSlide}
                disabled={currentSlideIndex === slides.length - 1}
                className="flex items-center px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors"
              >
                 下一页 <ChevronRight className="w-5 h-5 ml-1" />
               </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Editable Script & Dynamic Interruption */}
        <div className="lg:col-span-6 flex flex-col relative space-y-4">
          
          {/* Editable Script Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[160px]">
             <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
               <div className="flex items-center">
                 <Edit3 className="w-4 h-4 text-blue-600 mr-2" />
                 <h3 className="font-semibold text-slate-900 text-sm tracking-wide">本页演讲原文 / 修改提词点 (实时影响AI追问)</h3>
               </div>
             </div>
             <textarea 
               value={slideText}
               onChange={(e) => setSlideText(e.target.value)}
               placeholder="你可以将这页PPT的原始内容粘贴在这里，AI会完全读取你这里的最新文字进行针对性提问..."
               className="w-full flex-1 p-5 text-slate-700 leading-relaxed font-medium bg-transparent resize-none focus:outline-none focus:bg-blue-50/20 transition-colors"
               spellCheck="false"
             ></textarea>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold text-slate-900 text-sm flex items-center">
                  {isRecording ? <Mic className="w-4 h-4 text-red-500 mr-2 animate-pulse" /> : <Mic className="w-4 h-4 text-emerald-600 mr-2" />}
                  实战语音演练与打分
               </h3>
               <button 
                 onClick={toggleRecording}
                 className={`flex items-center px-4 py-2 text-sm font-bold rounded-lg transition-colors shadow-sm ${
                   isRecording ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                 }`}
               >
                 {isRecording ? (
                   <>
                     <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse mr-2"></span>
                     结束演练
                   </>
                 ) : (
                   <>
                     <Mic className="w-4 h-4 mr-2"/>
                     开始演练
                   </>
                 )}
               </button>
             </div>
             
             {speechError && (
               <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 mb-3 flex items-center">
                 <Bell className="w-4 h-4 mr-2 flex-shrink-0" />
                 {speechError}
               </div>
             )}

             <div className="flex items-center mb-3">
               <input 
                 type="checkbox" 
                 id="autoInterrupt"
                 checked={autoInterrupt} 
                 onChange={e => setAutoInterrupt(e.target.checked)} 
                 className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
               />
               <label htmlFor="autoInterrupt" className="ml-2 text-sm font-medium text-slate-700 cursor-pointer">
                 开启AI评委监听 (识别到您发言停顿时，老师会随机打断提问)
               </label>
             </div>

             <div className="bg-white border text-sm text-slate-600 border-slate-200 rounded-lg p-3 h-28 overflow-y-auto mb-3 shadow-inner relative">
                {!transcript && !interimTranscript && isRecording && isListening && (
                  <div className="text-slate-400 absolute inset-0 flex p-3 italic">
                    正在监听您的语音发言... (部分浏览器需在新标签页打开以获得权限)
                  </div>
                )}
                <span className="relative z-10">
                  {transcript} <span className="text-slate-400">{interimTranscript}</span>
                  {isRecording && <span className="animate-pulse inline-block ml-1 w-2 h-4 bg-red-400 align-middle"></span>}
                </span>
             </div>

             {!isRecording && transcript && !speechFeedback && (
                <button 
                  onClick={getSpeechFeedback}
                  disabled={gettingFeedback}
                  className="w-full flex justify-center items-center px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition-colors border border-slate-200 text-sm"
                >
                  {gettingFeedback ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-500" /> : <Sparkles className="w-4 h-4 mr-2 text-blue-500" />}
                  {gettingFeedback ? "正在分析表达质量..." : "获取表达清晰度与节奏反馈"}
                </button>
             )}

             {speechFeedback && (
               <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-slate-700 text-sm leading-relaxed whitespace-pre-wrap"
               >
                  <strong className="text-emerald-800 block mb-2">演练反馈：</strong>
                  {speechFeedback}
               </motion.div>
             )}
          </div>

          <div className="mt-4">
             <button 
               onClick={() => triggerDynamicInterrupt()}
               disabled={generating || (!slideText.trim() && !transcript.trim())}
               className="w-full flex items-center justify-center px-6 py-4 bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl transition-all shadow-sm active:scale-95 text-lg"
             >
               {generating ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : <Sparkles className="w-6 h-6 mr-2" />}
               {generating ? "老师正在仔细审阅找茬..." : (transcript ? "根据您说的文字，主动请求老师打断提问！" : "根据当前粘贴的文字，请求导师打断发问！")}
             </button>
          </div>

          {/* Interruption Overlay Area */}
          <AnimatePresence mode="wait">
            {showQuestion && currentQuestion && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-orange-50 border-2 mt-6 ${isAlarming ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'border-orange-200'} rounded-2xl p-6 relative overflow-hidden transition-all duration-300`}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                <div className="flex items-center mb-4">
                  <div className="bg-orange-100 text-orange-600 p-2 rounded-lg mr-3">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">“打断一下，这位同学...”</h3>
                </div>

                <p className="text-slate-800 font-bold text-lg mb-6 leading-snug">
                  {currentQuestion.q}
                </p>

                {!showAnswer ? (
                  <button 
                    onClick={() => setShowAnswer(true)}
                    className="w-full flex justify-center items-center px-4 py-3 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <Eye className="w-5 h-5 mr-2 text-slate-400" /> 查看参考应对及回答思路
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-white p-5 rounded-xl border border-orange-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap"
                  >
                    <span className="font-bold text-orange-600 block mb-2">应对回答思路：</span>
                    {currentQuestion.a}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
