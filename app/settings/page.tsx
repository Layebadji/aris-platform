'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [glycemicVigilance, setGlycemicVigilance] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth/login');
      return;
    }
    setUserId(session.user.id);

    const { data } = await supabase
      .from('profiles')
      .select('glycemic_vigilance')
      .eq('id', session.user.id)
      .maybeSingle();

    if (data) {
      setGlycemicVigilance(data.glycemic_vigilance ?? false);
    }
    setLoading(false);
  };

  const handleToggle = async (value: boolean) => {
    if (!userId) return;
    setGlycemicVigilance(value);
    setSaving(true);
    await supabase
      .from('profiles')
      .upsert({ id: userId, glycemic_vigilance: value, updated_at: new Date().toISOString() });
    setSaving(false);
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
          <h1 className="text-3xl font-light text-white mb-2">Préférences de Performance</h1>
          <p className="text-gray-400 text-sm">Personnalisez l'accompagnement nutritionnel d'ARIS.</p>
        </div>

        <div className="bg-[#151F33] border border-[#2A3F5F] rounded-2xl p-8 space-y-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-[#0A192F] flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldAlert className="h-5 w-5 text-green-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-base font-light text-white leading-tight mb-1">
                  Vigilance Glycémique
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Active un mode de conseil adapté à la gestion de la glycémie. Les plats à index
                  glycémique bas (quinoa, riz noir) seront mis en avant dans le Terroir, et ARIS
                  ajustera ses recommandations alimentaires en conséquence.
                </p>
                <p className="mt-2 text-xs text-gray-600 italic">
                  ARIS est un outil de performance, pas un dispositif médical. Ce paramètre ne
                  remplace pas un suivi médical réel.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleToggle(!glycemicVigilance)}
              disabled={saving}
              className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                glycemicVigilance ? 'bg-green-500' : 'bg-[#2A3F5F]'
              }`}
              aria-label="Basculer la Vigilance Glycémique"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                  glycemicVigilance ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {glycemicVigilance && (
            <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2.5">
              <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                Mode activé — Les conseils du Terroir et de l'Advisor IA sont adaptés à votre
                vigilance glycémique.
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
