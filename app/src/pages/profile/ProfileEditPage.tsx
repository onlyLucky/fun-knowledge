import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { useUser } from '@/providers/UserContext';
import DefaultAvatar from '@/assets/images/avatar.png';

// 状态标签组件
function StatusBadge({ status, msg }: { status: number; msg?: string }) {
  if (status === 0) return null;
  if (status === 1) {
    return (
      <span className="text-[10px] bg-[#FEF3C7] text-[#D97706] px-2 py-0.5 rounded-[100px] font-medium">
        审核中
      </span>
    );
  }
  if (status === 2) {
    return (
      <span
        className="text-[10px] bg-[#FEE2E2] text-[#DC2626] px-2 py-0.5 rounded-[100px] font-medium"
        title={msg}
      >
        审核失败
      </span>
    );
  }
  return null;
}

export function ProfileEditPage() {
  const navigate = useNavigate();
  const { profile } = useUser();

  const avatarStatus = profile.reviewInfo.avatar?.status ?? 0;
  const nicknameStatus = profile.reviewInfo.nickname?.status ?? 0;
  const signatureStatus = profile.reviewInfo.signature?.status ?? 0;

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

          <span className="text-[16px] font-bold text-[#121111]">编辑资料</span>

          <div className="w-[38px]" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* Avatar Section */}
        <div className="flex flex-col items-center py-8">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => navigate('/profile/edit/avatar')}
            className="relative"
          >
            <div className="w-[90px] h-[90px] rounded-[100px] overflow-hidden shadow-[0_6px_20px_rgba(41,37,38,0.18)]">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#292526] flex items-center justify-center">
                  <img src={DefaultAvatar} alt="avatar" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            {/* Edit badge */}
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#292526] rounded-full flex items-center justify-center border-2 border-[#F2F2F2] shadow-md">
              <Pencil size={13} strokeWidth={2.5} className="text-white" />
            </div>
          </motion.button>

          {/* Avatar status */}
          {avatarStatus !== 0 && (
            <div className="mt-2">
              <StatusBadge status={avatarStatus} msg={profile.reviewInfo.avatar?.msg} />
            </div>
          )}

          <p className="text-[12px] text-[#878787] mt-2">点击更换头像</p>
        </div>

        {/* Fields */}
        <div className="px-5 space-y-3">
          {/* Nickname */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/profile/edit/nickname')}
            className="w-full bg-[#FDFDFD] rounded-[18px] px-5 py-4 border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)] flex items-center justify-between"
          >
            <div className="flex-1 text-left">
              <p className="text-[11px] font-medium text-[#878787] mb-1">昵称</p>
              <p className="text-[15px] text-[#121111]">{profile.nickname}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={nicknameStatus} msg={profile.reviewInfo.nickname?.msg} />
              <ChevronRight size={16} strokeWidth={2} className="text-[#DFDEDE]" />
            </div>
          </motion.button>

          {/* Signature */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/profile/edit/signature')}
            className="w-full bg-[#FDFDFD] rounded-[18px] px-5 py-4 border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)] flex items-center justify-between"
          >
            <div className="flex-1 text-left">
              <p className="text-[11px] font-medium text-[#878787] mb-1">个性签名</p>
              <p className="text-[15px] text-[#121111]">{profile.bio || '暂无签名'}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={signatureStatus} msg={profile.reviewInfo.signature?.msg} />
              <ChevronRight size={16} strokeWidth={2} className="text-[#DFDEDE]" />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
