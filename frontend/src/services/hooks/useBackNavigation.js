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

      // Always close sidebar if open
      if (currentSidebarOpen) {
        currentSetSidebarOpen(false);
        if (currentSetSidebarCollapsed) currentSetSidebarCollapsed(true);
      }

      // If on an internal page, always go back to dashboard
      if (currentIsInternal) {
        currentSetTab('dashboard');
      }
      
      // If already on dashboard and sidebar closed, do nothing (stay on dashboard)
    },
    [] 
  );

  useEffect(() => {
    // Ensure there is a history state to pop so we don't accidentally exit on first back press
    window.history.pushState({ sgcInit: true }, '', window.location.href);

    const onPop = (e) => {
      handleBack(true);
      // Always push state again so the user never exits the app via hardware back button
      window.history.pushState({ sgcStay: true }, '', window.location.href);
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return { handleBack };
}