import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A192F] flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-3 mb-12">
        <span className="font-playfair text-4xl font-light text-gold leading-none tracking-[-0.05em]">A</span>
        <span className="text-3xl font-playfair text-white tracking-tight">ARIS</span>
      </div>
      <div className="bg-[#151F33] border border-[#2A3F5F] rounded-2xl p-10 max-w-md w-full text-center">
        <Compass className="h-10 w-10 text-gold mx-auto mb-4" strokeWidth={1.5} />
        <p className="text-6xl font-playfair font-light text-gold mb-4">404</p>
        <h1 className="text-xl font-light text-white mb-2">Page introuvable</h1>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link href="/dashboard">
          <Button className="w-full h-11 bg-gold hover:bg-gold-dark text-[#0A192F] font-medium">
            Retour au tableau de bord
          </Button>
        </Link>
      </div>
    </div>
  );
}
