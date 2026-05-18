import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface FavoritesContextType {
  saved: Set<string>;
  toggleSave: (cardId: string) => void;
  isSaved: (cardId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const toggleSave = useCallback((cardId: string) => {
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }, []);

  const isSaved = useCallback((cardId: string) => {
    return saved.has(cardId);
  }, [saved]);

  return (
    <FavoritesContext.Provider value={{ saved, toggleSave, isSaved }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
