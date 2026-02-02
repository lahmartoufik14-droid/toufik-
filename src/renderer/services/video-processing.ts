import { CanvasVideoProcessor, VideoProcessingOptions, VideoMetadata } from './canvas-video-processor';

export class VideoProcessor {
  private static instance: VideoProcessor;
  private canvasProcessor: CanvasVideoProcessor;
  
  private constructor() {
    this.canvasProcessor = CanvasVideoProcessor.getInstance();
  }
  
  static getInstance(): VideoProcessor {
    if (!this.instance) {
      this.instance = new VideoProcessor();
    }
    return this.instance;
  }
  
  async getVideoMetadata(file: File): Promise<VideoMetadata> {
    return this.canvasProcessor.getVideoMetadata(file);
  }
  
  async extractAudio(file: File): Promise<Blob> {
    return this.canvasProcessor.extractAudio(file);
  }
  
  async processVideo(
    file: File,
    options: VideoProcessingOptions,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    return this.canvasProcessor.processVideo(file, options, onProgress);
  }
  
  async createVideoPreview(file: File): Promise<string> {
    return this.canvasProcessor.createVideoPreview(file);
  }
}
