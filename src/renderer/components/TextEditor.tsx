import React from "react";
import { TextToolSettings } from "../../types";

interface TextEditorProps {
  settings: TextToolSettings;
  onChange: (settings: TextToolSettings) => void;
}

const TextEditor = ({ settings, onChange }: TextEditorProps) => {
  const updateField = <K extends keyof TextToolSettings>(key: K, value: TextToolSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="tool-section">
      <h3>أدوات النصوص</h3>
      <label>
        الكابشن
        <input
          type="text"
          value={settings.captionText}
          onChange={(event) => updateField("captionText", event.target.value)}
        />
      </label>
      <label>
        حجم الخط
        <input
          type="number"
          value={settings.fontSize}
          onChange={(event) => updateField("fontSize", Number(event.target.value))}
        />
      </label>
      <label>
        لون النص
        <input type="color" value={settings.color} onChange={(event) => updateField("color", event.target.value)} />
      </label>
      <label>
        الخط
        <input
          type="text"
          value={settings.fontFamily}
          onChange={(event) => updateField("fontFamily", event.target.value)}
        />
      </label>
      <label>
        محاذاة
        <select value={settings.alignment} onChange={(event) => updateField("alignment", event.target.value as TextToolSettings["alignment"]) }>
          <option value="right">يمين</option>
          <option value="center">وسط</option>
          <option value="left">يسار</option>
        </select>
      </label>
      <label>
        ظل النص
        <input type="checkbox" checked={settings.shadow} onChange={(event) => updateField("shadow", event.target.checked)} />
      </label>
      <label>
        شفافية
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.opacity}
          onChange={(event) => updateField("opacity", Number(event.target.value))}
        />
      </label>
      <label>
        سرعة العرض
        <input
          type="number"
          min="0.5"
          step="0.1"
          value={settings.speed}
          onChange={(event) => updateField("speed", Number(event.target.value))}
        />
      </label>
      <label>
        موضع النص
        <select value={settings.position} onChange={(event) => updateField("position", event.target.value as TextToolSettings["position"]) }>
          <option value="top">أعلى</option>
          <option value="middle">وسط</option>
          <option value="bottom">أسفل</option>
        </select>
      </label>
      <label>
        خلفية النص
        <input
          type="text"
          value={settings.background}
          onChange={(event) => updateField("background", event.target.value)}
        />
      </label>
    </div>
  );
};

export default TextEditor;
