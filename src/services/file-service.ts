import { promises as fs } from "fs";

export const ensureDirectory = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};
