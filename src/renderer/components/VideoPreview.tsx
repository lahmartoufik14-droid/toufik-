import React from "react";
import { VideoMetadata, WhisperResult } from "../../types";

interface VideoPreviewProps {
  video: VideoMetadata | null;
  words: WhisperResult | null;
}

const VideoPreview = ({ video, words }: VideoPreviewProps) => {
  return (
    <div className="panel">
      <h2>معاينة الفيديو</h2>
      {video ? (
        <div className="preview">
          <video controls src={`file://${video.path}`} />
          {words && (
            <div className="caption-summary">
              <h4>الكلمات المستخرجة</h4>
              <div className="word-list">
                {words.words.slice(0, 12).map((word, index) => (
                  <span key={`${word.word}-${index}`}>{word.word}</span>
                ))}
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
