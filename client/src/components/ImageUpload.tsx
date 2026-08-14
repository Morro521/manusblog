import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2, Upload, X } from "lucide-react";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  value?: string;
  maxSize?: number;
  label?: string;
}

const supportedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"] as const;
type SupportedImageType = (typeof supportedTypes)[number];

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("无法读取图片文件"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export default function ImageUpload({ onUpload, value, maxSize = 5, label = "IMAGE FILE" }: ImageUploadProps) {
  const [preview, setPreview] = useState(value || "");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = trpc.media.uploadImage.useMutation();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!supportedTypes.includes(file.type as SupportedImageType)) {
      setError("仅支持 JPG、PNG、WebP、GIF 或 AVIF 图片。");
      return;
    }
    if (file.size > maxSize * 1024 * 1024) {
      setError(`图片不能超过 ${maxSize}MB。`);
      return;
    }

    setError(null);
    try {
      const dataUrl = await readAsDataUrl(file);
      const base64 = dataUrl.split(",")[1];
      if (!base64) throw new Error("图片编码失败");
      const result = await uploadMutation.mutateAsync({ fileName: file.name, mimeType: file.type as SupportedImageType, base64 });
      setPreview(result.url);
      onUpload(result.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "上传失败，请重试。");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clear = () => {
    setPreview("");
    setError(null);
    onUpload("");
  };

  return (
    <div>
      <input ref={fileInputRef} type="file" accept={supportedTypes.join(",")} onChange={handleFileSelect} className="hidden" />
      <p className="editorial-kicker">{label}</p>
      {preview ? (
        <div className="mt-3">
          <div className="article-cover relative aspect-[1.8]"><img src={preview} alt="上传图片预览" /><button type="button" onClick={clear} className="absolute right-2 top-2 grid h-8 w-8 place-items-center border border-white/30 bg-[#11120f]/80 text-stone-100 backdrop-blur-sm hover:border-[#e39a86] hover:text-[#e39a86]" aria-label="移除图片"><X size={15} /></button></div>
          <div className="mt-3 flex items-center justify-between"><span className="font-mono text-[10px] tracking-[0.1em] text-[#c6edf0]">STORED ON S3</span><Button type="button" onClick={() => fileInputRef.current?.click()} variant="ghost" className="h-auto p-0 text-xs text-stone-500 hover:bg-transparent hover:text-[#c6edf0]">更换图片</Button></div>
        </div>
      ) : (
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending} className="mt-3 grid w-full place-items-center border border-dashed border-white/20 px-5 py-9 text-center transition-colors hover:border-[#c6edf0] disabled:cursor-not-allowed disabled:opacity-60"><div>{uploadMutation.isPending ? <Loader2 size={22} className="mx-auto animate-spin text-[#c6edf0]" /> : <Upload size={22} className="mx-auto text-stone-500" />}<p className="mt-3 text-sm text-stone-300">{uploadMutation.isPending ? "正在写入存储…" : "选择图片上传"}</p><p className="mt-1 text-xs text-stone-600">JPG · PNG · WebP · GIF · AVIF，最大 {maxSize}MB</p></div></button>
      )}
      {error && <p className="mt-3 border-l border-[#e39a86] pl-3 text-xs leading-5 text-[#e39a86]">{error}</p>}
    </div>
  );
}
