import React from "react";

interface ToolbarProps {
  status: string;
  onWhisper: () => void;
}

const Toolbar = ({ status, onWhisper }: ToolbarProps) => {
  return (
    <header className="toolbar">
      <h1>🎬 محرر فيديو القرآن الكريم</h1>
      <div className="status">{status}</div>
      <button onClick={onWhisper}>
        🎤 التعرف على الكلمات
      </button>
    </header>
  );
};

export default Toolbar;
