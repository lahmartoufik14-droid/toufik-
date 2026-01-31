import React from "react";
import { WhisperResult } from "../../types";

interface TimelineProps {
  words: WhisperResult | null;
}

const Timeline = ({ words }: TimelineProps) => {
  return (
    <div className="panel">
      <h2>الشريط الزمني</h2>
      {words ? (
        <div className="timeline">
          {words.words.slice(0, 30).map((word, index) => (
            <div className="timeline-item" key={`${word.word}-${index}`}>
              <div className="time">
                {word.start.toFixed(2)} - {word.end.toFixed(2)}
              </div>
              <div className="word">{word.word}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">سيظهر الشريط بعد التعرف على الكلمات</div>
      )}
    </div>
  );
};

export default Timeline;
