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
    <div>
      <h3>🎥 أدوات الفيديو (10 أدوات)</h3>
      
      <label>
        سرعة التشغيل (x{settings.playbackRate})
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={settings.playbackRate}
          onChange={(event) => updateField("playbackRate", Number(event.target.value))}
        />
      </label>

      <label>
        قص البداية ({settings.trimStart} ثانية)
        <input
          type="range"
          min="0"
          max="60"
          value={settings.trimStart}
          onChange={(event) => updateField("trimStart", Number(event.target.value))}
        />
      </label>

      <label>
        قص النهاية ({settings.trimEnd} ثانية)
        <input
          type="range"
          min="0"
          max="60"
          value={settings.trimEnd}
          onChange={(event) => updateField("trimEnd", Number(event.target.value))}
        />
      </label>

      <label>
        الدوران ({settings.rotation}°)
        <input
          type="range"
          min="0"
          max="360"
          step="90"
          value={settings.rotation}
          onChange={(event) => updateField("rotation", Number(event.target.value))}
        />
      </label>

      <label>
        السطوع ({(100 + settings.brightness * 100).toFixed(0)}%)
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
        التباين ({(100 + settings.contrast * 100).toFixed(0)}%)
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
        التشبع ({(settings.saturation * 100).toFixed(0)}%)
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={settings.saturation}
          onChange={(event) => updateField("saturation", Number(event.target.value))}
        />
      </label>

      <label>
        الفلتر
        <select 
          value={settings.filter} 
          onChange={(event) => updateField("filter", event.target.value)}
        >
          <option value="">بدون فلتر</option>
          <option value="grayscale">أبيض وأسود</option>
          <option value="sepia">سيبيا</option>
          <option value="blur">ضبابي</option>
        </select>
      </label>

      <label>
        الانتقال
        <select 
          value={settings.transition} 
          onChange={(event) => updateField("transition", event.target.value)}
        >
          <option value="">بدون انتقال</option>
          <option value="fade">تلاشي</option>
          <option value="slide">انزلاق</option>
        </select>
      </label>

      <label>
        التكبير/التصغير ({settings.scale.toFixed(1)}x)
        <input
          type="range"
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
