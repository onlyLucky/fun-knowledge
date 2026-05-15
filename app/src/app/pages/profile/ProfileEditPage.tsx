import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Check, Camera, X } from 'lucide-react';
import { useUser } from '../../context/UserContext';

// ─── Preset Avatars ───────────────────────────────────────────────────────────

const PHOTO_AVATARS = [
  {
    id: 'p1',
    url: 'https://images.unsplash.com/photo-1643646805556-350c057663dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHdvbWFuJTIwc21pbGUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3Nzc1NjQ2MjF8MA&ixlib=rb-4.1.0&q=80&w=400',
  },
  {
    id: 'p2',
    url: 'https://images.unsplash.com/photo-1738566061505-556830f8b8f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMG1hbiUyMHBvcnRyYWl0JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3NzU2NDYyMnww&ixlib=rb-4.1.0&q=80&w=400',
  },
  {
    id: 'p3',
    url: 'https://images.unsplash.com/photo-1571817244769-64ef45440ff0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXQlMjBtaW5pbWFsfGVufDF8fHx8MTc3NzU2NDYxOHww&ixlib=rb-4.1.0&q=80&w=400',
  },
  {
    id: 'p4',
    url: 'https://images.unsplash.com/photo-1571816501534-8c457c5a3b2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHBvcnRyYWl0JTIwbWluaW1hbHxlbnwxfHx8fDE3Nzc1NjQ2MTh8MA&ixlib=rb-4.1.0&q=80&w=400',
  },
  {
    id: 'p5',
    url: 'https://images.unsplash.com/photo-1522874339442-b66b63414ab4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHdpdGglMjBnbGFzc2VzJTIwaW50ZWxsZWN0dWFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc3NTY0NjI0fDA&ixlib=rb-4.1.0&q=80&w=400',
  },
  {
    id: 'p6',
    url: 'https://images.unsplash.com/photo-1762708590808-c453c0e4fb0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBiZWFyZCUyMGNhc3VhbCUyMHBvcnRyYWl0JTIwb3V0ZG9vcnxlbnwxfHx8fDE3Nzc1NjQ2MjR8MA&ixlib=rb-4.1.0&q=80&w=400',
  },
];

const EMOJI_AVATARS = [
  { id: 'e1', emoji: '🌍', bg: '#292526' },
  { id: 'e2', emoji: '🦊', bg: '#E8643A' },
  { id: 'e3', emoji: '🐼', bg: '#4A4A4A' },
  { id: 'e4', emoji: '🦁', bg: '#C89B3C' },
  { id: 'e5', emoji: '🌸', bg: '#D4688A' },
  { id: 'e6', emoji: '🎭', bg: '#5B5EA6' },
  { id: 'e7', emoji: '🦋', bg: '#4A90D9' },
  { id: 'e8', emoji: '🐉', bg: '#2D6A4F' },
  { id: 'e9', emoji: '⚡', bg: '#F0A500' },
  { id: 'e10', emoji: '🔭', bg: '#1A1A2E' },
  { id: 'e11', emoji: '🎯', bg: '#C0392B' },
  { id: 'e12', emoji: '🧠', bg: '#8E44AD' },
];

// ─── Avatar display helper ────────────────────────────────────────────────────

