import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Check, Camera, Image as ImageIcon } from 'lucide-react';
import { useUser } from '@/providers/UserContext';
import { authService, resolveImageUrl } from '@/api';
import { toast } from 'sonner';
import DefaultAvatar from '@/assets/images/avatar.png';

export function AvatarEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, updateProfile, refreshProfile } = useUser();

  const avatarStatus = profile.reviewInfo.avatar?.status ?? 0;
  const isReviewing = avatarStatus === 1;

  // 审核中/审核失败的头像URL（需要解析为完整URL用于预览）
  const reviewingAvatarUrl = avatarStatus !== 0 ? resolveImageUrl(profile.reviewInfo.avatar?.value || null) : '';

  // 从裁剪页面返回的裁剪后图片URL
  const { croppedImageUrl } = (location.state as { croppedImageUrl?: string }) || {};

  const [previewUrl, setPreviewUrl] = useState<string | null>(croppedImageUrl || null);
  const [saving, setSaving] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // 选择图片后跳转到裁剪页面
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      // 跳转到裁剪页面
      navigate('/profile/edit/avatar/crop', {
        state: { imageSrc: event.target?.result as string }
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 确认保存头像
  const handleConfirm = async () => {
    if (!previewUrl) {
      toast.error('请先选择头像');
      return;
    }

    setSaving(true);
    try {
      // 将预览URL转为文件
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

      // 上传头像
      const uploadResult = await authService.uploadAvatar(file);
      const avatarFullUrl = resolveImageUrl(uploadResult.url);

      // 更新用户信息
      const result = await authService.updateProfile({ avatar: uploadResult.url });
      await refreshProfile();

      if (!result || result.pending) {
        toast.success('提交成功，等待管理员审核');
      } else {
        updateProfile({ avatarUrl: avatarFullUrl });
        toast.success('头像更新成功');
      }
      setTimeout(() => navigate('/profile/edit'), 800);
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

          <span className="text-[16px] font-bold text-[#121111]">更换头像</span>

          {previewUrl ? (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleConfirm}
              disabled={saving || isReviewing}
              className="w-[38px] h-[38px] bg-[#292526] rounded-[12px] flex items-center justify-center shadow-[0_2px_6px_rgba(41,37,38,0.2)] disabled:opacity-50"
            >
              <Check size={18} strokeWidth={2.5} className={`text-white ${saving ? 'animate-pulse' : ''}`} />
            </motion.button>
          ) : (
            <div className="w-[38px]" />
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-5">
        {/* 预览头像 */}
        <div className="w-[120px] h-[120px] rounded-full overflow-hidden shadow-[0_6px_20px_rgba(41,37,38,0.18)] mb-6 mt-36">
          {previewUrl ? (
            <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
          ) : reviewingAvatarUrl ? (
            <img src={reviewingAvatarUrl} alt="reviewing avatar" className="w-full h-full object-cover" />
          ) : profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <img src={DefaultAvatar} alt="avatar" className="w-full h-full object-cover" />
          )}
        </div>

        {/* 审核状态 */}
        {isReviewing && (
          <p className="text-[12px] text-[#F59E0B] mb-2">当前头像正在审核中</p>
        )}
        {avatarStatus === 2 && !previewUrl && (
          <p className="text-[12px] text-[#EF4444] mb-2">
            审核未通过：{profile.reviewInfo.avatar?.msg || '请修改后重新提交'}
          </p>
        )}

        {/* 提示文字 */}
        <p className="text-[13px] text-[#878787] mb-6">
          {isReviewing ? '头像正在审核中' : previewUrl ? '点击右上角确认按钮保存' : '选择一张新头像'}
        </p>

        {/* 选择按钮 */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowOptions(true)}
          disabled={isReviewing}
          className="w-full max-w-[280px] py-3.5 bg-[#292526] rounded-[14px] text-[15px] text-white font-medium disabled:opacity-50"
        >
          {previewUrl ? '重新选择' : '选择新头像'}
        </motion.button>
      </div>

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="user" onChange={handleFileSelect} className="hidden" />

      {/* Bottom Sheet - Select Options */}
      <AnimatePresence>
        {showOptions && (
          <div className="absolute inset-0 z-[9999]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowOptions(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-[#FDFDFD] rounded-t-[28px] overflow-hidden"
            >
              <div className="flex justify-center pt-3">
                <div className="w-10 h-1 bg-[#DFDEDE] rounded-full" />
              </div>
              <div className="px-5 py-4">
                <h3 className="text-[16px] font-bold text-[#121111] text-center">选择头像</h3>
              </div>
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
                    <ImageIcon size={18} className="text-white" />
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
      </AnimatePresence>
    </div>
  );
}
