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
      <h2>إدارة المشروع</h2>
      <div className="summary">
        <div>الحالة: {summary.status}</div>
        <div>عدد الكلمات: {summary.words?.words.length ?? 0}</div>
        <div>تحذيرات التحليل: {summary.analysisWarnings.join("، ") || "لا يوجد"}</div>
      </div>
      <button onClick={onReset}>بدء مشروع جديد</button>
    </div>
  );
};

export default ProjectManager;
