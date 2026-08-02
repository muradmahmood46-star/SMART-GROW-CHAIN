/* eslint-disable */
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
 * @param {boolean}  options.sidebarOpen       - Whether sidebar is open (mobile overlay)
 * @param {Function} options.setSidebarOpen    - Open/close sidebar overlay
 * @param {Function} [options.setSidebarCollapsed] - Collapse/expand sidebar (optional)
 * @param {Function} options.navigate          - React Router navigate function
 * @param {boolean}  [options.isAdmin=false]   - Whether this is the admin panel
 * @returns {{ handleBack: Function }}
 */
export default function useBackNavigation({
  tab,
  setTab,
  sidebarOpen,
  setSidebarOpen,
  setSidebarCollapsed,
  navigate,
  isAdmin = false,
}) {
  const isInternal = tab !== 'dashboard';
  const processingRef = useRef(false);

  // ── Refs to avoid stale closures in popstate handler ──
  const sidebarOpenRef = useRef(sidebarOpen);
  sidebarOpenRef.current = sidebarOpen;

  const tabRef = useRef(tab);
  tabRef.current = tab;

  const isInternalRef = useRef(isInternal);
  isInternalRef.current = isInternal;

  const setTabRef = useRef(setTab);
  setTabRef.current = setTab;

  const setSidebarOpenRef = useRef(setSidebarOpen);
  setSidebarOpenRef.current = setSidebarOpen;

  const setSidebarCollapsedRef = useRef(setSidebarCollapsed);
  setSidebarCollapsedRef.current = setSidebarCollapsed;

  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const isAdminRef = useRef(isAdmin);
  isAdminRef.current = isAdmin;

  /**
   * Check if the current viewport is mobile width.
   * On mobile, sidebarOpen controls the overlay behavior.
   * On desktop, only sidebarCollapsed is used (sidebar is always in normal position).
   */
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  /**
   * Core back handler – called by all three back methods.
   * Uses refs internally so it always has the latest values.
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

      const currentSidebarOpen = sidebarOpenRef.current;
      const currentIsInternal = isInternalRef.current;
      const currentSetTab = setTabRef.current;
      const currentSetSidebarOpen = setSidebarOpenRef.current;
      const currentSetSidebarCollapsed = setSidebarCollapsedRef.current;
      const currentNavigate = navigateRef.current;
      const currentIsAdmin = isAdminRef.current;
      const mobile = window.innerWidth <= 768;

      if (currentSidebarOpen) {
        // Sidebar overlay is open → Dashboard
        if (mobile) {
          currentSetSidebarOpen(false);
          if (currentSetSidebarCollapsed) currentSetSidebarCollapsed(true);
        } else {
          // Desktop: just close the overlay (sidebar stays in normal position)
          currentSetSidebarOpen(false);
        }
        currentSetTab('dashboard');
        return;
      }

      if (currentIsInternal) {
        // Internal page → Sidebar opens (for both User and Admin)
        if (mobile) {
          currentSetSidebarOpen(true);
          if (currentSetSidebarCollapsed) currentSetSidebarCollapsed(false);
        } else {
          if (currentSetSidebarCollapsed) currentSetSidebarCollapsed(false);
        }
        return;
      }

      // Dashboard → Login
      currentNavigate(currentIsAdmin ? '/admin-login' : '/login', fromPopstate ? { replace: true } : undefined);
    },
    [] // No deps needed – all values come from refs
  );

  // ── Popstate handler (browser back + hardware back) ──
  // Only mounted once – always reads latest values from refs
  useEffect(() => {
    const onPop = (e) => {
      const currentSidebarOpen = sidebarOpenRef.current;
      const currentTab = tabRef.current;

      // Capture whether we're about to navigate away BEFORE handleBack changes state
      const goingToLogin = !currentSidebarOpen && currentTab === 'dashboard';

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
  }, []); // Empty deps – refs always have latest values

  return { handleBack };
}