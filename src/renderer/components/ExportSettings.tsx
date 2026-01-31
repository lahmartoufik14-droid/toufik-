import React, { useState } from "react";
import { ProjectSettings } from "../../types";

interface ExportSettingsProps {
  projectSettings: ProjectSettings;
  onChange: (settings: ProjectSettings) => void;
  onExport: (outputPath: string) => void;
}

const ExportSettings = ({ projectSettings, onChange, onExport }: ExportSettingsProps) => {
  const [outputPath, setOutputPath] = useState<string>("./exports/quran-video.mp4");

  const updateField = <K extends keyof ProjectSettings>(key: K, value: ProjectSettings[K]) => {
    onChange({ ...projectSettings, [key]: value });
  };

  return (
    <div className="panel">
      <h2>خيارات التصدير</h2>
      <label>
        مسار التصدير
        <input type="text" value={outputPath} onChange={(event) => setOutputPath(event.target.value)} />
      </label>
      <label>
        صيغة التصدير
        <select value={projectSettings.format} onChange={(event) => updateField("format", event.target.value as ProjectSettings["format"]) }>
          <option value="mp4">MP4</option>
          <option value="mkv">MKV</option>
          <option value="avi">AVI</option>
        </select>
      </label>
      <label>
        الجودة
        <select value={projectSettings.quality} onChange={(event) => updateField("quality", event.target.value as ProjectSettings["quality"]) }>
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
          <option value="4k">4K</option>
        </select>
      </label>
      <label>
        معدل الإطارات
        <select value={projectSettings.frameRate} onChange={(event) => updateField("frameRate", event.target.value as ProjectSettings["frameRate"]) }>
          <option value="30fps">30fps</option>
          <option value="60fps">60fps</option>
        </select>
      </label>
      <label>
        تضمين الكابشن
        <input
          type="checkbox"
          checked={projectSettings.embedCaptions}
          onChange={(event) => updateField("embedCaptions", event.target.checked)}
        />
      </label>
      <button className="primary" onClick={() => onExport(outputPath)}>
        تصدير الفيديو
      </button>
    </div>
  );
};

export default ExportSettings;
