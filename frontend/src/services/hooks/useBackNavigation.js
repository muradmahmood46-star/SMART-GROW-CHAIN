import { useCallback, useEffect, useRef } from 'react';

/**
 * Centralized back navigation hook for User and Admin panels.
 *
 * Manages the state machine:
 *   Internal Page → Back → Sidebar opens
 *   Sidebar open → Back → Dashboard
 *   Dashboard → Back → Login
 *
 * All three back methods (browser back, hardware back, internal back arrow)
 * use the same handleBack logic.
 *
 * @param {Object} options
 * @param {string}   options.tab               - Current active tab
 * @param {Function} options.setTab            - Set active tab
 * @param {boolean}  options.sidebarOpen       - Whether sidebar is open
 * @param {Function} options.setSidebarOpen    - Open/close sidebar
 * @param {Function} [options.setSidebarCollapsed] - Collapse/expand sidebar (optional)
 * @param {Function} options.navigate          - React Router navigate function
 * @returns {{ handleBack: Function }}
 */
export default function useBackNavigation({
  tab,
  setTab,
  sidebarOpen,
  setSidebarOpen,
  setSidebarCollapsed,
  navigate,
}) {
  const isInternal = tab !== 'dashboard';
  const processingRef = useRef(false);

  /**
   * Core back handler – called by all three back methods.
   * @param {boolean} [fromPopstate=false] - true when called from popstate event
   */
  const handleBack = useCallback(
    (fromPopstate = false) => {
      // Prevent rapid double-back
      if (processingRef.current) return;
      processingRef.current = true;
      setTimeout(() => {
        processingRef.current = false;
      }, 300);

      if (sidebarOpen) {
        // Sidebar → Dashboard
        setSidebarOpen(false);
        if (setSidebarCollapsed) setSidebarCollapsed(true);
        setTab('dashboard');
        return;
      }

      if (isInternal) {
        // Internal page → Sidebar opens
        setSidebarOpen(true);
        if (setSidebarCollapsed) setSidebarCollapsed(false);
        return;
      }

      // Dashboard → Login
      // Use replace when coming from popstate to avoid duplicate history entries
      navigate('/login', fromPopstate ? { replace: true } : undefined);
    },
    [sidebarOpen, isInternal, setTab, setSidebarOpen, setSidebarCollapsed, navigate]
  );

  // ── Popstate handler (browser back + hardware back) ──
  useEffect(() => {
    const onPop = (e) => {
      // Capture whether we're about to navigate away BEFORE handleBack changes state
      const goingToLogin = !sidebarOpen && tab === 'dashboard';

      handleBack(true);

      if (!goingToLogin) {
        // Keep the history stack balanced when staying on the same URL
        window.history.pushState({}, '', window.location.href);
      }
      // If goingToLogin is true, navigate('/login', { replace: true }) handles history
      // and the component will unmount, cleaning up this listener
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [handleBack, sidebarOpen, tab]);

  return { handleBack };
}