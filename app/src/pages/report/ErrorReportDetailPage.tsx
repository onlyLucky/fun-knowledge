import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, XCircle, MessageSquare, FileText } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { correctionService } from '@/api';
import { correctionTypeLabel, mapCorrectionStatus, resolveImageUrl } from '@/api/mappers';
import type { ServerCorrection } from '@/api/types';

type Status = 'pending' | 'resolved' | 'rejected';

const STATUS_CONFIG: Record<Status, { label: string; icon: typeof CheckCircle2; color: string; bg: string; border: string }> = {
  resolved: {
    label: '已采纳',
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-100',
  },
  pending: {
    label: '审核中',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  rejected: {
    label: '未采纳',
    icon: XCircle,
    color: 'text-[#878787]',
    bg: 'bg-[#F2F2F2]',
    border: 'border-[#DFDEDE]',
  },
};

const TIMELINE: Record<Status, { step: string; done: boolean }[]> = {
  resolved: [
    { step: '提交纠错', done: true },
    { step: '团队接收', done: true },
    { step: '内容审核', done: true },
    { step: '已采纳更新', done: true },
  ],
  pending: [
    { step: '提交纠错', done: true },
    { step: '团队接收', done: true },
    { step: '内容审核', done: false },
    { step: '结果通知', done: false },
  ],
  rejected: [
    { step: '提交纠错', done: true },
    { step: '团队接收', done: true },
    { step: '内容审核', done: true },
    { step: '未予采纳', done: true },
  ],
};

export function ErrorReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<ServerCorrection | null>(null);

  useEffect(() => {
    if (!id) return;
    correctionService.getCorrections({ pageSize: 100 }).then((res) => {
      const found = res.list.find((r) => r.id === id);
      setReport(found || null);
    }).catch(() => {});
  }, [id]);

  if (!report) {
    return (
      <div className="flex flex-col h-full bg-[#F2F2F2]">
        <PageHeader title="纠错详情" />
        <div className="flex-1 flex items-center justify-center text-[#878787] text-[14px]">
          找不到该纠错记录
        </div>
      </div>
    );
  }

  const card = report.knowledge;
  const status = mapCorrectionStatus(report.status);
  const cfg = STATUS_CONFIG[status];
  const timeline = TIMELINE[status];

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2]">
      <PageHeader title="纠错详情" subtitle={`提交于 ${report.created_at.slice(0, 10)}`} />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8 space-y-4">
        {/* Status banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-[18px] p-4 flex items-center gap-3 border ${cfg.bg} ${cfg.border}`}
        >
          <div className={`w-10 h-10 rounded-[12px] bg-white/60 flex items-center justify-center shrink-0`}>
            <cfg.icon size={20} strokeWidth={2} className={cfg.color} />
          </div>
          <div>
            <p className={`text-[14px] font-bold ${cfg.color}`}>{cfg.label}</p>
            <p className="text-[11px] text-[#878787] mt-0.5">
              {status === 'pending' ? '正在审核中，请耐心等待' : `审核完成于 ${report.review_time?.slice(0, 10) || ''}`}
            </p>
          </div>
        </motion.div>

        {/* Referenced card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[#FDFDFD] rounded-[20px] overflow-hidden border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)]"
        >
          <div className="px-4 pt-4 pb-2">
            <p className="text-[10px] font-medium text-[#878787] uppercase tracking-wider mb-3">关联卡片</p>
          </div>
          <div className="flex items-center gap-3 px-4 pb-4">
            <div className="w-14 h-14 rounded-[12px] overflow-hidden bg-[#F2F2F2] shrink-0">
              {card && <img src={resolveImageUrl(card.resource_url)} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-[#121111] line-clamp-2 leading-snug">
                {card?.title || '未知卡片'}
              </p>
              <span className="text-[10px] text-[#878787] mt-1 inline-block">{card?.category?.name || '未分类'}</span>
            </div>
          </div>
        </motion.div>

        {/* Report content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.09 }}
          className="bg-[#FDFDFD] rounded-[20px] p-4 border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)]"
        >
          <p className="text-[10px] font-medium text-[#878787] uppercase tracking-wider mb-3">纠错内容</p>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={14} strokeWidth={2} className="text-[#292526] shrink-0" />
            <span className="text-[13px] font-medium text-[#292526]">{correctionTypeLabel(report.type)}</span>
          </div>
          {report.description && (
            <div className="bg-[#F2F2F2] rounded-[12px] p-3">
              <p className="text-[13px] text-[#787676] leading-relaxed">{report.description}</p>
            </div>
          )}
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
          className="bg-[#FDFDFD] rounded-[20px] p-4 border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)]"
        >
          <p className="text-[10px] font-medium text-[#878787] uppercase tracking-wider mb-4">处理进度</p>

          <div className="flex items-start gap-0">
            {timeline.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                {/* Line connector */}
                <div className="flex items-center w-full mb-2">
                  {i > 0 && (
                    <div
                      className={`flex-1 h-[2px] ${
                        item.done ? 'bg-[#292526]' : 'bg-[#DFDEDE]'
                      }`}
                    />
                  )}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      item.done ? 'bg-[#292526]' : 'bg-[#DFDEDE]'
                    }`}
                  >
                    {item.done && (
                      <CheckCircle2 size={11} strokeWidth={3} className="text-[#FDFDFD]" />
                    )}
                  </div>
                  {i < timeline.length - 1 && (
                    <div
                      className={`flex-1 h-[2px] ${
                        timeline[i + 1].done ? 'bg-[#292526]' : 'bg-[#DFDEDE]'
                      }`}
                    />
                  )}
                </div>
                <p
                  className={`text-[10px] text-center leading-tight ${
                    item.done ? 'text-[#292526] font-medium' : 'text-[#DFDEDE]'
                  }`}
                >
                  {item.step}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Review comment */}
        {report.review_remark && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.17 }}
            className="bg-[#FDFDFD] rounded-[20px] p-4 border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)]"
          >
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={14} strokeWidth={2} className="text-[#292526]" />
              <p className="text-[10px] font-medium text-[#878787] uppercase tracking-wider">编辑团队回复</p>
            </div>
            <div className="bg-[#F2F2F2] rounded-[12px] p-3">
              <p className="text-[13px] text-[#787676] leading-relaxed">{report.review_remark}</p>
            </div>
            <p className="text-[10px] text-[#DFDEDE] mt-2 text-right">{report.review_time?.slice(0, 10)}</p>
          </motion.div>
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
