import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shuffle, CheckCircle, RefreshCcw, Eye } from 'lucide-react';
import { questions } from '../data/questions';

export default function MockDefense() {
  const allQuestions = useMemo(() => {
    return questions.flatMap(cat => cat.items.map(item => ({...item, category: cat.category})));
  }, []);

  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  const startSession = () => {
    setSessionStarted(true);
    pickRandomQuestion();
  };

  const pickRandomQuestion = () => {
    setShowAnswer(false);
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * allQuestions.length);
    } while (nextIndex === currentIndex && allQuestions.length > 1);
    setCurrentIndex(nextIndex);
  };

  if (!sessionStarted) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 leading-tight">
            答辩模拟练习
          </h2>
          <p className="text-slate-500 mt-2">系统随机抽取题目进行模拟问答，检验准备情况。</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center max-w-2xl mx-auto flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <Shuffle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-3">进入模拟问答</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
            点击开始后，系统将从整个题库中随机向您抛出问题。您可以尝试先自己阐述答案，然后再查看参考解答。
          </p>
          <button 
            onClick={startSession}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow-sm transition-colors"
          >
            开始练习
          </button>
        </div>
      </div>
    );
  }

  const currentQ = allQuestions[currentIndex];

  const difficultyColors = {
    "简单": "bg-slate-100 text-slate-700",
    "中等": "bg-blue-100 text-blue-700",
    "偏难": "bg-orange-100 text-orange-700",
    "主观发散": "bg-purple-100 text-purple-700",
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
         <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-slate-900">模拟问答进行中</h2>
        </div>
        <button 
          onClick={() => { setSessionStarted(false); setShowAnswer(false); }}
          className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50"
        >
          <RefreshCcw className="w-4 h-4 mr-2" /> 结束练习
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-slate-200 rounded-xl shadow-sm"
        >
          <div className="p-8">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                {currentQ.category}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${difficultyColors[currentQ.difficulty as keyof typeof difficultyColors] || "bg-slate-100 text-slate-700"}`}>
                难度: {currentQ.difficulty}
              </span>
            </div>
            
            <h3 className="text-2xl font-semibold text-slate-900 leading-relaxed mb-8">
              <span className="text-blue-500 font-bold mr-2">Q.</span>
              {currentQ.q.replace('老师提问：', '')}
            </h3>

            {!showAnswer ? (
              <div className="flex justify-start">
                <button 
                  onClick={() => setShowAnswer(true)}
                  className="flex items-center px-6 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  显示参考回答
                </button>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-50 p-6 rounded-lg border border-slate-200 mt-6"
              >
                <h4 className="flex items-center text-slate-800 font-semibold mb-3">
                   参考思路
                </h4>
                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                  {currentQ.a.replace('回答思路：', '')}
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={pickRandomQuestion}
                    className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    下一题 <RefreshCcw className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
