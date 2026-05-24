import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
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
    color: 'text-text-muted',
    bg: 'bg-bg-page',
    border: 'border-border',
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
  const navigate = useNavigate();
  const [report, setReport] = useState<ServerCorrection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    correctionService.getCorrection(id)
      .then((data) => setReport(data))
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-bg-page">
        <PageHeader title="纠错详情" />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="w-6 h-6 border-2 border-border border-t-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col h-full bg-bg-page">
        <PageHeader title="纠错详情" />
        <div className="flex-1 flex items-center justify-center text-text-muted text-[14px]">
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
    <div className="flex flex-col h-full bg-bg-page">
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
            <p className="text-[11px] text-text-muted mt-0.5">
              {status === 'pending' ? '正在审核中，请耐心等待' : `审核完成于 ${report.review_time?.slice(0, 10) || ''}`}
            </p>
          </div>
        </motion.div>

        {/* Referenced card - Favorites style */}
        {card && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            onClick={() => navigate(`/card/${card.id}`)}
            className="bg-bg-card rounded-[18px] overflow-hidden border border-border/50 shadow-[0_2px_8px_rgba(41,37,38,0.05)] flex cursor-pointer active:opacity-80 transition-opacity"
          >
            {/* Thumbnail */}
            <div className="w-[90px] shrink-0 bg-bg-page relative">
              <img
                src={resolveImageUrl(card.resource_url)}
                alt={card.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#121111]/10" />
              {/* <span className="absolute top-2 left-2 text-[9px] text-white bg-[#121111]/60 backdrop-blur-sm px-2 py-0.5 rounded-[100px]">
                {card.category?.name || '未分类'}
              </span> */}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
              <div>
                <h3 className="text-[14px] font-bold text-text-main leading-snug line-clamp-2">
                  {card.title}
                </h3>
                {card.content && (
                  <p className="text-[12px] text-text-muted mt-1.5 leading-snug line-clamp-1">
                    {card.content}
                  </p>
                )}
              </div>
              <div className="flex items-center mt-2">
                <div className="flex items-center gap-1 min-w-0">
                  <div className="w-1 h-1 rounded-full bg-border shrink-0" />
                  <span className="text-[10px] text-text-muted truncate">{card.source}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Report content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.09 }}
          className="bg-bg-card rounded-[20px] p-4 border border-border/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)]"
        >
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-3">纠错内容</p>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={14} strokeWidth={2} className="text-primary shrink-0" />
            <span className="text-[13px] font-medium text-primary">{correctionTypeLabel(report.type)}</span>
          </div>
          {report.description && (
            <div className="bg-bg-page rounded-[12px] p-3">
              <p className="text-[13px] text-text-sub leading-relaxed">{report.description}</p>
            </div>
          )}
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
          className="bg-bg-card rounded-[20px] p-4 border border-border/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)]"
        >
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-4">处理进度</p>

          <div className="flex items-start gap-0">
            {timeline.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                {/* Line connector */}
                <div className="flex items-center w-full mb-2">
                  {i > 0 && (
                    <div
                      className={`flex-1 h-[2px] ${
                        item.done ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  )}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      item.done ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    {item.done && (
                      <CheckCircle2 size={11} strokeWidth={3} className="text-[#FDFDFD]" />
                    )}
                  </div>
                  {i < timeline.length - 1 && (
                    <div
                      className={`flex-1 h-[2px] ${
                        timeline[i + 1].done ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  )}
                </div>
                <p
                  className={`text-[10px] text-center leading-tight ${
                    item.done ? 'text-primary font-medium' : 'text-[#DFDEDE]'
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
            className="bg-bg-card rounded-[20px] p-4 border border-border/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)]"
          >
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={14} strokeWidth={2} className="text-primary" />
              <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">编辑团队回复</p>
            </div>
            <div className="bg-bg-page rounded-[12px] p-3">
              <p className="text-[13px] text-text-sub leading-relaxed">{report.review_remark}</p>
            </div>
            <p className="text-[10px] text-[#DFDEDE] mt-2 text-right">{report.review_time?.slice(0, 10)}</p>
          </motion.div>
        )}

        {/* Info note */}
        <div className="bg-bg-page rounded-[14px] p-3 border border-border/50">
          <p className="text-[11px] text-text-muted leading-relaxed text-center">
            纠错内容将由编辑团队在 3 个工作日内审核，感谢你为知识质量的贡献 ✨
          </p>
        </div>
      </div>
    </div>
  );
}
