import { useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { ChevronLeft, Check, Camera, Image as ImageIcon } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { toast } from 'sonner';

// 裁剪区域生成圆形裁剪图
async function getCroppedImg(imageSrc: string, crop: { x: number; y: number; width: number; height: number }): Promise<string> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => { image.onload = resolve; });

  const canvas = document.createElement('canvas');
  const size = Math.max(crop.width, crop.height);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // 圆形裁剪
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    size,
    size,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(URL.createObjectURL(blob!));
    }, 'image/jpeg', 0.9);
  });
}

export function AvatarCropPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { imageSrc } = (location.state as { imageSrc?: string }) || {};

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_croppedArea: { x: number; y: number; width: number; height: number }, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      toast.error('请先选择图片');
      return;
    }

    setSaving(true);
    try {
      const croppedImageUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
      // 返回裁剪后的图片URL到上一页
      navigate('/profile/edit/avatar', { state: { croppedImageUrl }, replace: true });
    } catch {
      toast.error('裁剪失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-page relative">
      {/* Header */}
      <div className="bg-bg-page shrink-0">
        <div className="flex items-center justify-between px-5 py-4">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(-1)}
            className="w-[38px] h-[38px] bg-bg-card rounded-[12px] border border-border flex items-center justify-center shadow-[0_2px_6px_rgba(41,37,38,0.06)]"
          >
            <ChevronLeft size={20} strokeWidth={2.5} className="text-text-main" />
          </motion.button>

          <span className="text-[16px] font-bold text-text-main">调整头像</span>

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleSave}
            disabled={saving}
            className="w-[38px] h-[38px] bg-primary rounded-[12px] flex items-center justify-center shadow-[0_2px_6px_rgba(41,37,38,0.2)] disabled:opacity-50"
          >
            <Check size={18} strokeWidth={2.5} className={`text-white ${saving ? 'animate-pulse' : ''}`} />
          </motion.button>
        </div>
      </div>

      {imageSrc ? (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Cropper Area */}
          <div className="flex-1 relative bg-black">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Zoom Slider */}
          <div className="shrink-0 px-8 py-5 bg-bg-card">
            <div className="flex items-center gap-4">
              <span className="text-[12px] text-text-muted">小</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="text-[12px] text-text-muted">大</span>
            </div>
          </div>

          {/* Re-select buttons */}
          <div className="shrink-0 px-5 pb-6 bg-bg-card space-y-3">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => cameraInputRef.current?.click()}
              className="w-full py-3 bg-primary rounded-[14px] text-[14px] text-white font-medium flex items-center justify-center gap-2"
            >
              <Camera size={16} />
              拍照
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 bg-bg-page rounded-[14px] text-[14px] text-text-main font-medium flex items-center justify-center gap-2"
            >
              <ImageIcon size={16} />
              从相册选择
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <p className="text-[14px] text-text-muted mb-6">请先选择一张图片</p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => cameraInputRef.current?.click()}
            className="w-full max-w-[280px] py-3.5 bg-primary rounded-[14px] text-[15px] text-white font-medium flex items-center justify-center gap-2"
          >
            <Camera size={18} />
            拍照
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-[280px] py-3.5 bg-bg-page rounded-[14px] text-[15px] text-text-main font-medium mt-3 flex items-center justify-center gap-2"
          >
            <ImageIcon size={18} />
            从相册选择
          </motion.button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
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
          navigate('/profile/edit/avatar/crop', { state: { imageSrc: event.target?.result as string }, replace: true });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
      }} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          navigate('/profile/edit/avatar/crop', { state: { imageSrc: event.target?.result as string }, replace: true });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
      }} />
    </div>
  );
}