function AvatarDisplay({
  usePhoto, avatarUrl, avatarEmoji, avatarBg, size = 80
}: {
  usePhoto: boolean;
  avatarUrl: string;
  avatarEmoji: string;
  avatarBg: string;
  size?: number;
}) {
  if (usePhoto && avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt="avatar"
        className="w-full h-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: avatarBg, fontSize: size * 0.42 }}
    >
      {avatarEmoji}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ProfileEditPage() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useUser();

  const [nickname, setNickname] = useState(profile.nickname);
  const [bio, setBio] = useState(profile.bio);
  const [usePhoto, setUsePhoto] = useState(profile.usePhoto);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [avatarEmoji, setAvatarEmoji] = useState(profile.avatarEmoji);
  const [avatarBg, setAvatarBg] = useState(profile.avatarBg);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState<'photo' | 'emoji'>('photo');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile({ nickname, bio, usePhoto, avatarUrl, avatarEmoji, avatarBg });
    setSaved(true);
    setTimeout(() => navigate(-1), 800);
  };

  const selectPhoto = (url: string) => {
    setAvatarUrl(url);
    setUsePhoto(true);
    setShowAvatarPicker(false);
  };

  const selectEmoji = (emoji: string, bg: string) => {
    setAvatarEmoji(emoji);
    setAvatarBg(bg);
    setUsePhoto(false);
    setShowAvatarPicker(false);
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
            className="w-[38px] h-[38px] bg-[#292526] rounded-[12px] flex items-center justify-center shadow-[0_2px_6px_rgba(41,37,38,0.2)]"
          >
            <Check size={18} strokeWidth={2.5} className="text-white" />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* Avatar Section */}
        <div className="flex flex-col items-center py-8">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setShowAvatarPicker(true)}
            className="relative"
          >
            <div className="w-[90px] h-[90px] rounded-[100px] overflow-hidden shadow-[0_6px_20px_rgba(41,37,38,0.18)]">
              <AvatarDisplay
                usePhoto={usePhoto}
                avatarUrl={avatarUrl}
                avatarEmoji={avatarEmoji}
                avatarBg={avatarBg}
                size={90}
              />
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

          {/* Level info (read-only) */}
          <div className="bg-[#FDFDFD] rounded-[18px] px-5 py-4 border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)]">
            <p className="text-[11px] font-medium text-[#878787] mb-1">知识等级</p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-6 h-6 bg-[#292526] rounded-full flex items-center justify-center text-[11px]">⭐</div>
              <span className="text-[14px] font-bold text-[#121111]">探索者</span>
              <span className="text-[11px] text-[#878787] ml-1">· 每日打卡可升级</span>
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

      {/* ── Avatar Picker Bottom Sheet ── */}
      <AnimatePresence>
        {showAvatarPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 z-[200]"
              onClick={() => setShowAvatarPicker(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-[#FDFDFD] rounded-t-[28px] z-[201] overflow-hidden"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3">
                <div className="w-10 h-1 bg-[#DFDEDE] rounded-full" />
              </div>

              {/* Title row */}
              <div className="flex items-center justify-between px-5 py-3">
                <h3 className="text-[16px] font-bold text-[#121111]">选择头像</h3>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setShowAvatarPicker(false)}
                  className="w-[30px] h-[30px] bg-[#F2F2F2] rounded-[10px] flex items-center justify-center"
                >
                  <X size={15} strokeWidth={2.5} className="text-[#878787]" />
                </motion.button>
              </div>

              {/* Tabs */}
              <div className="flex px-5 gap-2 mb-4">
                {(['photo', 'emoji'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPickerTab(tab)}
                    className={`px-4 py-1.5 rounded-[100px] text-[12px] font-medium transition-all ${
                      pickerTab === tab
                        ? 'bg-[#292526] text-white'
                        : 'bg-[#F2F2F2] text-[#787676]'
                    }`}
                  >
                    {tab === 'photo' ? '真人头像' : '趣味头像'}
                  </button>
                ))}
              </div>

              <div className="px-5 pb-10">
                {pickerTab === 'photo' ? (
                  <div className="grid grid-cols-3 gap-3">
                    {PHOTO_AVATARS.map((av) => (
                      <motion.button
                        key={av.id}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => selectPhoto(av.url)}
                        className="relative aspect-square rounded-[16px] overflow-hidden"
                      >
                        <img src={av.url} alt="" className="w-full h-full object-cover" />
                        {usePhoto && avatarUrl === av.url && (
                          <div className="absolute inset-0 bg-[#292526]/60 flex items-center justify-center">
                            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
                              <Check size={14} strokeWidth={2.5} className="text-[#292526]" />
                            </div>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {EMOJI_AVATARS.map((av) => (
                      <motion.button
                        key={av.id}
                        whileTap={{ scale: 0.88 }}
                        onClick={() => selectEmoji(av.emoji, av.bg)}
                        className="relative aspect-square rounded-[16px] overflow-hidden flex items-center justify-center text-[28px] shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
                        style={{ backgroundColor: av.bg }}
                      >
                        {av.emoji}
                        {!usePhoto && avatarEmoji === av.emoji && avatarBg === av.bg && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                              <Check size={12} strokeWidth={2.5} className="text-[#292526]" />
                            </div>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
