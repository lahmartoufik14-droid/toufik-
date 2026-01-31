import { ipcRenderer } from "electron";

export const invoke = (channel: string, payload?: unknown) => ipcRenderer.invoke(channel, payload);
