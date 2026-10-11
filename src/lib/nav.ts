import { useStore } from '../store';

export type RequestsView = 'main' | 'submit' | 'holiday' | 'meeting' | 'feedback' | 'quote' | 'directory' | 'history';

/** Deep links into Communication & Requests sub-views (prefilled forms). */
export function useRequestsNav() {
  const { update, closeModal } = useStore();
  return (view: RequestsView, opts?: { tab?: string; prefill?: string }) => {
    closeModal();
    update((s) => {
      s.page = 'requests';
      s.tabs['requests:view'] = view;
      s.tabs['requests:prefill'] = opts?.prefill ?? '';
      if (opts?.tab) s.tabs.requests = opts.tab;
    });
    try { history.replaceState(null, '', '#requests'); } catch { /* ignore */ }
    window.scrollTo({ top: 0 });
  };
}
