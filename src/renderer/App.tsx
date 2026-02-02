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
import { VideoProcessor } from "./services/video-processing";
import "./styles.css";

const App = () => {
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [words, setWords] = useState<WhisperResult | null>(null);
  const [analysisWarnings, setAnalysisWarnings] = useState<string[]>([]);
  const [textTools, setTextTools] = useState<TextToolSettings>(defaultTextTools);
  const [videoTools, setVideoTools] = useState<VideoToolSettings>(defaultVideoTools);
  const [audioTools, setAudioTools] = useState<AudioToolSettings>(defaultAudioTools);
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>(defaultProjectSettings);
  const [status, setStatus] = useState<string>("جاهز للبدء");
  const [exportProgress, setExportProgress] = useState<number>(0);

  const ipc = useIpc();

  const handleUpload = useCallback(
    async (file: File) => {
      setStatus("يتم تحميل الفيديو...");
      
      try {
        setVideoFile(file);
        
        const videoProcessor = VideoProcessor.getInstance();
        const metadata = await videoProcessor.getVideoMetadata(file);
        
        const filePath = (file as any).path || URL.createObjectURL(file);
        
        setVideo({
          name: file.name,
          path: filePath,
          size: metadata.size,
          duration: metadata.duration,
          format: metadata.format as VideoMetadata["format"]
        });
        
        setStatus("الفيديو جاهز للتحرير ✓");
        
        if (filePath.startsWith('blob:') === false) {
          const analysis = await ipc.analyzeVideo(filePath);
          setAnalysisWarnings(analysis.warnings || []);
        }
      } catch (error) {
        console.error("خطأ في تحميل الفيديو:", error);
        setStatus("فشل تحميل الفيديو ✗");
      }
    },
    [ipc]
  );

  const handleWhisper = useCallback(async () => {
    if (!videoFile) {
      setStatus("الرجاء رفع فيديو أولاً");
      return;
    }
    
    setStatus("يتم استخراج الصوت...");
    
    try {
      const videoProcessor = VideoProcessor.getInstance();
      const audioBlob = await videoProcessor.extractAudio(videoFile);
      
      setStatus("يتم التعرف على الكلمات...");
      
      const arrayBuffer = await audioBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fs = require('fs');
      const path = require('path');
      const os = require('os');
      
      const tempAudioPath = path.join(os.tmpdir(), `whisper-${Date.now()}.wav`);
      
      if (typeof window !== 'undefined' && window.api && window.api.saveVideoBlob) {
        await window.api.saveVideoBlob(arrayBuffer, tempAudioPath);
        const result = await ipc.transcribeAudio(tempAudioPath);
        setWords(result);
        setStatus("تم إنشاء الترجمة بنجاح ✓");
      } else {
        setStatus("فشل حفظ الملف الصوتي");
      }
    } catch (error) {
      console.error("خطأ في معالجة Whisper:", error);
      setStatus("فشل إنشاء الترجمة ✗");
    }
  }, [videoFile, ipc]);

  const handleExport = useCallback(
    async () => {
      if (!videoFile) {
        setStatus("الرجاء رفع فيديو أولاً");
        return;
      }
      
      setStatus("يتم تصدير الفيديو...");
      setExportProgress(0);
      
      try {
        const videoProcessor = VideoProcessor.getInstance();
        
        const processedBlob = await videoProcessor.processVideo(
          videoFile,
          {
            brightness: videoTools.brightness,
            contrast: videoTools.contrast,
            saturation: videoTools.saturation,
            rotation: videoTools.rotation,
            scale: videoTools.scale,
            playbackRate: videoTools.playbackRate,
            captionText: textTools.captionText,
            captionColor: textTools.color,
            captionSize: textTools.fontSize,
            captionFont: textTools.fontFamily,
            captionPosition: textTools.position,
            captionBackground: textTools.background,
            captionOpacity: textTools.opacity,
            removeAudio: audioTools.removeAudio,
            volume: audioTools.volume,
            tempo: audioTools.tempo,
            trimStart: videoTools.trimStart,
            trimEnd: videoTools.trimEnd
          },
          (progress) => {
            setExportProgress(progress);
            setStatus(`جاري التصدير... ${Math.round(progress)}%`);
          }
        );
        
        const outputPath = await ipc.exportVideo({
          inputPath: video?.path || '',
          outputPath: `output-${Date.now()}.webm`,
          projectSettings,
          textTools,
          videoTools,
          audioTools
        });
        
        if (outputPath && window.api && window.api.saveVideoBlob) {
          const arrayBuffer = await processedBlob.arrayBuffer();
          await window.api.saveVideoBlob(arrayBuffer, outputPath);
          setStatus(`تم التصدير بنجاح ✓ - ${outputPath}`);
        } else {
          const url = URL.createObjectURL(processedBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `output-${Date.now()}.webm`;
          a.click();
          URL.revokeObjectURL(url);
          setStatus("تم التصدير بنجاح ✓");
        }
        
        setExportProgress(100);
      } catch (error) {
        console.error("خطأ في تصدير الفيديو:", error);
        setStatus("فشل تصدير الفيديو ✗");
        setExportProgress(0);
      }
    },
    [videoFile, video, ipc, projectSettings, textTools, videoTools, audioTools]
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
          <VideoPreview video={video} words={words} videoFile={videoFile} />
          <Timeline words={words} />
        </div>
        <div className="right">
          <ProjectManager summary={summary} onReset={() => {
            setVideo(null);
            setVideoFile(null);
            setWords(null);
            setStatus("جاهز للبدء");
          }} />
          <EditorTools
            textTools={textTools}
            videoTools={videoTools}
            audioTools={audioTools}
            onTextChange={setTextTools}
            onVideoChange={setVideoTools}
            onAudioChange={setAudioTools}
          />
          <ExportSettings 
            onExport={handleExport} 
            projectSettings={projectSettings} 
            onChange={setProjectSettings}
            exportProgress={exportProgress}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
