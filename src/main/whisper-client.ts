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

  const words = response.segments?.flatMap((segment) =>
    segment.words?.map((word) => ({
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
