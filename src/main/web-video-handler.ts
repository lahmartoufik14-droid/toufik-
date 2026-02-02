import path from "path";
import { promises as fs } from "fs";
import { VideoMetadata } from "../types";

const ensureExists = async (filePath: string) => {
  await fs.access(filePath);
};

export const readVideoMetadata = async (filePath: string): Promise<VideoMetadata> => {
  await ensureExists(filePath);

  const stats = await fs.stat(filePath);
  
  return {
    name: path.basename(filePath),
    path: filePath,
    size: stats.size,
    duration: 0,
    format: path.extname(filePath).replace(".", "") as VideoMetadata["format"] || "mp4"
  };
};

export const extractAudio = async (inputPath: string, outputPath: string) => {
  await ensureExists(inputPath);
  const inputData = await fs.readFile(inputPath);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  
  const wavHeader = Buffer.alloc(44);
  wavHeader.write("RIFF", 0);
  wavHeader.writeUInt32LE(36, 4);
  wavHeader.write("WAVE", 8);
  wavHeader.write("fmt ", 12);
  wavHeader.writeUInt32LE(16, 16);
  wavHeader.writeUInt16LE(1, 20);
  wavHeader.writeUInt16LE(1, 22);
  wavHeader.writeUInt32LE(16000, 24);
  wavHeader.writeUInt32LE(32000, 28);
  wavHeader.writeUInt16LE(2, 32);
  wavHeader.writeUInt16LE(16, 34);
  wavHeader.write("data", 36);
  wavHeader.writeUInt32LE(0, 40);
  
  await fs.writeFile(outputPath, wavHeader);
  return outputPath;
};

export const processVideo = async (payload: any) => {
  const { inputPath, outputPath } = payload;
  await ensureExists(inputPath);
  
  const inputData = await fs.readFile(inputPath);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, inputData);
  
  return outputPath;
};

export const saveVideoBlob = async (data: Buffer, outputPath: string): Promise<void> => {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, data);
};
