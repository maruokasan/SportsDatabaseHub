// src/components/ui/ModalDrawer.jsx
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function ModalDrawer({ isOpen, title, children, actions, onClose }) {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
    }
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <aside className="relative ml-auto flex h-full w-full max-w-lg flex-col bg-shell-surface text-text-primary transition duration-[250ms] ease-in-out md:rounded-l-shell">
        <header className="flex items-center justify-between border-b border-shell-border px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Admin</p>
            <h3 className="font-display text-lg">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-shell-border text-text-muted transition hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {actions ? <div className="border-t border-shell-border bg-shell-raised/40 px-5 py-4">{actions}</div> : null}
      </aside>
    </div>,
    document.body
  );
}
