'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight } from 'lucide-react';

const GOALS = [
  { value: 'cognitive_performance', label: 'Performance Cognitive', description: 'Maximiser la clarté mentale et la prise de décision' },
  { value: 'energy_vitality', label: 'Énergie & Vitalité', description: 'Maintenir un niveau d\'énergie optimal toute la journée' },
  { value: 'stress_recovery', label: 'Gestion du Stress', description: 'Optimiser la récupération et réduire la fatigue' },
  { value: 'metabolic_balance', label: 'Équilibre Métabolique', description: 'Stabiliser le métabolisme pour une performance durable' },
];

const METABOLIC_TYPES = [
  { value: 'balanced', label: 'Équilibré', description: 'Bonne tolérance aux glucides, métabolisme stable' },
  { value: 'performance', label: 'Performance', description: 'Besoins élevés en protéines et énergie rapide' },
  { value: 'endurance', label: 'Endurance', description: 'Optimisé pour les efforts prolongés, faible IG préféré' },
  { value: 'recovery', label: 'Récupération', description: 'Priorité aux anti-inflammatoires et à la régénération' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [goal, setGoal] = useState('');
  const [metabolicType, setMetabolicType] = useState('');
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth/login'); return; }
      setUserId(session.user.id);

      const { data } = await supabase
        .from('profiles')
        .select('full_name, performance_goal, metabolic_type')
        .eq('id', session.user.id)
        .maybeSingle();

      if (data?.full_name && data?.performance_goal && data?.metabolic_type) {
        router.replace('/dashboard');
      }
    };
    init();
  }, [router]);

  const handleFinish = async () => {
    if (!userId || !fullName.trim() || !goal || !metabolicType) return;
    setSaving(true);
    await supabase.from('profiles').upsert({
      id: userId,
      full_name: fullName.trim(),
      performance_goal: goal,
      metabolic_type: metabolicType,
      updated_at: new Date().toISOString(),
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0A192F] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-12">
          <span className="font-playfair text-4xl font-light text-gold leading-none tracking-[-0.05em]">A</span>
          <span className="text-3xl font-playfair text-white tracking-tight">ARIS</span>
        </div>

        {/* Étape indicateur */}
        <div className="flex items-center gap-2 justify-center mb-10">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                s === step ? 'w-10 bg-gold' : s < step ? 'w-4 bg-gold/50' : 'w-4 bg-[#2A3F5F]'
              }`}
            />
          ))}
        </div>

        <div className="bg-[#151F33] border border-[#2A3F5F] rounded-2xl p-8">
          {/* Étape 1 — Nom */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-light text-white mb-2">Bienvenue dans ARIS</h1>
                <p className="text-sm text-gray-400">
                  Votre conseiller en bio-performance d'élite. Commençons par faire connaissance.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Votre nom complet</label>
                <Input
                  autoFocus
                  placeholder="Ex. Amadou Diallo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fullName.trim() && setStep(2)}
                  className="bg-[#0A192F] border-[#2A3F5F] text-white placeholder:text-gray-600 h-12 focus:border-gold focus:ring-gold"
                />
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!fullName.trim()}
                className="w-full h-12 bg-gold hover:bg-gold-dark text-[#0A192F] font-medium"
              >
                Continuer
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Étape 2 — Objectif */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-light text-white mb-2">Votre objectif principal</h1>
                <p className="text-sm text-gray-400">
                  ARIS calibre ses conseils nutritionnels en fonction de votre priorité du moment.
                </p>
              </div>
              <div className="space-y-3">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGoal(g.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      goal === g.value
                        ? 'border-gold bg-gold/10'
                        : 'border-[#2A3F5F] hover:border-[#3A5F8F] bg-[#0A192F]'
                    }`}
                  >
                    <p className={`text-sm font-medium ${goal === g.value ? 'text-gold' : 'text-white'}`}>
                      {g.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{g.description}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 h-12 border-[#2A3F5F] text-gray-400 hover:text-white hover:bg-[#0A192F]"
                >
                  Retour
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!goal}
                  className="flex-1 h-12 bg-gold hover:bg-gold-dark text-[#0A192F] font-medium"
                >
                  Continuer
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Étape 3 — Type métabolique */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-light text-white mb-2">Votre profil métabolique</h1>
                <p className="text-sm text-gray-400">
                  Cette classification affine les recommandations du Terroir et l'Advisor IA.
                </p>
              </div>
              <div className="space-y-3">
                {METABOLIC_TYPES.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMetabolicType(m.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      metabolicType === m.value
                        ? 'border-gold bg-gold/10'
                        : 'border-[#2A3F5F] hover:border-[#3A5F8F] bg-[#0A192F]'
                    }`}
                  >
                    <p className={`text-sm font-medium ${metabolicType === m.value ? 'text-gold' : 'text-white'}`}>
                      {m.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 h-12 border-[#2A3F5F] text-gray-400 hover:text-white hover:bg-[#0A192F]"
                >
                  Retour
                </Button>
                <Button
                  onClick={handleFinish}
                  disabled={!metabolicType || saving}
                  className="flex-1 h-12 bg-gold hover:bg-gold-dark text-[#0A192F] font-medium"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-[#0A192F] border-t-transparent rounded-full animate-spin" />
                      Enregistrement...
                    </span>
                  ) : (
                    'Accéder à mon tableau de bord'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          Données strictement confidentielles · Jamais partagées avec des tiers
        </p>
      </div>
    </div>
  );
}
