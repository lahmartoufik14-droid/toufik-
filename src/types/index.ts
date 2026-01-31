export type VideoFormat = "mp4" | "mkv" | "avi";
export type VideoQuality = "720p" | "1080p" | "4k";
export type FrameRate = "30fps" | "60fps";

export interface VideoMetadata {
  name: string;
  path: string;
  size: number;
  duration: number;
  format: VideoFormat;
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface WhisperResult {
  language: string;
  words: WordTimestamp[];
}

export interface ProjectSettings {
  format: VideoFormat;
  quality: VideoQuality;
  frameRate: FrameRate;
  embedCaptions: boolean;
}

export interface TextToolSettings {
  captionText: string;
  fontSize: number;
  color: string;
  fontFamily: string;
  alignment: "left" | "center" | "right";
  shadow: boolean;
  opacity: number;
  speed: number;
  position: "top" | "middle" | "bottom";
  background: string;
}

export interface VideoToolSettings {
  playbackRate: number;
  trimStart: number;
  trimEnd: number;
  rotation: number;
  brightness: number;
  contrast: number;
  saturation: number;
  filter: string;
  transition: string;
  scale: number;
}

export interface AudioToolSettings {
  volume: number;
  backgroundMusic: string;
  removeAudio: boolean;
  equalizer: string;
  noiseReduction: number;
  echo: number;
  effects: string[];
  compression: number;
  tempo: number;
  preview: boolean;
}
