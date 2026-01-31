import React, { useCallback, useMemo, useState } from "react";
import VideoUploader from "./components/VideoUploader";
import VideoPreview from "./components/VideoPreview";
import Timeline from "./components/Timeline";
import EditorTools from "./components/EditorTools";
import ExportSettings from "./components/ExportSettings";
import ProjectManager from "./components/ProjectManager";
import Toolbar from "./components/Toolbar";
import {
  AudioToolSettings,
  ProjectSettings,
  TextToolSettings,
  VideoMetadata,
  VideoToolSettings,
  WhisperResult
} from "../types";
import { defaultAudioTools, defaultProjectSettings, defaultTextTools, defaultVideoTools } from "./defaults";
import { useIpc } from "./hooks/useIpc";

const App = () => {
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const [words, setWords] = useState<WhisperResult | null>(null);
  const [analysisWarnings, setAnalysisWarnings] = useState<string[]>([]);
  const [textTools, setTextTools] = useState<TextToolSettings>(defaultTextTools);
  const [videoTools, setVideoTools] = useState<VideoToolSettings>(defaultVideoTools);
  const [audioTools, setAudioTools] = useState<AudioToolSettings>(defaultAudioTools);
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>(defaultProjectSettings);
  const [status, setStatus] = useState<string>("جاهز");

  const ipc = useIpc();

  const handleUpload = useCallback(
    async (filePath: string) => {
      setStatus("يتم تحميل الفيديو...");
      const metadata = await ipc.getMetadata(filePath);
      setVideo(metadata);
      const analysis = await ipc.analyzeVideo(filePath);
      setAnalysisWarnings(analysis.warnings);
      setStatus("الفيديو جاهز للتحرير");
    },
    [ipc]
  );

  const handleWhisper = useCallback(async () => {
    if (!video) {
      return;
    }
    setStatus("يتم التعرف على الكلمات...");
    const audioPath = await ipc.extractAudio(video.path);
    const result = await ipc.transcribeAudio(audioPath);
    setWords(result);
    setStatus("تم إنشاء الكابشن");
  }, [ipc, video]);

  const handleExport = useCallback(
    async (outputPath: string) => {
      if (!video) {
        return;
      }
      setStatus("يتم تصدير الفيديو...");
      await ipc.exportVideo({
        inputPath: video.path,
        outputPath,
        projectSettings,
        textTools,
        videoTools,
        audioTools
      });
      setStatus("تم التصدير بنجاح");
    },
    [ipc, video, projectSettings, textTools, videoTools, audioTools]
  );

  const summary = useMemo(
    () => ({
      video,
      words,
      analysisWarnings,
      status
    }),
    [video, words, analysisWarnings, status]
  );

  return (
    <div className="app">
      <Toolbar status={status} onWhisper={handleWhisper} />
      <div className="layout">
        <div className="left">
          <VideoUploader onUpload={handleUpload} video={video} />
          <VideoPreview video={video} words={words} />
          <Timeline words={words} />
        </div>
        <div className="right">
          <ProjectManager summary={summary} onReset={() => setVideo(null)} />
          <EditorTools
            textTools={textTools}
            videoTools={videoTools}
            audioTools={audioTools}
            onTextChange={setTextTools}
            onVideoChange={setVideoTools}
            onAudioChange={setAudioTools}
          />
          <ExportSettings onExport={handleExport} projectSettings={projectSettings} onChange={setProjectSettings} />
        </div>
      </div>
    </div>
  );
};

export default App;
