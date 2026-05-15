import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, XCircle, MessageSquare, FileText } from 'lucide-react';
import { MOCK_CARDS } from '../../data/mock';
import { PageHeader } from '../../components/PageHeader';

type Status = 'pending' | 'resolved' | 'rejected';

const MOCK_REPORTS: {
  id: string;
  cardId: string;
  reason: string;
  note: string;
  status: Status;
  date: string;
  reviewDate?: string;
  reviewComment?: string;
}[] = [
  {
    id: '1',
    cardId: '3',
    reason: '内容描述不准确',
    note: '瑞利散射还涉及到其他波长的散射，描述过于简化',
    status: 'resolved',
    date: '2026-04-20',
    reviewDate: '2026-04-22',
    reviewComment: '感谢反馈！我们已补充了关于其他波长散射的说明，内容更新已发布。',
  },
  {
    id: '2',
    cardId: '1',
    reason: '数据或数字有误',
    note: '蓝光伤害说法有争议，缺乏具体研究引用',
    status: 'pending',
    date: '2026-04-28',
  },
  {
    id: '3',
    cardId: '5',
    reason: '内容已过时',
    note: '关于修复过程的描述存在歧义，建议参考最新研究',
    status: 'rejected',
    date: '2026-04-15',
    reviewDate: '2026-04-17',
    reviewComment: '经团队核实，目前内容描述符合主流学术观点，暂不做修改，感谢你的反馈！',
  },
];

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
  const report = MOCK_REPORTS.find((r) => r.id === id);

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

  const card = MOCK_CARDS.find((c) => c.id === report.cardId);
  const cfg = STATUS_CONFIG[report.status];
  const timeline = TIMELINE[report.status];

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2]">
      <PageHeader title="纠错详情" subtitle={`提交于 ${report.date}`} />

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
              {report.status === 'pending' ? '正在审核中，请耐心等待' : `审核完成于 ${report.reviewDate}`}
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
              {card && <img src={card.image} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-[#121111] line-clamp-2 leading-snug">
                {card?.title || '未知卡片'}
              </p>
              <span className="text-[10px] text-[#878787] mt-1 inline-block">{card?.category}</span>
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
            <span className="text-[13px] font-medium text-[#292526]">{report.reason}</span>
          </div>
          {report.note && (
            <div className="bg-[#F2F2F2] rounded-[12px] p-3">
              <p className="text-[13px] text-[#787676] leading-relaxed">{report.note}</p>
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
        {report.reviewComment && (
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
              <p className="text-[13px] text-[#787676] leading-relaxed">{report.reviewComment}</p>
            </div>
            <p className="text-[10px] text-[#DFDEDE] mt-2 text-right">{report.reviewDate}</p>
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
