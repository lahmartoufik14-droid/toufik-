import { useMemo } from "react";
import { AudioToolSettings, ProjectSettings, TextToolSettings, VideoMetadata, VideoToolSettings, WhisperResult } from "../../types";

declare global {
  interface Window {
    api?: {
      getMetadata: (filePath: string) => Promise<VideoMetadata>;
      extractAudio: (filePath: string) => Promise<string>;
      transcribeAudio: (audioPath: string) => Promise<WhisperResult>;
      exportVideo: (payload: {
        inputPath: string;
        outputPath: string;
        projectSettings: ProjectSettings;
        textTools: TextToolSettings;
        videoTools: VideoToolSettings;
        audioTools: AudioToolSettings;
      }) => Promise<string>;
      analyzeVideo: (filePath: string) => Promise<{ metadata: VideoMetadata; warnings: string[] }>;
      saveVideoBlob: (data: ArrayBuffer, outputPath: string) => Promise<string>;
      selectFile: () => Promise<string | null>;
      getFilePath: (file: File) => string;
    };
  }
}

export const useIpc = () => {
  return useMemo(() => {
    if (!window.api) {
      throw new Error("IPC bridge not available");
    }

    return window.api;
  }, []);
};
