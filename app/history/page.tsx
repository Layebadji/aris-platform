'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, History, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';
import type { HealthLog } from '@/lib/types/database';

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadLogs(0);
  }, []);

  const loadLogs = async (pageIndex: number) => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login'); return; }

    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count } = await supabase
      .from('health_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('logged_at', { ascending: false })
      .range(from, to);

    if (data) setLogs(data);
    if (count !== null) setTotal(count);
    setPage(pageIndex);
    setLoading(false);
  };

  const getTrend = (logs: HealthLog[], field: keyof HealthLog, index: number) => {
    if (index >= logs.length - 1) return null;
    const current = logs[index][field] as number;
    const previous = logs[index + 1][field] as number;
    const diff = current - previous;
    if (Math.abs(diff) < 3) return { icon: Minus, color: 'text-gray-500', label: '~' };
    return diff > 0
      ? { icon: TrendingUp, color: 'text-green-400', label: `+${diff}` }
      : { icon: TrendingDown, color: 'text-red-400', label: String(diff) };
  };

  const getScoreColor = (v: number) =>
    v >= 80 ? 'text-gold' : v >= 60 ? 'text-green-400' : v >= 40 ? 'text-amber-500' : 'text-red-400';

  const totalPages = Math.ceil(total / PAGE_SIZE);

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
            <Link href="/log">
              <Button className="bg-gold hover:bg-gold-dark text-[#0A192F] text-sm h-9 px-4">
                Nouveau relevé
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <History className="h-6 w-6 text-gold" />
            <h1 className="text-3xl font-light text-white">Historique</h1>
          </div>
          <p className="text-gray-400 text-sm">{total} relevés enregistrés</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-[#151F33] border border-[#2A3F5F] rounded-2xl p-10 text-center">
            <History className="h-10 w-10 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">Aucun relevé enregistré pour le moment.</p>
            <Link href="/log">
              <Button className="bg-gold hover:bg-gold-dark text-[#0A192F]">
                Enregistrer ma première journée
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* En-tête tableau */}
            <div className="hidden md:grid grid-cols-6 gap-4 px-4 mb-3 text-xs text-gray-600 uppercase tracking-wider">
              <span className="col-span-2">Date</span>
              <span className="text-center">Vitalité</span>
              <span className="text-center">Cognitif</span>
              <span className="text-center">Métabolique</span>
              <span className="text-center">Récupération</span>
            </div>

            <div className="space-y-2">
              {logs.map((log, index) => {
                const vitalityTrend = getTrend(logs, 'vitality_score', index);
                return (
                  <Link key={log.id} href={`/log`} className="block">
                    <div className="bg-[#151F33] border border-[#2A3F5F] hover:border-gold/40 rounded-xl px-4 py-4 transition-colors duration-200 group">
                      <div className="md:grid md:grid-cols-6 md:gap-4 md:items-center flex flex-col gap-3">
                        {/* Date */}
                        <div className="md:col-span-2">
                          <p className="text-sm text-white font-light">
                            {new Date(log.logged_at).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                            })}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {new Date(log.logged_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        {/* Métriques */}
                        {[
                          { label: 'Vitalité', value: log.vitality_score, trend: vitalityTrend },
                          { label: 'Cognitif', value: log.cognitive_index, trend: null },
                          { label: 'Métabolique', value: log.metabolic_stability, trend: null },
                          { label: 'Récupération', value: log.recovery_index, trend: null },
                        ].map(({ label, value, trend }) => (
                          <div key={label} className="md:text-center flex items-center gap-2 md:block">
                            <span className="md:hidden text-xs text-gray-600 w-24">{label}</span>
                            <div className="flex items-center gap-1.5 md:justify-center">
                              <span className={`text-lg font-light tabular-nums ${getScoreColor(value)}`}>
                                {value}
                              </span>
                              {trend && (
                                <span className={`text-xs ${trend.color}`}>{trend.label}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  onClick={() => loadLogs(page - 1)}
                  disabled={page === 0 || loading}
                  variant="outline"
                  className="border-[#2A3F5F] text-gray-400 hover:text-white hover:bg-[#151F33]"
                >
                  Précédent
                </Button>
                <span className="text-sm text-gray-500">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  onClick={() => loadLogs(page + 1)}
                  disabled={page >= totalPages - 1 || loading}
                  variant="outline"
                  className="border-[#2A3F5F] text-gray-400 hover:text-white hover:bg-[#151F33]"
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
