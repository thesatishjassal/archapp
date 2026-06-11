'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('arch_user_verified');

    if (verified === 'true') {
      setAuthorized(true);
    } else {
      router.replace('/login');
    }
  }, [router]);

  if (!authorized) {
    return null; // or loading spinner
  }

  return children;
}