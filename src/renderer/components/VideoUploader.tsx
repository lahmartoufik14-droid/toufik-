import React, { useRef } from "react";
import { VideoMetadata } from "../../types";

interface VideoUploaderProps {
  onUpload: (filePath: string) => void;
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
      onUpload(file.path);
    }
  };

  return (
    <div className="panel">
      <h2>رفع الفيديو</h2>
      <div className="uploader">
        <button className="primary" onClick={handleSelect}>
          اختيار ملف
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/x-matroska,video/avi"
          onChange={handleChange}
          hidden
        />
        {video && (
          <div className="meta">
            <div>الملف: {video.name}</div>
            <div>المدة: {video.duration.toFixed(2)} ثانية</div>
            <div>الحجم: {(video.size / (1024 * 1024)).toFixed(2)} MB</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUploader;
