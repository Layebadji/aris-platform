'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Mail, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A192F] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <span className="font-playfair text-5xl font-light text-gold leading-none tracking-[-0.05em]">A</span>
              <Sparkles className="h-5 w-5 text-gold absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>

          <h1 className="text-4xl font-light tracking-tight text-white mb-3">
            <span className="font-playfair">ARIS</span>
          </h1>

          <p className="text-sm text-gray-400 tracking-widest uppercase mb-2">
            Excellence Bio-Performance
          </p>

          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"></div>
        </div>

        <div className="bg-[#151F33] border border-[#2A3F5F] rounded-2xl p-8 shadow-2xl">
          {!sent ? (
            <form onSubmit={handleMagicLink} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-light text-gray-300 tracking-wide"
                >
                  Accès Souverain
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@executif.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-11 bg-[#0A192F] border-[#2A3F5F] text-white placeholder:text-gray-600 h-12 focus:border-gold focus:ring-gold"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full h-12 bg-gold hover:bg-gold-dark text-[#0A192F] font-medium tracking-wide transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-[#0A192F] border-t-transparent rounded-full animate-spin"></div>
                    Authentification en cours...
                  </span>
                ) : (
                  'Demander un Lien Souverain'
                )}
              </Button>

              <p className="text-xs text-center text-gray-500 leading-relaxed">
                Nous vous transmettrons un lien d'authentification sécurisé sans mot de passe.
                <br />
                Valide pendant 60 minutes.
              </p>
            </form>
          ) : (
            <div className="text-center py-6 space-y-6">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-gold" />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-light text-white">
                  Consultez Votre Messagerie
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Nous avons transmis un lien d'accès sécurisé à
                  <br />
                  <span className="text-gold font-medium">{email}</span>
                </p>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => {
                    setSent(false);
                    setEmail('');
                  }}
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:bg-[#0A192F]"
                >
                  Utiliser une autre adresse
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-8">
          Réservé aux dirigeants d'élite à Dakar
        </p>
      </div>
    </div>
  );
}
