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
    <div>
      <h3>📝 أدوات النصوص (10 أدوات)</h3>
      
      <label>
        نص الترجمة
        <input
          type="text"
          value={settings.captionText}
          onChange={(event) => updateField("captionText", event.target.value)}
          placeholder="أدخل النص هنا..."
        />
      </label>

      <label>
        حجم الخط ({settings.fontSize}px)
        <input
          type="range"
          min="16"
          max="72"
          value={settings.fontSize}
          onChange={(event) => updateField("fontSize", Number(event.target.value))}
        />
      </label>

      <label>
        لون النص
        <input 
          type="color" 
          value={settings.color} 
          onChange={(event) => updateField("color", event.target.value)} 
        />
      </label>

      <label>
        نوع الخط
        <select
          value={settings.fontFamily}
          onChange={(event) => updateField("fontFamily", event.target.value)}
        >
          <option value="Arial">Arial</option>
          <option value="Traditional Arabic">Traditional Arabic</option>
          <option value="Tahoma">Tahoma</option>
          <option value="Verdana">Verdana</option>
          <option value="Georgia">Georgia</option>
        </select>
      </label>

      <label>
        المحاذاة
        <select 
          value={settings.alignment} 
          onChange={(event) => updateField("alignment", event.target.value as TextToolSettings["alignment"])}
        >
          <option value="right">يمين</option>
          <option value="center">وسط</option>
          <option value="left">يسار</option>
        </select>
      </label>

      <label className="checkbox-label">
        <input 
          type="checkbox" 
          checked={settings.shadow} 
          onChange={(event) => updateField("shadow", event.target.checked)} 
        />
        <span>إضافة ظل للنص</span>
      </label>

      <label>
        الشفافية ({settings.opacity.toFixed(1)})
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
        سرعة العرض (x{settings.speed})
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={settings.speed}
          onChange={(event) => updateField("speed", Number(event.target.value))}
        />
      </label>

      <label>
        موضع النص
        <select 
          value={settings.position} 
          onChange={(event) => updateField("position", event.target.value as TextToolSettings["position"])}
        >
          <option value="top">أعلى الشاشة</option>
          <option value="middle">وسط الشاشة</option>
          <option value="bottom">أسفل الشاشة</option>
        </select>
      </label>

      <label>
        لون الخلفية
        <input
          type="color"
          value={settings.background.replace('rgba(0, 0, 0, 0.7)', '#000000')}
          onChange={(event) => updateField("background", `rgba(${parseInt(event.target.value.slice(1, 3), 16)}, ${parseInt(event.target.value.slice(3, 5), 16)}, ${parseInt(event.target.value.slice(5, 7), 16)}, 0.7)`)}
        />
      </label>
    </div>
  );
};

export default TextEditor;
