import { ipcMain } from "electron";
import {
  analyzeVideo,
  exportVideo,
  getVideoMetadata,
  extractAudioForWhisper
} from "./video-processor";
import { transcribeAudio } from "./whisper-client";

export const registerIpcHandlers = () => {
  ipcMain.handle("video:metadata", async (_event, filePath: string) => {
    return getVideoMetadata(filePath);
  });

  ipcMain.handle("video:extract-audio", async (_event, filePath: string) => {
    return extractAudioForWhisper(filePath);
  });

  ipcMain.handle("whisper:transcribe", async (_event, audioPath: string) => {
    return transcribeAudio(audioPath);
  });

  ipcMain.handle("video:export", async (_event, payload) => {
    return exportVideo(payload);
  });

  ipcMain.handle("video:analyze", async (_event, filePath: string) => {
    return analyzeVideo(filePath);
  });
};
