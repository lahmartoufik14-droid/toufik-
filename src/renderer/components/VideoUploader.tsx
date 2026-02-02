import React, { useRef } from "react";
import { VideoMetadata } from "../../types";

interface VideoUploaderProps {
  onUpload: (file: File) => void;
  video: VideoMetadata | null;
}

const VideoUploader = ({ onUpload, video }: VideoUploaderProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSelect = () => {
    inputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const formatSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="panel">
      <h2>📁 رفع الفيديو</h2>
      <div className="uploader">
        <button className="primary upload-btn" onClick={handleSelect}>
          ⬆️ اختيار ملف فيديو
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/x-matroska,video/avi,video/webm,video/quicktime"
          onChange={handleChange}
          hidden
        />
        {video && (
          <div className="meta">
            <div className="meta-item">
              <span className="meta-label">📄 الملف:</span>
              <span className="meta-value">{video.name}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">⏱️ المدة:</span>
              <span className="meta-value">{formatDuration(video.duration)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">💾 الحجم:</span>
              <span className="meta-value">{formatSize(video.size)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">📹 النوع:</span>
              <span className="meta-value">{video.format.toUpperCase()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUploader;
