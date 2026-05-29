'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentUrl?: string;
  className?: string;
}

export function ImageUpload({ onUpload, currentUrl, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(currentUrl || '');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الملف يجب أن لا يتجاوز 5 ميجابايت');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل الرفع');
      }
      const { url } = await res.json();
      setPreview(url);
      onUpload(url);
      toast.success('تم رفع الصورة بنجاح');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'فشل رفع الصورة';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (file: File | undefined) => {
    if (file) upload(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
  };

  const clear = () => {
    setPreview('');
    onUpload('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={className} dir="rtl">
      {preview ? (
        <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
          <div className="relative w-full h-48">
            <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
          </div>
          <button
            type="button"
            onClick={clear}
            className="absolute top-2 left-2 bg-white/90 hover:bg-white rounded-full p-1 shadow"
          >
            <X className="h-4 w-4 text-gray-700" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className="flex flex-col items-center justify-center gap-3 rounded-xl cursor-pointer transition-colors py-10"
          style={{
            border: `2px dashed ${dragOver ? '#F5A623' : '#e5e7eb'}`,
            backgroundColor: dragOver ? 'rgba(245,166,35,0.05)' : '#fafafa',
          }}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          ) : (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-full" style={{ backgroundColor: 'rgba(245,166,35,0.1)' }}>
                {dragOver ? <Upload className="h-6 w-6" style={{ color: '#F5A623' }} /> : <ImageIcon className="h-6 w-6 text-gray-400" />}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">اسحب الصورة هنا أو اضغط للاختيار</p>
                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP — حد أقصى 5 ميجابايت</p>
              </div>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
