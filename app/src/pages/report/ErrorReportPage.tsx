import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, XCircle, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { correctionService } from '@/api';
import { correctionTypeLabel, mapCorrectionStatus, resolveImageUrl } from '@/api/mappers';
import type { ServerCorrection } from '@/api/types';

type Status = 'pending' | 'resolved' | 'rejected';

const STATUS_CONFIG: Record<Status, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  resolved: { label: '已采纳', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  pending:  { label: '审核中', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  rejected: { label: '未采纳', icon: XCircle, color: 'text-[#878787]', bg: 'bg-[#F2F2F2]' },
};

export function ErrorReportPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ServerCorrection[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    correctionService.getCorrections({ pageSize: 50 }).then((res) => {
      setReports(res.list);
      setTotal(res.total);
    }).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2]">
      <PageHeader
        title="纠错记录"
        subtitle={`共提交 ${total} 条纠错`}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6 space-y-3">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[#878787]">
            <p className="text-[14px]">还没有提交过纠错</p>
          </div>
        ) : (
          reports.map((report, i) => {
            const card = report.knowledge;
            const cfg = STATUS_CONFIG[mapCorrectionStatus(report.status)];
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => navigate(`/error-reports/${report.id}`)}
                className="bg-[#FDFDFD] rounded-[18px] p-4 border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.05)] active:opacity-75 transition-opacity cursor-pointer"
              >
                {/* Card reference */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-[10px] overflow-hidden bg-[#F2F2F2] shrink-0">
                    {card && <img src={resolveImageUrl(card.resource_url)} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <p className="text-[12px] font-medium text-[#121111] line-clamp-1 flex-1">
                    {card?.title || '未知卡片'}
                  </p>
                </div>

                {/* Reason */}
                <p className="text-[13px] text-[#787676] leading-relaxed mb-3 line-clamp-2">
                  {correctionTypeLabel(report.type)}：{report.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#878787]">{report.created_at.slice(0, 10)}</span>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-[100px] ${cfg.bg}`}>
                      <cfg.icon size={12} strokeWidth={2.5} className={cfg.color} />
                      <span className={`text-[11px] font-medium ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <ChevronRight size={14} strokeWidth={2} className="text-[#DFDEDE]" />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}

        {/* Info note */}
        <div className="bg-[#F2F2F2] rounded-[14px] p-3 border border-[#DFDEDE]/50">
          <p className="text-[11px] text-[#878787] leading-relaxed text-center">
            纠错内容将由编辑团队在 3 个工作日内审核，感谢你为知识质量的贡献 ✨
          </p>
        </div>
      </div>
    </div>
  );
}