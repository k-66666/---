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
import CountdownTimer from './components/CountdownTimer';

type Tab = 'overview' | 'ppt' | 'qa' | 'mock';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col p-4 sm:p-8 overflow-hidden font-sans selection:bg-blue-200 selection:text-slate-900">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-end mb-6 border-b border-slate-200 pb-4 gap-4">
        <div className="flex flex-col">
          <span className="text-blue-600 font-medium text-xs tracking-wider uppercase mb-1 drop-shadow-sm"></span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">基于Python的茶产品销售系统</h1>
        </div>
        <div className="flex-shrink-0 w-full md:w-auto">
          <CountdownTimer />
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
