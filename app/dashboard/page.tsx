'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { VitalityGauge } from '@/components/dashboard/vitality-gauge';
import { MetricCard } from '@/components/dashboard/metric-card';
import { Button } from '@/components/ui/button';
import { Brain, Activity, Moon, LogOut, UtensilsCrossed, PenLine, Settings, FileText, History } from 'lucide-react';
import Link from 'next/link';
import { calculateVitalityScore } from '@/lib/performance';
import { VitalityChart } from '@/components/dashboard/vitality-chart';

interface HealthMetrics {
  vitality_score: number;
  cognitive_index: number;
  metabolic_stability: number;
  recovery_index: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<HealthMetrics>({
    vitality_score: 0,
    cognitive_index: 0,
    metabolic_stability: 0,
    recovery_index: 0,
  });
  const [userName, setUserName] = useState<string>('Dirigeant');
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    checkAuth();
    loadMetrics();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth/login');
    } else {
      loadProfile(session.user.id);
    }
  };

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, performance_goal, metabolic_type')
      .eq('id', userId)
      .maybeSingle();

    if (!data?.full_name || !data?.performance_goal || !data?.metabolic_type) {
      router.replace('/onboarding');
      return;
    }
    setUserName(data.full_name);
  };

  const loadMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from('health_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('logged_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          const vScore = calculateVitalityScore({
            metabolic_stability: data.metabolic_stability,
            cognitive_index: data.cognitive_index,
            recovery_index: data.recovery_index,
          });
          setMetrics({
            vitality_score: vScore,
            cognitive_index: data.cognitive_index,
            metabolic_stability: data.metabolic_stability,
            recovery_index: data.recovery_index,
          });
          fetchInsight(vScore, data.cognitive_index, data.metabolic_stability, data.recovery_index);
        } else {
          const fallback = {
            metabolic_stability: 78,
            cognitive_index: 82,
            recovery_index: 71,
          };
          const vScore = calculateVitalityScore(fallback);
          setMetrics({ vitality_score: vScore, ...fallback });
          fetchInsight(vScore, fallback.cognitive_index, fallback.metabolic_stability, fallback.recovery_index);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des métriques :', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsight = async (vitality: number, cognitive: number, metabolic: number, recovery: number) => {
    setInsightLoading(true);
    try {
      const res = await fetch(
        `/api/insight?vitality=${vitality}&cognitive=${cognitive}&metabolic=${metabolic}&recovery=${recovery}`
      );
      if (res.ok) {
        const json = await res.json();
        if (json.insight) setInsight(json.insight);
      }
    } catch {
      // Vision du Jour indisponible — le texte statique reste affiché
    } finally {
      setInsightLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A192F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Chargement de vos données de performance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A192F]">
      <header className="border-b border-[#2A3F5F] bg-[#0A192F]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="font-playfair text-2xl font-light text-gold leading-none tracking-[-0.05em]">A</span>
              <span className="text-xl font-playfair text-white tracking-tight">ARIS</span>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/log">
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:bg-[#151F33]"
                >
                  <PenLine className="h-4 w-4 mr-2" />
                  Journal
                </Button>
              </Link>
              <Link href="/terroir">
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:bg-[#151F33]"
                >
                  <UtensilsCrossed className="h-4 w-4 mr-2" />
                  Terroir
                </Button>
              </Link>
              <Link href="/report">
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:bg-[#151F33]"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Rapport
                </Button>
              </Link>
              <Link href="/history">
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:bg-[#151F33]"
                >
                  <History className="h-4 w-4 mr-2" />
                  Historique
                </Button>
              </Link>
              <Link href="/settings">
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:bg-[#151F33]"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-[#151F33]"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-light text-white">
              Bienvenue, <span className="text-gold">{userName}</span>
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1 flex justify-center items-start">
            <div className="bg-[#151F33] border border-[#2A3F5F] rounded-2xl p-8 w-full">
              <VitalityGauge score={metrics.vitality_score} />

              <div className="mt-8 pt-6 border-t border-[#2A3F5F]">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  Votre score global de bio-performance, basé sur les métriques cognitives, métaboliques et de récupération
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <h2 className="text-lg font-light text-white mb-4 tracking-wide">
                Indicateurs de Performance Clés
              </h2>
            </div>

            <MetricCard
              icon={Brain}
              label="Charge Cognitive"
              value={metrics.cognitive_index}
              trend="up"
            />

            <MetricCard
              icon={Activity}
              label="Stabilité Métabolique"
              value={metrics.metabolic_stability}
              trend="stable"
            />

            <MetricCard
              icon={Moon}
              label="Indice de Récupération"
              value={metrics.recovery_index}
              trend="up"
            />

            <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gold flex items-center justify-center">
                  <span className="font-playfair text-lg font-semibold text-[#0A192F] leading-none">A</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">Vision Stratégique</h3>
                  <p className="text-xs text-gray-400">Personnalisé</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed min-h-[3rem]">
                {insightLoading ? (
                  <span className="text-gray-500 italic">Analyse en cours...</span>
                ) : (
                  insight ?? 'Votre performance cognitive atteint son sommet entre 9h et 11h. Planifiez vos décisions stratégiques sur cette fenêtre.'
                )}
              </p>
            </div>
          </div>
        </div>

        <VitalityChart />

        <div className="bg-[#151F33] border border-[#2A3F5F] rounded-2xl p-8 mt-8">
          <h2 className="text-lg font-light text-white mb-6 tracking-wide">
            Couche de Confidentialité & Anonymisation
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-green-400 mt-1.5 animate-pulse"></div>
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Données Chiffrées</h3>
                <p className="text-xs text-gray-400">Chiffrement de bout en bout actif</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-green-400 mt-1.5 animate-pulse"></div>
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Traitement Anonymisé</h3>
                <p className="text-xs text-gray-400">Données personnelles dissociées avant analyse</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-green-400 mt-1.5 animate-pulse"></div>
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Protection RLS Active</h3>
                <p className="text-xs text-gray-400">Sécurité au niveau des lignes activée</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
