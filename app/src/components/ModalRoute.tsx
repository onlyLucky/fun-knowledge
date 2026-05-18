import { createPortal } from 'react-dom';
import { AuthSubGuard } from '@/router';

export function ModalRoute({ children }: { children: React.ReactNode }) {
  const container = document.getElementById('app-container');
  if (!container) return null;

  return (
    <AuthSubGuard>
      {createPortal(
        <div className="absolute inset-0 z-50 bg-[#F2F2F2] flex flex-col overflow-hidden">
          {children}
        </div>,
        container
      )}
    </AuthSubGuard>
  );
}
