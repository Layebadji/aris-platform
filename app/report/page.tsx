'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileText, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import Link from 'next/link';
import { calculateVitalityScore } from '@/lib/performance';

interface DayData {
  date: string;
  vitality: number;
  cognitive: number;
  metabolic: number;
  recovery: number;
}

interface ReportResult {
  report: string;
  avgVitality: number;
  avgCognitive: number;
  avgRecovery: number;
}

export default function ReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [days, setDays] = useState<DayData[]>([]);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [userName, setUserName] = useState('');
  const [performanceGoal, setPerformanceGoal] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login'); return; }

    const since = new Date();
    since.setDate(since.getDate() - 6);

    const [{ data: logs }, { data: profile }] = await Promise.all([
      supabase
        .from('health_logs')
        .select('vitality_score, cognitive_index, metabolic_stability, recovery_index, logged_at')
        .eq('user_id', session.user.id)
        .gte('logged_at', since.toISOString())
        .order('logged_at', { ascending: true }),
      supabase
        .from('profiles')
        .select('full_name, performance_goal')
        .eq('id', session.user.id)
        .maybeSingle(),
    ]);

    if (profile) {
      setUserName(profile.full_name ?? '');
      setPerformanceGoal(profile.performance_goal ?? '');
    }

    if (logs && logs.length > 0) {
      const byDay = new Map<string, DayData>();
      for (const log of logs) {
        const day = log.logged_at.split('T')[0];
        byDay.set(day, {
          date: day,
          vitality: log.vitality_score ?? calculateVitalityScore({
            cognitive_index: log.cognitive_index,
            metabolic_stability: log.metabolic_stability,
            recovery_index: log.recovery_index,
          }),
          cognitive: log.cognitive_index,
          metabolic: log.metabolic_stability,
          recovery: log.recovery_index,
        });
      }
      setDays(Array.from(byDay.values()));
    }

    setLoading(false);
  };

  const generateReport = async () => {
    if (days.length === 0) return;
    setGenerating(true);
    setError(false);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days, userName, performanceGoal }),
      });
      if (res.ok) {
        const json = await res.json();
        setResult(json);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setGenerating(false);
    }
  };

  const formatParagraph = (text: string) => {
    return text.split('\n').filter(Boolean).map((line, i) => {
      const isBold = line.startsWith('**') || line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.');
      return (
        <p key={i} className={`leading-relaxed ${isBold ? 'text-white font-medium mt-4 first:mt-0' : 'text-gray-300'}`}>
          {line.replace(/\*\*/g, '')}
        </p>
      );
    });
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
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-6 w-6 text-gold" />
            <h1 className="text-3xl font-light text-white">Rapport Hebdomadaire</h1>
          </div>
          <p className="text-gray-400 text-sm">Analyse de performance des 7 derniers jours par ARIS</p>
        </div>

        {days.length < 2 ? (
          <div className="bg-[#151F33] border border-[#2A3F5F] rounded-2xl p-10 text-center">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
            <p className="text-white font-light mb-2">Données insuffisantes</p>
            <p className="text-gray-400 text-sm mb-6">
              Enregistrez au moins 2 jours de métriques pour générer un rapport hebdomadaire.
            </p>
            <Link href="/log">
              <Button className="bg-gold hover:bg-gold-dark text-[#0A192F]">
                Enregistrer ma journée
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Résumé chiffré */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Jours enregistrés', value: days.length, icon: TrendingUp, color: 'text-gold' },
                { label: 'Vitalité moy.', value: Math.round(days.reduce((s, d) => s + d.vitality, 0) / days.length), icon: Target, color: 'text-green-400' },
                { label: 'Récupération moy.', value: Math.round(days.reduce((s, d) => s + d.recovery, 0) / days.length), icon: TrendingUp, color: 'text-blue-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-[#151F33] border border-[#2A3F5F] rounded-xl p-5 text-center">
                  <Icon className={`h-5 w-5 ${color} mx-auto mb-2`} strokeWidth={1.5} />
                  <p className={`text-2xl font-light tabular-nums ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Données de la semaine */}
            <div className="bg-[#151F33] border border-[#2A3F5F] rounded-2xl p-6">
              <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Données de la semaine</h2>
              <div className="space-y-2">
                {days.map((d) => (
                  <div key={d.date} className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500 w-24 flex-shrink-0">
                      {new Date(d.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <div className="flex gap-3 flex-1">
                      <span className="text-gold tabular-nums">{d.vitality}</span>
                      <span className="text-gray-600">Vit ·</span>
                      <span className="text-blue-400 tabular-nums">{d.cognitive}</span>
                      <span className="text-gray-600">Cog ·</span>
                      <span className="text-green-400 tabular-nums">{d.recovery}</span>
                      <span className="text-gray-600">Rec</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rapport IA */}
            {result ? (
              <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/30 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                    <span className="font-playfair text-lg font-semibold text-[#0A192F] leading-none">A</span>
                  </div>
                  <div>
                    <p className="text-xs text-gold uppercase tracking-wider font-medium">Analyse ARIS</p>
                    <p className="text-xs text-gray-500">Rapport généré le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  {formatParagraph(result.report)}
                </div>
                <p className="mt-6 text-xs text-gray-600 italic">
                  ARIS est un outil de performance, pas un dispositif médical. Ces conseils ne remplacent pas un suivi médical professionnel.
                </p>
              </div>
            ) : (
              <div className="bg-[#151F33] border border-[#2A3F5F] rounded-2xl p-8 text-center">
                {error && (
                  <p className="text-amber-500 text-sm mb-4">Génération indisponible. Vérifiez la connexion et réessayez.</p>
                )}
                <Button
                  onClick={generateReport}
                  disabled={generating}
                  className="bg-gold hover:bg-gold-dark text-[#0A192F] h-12 px-8 font-medium"
                >
                  {generating ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-[#0A192F] border-t-transparent rounded-full animate-spin" />
                      Analyse en cours...
                    </span>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Générer mon rapport de la semaine
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-600 mt-4">Analyse propulsée par Claude · ~15 secondes</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
