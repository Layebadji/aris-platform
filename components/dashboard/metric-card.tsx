import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
}

export function MetricCard({ icon: Icon, label, value, unit = '%', trend }: MetricCardProps) {
  const getTrendColor = () => {
    if (!trend) return 'text-gray-400';
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  const getValueColor = () => {
    if (value >= 80) return 'text-[#D4AF37]';
    if (value >= 60) return 'text-green-400';
    if (value >= 40) return 'text-amber-500';
    return 'text-red-400';
  };

  return (
    <div className="bg-[#151F33] border border-[#2A3F5F] rounded-xl p-6 hover:border-[#D4AF37]/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 rounded-lg bg-[#0A192F] flex items-center justify-center">
          <Icon className="h-6 w-6 text-[#D4AF37]" strokeWidth={1.5} />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${getTrendColor()}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>

      <h3 className="text-sm text-gray-400 mb-2 tracking-wide">{label}</h3>

      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-light ${getValueColor()}`}>
          {value}
        </span>
        <span className="text-lg text-gray-500">{unit}</span>
      </div>

      <div className="mt-3 h-1.5 bg-[#0A192F] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F4D792] transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
