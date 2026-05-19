export interface FavoriteChangeEvent {
  cardId: string;
  isFavorited: boolean;
}

type Listener = (event: FavoriteChangeEvent) => void;

const listeners = new Set<Listener>();

export const favoriteEvents = {
  emit(event: FavoriteChangeEvent) {
    listeners.forEach((fn) => fn(event));
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
};
