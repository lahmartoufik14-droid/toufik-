import React, { useState } from "react";
import { ProjectSettings } from "../../types";

interface ExportSettingsProps {
  projectSettings: ProjectSettings;
  onChange: (settings: ProjectSettings) => void;
  onExport: () => void;
  exportProgress?: number;
}

const ExportSettings = ({ projectSettings, onChange, onExport, exportProgress = 0 }: ExportSettingsProps) => {
  const updateField = <K extends keyof ProjectSettings>(key: K, value: ProjectSettings[K]) => {
    onChange({ ...projectSettings, [key]: value });
  };

  const isExporting = exportProgress > 0 && exportProgress < 100;

  return (
    <div className="panel">
      <h2>⚙️ خيارات التصدير</h2>
      
      <label>
        📹 صيغة التصدير
        <select 
          value={projectSettings.format} 
          onChange={(event) => updateField("format", event.target.value as ProjectSettings["format"])}
          disabled={isExporting}
        >
          <option value="mp4">MP4 (موصى به)</option>
          <option value="mkv">MKV</option>
          <option value="avi">AVI</option>
        </select>
      </label>

      <label>
        🎬 الجودة
        <select 
          value={projectSettings.quality} 
          onChange={(event) => updateField("quality", event.target.value as ProjectSettings["quality"])}
          disabled={isExporting}
        >
          <option value="720p">720p (HD)</option>
          <option value="1080p">1080p (Full HD)</option>
          <option value="4k">4K (Ultra HD)</option>
        </select>
      </label>

      <label>
        🎞️ معدل الإطارات
        <select 
          value={projectSettings.frameRate} 
          onChange={(event) => updateField("frameRate", event.target.value as ProjectSettings["frameRate"])}
          disabled={isExporting}
        >
          <option value="30fps">30 FPS</option>
          <option value="60fps">60 FPS</option>
        </select>
      </label>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={projectSettings.embedCaptions}
          onChange={(event) => updateField("embedCaptions", event.target.checked)}
          disabled={isExporting}
        />
        <span>📝 تضمين الترجمة في الفيديو</span>
      </label>

      {isExporting && (
        <div className="export-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <div className="progress-text">
            {Math.round(exportProgress)}%
          </div>
        </div>
      )}

      <button 
        className="primary export-btn" 
        onClick={onExport}
        disabled={isExporting}
      >
        {isExporting ? '⏳ جاري التصدير...' : '💾 تصدير الفيديو'}
      </button>
    </div>
  );
};

export default ExportSettings;
