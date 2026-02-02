import React from "react";
import { AudioToolSettings } from "../../types";

interface AudioEditorProps {
  settings: AudioToolSettings;
  onChange: (settings: AudioToolSettings) => void;
}

const AudioEditor = ({ settings, onChange }: AudioEditorProps) => {
  const updateField = <K extends keyof AudioToolSettings>(key: K, value: AudioToolSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div>
      <h3>🎵 أدوات الصوت (10 أدوات)</h3>
      
      <label>
        مستوى الصوت ({(settings.volume * 100).toFixed(0)}%)
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={settings.volume}
          onChange={(event) => updateField("volume", Number(event.target.value))}
        />
      </label>

      <label>
        موسيقى خلفية (مسار الملف)
        <input
          type="text"
          value={settings.backgroundMusic}
          onChange={(event) => updateField("backgroundMusic", event.target.value)}
          placeholder="اترك فارغاً لعدم الإضافة"
        />
      </label>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={settings.removeAudio}
          onChange={(event) => updateField("removeAudio", event.target.checked)}
        />
        <span>إزالة الصوت الأصلي</span>
      </label>

      <label>
        معادل الصوت
        <select 
          value={settings.equalizer} 
          onChange={(event) => updateField("equalizer", event.target.value)}
        >
          <option value="">بدون معادل</option>
          <option value="bass">تعزيز الجهير</option>
          <option value="treble">تعزيز الحاد</option>
          <option value="vocal">تعزيز الصوت</option>
        </select>
      </label>

      <label>
        تقليل الضوضاء ({(settings.noiseReduction * 100).toFixed(0)}%)
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.noiseReduction}
          onChange={(event) => updateField("noiseReduction", Number(event.target.value))}
        />
      </label>

      <label>
        الصدى ({settings.echo})
        <input
          type="range"
          min="0"
          max="10"
          value={settings.echo}
          onChange={(event) => updateField("echo", Number(event.target.value))}
        />
      </label>

      <label>
        تأثيرات صوتية (مفصولة بفاصلة)
        <input
          type="text"
          value={settings.effects.join(", ")}
          onChange={(event) => updateField("effects", event.target.value.split(",").map((item) => item.trim()))}
          placeholder="reverb, delay..."
        />
      </label>

      <label>
        ضغط الصوت ({(settings.compression * 100).toFixed(0)}%)
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.compression}
          onChange={(event) => updateField("compression", Number(event.target.value))}
        />
      </label>

      <label>
        سرعة الصوت (x{settings.tempo})
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={settings.tempo}
          onChange={(event) => updateField("tempo", Number(event.target.value))}
        />
      </label>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={settings.preview}
          onChange={(event) => updateField("preview", event.target.checked)}
        />
        <span>معاينة التغييرات فوراً</span>
      </label>
    </div>
  );
};

export default AudioEditor;
