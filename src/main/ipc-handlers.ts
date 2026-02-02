import { ipcMain, dialog } from "electron";
import { readVideoMetadata, extractAudio, saveVideoBlob } from "./web-video-handler";
import { transcribeAudio } from "./whisper-client";
import path from "path";
import os from "os";

export const registerIpcHandlers = () => {
  ipcMain.handle("video:metadata", async (_event, filePath: string) => {
    return readVideoMetadata(filePath);
  });

  ipcMain.handle("video:extract-audio", async (_event, filePath: string) => {
    const tempDir = path.join(os.tmpdir(), 'quran-video-editor');
    const audioPath = path.join(tempDir, `audio-${Date.now()}.wav`);
    return extractAudio(filePath, audioPath);
  });

  ipcMain.handle("whisper:transcribe", async (_event, audioPath: string) => {
    return transcribeAudio(audioPath);
  });

  ipcMain.handle("video:export", async (_event, payload) => {
    try {
      const result = await dialog.showSaveDialog({
        title: 'حفظ الفيديو',
        defaultPath: payload.outputPath || 'output.webm',
        filters: [
          { name: 'WebM Video', extensions: ['webm'] },
          { name: 'MP4 Video', extensions: ['mp4'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        return result.filePath;
      }
      
      throw new Error('تم إلغاء التصدير');
    } catch (error) {
      throw error;
    }
  });

  ipcMain.handle("video:analyze", async (_event, filePath: string) => {
    const metadata = await readVideoMetadata(filePath);
    const warnings: string[] = [];
    
    if (metadata.size > 500 * 1024 * 1024) {
      warnings.push('حجم الفيديو كبير جداً (أكثر من 500 ميجابايت)');
    }
    
    return {
      metadata,
      warnings
    };
  });

  ipcMain.handle("video:save-blob", async (_event, data: Buffer, outputPath: string) => {
    await saveVideoBlob(data, outputPath);
    return outputPath;
  });

  ipcMain.handle("dialog:select-file", async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Video Files', extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm'] }
      ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }

    return null;
  });
};
