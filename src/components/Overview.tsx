import { BookOpen, Code, Database, LayoutTemplate, Zap } from 'lucide-react';

export default function Overview() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 leading-tight">
          项目概览与技术架构
        </h2>
        <p className="text-slate-500 mt-2">系统梳理核心功能点与所用技术，协助理清架构脉络。</p>
      </div>

      <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
          基本信息
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3">
            <BookOpen className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">项目名称</p>
              <p className="text-base text-slate-900">基于Python的茶产品销售系统的设计与实现</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <LayoutTemplate className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">项目架构</p>
              <p className="text-base text-slate-900">前后端分离 (B/S 架构)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 mb-4 border-b border-slate-100 pb-3">
            <Code className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">技术栈说明</h3>
          </div>
          <ul className="space-y-3 font-medium text-slate-700 flex-1">
            <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 后端环境：Python 3, Django 3.2</li>
            <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 前端框架：Vue.js, Element UI</li>
            <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 数据库：MySQL 8.0 (持久化), Redis (缓存)</li>
            <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 通信协议：RESTful API, WebSocket</li>
          </ul>
        </div>

        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 mb-4 border-b border-slate-100 pb-3">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">开发与创新亮点</h3>
          </div>
          <ul className="space-y-3 text-slate-700 leading-relaxed flex-1">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
              <span className="text-sm"><strong>大模型接入：</strong>系统对接通义千问大模型API，自动生成销售图表建议报告。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
              <span className="text-sm"><strong>动态通信：</strong>借助 Django Channels 结合 WebSocket，构建实时的全站公告系统。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
              <span className="text-sm"><strong>严密鉴权：</strong>前端无状态 JWT 方案结合后端权限设计，并使用 Redis 防刷验证码防护。</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
