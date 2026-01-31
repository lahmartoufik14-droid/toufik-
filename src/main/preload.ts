import { contextBridge, ipcRenderer } from "electron";
import { AudioToolSettings, ProjectSettings, TextToolSettings, VideoToolSettings } from "../types";

contextBridge.exposeInMainWorld("api", {
  getMetadata: (filePath: string) => ipcRenderer.invoke("video:metadata", filePath),
  extractAudio: (filePath: string) => ipcRenderer.invoke("video:extract-audio", filePath),
  transcribeAudio: (audioPath: string) => ipcRenderer.invoke("whisper:transcribe", audioPath),
  exportVideo: (payload: {
    inputPath: string;
    outputPath: string;
    projectSettings: ProjectSettings;
    textTools: TextToolSettings;
    videoTools: VideoToolSettings;
    audioTools: AudioToolSettings;
  }) => ipcRenderer.invoke("video:export", payload),
  analyzeVideo: (filePath: string) => ipcRenderer.invoke("video:analyze", filePath),
  getFilePath: (file: File) => (file as unknown as { path: string }).path
});
