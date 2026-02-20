'use client';

import { useEffect, useState } from 'react';

interface VitalityGaugeProps {
  score: number;
  label?: string;
}

export function VitalityGauge({ score, label = 'Score de Vitalité' }: VitalityGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const circumference = 2 * Math.PI * 85;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#D4AF37';
    if (score >= 60) return '#4ADE80';
    if (score >= 40) return '#FBBF24';
    return '#F87171';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Optimal';
    if (score >= 40) return 'Modéré';
    return 'Attention';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="transform -rotate-90 w-48 h-48">
          <circle
            cx="96"
            cy="96"
            r="85"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-[#1E2A3F]"
          />
          <circle
            cx="96"
            cy="96"
            r="85"
            stroke={getScoreColor(animatedScore)}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-light text-white mb-1">
            {animatedScore}
          </span>
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            {getScoreLabel(animatedScore)}
          </span>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-400 tracking-wide">{label}</p>
    </div>
  );
}
