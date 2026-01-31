import OpenAI from "openai";
import { createReadStream } from "fs";
import { WhisperResult } from "../types";

const apiKey = process.env.OPENAI_API_KEY;

export const transcribeAudio = async (audioPath: string): Promise<WhisperResult> => {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const client = new OpenAI({ apiKey });
  const response = await client.audio.transcriptions.create({
    file: createReadStream(audioPath),
    model: "whisper-1",
    response_format: "verbose_json",
    language: "ar"
  });

  interface WordInfo {
    word: string;
    start: number;
    end: number;
  }

  interface SegmentWithWords {
    words?: WordInfo[];
  }

  const words = response.segments?.flatMap((segment) =>
    (segment as unknown as SegmentWithWords).words?.map((word: WordInfo) => ({
      word: word.word,
      start: word.start,
      end: word.end
    })) ?? []
  ) ?? [];

  return {
    language: response.language ?? "ar",
    words
  };
};
