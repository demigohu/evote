'use client';

import dynamic from 'next/dynamic';

// Nonaktifkan SSR untuk RegisterContent
const RegisterContent = dynamic(() => import('./RegisterContent'), { ssr: false });

export default function Register() {
  return <RegisterContent />;
}