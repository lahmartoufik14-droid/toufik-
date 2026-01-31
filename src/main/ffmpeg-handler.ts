import ffmpeg, { FfprobeData } from "fluent-ffmpeg";
import { promises as fs } from "fs";
import path from "path";
import { ExportPayload } from "./video-processor";
import { VideoMetadata } from "../types";

const ensureExists = async (filePath: string) => {
  await fs.access(filePath);
};

export const readVideoMetadata = async (filePath: string): Promise<VideoMetadata> => {
  await ensureExists(filePath);

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err: Error | null, metadata: FfprobeData) => {
      if (err) {
        reject(err);
        return;
      }

      resolve({
        name: path.basename(filePath),
        path: filePath,
        size: metadata.format.size ?? 0,
        duration: metadata.format.duration ?? 0,
        format: (metadata.format.format_name?.split(",")[0] ?? "mp4") as VideoMetadata["format"]
      });
    });
  });
};

export const extractAudio = async (inputPath: string, outputPath: string) => {
  await ensureExists(inputPath);
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(["-ac", "1", "-ar", "16000"])
      .format("wav")
      .on("end", resolve)
      .on("error", reject)
      .save(outputPath);
  });
};

export const processVideo = async (payload: ExportPayload) => {
  const { inputPath, outputPath, projectSettings, textTools, videoTools, audioTools } = payload;

  await ensureExists(inputPath);

  const vfFilters: string[] = [];
  const eqParts: string[] = [];

  if (videoTools.brightness !== 0) {
    eqParts.push(`brightness=${videoTools.brightness}`);
  }
  if (videoTools.contrast !== 0) {
    eqParts.push(`contrast=${videoTools.contrast}`);
  }
  if (videoTools.saturation !== 0) {
    eqParts.push(`saturation=${videoTools.saturation}`);
  }
  if (eqParts.length) {
    vfFilters.push(`eq=${eqParts.join(":")}`);
  }
  if (videoTools.rotation !== 0) {
    vfFilters.push(`rotate=${(videoTools.rotation * Math.PI) / 180}`);
  }

  vfFilters.push(`scale=trunc(iw*${videoTools.scale}/2)*2:trunc(ih*${videoTools.scale}/2)*2`);

  if (videoTools.playbackRate !== 1) {
    vfFilters.push(`setpts=PTS/${videoTools.playbackRate}`);
  }

  const captionText = textTools.captionText?.trim();
  if (textTools.background) {
    vfFilters.push("drawbox=x=0:y=ih*0.78:w=iw:h=ih*0.22:color=" + textTools.background + ":t=fill");
  }
  if (captionText) {
    const escapedText = captionText.replace(/:/g, "\\:").replace(/'/g, "\\'");
    const alignmentMap: Record<typeof textTools.alignment, string> = {
      left: "30",
      center: "(w-text_w)/2",
      right: "w-text_w-30"
    };
    const positionMap: Record<typeof textTools.position, string> = {
      top: "40",
      middle: "(h-text_h)/2",
      bottom: "h-text_h-40"
    };
    const shadow = textTools.shadow ? ":shadowcolor=black:shadowx=2:shadowy=2" : "";
    vfFilters.push(
      `drawtext=text='${escapedText}':fontcolor=${textTools.color}:fontsize=${textTools.fontSize}:x=${alignmentMap[textTools.alignment]}:y=${positionMap[textTools.position]}:alpha=${textTools.opacity}${shadow}`
    );
  }

  const outputOptions = [
    `-r ${projectSettings.frameRate === "60fps" ? 60 : 30}`,
    `-b:v ${projectSettings.quality === "4k" ? "8M" : projectSettings.quality === "1080p" ? "5M" : "3M"}`
  ];

  if (vfFilters.length) {
    outputOptions.push(`-vf ${vfFilters.join(",")}`);
  }

  if (audioTools.removeAudio) {
    outputOptions.push("-an");
  } else {
    const audioFilters: string[] = [];
    if (audioTools.volume !== 1) {
      audioFilters.push(`volume=${audioTools.volume}`);
    }
    if (audioTools.tempo !== 1) {
      audioFilters.push(`atempo=${audioTools.tempo}`);
    }
    if (audioFilters.length) {
      outputOptions.push(`-filter:a ${audioFilters.join(",")}`);
    }
  }

  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath);
    if (videoTools.trimStart > 0) {
      command.setStartTime(videoTools.trimStart);
    }
    if (videoTools.trimEnd > videoTools.trimStart) {
      command.setDuration(videoTools.trimEnd - videoTools.trimStart);
    }
    command
      .outputOptions(outputOptions)
      .on("end", resolve)
      .on("error", reject)
      .save(outputPath);
  });
};
