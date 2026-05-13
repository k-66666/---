/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BookOpenText, MessageSquareQuote, Target } from 'lucide-react';
import Overview from './components/Overview';
import QuestionBank from './components/QuestionBank';
import MockDefense from './components/MockDefense';
import PPTRehearsal from './components/PPTRehearsal';

type Tab = 'overview' | 'ppt' | 'qa' | 'mock';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col p-4 sm:p-8 overflow-hidden font-sans selection:bg-blue-200 selection:text-slate-900">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 border-b border-slate-200 pb-6">
        <div className="flex flex-col mb-4 sm:mb-0">
          <span className="text-blue-600 font-medium text-sm tracking-widest uppercase mb-1">Thesis Defense Assistant v1.0</span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">毕业答辩准备系统</h1>
        </div>
        <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
          <div className="bg-blue-600 text-white px-4 py-1.5 font-medium text-sm rounded-full mb-2 shadow-sm">冲刺复习模式 (Active)</div>
          <div className="text-slate-500 text-sm">学习进度追踪：持续更新中</div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Sidebar Navigator */}
        <nav className="md:col-span-3 flex flex-col gap-2 overflow-y-auto">
          <div className="text-slate-800 p-3 font-semibold text-lg border-b border-slate-200 mb-2 mt-1">系统导航</div>
          <div className="flex flex-col gap-1 px-1">
            <TabButton 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')}
              num="01"
              label="项目概览"
            />
            <TabButton 
              active={activeTab === 'ppt'} 
              onClick={() => setActiveTab('ppt')}
              num="02"
              label="PPT 演练"
            />
            <TabButton 
              active={activeTab === 'qa'} 
              onClick={() => setActiveTab('qa')}
              num="03"
              label="答辩题库"
            />
            <TabButton 
              active={activeTab === 'mock'} 
              onClick={() => setActiveTab('mock')}
              num="04"
              label="模拟练习"
            />
          </div>
          <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl mx-1 shadow-sm">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center">
              <Target className="w-4 h-4 mr-1.5" /> 导师答辩建议
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed mb-3">“答辩的核心不仅是代码实现，更是对设计思路和解决问题过程的清晰阐述。遇到问题不要慌，理清逻辑，自信表达。”</p>
            <div className="flex justify-end">
              <span className="text-xs text-blue-700 font-bold bg-blue-100 px-2 py-1 rounded-md">— 评委组长</span>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="md:col-span-9 flex flex-col overflow-y-auto pr-2 pb-10">
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'ppt' && <PPTRehearsal />}
          {activeTab === 'qa' && <QuestionBank />}
          {activeTab === 'mock' && <MockDefense />}
        </main>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, num, label }: { active: boolean, onClick: () => void, num: string, label: string }) {
  if (active) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left p-3 border-l-4 border-blue-600 bg-white shadow-sm transition-colors rounded-r-md"
      >
        <span className="text-xs text-blue-600 block font-mono mb-0.5">{num}</span>
        <span className="font-semibold text-slate-900">{label}</span>
      </button>
    );
  } else {
    return (
      <button
        onClick={onClick}
        className="w-full text-left p-3 border-l-4 border-transparent hover:border-slate-300 hover:bg-slate-100 transition-all rounded-r-md"
      >
        <span className="text-xs text-slate-500 block font-mono mb-0.5">{num}</span>
        <span className="font-medium text-slate-600">{label}</span>
      </button>
    );
  }
}
