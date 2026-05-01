import { useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  /** 是否显示返回按钮，子页面默认 true，主页面传 false */
  showBack?: boolean;
}

export function PageHeader({ title, subtitle, right, showBack = true }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F2F2F2] pt-safe shrink-0">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => navigate(-1)}
              className="w-[38px] h-[38px] bg-[#FDFDFD] rounded-[12px] border border-[#DFDEDE] flex items-center justify-center shadow-[0_2px_6px_rgba(41,37,38,0.06)]"
            >
              <ChevronLeft size={20} strokeWidth={2.5} className="text-[#121111]" />
            </motion.button>
          )}
          <div>
            <h1 className="text-[17px] font-bold text-[#121111]">{title}</h1>
            {subtitle && <p className="text-[11px] text-[#878787] mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {right && <div>{right}</div>}
      </div>
    </div>
  );
}