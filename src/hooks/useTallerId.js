import { useState, useEffect } from 'react';

export function useTallerId() {
  const [tallerId, setTallerId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionStr = localStorage.getItem('user_session') || sessionStorage.getItem('user_session');
    
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        setTallerId(session.taller_id || session.workshop_id || null);
      } catch (e) {
        console.error('Error parsing session:', e);
      }
    }
    setLoading(false);
  }, []);

  return { tallerId, loading };
}
