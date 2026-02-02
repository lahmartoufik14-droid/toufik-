import { AudioToolSettings, ProjectSettings, TextToolSettings, VideoToolSettings } from "../types";

export interface ExportPayload {
  inputPath: string;
  outputPath: string;
  projectSettings: ProjectSettings;
  textTools: TextToolSettings;
  videoTools: VideoToolSettings;
  audioTools: AudioToolSettings;
}

export const processVideoExport = async (payload: ExportPayload): Promise<string> => {
  return payload.outputPath;
};
