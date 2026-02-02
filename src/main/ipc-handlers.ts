import { ipcMain } from "electron";
import {
  analyzeVideo,
  exportVideo,
  getVideoMetadata,
  extractAudioForWhisper
} from "./video-processor";
import { transcribeAudio } from "./whisper-client";
import { getMainWindow } from "./index";

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

  // New handler for web-based video processing
  ipcMain.handle("video:process-web", async (_event, payload) => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      return mainWindow.webContents.send("video:process-web", payload);
    }
    throw new Error("Main window not available");
  });
};
