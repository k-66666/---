import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MessageCircleQuestion, Sparkles, Loader2 } from 'lucide-react';
import { questions } from '../data/questions';
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
const getAI = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "missing_api_key_on_vercel" });
  }
  return aiClient;
};

export default function QuestionBank() {
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  // Keep track of any AI generated questions so we can render them immediately
  const [aiGeneratedCount, setAiGeneratedCount] = useState(0);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    try {
        const prompt = `你是一个软件工程专业的大学导师。现在学生正在进行《基于Python的茶产品销售系统的设计与实现》的毕业答辩。
请针对“${topic}”这个主题，生成3个深入、具体的答辩问题，并给出优秀的回答思路。问题需要有一定的专业性，符合本科毕业答辩的难度。
请直接输出JSON数组，不要输出其他多余文字或markdown代码块。
格式如下：
[
  { "q": "老师提问：...", "a": "回答思路：...", "difficulty": "中等" }
]
难度只能是：简单、中等、偏难、主观发散。
`;
        const response = await getAI().models.generateContent({
             model: 'gemini-2.5-flash',
             contents: prompt,
             config: { responseMimeType: "application/json" } // forces JSON parsing
        });
        
        const result = response.text;
        const parsed = JSON.parse(result);
        
        // Add to our global static array for both components to access
        let existingAiCat = questions.find(c => c.category === 'AI 扩展题库');
        if (existingAiCat) {
            existingAiCat.items.unshift(...parsed);
        } else {
            questions.unshift({
                category: 'AI 扩展题库',
                items: parsed
            });
        }
        
        setAiGeneratedCount(c => c + parsed.length);
        setTopic("");
    } catch (e) {
        console.error(e);
        alert("辅助生成失败，请重试或检查。");
    } finally {
        setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 leading-tight">
          答辩问题解答参考
        </h2>
        <p className="text-slate-500 mt-2">汇总了答辩可能遇到的各类问题及其解答思路。</p>
      </div>

      {/* AI Generate Form */}
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl shadow-sm">
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">辅助问题生成</h3>
        </div>
        <p className="text-slate-600 text-sm mb-4 leading-relaxed">
          您可以输入特定的业务模块或技术点（例如：“并发处理”、“数据库结构”、“权限管理”），系统将利用 AI 模型生成导师可能提问的问题和解答建议。
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="例如：微信支付集成细节..."
            className="flex-1 bg-white text-slate-900 px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
            onKeyDown={e => { if (e.key === 'Enter') handleGenerate(); }}
          />
          <button 
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center shadow-sm"
          >
            {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : "生成问题"}
          </button>
        </div>
      </div>

      <div className="hidden">{aiGeneratedCount}</div> {/* forces re-render when count increments */}

      {questions.map((category, idx) => (
        <div key={idx + aiGeneratedCount} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center">
              <MessageCircleQuestion className="w-5 h-5 mr-2 text-slate-500" />
              {category.category}
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {category.items.map((item, i) => (
              <QuestionItem key={`${category.category}-${i}`} item={item} index={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function QuestionItem({ item, index }: { item: any, index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  // Map difficulty to specific theme colors
  const difficultyColors = {
    "简单": "bg-slate-100 text-slate-700",
    "中等": "bg-blue-100 text-blue-700",
    "偏难": "bg-orange-100 text-orange-700",
    "主观发散": "bg-purple-100 text-purple-700",
  };

  return (
    <div className="px-6 py-5 transition-colors hover:bg-slate-50 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <h3 className="text-base font-medium text-slate-900 leading-snug">
            <span className="text-blue-500 mr-2 font-mono">Q{index + 1}.</span>
            {item.q}
          </h3>
          <div className="mt-3 flex items-center space-x-2">
            <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${difficultyColors[item.difficulty as keyof typeof difficultyColors] || "bg-slate-100 text-slate-700"}`}>
              {item.difficulty}
            </span>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-slate-400 mt-1"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
           <div className="mt-4 bg-slate-50 p-5 rounded-lg border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center">
                参考回答
              </h3>
              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {item.a}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
