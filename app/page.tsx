'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A192F] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading ARIS...</p>
      </div>
    </div>
  );
}
