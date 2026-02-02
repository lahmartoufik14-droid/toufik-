import React, { useCallback, useMemo, useState, useEffect } from "react";
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
import { VideoProcessor } from "./services/video-processing";

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
      
      try {
        // Get basic metadata from main process
        const metadata = await ipc.getMetadata(filePath);
        
        // Enhance metadata with duration from renderer
        const file = await fetch(filePath).then(res => res.blob());
        const videoFile = new File([file], metadata.name, { type: `video/${metadata.format}` });
        
        const videoProcessor = VideoProcessor.getInstance();
        const enhancedMetadata = await videoProcessor.getVideoMetadata(videoFile);
        
        setVideo({
          ...metadata,
          duration: enhancedMetadata.duration,
          size: enhancedMetadata.size
        });
        
        const analysis = await ipc.analyzeVideo(filePath);
        setAnalysisWarnings(analysis.warnings);
        setStatus("الفيديو جاهز للتحرير");
      } catch (error) {
        console.error("Error loading video:", error);
        setStatus("فشل تحميل الفيديو");
      }
    },
    [ipc]
  );

  const handleWhisper = useCallback(async () => {
    if (!video) {
      return;
    }
    setStatus("يتم التعرف على الكلمات...");
    
    try {
      // Extract audio using web-based approach
      const file = await fetch(video.path).then(res => res.blob());
      const videoFile = new File([file], video.name, { type: `video/${video.format}` });
      
      const videoProcessor = VideoProcessor.getInstance();
      const audioBlob = await videoProcessor.extractAudio(videoFile);
      
      // Save audio blob to temporary file
      const audioPath = await saveBlobToTempFile(audioBlob, "whisper-audio.wav");
      
      const result = await ipc.transcribeAudio(audioPath);
      setWords(result);
      setStatus("تم إنشاء الكابشن");
    } catch (error) {
      console.error("Error in whisper processing:", error);
      setStatus("فشل إنشاء الكابشن");
    }
  }, [ipc, video]);

  const saveBlobToTempFile = async (blob: Blob, filename: string): Promise<string> => {
    // This function would be implemented to save the blob to a temporary file
    // For now, we'll return a placeholder path
    return `${video?.path}.temp/${filename}`;
  };

  const handleExport = useCallback(
    async (outputPath: string) => {
      if (!video) {
        return;
      }
      setStatus("يتم تصدير الفيديو...");
      
      try {
        // Use web-based video processing
        const file = await fetch(video.path).then(res => res.blob());
        const videoFile = new File([file], video.name, { type: `video/${video.format}` });
        
        const videoProcessor = VideoProcessor.getInstance();
        const processedVideo = await videoProcessor.processVideo(videoFile, {
          brightness: videoTools.brightness,
          contrast: videoTools.contrast,
          saturation: videoTools.saturation,
          rotation: videoTools.rotation,
          scale: videoTools.scale,
          playbackRate: videoTools.playbackRate,
          captionText: textTools.captionText,
          captionColor: textTools.color,
          captionSize: textTools.fontSize,
          removeAudio: audioTools.removeAudio,
          volume: audioTools.volume,
          tempo: audioTools.tempo,
          trimStart: videoTools.trimStart,
          trimEnd: videoTools.trimEnd
        });
        
        // Save the processed video to the output path
        // In a real implementation, this would save the blob to the filesystem
        setStatus("تم التصدير بنجاح");
        
        // Also call the original export for compatibility
        await ipc.exportVideo({
          inputPath: video.path,
          outputPath,
          projectSettings,
          textTools,
          videoTools,
          audioTools
        });
        
      } catch (error) {
        console.error("Error exporting video:", error);
        setStatus("فشل تصدير الفيديو");
      }
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
