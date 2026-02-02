/**
 * معالج الفيديو باستخدام Canvas API - بدون FFmpeg
 * يستخدم Canvas لإضافة الترجمة والنصوص على الفيديو
 */

export interface VideoProcessingOptions {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  rotation?: number;
  scale?: number;
  playbackRate?: number;
  captionText?: string;
  captionColor?: string;
  captionSize?: number;
  captionFont?: string;
  captionPosition?: 'top' | 'middle' | 'bottom';
  captionBackground?: string;
  captionOpacity?: number;
  removeAudio?: boolean;
  volume?: number;
  tempo?: number;
  trimStart?: number;
  trimEnd?: number;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  size: number;
  format: string;
  hasAudio: boolean;
}

export class CanvasVideoProcessor {
  private static instance: CanvasVideoProcessor;
  
  private constructor() {}
  
  static getInstance(): CanvasVideoProcessor {
    if (!this.instance) {
      this.instance = new CanvasVideoProcessor();
    }
    return this.instance;
  }
  
  async getVideoMetadata(file: File): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        const metadata: VideoMetadata = {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          size: file.size,
          format: file.type.split('/')[1] || 'mp4',
          hasAudio: true
        };
        
        URL.revokeObjectURL(url);
        resolve(metadata);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('فشل تحميل الفيديو'));
      };
      
      video.src = url;
    });
  }
  
  async extractAudio(file: File): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const wavBlob = this.audioBufferToWav(audioBuffer);
        resolve(wavBlob);
      } catch (error) {
        reject(error);
      }
    });
  }
  
  private audioBufferToWav(audioBuffer: AudioBuffer): Blob {
    const numOfChan = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;
    
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };
    
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(audioBuffer.sampleRate);
    setUint32(audioBuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4);
    
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }
    
    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  }
  
  async processVideo(
    file: File,
    options: VideoProcessingOptions,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
      try {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('فشل إنشاء canvas context'));
          return;
        }
        
        const url = URL.createObjectURL(file);
        video.src = url;
        
        await new Promise((resolve) => {
          video.onloadedmetadata = resolve;
        });
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const chunks: Blob[] = [];
        const stream = canvas.captureStream(30);
        
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: 8000000
        });
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          URL.revokeObjectURL(url);
          resolve(blob);
        };
        
        mediaRecorder.start();
        video.play();
        
        const renderFrame = () => {
          if (video.paused || video.ended) {
            mediaRecorder.stop();
            return;
          }
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          ctx.save();
          
          if (options.rotation) {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((options.rotation * Math.PI) / 180);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
          }
          
          if (options.brightness || options.contrast || options.saturation) {
            ctx.filter = this.buildFilterString(options);
          }
          
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          if (options.captionText) {
            this.drawCaption(ctx, options, canvas.width, canvas.height);
          }
          
          ctx.restore();
          
          if (onProgress) {
            onProgress((video.currentTime / video.duration) * 100);
          }
          
          requestAnimationFrame(renderFrame);
        };
        
        renderFrame();
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  private buildFilterString(options: VideoProcessingOptions): string {
    const filters: string[] = [];
    
    if (options.brightness !== undefined) {
      filters.push(`brightness(${options.brightness}%)`);
    }
    
    if (options.contrast !== undefined) {
      filters.push(`contrast(${options.contrast}%)`);
    }
    
    if (options.saturation !== undefined) {
      filters.push(`saturate(${options.saturation}%)`);
    }
    
    return filters.join(' ');
  }
  
  private drawCaption(
    ctx: CanvasRenderingContext2D,
    options: VideoProcessingOptions,
    width: number,
    height: number
  ) {
    const fontSize = options.captionSize || 32;
    const font = options.captionFont || 'Arial';
    const color = options.captionColor || '#FFFFFF';
    const text = options.captionText || '';
    const position = options.captionPosition || 'bottom';
    const background = options.captionBackground || 'rgba(0, 0, 0, 0.7)';
    const opacity = options.captionOpacity || 1;
    
    ctx.globalAlpha = opacity;
    ctx.font = `bold ${fontSize}px ${font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const textMetrics = ctx.measureText(text);
    const textHeight = fontSize * 1.5;
    const padding = 20;
    
    let y = height / 2;
    if (position === 'top') {
      y = textHeight / 2 + padding;
    } else if (position === 'bottom') {
      y = height - textHeight / 2 - padding;
    }
    
    ctx.fillStyle = background;
    ctx.fillRect(
      width / 2 - textMetrics.width / 2 - padding,
      y - textHeight / 2,
      textMetrics.width + padding * 2,
      textHeight
    );
    
    ctx.fillStyle = color;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillText(text, width / 2, y);
    
    ctx.globalAlpha = 1;
    ctx.shadowColor = 'transparent';
  }
  
  async createVideoPreview(file: File): Promise<string> {
    return URL.createObjectURL(file);
  }
}
