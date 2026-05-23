import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Check } from 'lucide-react';
import { useUser } from '@/providers/UserContext';
import { authService } from '@/api';
import { toast } from 'sonner';

export function SignatureEditPage() {
  const navigate = useNavigate();
  const { profile, updateProfile, refreshProfile } = useUser();

  const signatureStatus = profile.reviewInfo.signature?.status ?? 0;
  const isReviewing = signatureStatus === 1;

  const initialSignature = signatureStatus !== 0 ? (profile.reviewInfo.signature?.value || profile.bio || '') : profile.bio || '';

  const [signature, setSignature] = useState(initialSignature);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    // 未改变直接返回
    if (signature === initialSignature) {
      navigate(-1);
      return;
    }

    setSaving(true);
    try {
      const result = await authService.updateProfile({ signature });
      await refreshProfile();

      if (!result || result.pending) {
        toast.success('提交成功，等待管理员审核');
        setTimeout(() => navigate(-1), 800);
      } else {
        updateProfile({ bio: signature });
        setSaved(true);
        setTimeout(() => navigate(-1), 800);
      }
    } catch {
      toast.error('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2] relative">
      {/* Header */}
      <div className="bg-[#F2F2F2] shrink-0">
        <div className="flex items-center justify-between px-5 py-4">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(-1)}
            className="w-[38px] h-[38px] bg-[#FDFDFD] rounded-[12px] border border-[#DFDEDE] flex items-center justify-center shadow-[0_2px_6px_rgba(41,37,38,0.06)]"
          >
            <ChevronLeft size={20} strokeWidth={2.5} className="text-[#121111]" />
          </motion.button>

          <span className="text-[16px] font-bold text-[#121111]">修改签名</span>

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleSave}
            disabled={saving || isReviewing}
            className="w-[38px] h-[38px] bg-[#292526] rounded-[12px] flex items-center justify-center shadow-[0_2px_6px_rgba(41,37,38,0.2)] disabled:opacity-50"
          >
            <Check size={18} strokeWidth={2.5} className={`text-white ${saving ? 'animate-pulse' : ''}`} />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-10">
        {/* Signature Input */}
        <div className="bg-[#FDFDFD] rounded-[18px] px-5 py-4 border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)]">
          <p className="text-[11px] font-medium text-[#878787] mb-2">个性签名</p>
          <textarea
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            maxLength={40}
            rows={3}
            placeholder="写一句话介绍自己..."
            autoFocus
            disabled={isReviewing}
            className="w-full text-[15px] text-[#121111] bg-transparent outline-none resize-none placeholder:text-[#DFDEDE] disabled:opacity-50"
          />
          <div className="flex justify-end mt-2">
            <span className="text-[10px] text-[#DFDEDE]">{signature.length}/40</span>
          </div>
        </div>

        {/* Review Status */}
        {profile.reviewInfo.signature && profile.reviewInfo.signature.status !== 0 && (
          <div className="mt-3">
            {profile.reviewInfo.signature.status === 1 && (
              <p className="text-[12px] text-[#F59E0B]">当前签名正在审核中</p>
            )}
            {profile.reviewInfo.signature.status === 2 && signature === (profile.reviewInfo.signature?.value || '') && (
              <p className="text-[12px] text-[#EF4444]">
                审核未通过：{profile.reviewInfo.signature.msg || '请修改后重新提交'}
              </p>
            )}
          </div>
        )}

        {/* Save banner */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 bg-green-50 border border-green-100 rounded-[14px] p-3 flex items-center gap-2"
            >
              <Check size={16} strokeWidth={2.5} className="text-green-600 shrink-0" />
              <span className="text-[13px] font-medium text-green-700">保存成功，正在返回...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
