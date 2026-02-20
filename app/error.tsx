'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ARIS] Erreur inattendue :', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A192F] flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-3 mb-12">
        <span className="font-playfair text-4xl font-light text-gold leading-none tracking-[-0.05em]">A</span>
        <span className="text-3xl font-playfair text-white tracking-tight">ARIS</span>
      </div>
      <div className="bg-[#151F33] border border-[#2A3F5F] rounded-2xl p-10 max-w-md w-full text-center">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
        <h1 className="text-xl font-light text-white mb-2">Une erreur est survenue</h1>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          Une interruption imprévue s'est produite. Vos données sont intactes.
          Vous pouvez réessayer ou revenir au tableau de bord.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            onClick={reset}
            className="w-full h-11 bg-gold hover:bg-gold-dark text-[#0A192F] font-medium"
          >
            Réessayer
          </Button>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            variant="outline"
            className="w-full h-11 border-[#2A3F5F] text-gray-400 hover:text-white hover:bg-[#0A192F]"
          >
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    </div>
  );
}
