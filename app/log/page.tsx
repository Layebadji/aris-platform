'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { calculateVitalityScore } from '@/lib/performance';
import { VitalityGauge } from '@/components/dashboard/vitality-gauge';
import { Button } from '@/components/ui/button';
import { Brain, Activity, Moon, ChevronLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface SliderFieldProps {
  label: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  value: number;
  onChange: (v: number) => void;
}

function SliderField({ label, description, icon: Icon, iconColor, value, onChange }: SliderFieldProps) {
  const valueColor =
    value >= 80 ? 'text-gold' :
    value >= 60 ? 'text-green-400' :
    value >= 40 ? 'text-amber-500' :
    'text-red-400';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#0A192F] flex items-center justify-center flex-shrink-0">
            <Icon className={`h-4 w-4 ${iconColor}`} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-light text-white leading-tight">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <span className={`text-3xl font-light tabular-nums ${valueColor}`}>{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="aris-slider"
        style={{
          background: `linear-gradient(to right, #D4AF37 ${value}%, #1E2A3F ${value}%)`,
        }}
      />
      <div className="flex justify-between text-xs text-gray-700">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}

export default function LogPage() {
  const router = useRouter();
  const [cognitive, setCognitive] = useState(75);
  const [metabolic, setMetabolic] = useState(75);
  const [recovery, setRecovery] = useState(75);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyLoggedId, setAlreadyLoggedId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const vitality = calculateVitalityScore({
    cognitive_index: cognitive,
    metabolic_stability: metabolic,
    recovery_index: recovery,
  });

  const penaltyActive = cognitive > 85 && recovery < 60;

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth/login');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('health_logs')
      .select('id, cognitive_index, metabolic_stability, recovery_index')
      .eq('user_id', session.user.id)
      .gte('logged_at', `${today}T00:00:00`)
      .limit(1)
      .maybeSingle();

    if (data) {
      setAlreadyLoggedId(data.id);
      setCognitive(data.cognitive_index);
      setMetabolic(data.metabolic_stability);
      setRecovery(data.recovery_index);
    }

    setLoading(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const payload = {
        user_id: user.id,
        cognitive_index: cognitive,
        metabolic_stability: metabolic,
        recovery_index: recovery,
        vitality_score: vitality,
        logged_at: new Date().toISOString(),
      };

      if (alreadyLoggedId) {
        await supabase.from('health_logs').update(payload).eq('id', alreadyLoggedId);
      } else {
        await supabase.from('health_logs').insert(payload);
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement :', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A192F] flex items-center justify-center">
        <div className="h-12 w-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A192F]">
      <header className="border-b border-[#2A3F5F] bg-[#0A192F]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-[#151F33]">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Tableau de bord
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <span className="font-playfair text-2xl font-light text-gold leading-none tracking-[-0.05em]">A</span>
              <span className="text-xl font-playfair text-white tracking-tight">ARIS</span>
            </div>
            <div className="w-32" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-white mb-2">Journal de Performance</h1>
          <p className="text-gray-400 text-sm">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
            {alreadyLoggedId && (
              <span className="ml-3 text-amber-500 text-xs uppercase tracking-wider">
                · Mise à jour du relevé du jour
              </span>
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Aperçu live */}
          <div className="bg-[#151F33] border border-[#2A3F5F] rounded-2xl p-8 flex flex-col items-center justify-center gap-6">
            <VitalityGauge score={vitality} label="Aperçu en direct" />

            {penaltyActive && (
              <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 w-full">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-400 leading-relaxed">
                  Surcharge cognitive détectée. Une pénalité de −10 pts est appliquée.
                  Planifiez une récupération active.
                </p>
              </div>
            )}

            <div className="w-full grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Cognitif', value: cognitive, color: 'text-gold' },
                { label: 'Métabolique', value: metabolic, color: 'text-green-400' },
                { label: 'Récupération', value: recovery, color: 'text-blue-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-[#0A192F] rounded-lg p-3">
                  <p className={`text-xl font-light tabular-nums ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sliders + soumission */}
          <div className="bg-[#151F33] border border-[#2A3F5F] rounded-2xl p-8 flex flex-col gap-8">
            <SliderField
              label="Charge Cognitive"
              description="Clarté mentale et focus perçus"
              icon={Brain}
              iconColor="text-gold"
              value={cognitive}
              onChange={setCognitive}
            />

            <SliderField
              label="Stabilité Métabolique"
              description="Énergie, digestion et satiété"
              icon={Activity}
              iconColor="text-green-400"
              value={metabolic}
              onChange={setMetabolic}
            />

            <SliderField
              label="Indice de Récupération"
              description="Qualité du sommeil et régénération"
              icon={Moon}
              iconColor="text-blue-400"
              value={recovery}
              onChange={setRecovery}
            />

            <Button
              onClick={handleSubmit}
              disabled={submitting || success}
              className={`w-full h-12 font-medium tracking-wide transition-all duration-300 ${
                success
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/20'
                  : 'bg-gold hover:bg-gold-dark text-[#0A192F]'
              }`}
            >
              {success ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Enregistré — redirection...
                </span>
              ) : submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-[#0A192F] border-t-transparent rounded-full animate-spin" />
                  Enregistrement...
                </span>
              ) : alreadyLoggedId ? (
                'Mettre à jour le relevé du jour'
              ) : (
                'Enregistrer ma journée'
              )}
            </Button>

            <p className="text-xs text-center text-gray-600 leading-relaxed">
              Données chiffrées et anonymisées avant toute analyse.<br />
              Jamais partagées avec des tiers.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
