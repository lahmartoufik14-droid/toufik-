import React from "react";
import { AudioToolSettings, TextToolSettings, VideoToolSettings } from "../../types";
import TextEditor from "./TextEditor";
import VideoEffects from "./VideoEffects";
import AudioEditor from "./AudioEditor";

interface EditorToolsProps {
  textTools: TextToolSettings;
  videoTools: VideoToolSettings;
  audioTools: AudioToolSettings;
  onTextChange: (settings: TextToolSettings) => void;
  onVideoChange: (settings: VideoToolSettings) => void;
  onAudioChange: (settings: AudioToolSettings) => void;
}

const EditorTools = ({ textTools, videoTools, audioTools, onTextChange, onVideoChange, onAudioChange }: EditorToolsProps) => {
  return (
    <div className="panel">
      <h2>أدوات التحرير</h2>
      <TextEditor settings={textTools} onChange={onTextChange} />
      <VideoEffects settings={videoTools} onChange={onVideoChange} />
      <AudioEditor settings={audioTools} onChange={onAudioChange} />
    </div>
  );
};

export default EditorTools;
