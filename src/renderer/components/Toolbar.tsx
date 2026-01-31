import React from "react";

interface ToolbarProps {
  status: string;
  onWhisper: () => void;
}

const Toolbar = ({ status, onWhisper }: ToolbarProps) => {
  return (
    <header className="toolbar">
      <div className="logo">Quran Video Editor</div>
      <div className="actions">
        <button className="secondary" onClick={onWhisper}>
          تعرف على الكلمات
        </button>
      </div>
      <div className="status">{status}</div>
    </header>
  );
};

export default Toolbar;
