'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Sparkles,
  Brain,
  Activity,
  ChevronLeft,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import type { Recommendation } from '@/lib/types/database';

export default function TerroirPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');
  const [userVitality, setUserVitality] = useState<{
    cognitive_index: number;
    metabolic_stability: number;
    recovery_index: number;
  } | null>(null);
  const [glycemicVigilance, setGlycemicVigilance] = useState(false);
  const [analyses, setAnalyses] = useState<Record<string, string>>({});
  const [loadingAnalysisId, setLoadingAnalysisId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    loadRecommendations();
    loadUserVitalityAndProfile();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth/login');
    }
  };

  const handleAnalysis = async (rec: Recommendation) => {
    if (expandedId === rec.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(rec.id);
    if (analyses[rec.id]) return;

    setLoadingAnalysisId(rec.id);
    try {
      const params = new URLSearchParams({
        dish: rec.dish_name,
        description: rec.description,
        cognitive_boost: String(rec.cognitive_boost),
        recovery_support: String(rec.recovery_support),
        metabolic_compatibility: rec.metabolic_compatibility.join(','),
      });
      const res = await fetch(`/api/nutrition?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAnalyses((prev) => ({ ...prev, [rec.id]: data.analysis }));
      }
    } catch {
      setAnalyses((prev) => ({ ...prev, [rec.id]: 'Analyse indisponible pour le moment.' }));
    } finally {
      setLoadingAnalysisId(null);
    }
  };

  const loadUserVitalityAndProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: logData }, { data: profileData }] = await Promise.all([
      supabase
        .from('health_logs')
        .select('cognitive_index, metabolic_stability, recovery_index, vitality_score')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('profiles')
        .select('glycemic_vigilance')
        .eq('id', user.id)
        .maybeSingle(),
    ]);

    if (logData) setUserVitality(logData);
    const vigilance = profileData?.glycemic_vigilance ?? false;
    setGlycemicVigilance(vigilance);

    if (logData) {
      fetchAdvice(
        logData.vitality_score ?? 75,
        logData.cognitive_index,
        logData.metabolic_stability,
        logData.recovery_index,
        vigilance,
      );
    }
  };

  const fetchAdvice = async (
    vitality: number,
    cognitive: number,
    metabolic: number,
    recovery: number,
    vigilance: boolean,
  ) => {
    try {
      const params = new URLSearchParams({
        vitality: String(vitality),
        cognitive: String(cognitive),
        metabolic: String(metabolic),
        recovery: String(recovery),
        glycemic_vigilance: String(vigilance),
        hour: String(new Date().getHours()),
      });
      const res = await fetch(`/api/advisor?${params}`);
      if (res.ok) {
        const json = await res.json();
        if (json.advice) setAdvice(json.advice);
      }
    } catch {
      // L'avis du conseiller reste indisponible silencieusement
    }
  };

  const loadRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .order('performance_rating', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setRecommendations(data);
      } else {
        setRecommendations(seedData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations :', error);
      setRecommendations(seedData);
    } finally {
      setLoading(false);
    }
  };

  const seedData: Recommendation[] = [
    {
      id: '1',
      dish_name: 'Thiéboudienne Royal',
      restaurant_name: 'Le Lagon',
      description: 'Pilier de la tradition sénégalaise, ce plat de poisson et de riz aux légumes biologiques délivre une richesse exceptionnelle en oméga-3 et glucides complexes pour une performance durable.',
      performance_rating: 92,
      metabolic_compatibility: ['balanced', 'endurance'],
      cognitive_boost: true,
      recovery_support: true,
      is_low_gi: false,
      price_tier: 'premium',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      dish_name: 'Bar Grillé au Quinoa',
      restaurant_name: 'Alkimia',
      description: 'Bar de ligne accompagné de quinoa ancestral et de légumes de saison, composé pour soutenir une stabilité métabolique optimale tout au long de la journée.',
      performance_rating: 95,
      metabolic_compatibility: ['balanced', 'performance'],
      cognitive_boost: true,
      recovery_support: false,
      is_low_gi: true,
      price_tier: 'luxury',
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      dish_name: 'Mafé Exécutif',
      restaurant_name: 'Le Lagon',
      description: 'Agneau confit en sauce d\'arachide avec patate douce caramélisée — une symphonie d\'acides gras essentiels et de vitamines B au service de la régénération musculaire.',
      performance_rating: 88,
      metabolic_compatibility: ['balanced', 'recovery'],
      cognitive_boost: false,
      recovery_support: true,
      is_low_gi: false,
      price_tier: 'premium',
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      dish_name: 'Poké Bowl Méditerranée',
      restaurant_name: 'Alkimia',
      description: 'Thon de pêche artisanale, avocat des terroirs et edamame sur riz noir au miso — assemblage raffiné pour aiguiser l\'acuité mentale avant une décision capitale.',
      performance_rating: 91,
      metabolic_compatibility: ['balanced', 'cognitive'],
      cognitive_boost: true,
      recovery_support: false,
      is_low_gi: true,
      price_tier: 'premium',
      created_at: new Date().toISOString(),
    },
    {
      id: '5',
      dish_name: 'Yassa Poulet Prestige',
      restaurant_name: 'Le Lagon',
      description: 'Poulet de plein air longuement mariné au citron confit et aux oignons doux, servi sur riz jasmin parfumé — idéal pour une récupération complète après une journée exigeante.',
      performance_rating: 85,
      metabolic_compatibility: ['balanced', 'recovery'],
      cognitive_boost: false,
      recovery_support: true,
      is_low_gi: false,
      price_tier: 'standard',
      created_at: new Date().toISOString(),
    },
  ];

  const priceTierLabel: Record<string, string> = {
    standard: 'Standard',
    premium: 'Premium',
    luxury: 'Excellence',
  };

  const restaurants = ['all', ...Array.from(new Set(recommendations.map((r) => r.restaurant_name)))];

  const getMatchScore = (rec: Recommendation) => {
    let bonus = 0;
    if (userVitality) {
      if (userVitality.recovery_index < 65 && rec.recovery_support) bonus += 15;
      if (userVitality.cognitive_index < 70 && rec.cognitive_boost) bonus += 15;
    }
    if (glycemicVigilance && rec.is_low_gi) bonus += 20;
    return rec.performance_rating + bonus;
  };

  const isRecommended = (rec: Recommendation) => {
    if (!userVitality) return false;
    return (
      (userVitality.recovery_index < 65 && rec.recovery_support) ||
      (userVitality.cognitive_index < 70 && rec.cognitive_boost)
    );
  };

  const filteredRecommendations = recommendations
    .filter((rec) => {
      const matchesSearch =
        rec.dish_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRestaurant =
        selectedRestaurant === 'all' || rec.restaurant_name === selectedRestaurant;
      return matchesSearch && matchesRestaurant;
    })
    .sort((a, b) => getMatchScore(b) - getMatchScore(a));

  const getRatingColor = (rating: number) => {
    if (rating >= 90) return 'text-gold';
    if (rating >= 80) return 'text-green-400';
    if (rating >= 70) return 'text-amber-500';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A192F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Chargement des recommandations gastronomiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A192F]">
      <header className="border-b border-[#2A3F5F] bg-[#0A192F]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:bg-[#151F33]"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-playfair text-2xl font-light text-gold leading-none tracking-[-0.05em]">A</span>
              <span className="text-xl font-playfair text-white tracking-tight">ARIS</span>
            </div>

            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="h-6 w-6 text-gold" />
            <h1 className="text-3xl font-light text-white">Menu Terroir &amp; Performance</h1>
          </div>
          <p className="text-gray-400 text-sm">
            Sélection exclusive des meilleurs établissements de Dakar, optimisée pour la performance des dirigeants
          </p>
          {userVitality && (userVitality.recovery_index < 65 || userVitality.cognitive_index < 70 || glycemicVigilance) && (
            <div className="mt-4 flex items-center gap-2 text-xs text-gold bg-gold/10 border border-gold/20 rounded-lg px-4 py-2.5 w-fit">
              <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                Tri personnalisé selon votre profil du jour
                {userVitality.recovery_index < 65 && ' · Récupération prioritaire'}
                {userVitality.cognitive_index < 70 && ' · Soutien cognitif recommandé'}
                {glycemicVigilance && ' · Vigilance glycémique — plats IG bas mis en avant'}
              </span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Rechercher un plat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-[#151F33] border-[#2A3F5F] text-white placeholder:text-gray-600 h-12 focus:border-gold focus:ring-gold"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {restaurants.map((restaurant) => (
              <Button
                key={restaurant}
                onClick={() => setSelectedRestaurant(restaurant)}
                variant={selectedRestaurant === restaurant ? 'default' : 'outline'}
                className={
                  selectedRestaurant === restaurant
                    ? 'bg-gold text-[#0A192F] hover:bg-gold-dark border-gold whitespace-nowrap'
                    : 'border-[#2A3F5F] text-gray-400 hover:text-white hover:bg-[#151F33] whitespace-nowrap'
                }
              >
                {restaurant === 'all' ? 'Tous les établissements' : restaurant}
              </Button>
            ))}
          </div>
        </div>

        {advice && (
          <div className="mb-8 bg-gradient-to-br from-gold/10 to-transparent border border-gold/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                <span className="font-playfair text-lg font-semibold text-[#0A192F] leading-none">A</span>
              </div>
              <div>
                <p className="text-xs text-gold uppercase tracking-wider mb-2 font-medium">
                  L'Avis du Conseiller
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">{advice}</p>
              </div>
            </div>
          </div>
        )}

        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">Aucun plat ne correspond à vos critères</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-[#151F33] border border-[#2A3F5F] rounded-xl overflow-hidden hover:border-gold/50 transition-all duration-300 group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-light text-white mb-1 group-hover:text-gold transition-colors">
                        {rec.dish_name}
                      </h3>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        {rec.restaurant_name}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-gold fill-gold" />
                        <span className={`text-lg font-medium ${getRatingColor(rec.performance_rating)}`}>
                          {rec.performance_rating}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">Score</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    {rec.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {isRecommended(rec) && (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-gold/10 border border-gold/30 rounded-md">
                        <Sparkles className="h-3 w-3 text-gold" />
                        <span className="text-xs text-gold font-medium">Recommandé</span>
                      </div>
                    )}
                    {rec.cognitive_boost && (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0A192F] rounded-md">
                        <Brain className="h-3 w-3 text-gold" />
                        <span className="text-xs text-gray-400">Cognitif</span>
                      </div>
                    )}
                    {rec.recovery_support && (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0A192F] rounded-md">
                        <Activity className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-gray-400">Récupération</span>
                      </div>
                    )}
                    {rec.is_low_gi && (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-md">
                        <Activity className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-green-400">IG Bas</span>
                      </div>
                    )}
                    <div className="px-2 py-1 bg-[#0A192F] rounded-md">
                      <span className="text-xs text-gray-400">
                        {priceTierLabel[rec.price_tier] ?? rec.price_tier}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAnalysis(rec)}
                    className={`w-full border transition-all duration-300 ${
                      expandedId === rec.id
                        ? 'bg-gold text-[#0A192F] hover:bg-gold-dark border-gold'
                        : 'bg-gold/10 text-gold hover:bg-gold hover:text-[#0A192F] border-gold/30'
                    }`}
                  >
                    {loadingAnalysisId === rec.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Analyse en cours...
                      </span>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {expandedId === rec.id ? 'Masquer l\'analyse' : 'Analyser le Profil Nutritionnel'}
                      </>
                    )}
                  </Button>

                  {expandedId === rec.id && (
                    <div className="mt-4 pt-4 border-t border-[#2A3F5F]">
                      {loadingAnalysisId === rec.id ? (
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 border border-gold/50 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                          <span className="text-xs text-gray-500 italic">
                            Génération de l'analyse nutritionnelle...
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {analyses[rec.id]}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-gradient-to-br from-gold/10 to-transparent border border-gold/30 rounded-xl p-8">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
              <span className="font-playfair text-xl font-semibold text-[#0A192F] leading-none">A</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Optimisation de la Performance</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Notre analyse propulsée par l'IA évalue chaque plat selon l'équilibre macronutritionnel,
                la densité micronutritionnelle, la charge glycémique et la qualité des ingrédients.
                Les scores reflètent l'impact sur la performance cognitive, la stabilité métabolique
                et la capacité de récupération.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
