import React from "react";
import { WhisperResult } from "../../types";

interface TimelineProps {
  words: WhisperResult | null;
}

const Timeline = ({ words }: TimelineProps) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs.padStart(4, '0')}`;
  };

  return (
    <div className="panel">
      <h2>⏱️ الشريط الزمني</h2>
      {words ? (
        <div className="timeline">
          {words.words.slice(0, 30).map((word, index) => (
            <div className="timeline-item" key={`${word.word}-${index}`}>
              <span className="timeline-word">{word.word}</span>
              <span className="timeline-time">
                {formatTime(word.start)} - {formatTime(word.end)}
              </span>
            </div>
          ))}
          {words.words.length > 30 && (
            <div className="timeline-item" style={{ justifyContent: 'center' }}>
              <span style={{ color: '#999' }}>
                +{words.words.length - 30} كلمة إضافية
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="empty">
          سيظهر الشريط الزمني بعد التعرف على الكلمات
        </div>
      )}
    </div>
  );
};

export default Timeline;
