import path from "path";
import { promises as fs } from "fs";
import { processVideo, extractAudio, readVideoMetadata } from "./ffmpeg-handler";
import {
  AudioToolSettings,
  ProjectSettings,
  TextToolSettings,
  VideoToolSettings,
  VideoMetadata
} from "../types";

export interface ExportPayload {
  inputPath: string;
  outputPath: string;
  projectSettings: ProjectSettings;
  textTools: TextToolSettings;
  videoTools: VideoToolSettings;
  audioTools: AudioToolSettings;
}

export const getVideoMetadata = async (filePath: string): Promise<VideoMetadata> => {
  return readVideoMetadata(filePath);
};

export const extractAudioForWhisper = async (filePath: string) => {
  const outputPath = path.join(path.dirname(filePath), "whisper-audio.wav");
  await extractAudio(filePath, outputPath);
  return outputPath;
};

export const analyzeVideo = async (filePath: string) => {
  const metadata = await readVideoMetadata(filePath);
  return {
    metadata,
    warnings: metadata.duration > 60 * 60 ? ["الفيديو طويل جدًا لتحليل سريع"] : []
  };
};

export const exportVideo = async (payload: ExportPayload) => {
  await fs.mkdir(path.dirname(payload.outputPath), { recursive: true });
  return processVideo(payload);
};
