import React, { useEffect, useRef, useState } from "react";
import { VideoMetadata, WhisperResult } from "../../types";

interface VideoPreviewProps {
  video: VideoMetadata | null;
  words: WhisperResult | null;
  videoFile: File | null;
}

const VideoPreview = ({ video, words, videoFile }: VideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [currentWord, setCurrentWord] = useState<string>("");

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (video && video.path.startsWith('blob:')) {
      setVideoUrl(video.path);
    } else if (video && video.path) {
      setVideoUrl(`file://${video.path}`);
    }
  }, [video, videoFile]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !words) return;

    const handleTimeUpdate = () => {
      const currentTime = videoElement.currentTime;
      const word = words.words.find(
        (w) => w.start <= currentTime && w.end >= currentTime
      );
      if (word) {
        setCurrentWord(word.word);
      }
    };

    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [words]);

  return (
    <div className="panel">
      <h2>معاينة الفيديو</h2>
      {video ? (
        <div className="preview">
          <div className="video-container">
            <video 
              ref={videoRef}
              controls 
              src={videoUrl}
              style={{ width: '100%', maxHeight: '400px', borderRadius: '8px' }}
            />
            {currentWord && (
              <div className="current-caption">
                {currentWord}
              </div>
            )}
          </div>
          {words && (
            <div className="caption-summary">
              <h4>الكلمات المستخرجة ({words.words.length})</h4>
              <div className="word-list">
                {words.words.slice(0, 12).map((word, index) => (
                  <span key={`${word.word}-${index}`} className="word-tag">
                    {word.word}
                  </span>
                ))}
                {words.words.length > 12 && (
                  <span className="word-tag">+{words.words.length - 12} المزيد</span>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="empty">لم يتم تحميل فيديو بعد</div>
      )}
    </div>
  );
};

export default VideoPreview;
