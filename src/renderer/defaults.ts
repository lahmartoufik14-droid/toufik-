import { AudioToolSettings, ProjectSettings, TextToolSettings, VideoToolSettings } from "../types";

export const defaultTextTools: TextToolSettings = {
  captionText: "",
  fontSize: 32,
  color: "#ffffff",
  fontFamily: "Arial",
  alignment: "center",
  shadow: true,
  opacity: 1,
  speed: 1,
  position: "bottom",
  background: "rgba(0, 0, 0, 0.7)"
};

export const defaultVideoTools: VideoToolSettings = {
  playbackRate: 1,
  trimStart: 0,
  trimEnd: 0,
  rotation: 0,
  brightness: 0,
  contrast: 0,
  saturation: 1,
  filter: "",
  transition: "",
  scale: 1
};

export const defaultAudioTools: AudioToolSettings = {
  volume: 1,
  backgroundMusic: "",
  removeAudio: false,
  equalizer: "",
  noiseReduction: 0,
  echo: 0,
  effects: [],
  compression: 0,
  tempo: 1,
  preview: false
};

export const defaultProjectSettings: ProjectSettings = {
  format: "mp4",
  quality: "1080p",
  frameRate: "30fps",
  embedCaptions: true
};
