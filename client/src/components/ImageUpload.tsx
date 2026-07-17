import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  maxSize?: number; // MB
}

export default function ImageUpload({ onUpload, maxSize = 5 }: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件");
      return;
    }

    // 验证文件大小
    if (file.size > maxSize * 1024 * 1024) {
      setError(`文件大小不能超过 ${maxSize}MB`);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // 模拟上传到 S3
      // 实际应该调用后端 API 上传到 S3
      // const formData = new FormData();
      // formData.append("file", file);
      // const response = await fetch("/api/upload", { method: "POST", body: formData });
      // const data = await response.json();
      // onUpload(data.url);

      // 临时使用 Data URL（实际应改为 S3 URL）
      setTimeout(() => {
        onUpload(preview || "");
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError("上传失败，请重试");
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-purple-500/20"
          />
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="w-full border-2 border-dashed border-purple-500/30 hover:border-purple-500/50 rounded-lg p-8 text-center transition-colors disabled:opacity-50"
        >
          <div className="flex flex-col items-center gap-2">
            {isLoading ? (
              <Loader2 size={32} className="text-cyan-400 animate-spin" />
            ) : (
              <Upload size={32} className="text-cyan-400" />
            )}
            <p className="text-gray-300 font-medium">
              {isLoading ? "上传中..." : "点击选择图片或拖拽上传"}
            </p>
            <p className="text-sm text-gray-500">
              支持 JPG, PNG, GIF，最大 {maxSize}MB
            </p>
          </div>
        </button>
      )}

      {error && (
        <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {preview && (
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/20"
        >
          更换图片
        </Button>
      )}
    </div>
  );
}
