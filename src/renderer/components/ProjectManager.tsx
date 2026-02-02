import React from "react";
import { VideoMetadata, WhisperResult } from "../../types";

interface ProjectSummary {
  video: VideoMetadata | null;
  words: WhisperResult | null;
  analysisWarnings: string[];
  status: string;
}

interface ProjectManagerProps {
  summary: ProjectSummary;
  onReset: () => void;
}

const ProjectManager = ({ summary, onReset }: ProjectManagerProps) => {
  return (
    <div className="panel">
      <h2>📊 ملخص المشروع</h2>
      <div className="summary">
        <div className="summary-item">
          <span className="summary-label">الحالة:</span>
          <span className="summary-value">{summary.status}</span>
        </div>
        {summary.video && (
          <div className="summary-item">
            <span className="summary-label">الفيديو:</span>
            <span className="summary-value">{summary.video.name}</span>
          </div>
        )}
        <div className="summary-item">
          <span className="summary-label">الكلمات:</span>
          <span className="summary-value">{summary.words?.words.length ?? 0}</span>
        </div>
      </div>
      
      {summary.analysisWarnings.length > 0 && (
        <div className="warnings">
          <h4>⚠️ تحذيرات</h4>
          <ul>
            {summary.analysisWarnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
      
      <button 
        className="primary" 
        onClick={onReset}
        style={{ width: '100%', marginTop: '1rem' }}
      >
        🔄 بدء مشروع جديد
      </button>
    </div>
  );
};

export default ProjectManager;
