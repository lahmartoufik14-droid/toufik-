import React from "react";
import { VideoToolSettings } from "../../types";

interface VideoEffectsProps {
  settings: VideoToolSettings;
  onChange: (settings: VideoToolSettings) => void;
}

const VideoEffects = ({ settings, onChange }: VideoEffectsProps) => {
  const updateField = <K extends keyof VideoToolSettings>(key: K, value: VideoToolSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="tool-section">
      <h3>أدوات الفيديو</h3>
      <label>
        سرعة التشغيل
        <input
          type="number"
          min="0.5"
          step="0.1"
          value={settings.playbackRate}
          onChange={(event) => updateField("playbackRate", Number(event.target.value))}
        />
      </label>
      <label>
        قص البداية (ث)
        <input
          type="number"
          min="0"
          value={settings.trimStart}
          onChange={(event) => updateField("trimStart", Number(event.target.value))}
        />
      </label>
      <label>
        قص النهاية (ث)
        <input
          type="number"
          min="0"
          value={settings.trimEnd}
          onChange={(event) => updateField("trimEnd", Number(event.target.value))}
        />
      </label>
      <label>
        تدوير
        <input
          type="number"
          value={settings.rotation}
          onChange={(event) => updateField("rotation", Number(event.target.value))}
        />
      </label>
      <label>
        السطوع
        <input
          type="range"
          min="-1"
          max="1"
          step="0.1"
          value={settings.brightness}
          onChange={(event) => updateField("brightness", Number(event.target.value))}
        />
      </label>
      <label>
        التباين
        <input
          type="range"
          min="-1"
          max="1"
          step="0.1"
          value={settings.contrast}
          onChange={(event) => updateField("contrast", Number(event.target.value))}
        />
      </label>
      <label>
        التشبع
        <input
          type="range"
          min="-1"
          max="2"
          step="0.1"
          value={settings.saturation}
          onChange={(event) => updateField("saturation", Number(event.target.value))}
        />
      </label>
      <label>
        فلتر
        <input type="text" value={settings.filter} onChange={(event) => updateField("filter", event.target.value)} />
      </label>
      <label>
        انتقال
        <input type="text" value={settings.transition} onChange={(event) => updateField("transition", event.target.value)} />
      </label>
      <label>
        تحجيم
        <input
          type="number"
          min="0.5"
          max="2"
          step="0.1"
          value={settings.scale}
          onChange={(event) => updateField("scale", Number(event.target.value))}
        />
      </label>
    </div>
  );
};

export default VideoEffects;
