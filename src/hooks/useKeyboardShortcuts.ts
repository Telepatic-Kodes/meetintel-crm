'use client';

import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const matchingShortcut = shortcuts.find(shortcut => {
      return (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        !!event.ctrlKey === !!shortcut.ctrlKey &&
        !!event.shiftKey === !!shortcut.shiftKey &&
        !!event.altKey === !!shortcut.altKey
      );
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Predefined shortcuts for the application
export const APP_SHORTCUTS = {
  NEW_ANALYSIS: { key: 'n', ctrlKey: true, description: 'Nuevo análisis' },
  COPY_RESULT: { key: 'c', ctrlKey: true, description: 'Copiar resultado' },
  EXPORT_RESULT: { key: 'e', ctrlKey: true, description: 'Exportar resultado' },
  NEXT_TAB: { key: 'Tab', ctrlKey: true, description: 'Siguiente pestaña' },
  PREV_TAB: { key: 'Tab', ctrlKey: true, shiftKey: true, description: 'Pestaña anterior' },
  FOCUS_SEARCH: { key: 'k', ctrlKey: true, description: 'Buscar' },
  TOGGLE_SIDEBAR: { key: 'b', ctrlKey: true, description: 'Toggle sidebar' },
  HELP: { key: '?', description: 'Mostrar ayuda' }
};
