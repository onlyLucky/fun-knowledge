type Listener = (loading: boolean) => void;

let activeCount = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
let visible = false;

const listeners = new Set<Listener>();

const DELAY = 300;

function emit() {
  listeners.forEach((fn) => fn(visible));
}

export const globalLoading = {
  start() {
    activeCount++;
    if (activeCount === 1 && !timer) {
      timer = setTimeout(() => {
        visible = true;
        emit();
      }, DELAY);
    }
  },

  stop() {
    activeCount = Math.max(0, activeCount - 1);
    if (activeCount === 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (visible) {
        visible = false;
        emit();
      }
    }
  },

  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
};
