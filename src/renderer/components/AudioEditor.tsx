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
    <div className="tool-section">
      <h3>أدوات الصوت</h3>
      <label>
        مستوى الصوت
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
        موسيقى خلفية
        <input
          type="text"
          value={settings.backgroundMusic}
          onChange={(event) => updateField("backgroundMusic", event.target.value)}
        />
      </label>
      <label>
        حذف الصوت
        <input
          type="checkbox"
          checked={settings.removeAudio}
          onChange={(event) => updateField("removeAudio", event.target.checked)}
        />
      </label>
      <label>
        معادل الصوت
        <input type="text" value={settings.equalizer} onChange={(event) => updateField("equalizer", event.target.value)} />
      </label>
      <label>
        تقليل الضوضاء
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
        صدى
        <input type="number" value={settings.echo} onChange={(event) => updateField("echo", Number(event.target.value))} />
      </label>
      <label>
        تأثيرات صوتية
        <input
          type="text"
          value={settings.effects.join(", ")}
          onChange={(event) => updateField("effects", event.target.value.split(",").map((item) => item.trim()))}
        />
      </label>
      <label>
        ضغط الصوت
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
        سرعة الصوت
        <input
          type="number"
          min="0.5"
          step="0.1"
          value={settings.tempo}
          onChange={(event) => updateField("tempo", Number(event.target.value))}
        />
      </label>
      <label>
        معاينة الصوت
        <input
          type="checkbox"
          checked={settings.preview}
          onChange={(event) => updateField("preview", event.target.checked)}
        />
      </label>
    </div>
  );
};

export default AudioEditor;
