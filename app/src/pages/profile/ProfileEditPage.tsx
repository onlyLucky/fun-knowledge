import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Check, Camera, Image } from 'lucide-react';
import { getPortalTarget } from '@/lib/portal';
import { useUser } from '@/providers/UserContext';
import { authService } from '@/api';
import { toast } from 'sonner';
import DefaultAvatar from "@/assets/images/avatar.png"

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ProfileEditPage() {
  const navigate = useNavigate();
  const { profile, updateProfile, initProfile } = useUser();

  const [nickname, setNickname] = useState(profile.nickname);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authService.updateProfile({
        nickname,
        signature: bio,
        avatar: avatarUrl || undefined,
      });
      updateProfile({ nickname, bio, avatarUrl });
      await initProfile();
      setSaved(true);
      setTimeout(() => navigate(-1), 800);
    } catch {
      toast.error('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    // 验证文件大小 (最大 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB');
      return;
    }

    // 读取文件并预览
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatarUrl(result);
      setShowAvatarOptions(false);
    };
    reader.readAsDataURL(file);

    // 重置 input 以便重复选择同一文件
    e.target.value = '';
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatarUrl(result);
      setShowAvatarOptions(false);
    };
    reader.readAsDataURL(file);

    e.target.value = '';
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

          <span className="text-[16px] font-bold text-[#121111]">编辑资料</span>

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleSave}
            disabled={saving}
            className="w-[38px] h-[38px] bg-[#292526] rounded-[12px] flex items-center justify-center shadow-[0_2px_6px_rgba(41,37,38,0.2)] disabled:opacity-50"
          >
            <Check size={18} strokeWidth={2.5} className={`text-white ${saving ? 'animate-pulse' : ''}`} />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* Avatar Section */}
        <div className="flex flex-col items-center py-8">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setShowAvatarOptions(true)}
            className="relative"
          >
            <div className="w-[90px] h-[90px] rounded-[100px] overflow-hidden shadow-[0_6px_20px_rgba(41,37,38,0.18)]">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#292526] flex items-center justify-center">
                  <img
                    src={DefaultAvatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            {/* Camera badge */}
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#292526] rounded-full flex items-center justify-center border-2 border-[#F2F2F2] shadow-md">
              <Camera size={13} strokeWidth={2} className="text-white" />
            </div>
          </motion.button>
          <p className="text-[12px] text-[#878787] mt-3">点击更换头像</p>
        </div>

        {/* Fields */}
        <div className="px-5 space-y-3">
          {/* Nickname */}
          <div className="bg-[#FDFDFD] rounded-[18px] px-5 py-4 border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)]">
            <p className="text-[11px] font-medium text-[#878787] mb-2">昵称</p>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={16}
              placeholder="输入昵称..."
              className="w-full text-[15px] text-[#121111] bg-transparent outline-none placeholder:text-[#DFDEDE]"
            />
            <div className="flex justify-end mt-2">
              <span className="text-[10px] text-[#DFDEDE]">{nickname.length}/16</span>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-[#FDFDFD] rounded-[18px] px-5 py-4 border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)]">
            <p className="text-[11px] font-medium text-[#878787] mb-2">个性签名</p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={40}
              rows={2}
              placeholder="写一句话介绍自己..."
              className="w-full text-[15px] text-[#121111] bg-transparent outline-none resize-none placeholder:text-[#DFDEDE]"
            />
            <div className="flex justify-end">
              <span className="text-[10px] text-[#DFDEDE]">{bio.length}/40</span>
            </div>
          </div>
        </div>

        {/* Save banner */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-5 mt-5 bg-green-50 border border-green-100 rounded-[14px] p-3 flex items-center gap-2"
            >
              <Check size={16} strokeWidth={2.5} className="text-green-600 shrink-0" />
              <span className="text-[13px] font-medium text-green-700">保存成功，正在返回...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleCameraCapture}
        className="hidden"
      />

      {/* Avatar Options Bottom Sheet */}
      {createPortal(
        <AnimatePresence>
          {showAvatarOptions && (
            <div className="absolute inset-0 z-[9999]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40"
                onClick={() => setShowAvatarOptions(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                className="absolute bottom-0 left-0 right-0 bg-[#FDFDFD] rounded-t-[28px] overflow-hidden"
              >
                {/* Handle */}
                <div className="flex justify-center pt-3">
                  <div className="w-10 h-1 bg-[#DFDEDE] rounded-full" />
                </div>

                {/* Title */}
                <div className="px-5 py-4">
                  <h3 className="text-[16px] font-bold text-[#121111] text-center">更换头像</h3>
                </div>

                {/* Options */}
                <div className="px-5 pb-8 space-y-3">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full flex items-center gap-4 bg-[#F2F2F2] rounded-[16px] px-5 py-4"
                  >
                    <div className="w-10 h-10 bg-[#292526] rounded-[12px] flex items-center justify-center">
                      <Camera size={18} className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-[15px] font-medium text-[#121111]">拍照</p>
                      <p className="text-[12px] text-[#878787] mt-0.5">使用相机拍摄新头像</p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-4 bg-[#F2F2F2] rounded-[16px] px-5 py-4"
                  >
                    <div className="w-10 h-10 bg-[#292526] rounded-[12px] flex items-center justify-center">
                      <Image size={18} className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-[15px] font-medium text-[#121111]">从相册选择</p>
                      <p className="text-[12px] text-[#878787] mt-0.5">从手机相册中选取照片</p>
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        getPortalTarget()
      )}
    </div>
  );
}
