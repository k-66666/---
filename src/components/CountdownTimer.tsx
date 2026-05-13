import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock } from 'lucide-react';

export default function CountdownTimer() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const d1 = new Date('2026-05-14T00:00:00');
  const d2 = new Date('2026-05-28T00:00:00');

  const getDiff = (target: Date) => {
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return { d, h, m, s };
  };

  const diff1 = getDiff(d1);
  const diff2 = getDiff(d2);

  return (
    <div className="flex flex-col sm:flex-row gap-2.5 w-full justify-start md:justify-end">
      <TimerRow label="预答辩 (5.14)" diff={diff1} isAlert={true} />
      <TimerRow label="答辩 (5.28)" diff={diff2} isAlert={false} />
    </div>
  );
}

function TimerRow({ label, diff, isAlert }: { label: string; diff: {d:number,h:number,m:number,s:number}; isAlert: boolean }) {
  const pad = (num: number) => num.toString().padStart(2, '0');
  
  const bgClass = isAlert 
    ? 'bg-gradient-to-br from-orange-50 to-red-50/50 border-orange-200/60 shadow-sm' 
    : 'bg-gradient-to-br from-blue-50 to-indigo-50/50 border-blue-200/60 shadow-sm';
  
  const textClass = isAlert ? 'text-orange-900' : 'text-blue-900';
  const iconClass = isAlert ? 'text-orange-500' : 'text-blue-500';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-start gap-3 sm:gap-4 rounded-lg px-3 py-2 border backdrop-blur-sm ${bgClass}`}
    >
      <span className={`${textClass} font-semibold text-xs flex items-center gap-1.5`}>
        <Clock className={`w-3.5 h-3.5 ${iconClass}`} />
        {label}
      </span>
      <div className="flex gap-1.5 items-center">
        <TimeUnit unit="天" value={pad(diff.d)} isAlert={isAlert} />
        <span className={`text-[10px] font-bold opacity-40 ${textClass}`}>:</span>
        <TimeUnit unit="时" value={pad(diff.h)} isAlert={isAlert} />
        <span className={`text-[10px] font-bold opacity-40 ${textClass}`}>:</span>
        <TimeUnit unit="分" value={pad(diff.m)} isAlert={isAlert} />
        <span className={`text-[10px] font-bold opacity-40 ${textClass}`}>:</span>
        <TimeUnit unit="秒" value={pad(diff.s)} isAlert={isAlert} />
      </div>
    </motion.div>
  );
}

function TimeUnit({ unit, value, isAlert }: { unit: string; value: string; isAlert: boolean }) {
  const blockClass = isAlert 
    ? 'bg-white/80 border border-orange-100 text-orange-700' 
    : 'bg-white/80 border border-blue-100 text-blue-700';
    
  const labelClass = isAlert ? 'text-orange-500' : 'text-blue-500';

  return (
    <div className={`flex flex-col items-center justify-center rounded px-1.5 py-0.5 min-w-[28px] ${blockClass}`}>
      <div className="relative overflow-hidden h-3.5 flex items-center justify-center w-full">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="font-mono text-xs font-black tracking-tight leading-none absolute"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className={`text-[8px] mt-[1px] leading-none font-bold ${labelClass}`}>{unit}</span>
    </div>
  );
}
