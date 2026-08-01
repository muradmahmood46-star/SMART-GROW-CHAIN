import { useEffect, useRef } from 'react';
import API from '../api';

export default function SessionTracker() {
  const isActive = useRef(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleActivity = () => {
      isActive.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        isActive.current = false;
      }, 30000); // mark inactive after 30s of no input
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    const ping = () => {
      // Only ping if the user is considered active, the document is visible, and the user is logged in
      if (isActive.current && document.visibilityState === 'visible' && localStorage.getItem('token')) {
        API.post('/user/ping').catch(() => {
            // Ignore errors (e.g. token expired), ping will naturally fail and not crash the UI
        });
      }
    };

    const interval = setInterval(ping, 60000); // Ping every 60 seconds
    
    // Send an initial ping on mount
    ping();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return null;
}
