'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface DataPoint {
  date: string;
  vitality: number;
  cognitive: number;
  metabolic: number;
  recovery: number;
}

const W = 400;
const H = 80;
const PAD = { left: 6, right: 6, top: 8, bottom: 8 };
const chartW = W - PAD.left - PAD.right;
const chartH = H - PAD.top - PAD.bottom;

function toX(i: number, total: number) {
  return PAD.left + (total === 1 ? chartW / 2 : (i / (total - 1)) * chartW);
}
function toY(v: number) {
  return PAD.top + chartH - (v / 100) * chartH;
}
function polyline(points: { x: number; y: number }[]) {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

const LINES = [
  { key: 'vitality' as const, color: '#D4AF37', label: 'Vitalité' },
  { key: 'cognitive' as const, color: '#60A5FA', label: 'Cognitif' },
  { key: 'recovery' as const, color: '#4ADE80', label: 'Récupération' },
];

export function VitalityChart() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const since = new Date();
    since.setDate(since.getDate() - 6);

    const { data: logs } = await supabase
      .from('health_logs')
      .select('vitality_score, cognitive_index, metabolic_stability, recovery_index, logged_at')
      .eq('user_id', user.id)
      .gte('logged_at', since.toISOString())
      .order('logged_at', { ascending: true });

    if (logs && logs.length > 0) {
      const byDay = new Map<string, DataPoint>();
      for (const log of logs) {
        const day = log.logged_at.split('T')[0];
        byDay.set(day, {
          date: day,
          vitality: log.vitality_score,
          cognitive: log.cognitive_index,
          metabolic: log.metabolic_stability,
          recovery: log.recovery_index,
        });
      }
      setData(Array.from(byDay.values()));
    }
    setLoading(false);
  };

  if (loading || data.length < 2) return null;

  return (
    <div className="bg-[#151F33] border border-[#2A3F5F] rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-light text-white tracking-wide">
          Évolution sur 7 jours
        </h2>
        <div className="flex items-center gap-4">
          {LINES.map((m) => (
            <div key={m.key} className="flex items-center gap-1.5">
              <div className="h-2 w-5 rounded-full" style={{ background: m.color }} />
              <span className="text-xs text-gray-500">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '100px' }}>
        {/* Grid horizontales */}
        {[25, 50, 75].map((v) => (
          <line
            key={v}
            x1={PAD.left}
            y1={toY(v)}
            x2={W - PAD.right}
            y2={toY(v)}
            stroke="#1E2A3F"
            strokeWidth="1"
          />
        ))}

        {/* Lignes des métriques */}
        {LINES.map((m) => (
          <polyline
            key={m.key}
            points={polyline(data.map((d, i) => ({ x: toX(i, data.length), y: toY(d[m.key]) })))}
            fill="none"
            stroke={m.color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={m.key === 'vitality' ? 1 : 0.6}
          />
        ))}

        {/* Points de données — vitalité */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={toX(i, data.length)}
            cy={toY(d.vitality)}
            r="3"
            fill="#D4AF37"
            stroke="#0A192F"
            strokeWidth="1.5"
          />
        ))}
      </svg>

      {/* Labels axe X */}
      <div className="flex justify-between mt-3 px-1">
        {data.map((d) => (
          <span key={d.date} className="text-xs text-gray-600">
            {new Date(d.date + 'T12:00:00').toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        ))}
      </div>
    </div>
  );
}
