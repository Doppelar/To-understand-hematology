import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onComplete?: (uploadURL: string) => void;
  buttonClassName?: string;
  children: ReactNode;
}

export function ObjectUploader({
  maxFileSize = 10485760,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxFileSize) {
      toast({
        title: "ファイルサイズエラー",
        description: `ファイルサイズは${Math.round(maxFileSize / 1024 / 1024)}MB以下にしてください`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploadParamsResponse = await fetch('/api/objects/upload', {
        method: 'POST',
      });
      const { uploadURL } = await uploadParamsResponse.json();

      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      onComplete?.(uploadURL);
      
      toast({
        title: "アップロード完了",
        description: "写真のアップロードが完了しました",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "アップロードエラー",
        description: "写真のアップロードに失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        data-testid="input-photo-upload"
      />
      <Button
        type="button"
        onClick={handleClick}
        className={buttonClassName}
        disabled={isUploading}
        data-testid="button-upload-photo"
      >
        {isUploading ? '読み込み中...' : children}
      </Button>
    </div>
  );
}
