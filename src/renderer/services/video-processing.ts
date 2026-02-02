import { VideoMetadata } from "../../types";

export class VideoProcessor {
  private static instance: VideoProcessor;
  private audioContext: AudioContext;
  
  private constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  public static getInstance(): VideoProcessor {
    if (!this.instance) {
      this.instance = new VideoProcessor();
    }
    return this.instance;
  }
  
  public async getVideoMetadata(file: File): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement("video");
      videoElement.preload = "metadata";
      
      videoElement.onloadedmetadata = () => {
        resolve({
          name: file.name,
          path: URL.createObjectURL(file),
          size: file.size,
          duration: videoElement.duration,
          format: this.getFileExtension(file.name) as VideoMetadata["format"]
        });
        
        // Clean up
        URL.revokeObjectURL(videoElement.src);
      };
      
      videoElement.onerror = () => {
        reject(new Error("Failed to load video metadata"));
        URL.revokeObjectURL(videoElement.src);
      };
      
      videoElement.src = URL.createObjectURL(file);
    });
  }
  
  public async extractAudio(videoFile: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement("video");
      videoElement.muted = true;
      videoElement.playsInline = true;
      
      const mediaStreamDestination = this.audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        resolve(audioBlob);
        
        // Clean up
        URL.revokeObjectURL(videoElement.src);
      };
      
      mediaRecorder.onerror = (error) => {
        reject(error);
        URL.revokeObjectURL(videoElement.src);
      };
      
      videoElement.onloadedmetadata = async () => {
        try {
          // Create media element source
          const source = this.audioContext.createMediaElementSource(videoElement);
          source.connect(mediaStreamDestination);
          source.connect(this.audioContext.destination);
          
          mediaRecorder.start();
          await videoElement.play();
          
          // Stop recording when video ends
          videoElement.onended = () => {
            mediaRecorder.stop();
          };
          
          // Also stop after video duration
          setTimeout(() => {
            if (mediaRecorder.state !== "inactive") {
              mediaRecorder.stop();
            }
            videoElement.pause();
          }, videoElement.duration * 1000);
          
        } catch (error) {
          reject(error);
          URL.revokeObjectURL(videoElement.src);
        }
      };
      
      videoElement.onerror = () => {
        reject(new Error("Failed to load video for audio extraction"));
        URL.revokeObjectURL(videoElement.src);
      };
      
      videoElement.src = URL.createObjectURL(videoFile);
    });
  }
  
  public async processVideo(
    videoFile: File,
    options: {
      brightness?: number;
      contrast?: number;
      saturation?: number;
      rotation?: number;
      scale?: number;
      playbackRate?: number;
      captionText?: string;
      captionColor?: string;
      captionSize?: number;
      removeAudio?: boolean;
      volume?: number;
      tempo?: number;
      trimStart?: number;
      trimEnd?: number;
    }
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement("video");
      videoElement.muted = options.removeAudio || false;
      videoElement.playsInline = true;
      videoElement.crossOrigin = "anonymous";
      
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Could not create canvas context"));
        return;
      }
      
      const stream = canvas.captureStream(options.playbackRate || 1);
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: videoFile.type || "video/mp4"
      });
      const videoChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const processedVideo = new Blob(videoChunks, { type: videoFile.type || "video/mp4" });
        resolve(processedVideo);
        
        // Clean up
        URL.revokeObjectURL(videoElement.src);
      };
      
      mediaRecorder.onerror = (error) => {
        reject(error);
        URL.revokeObjectURL(videoElement.src);
      };
      
      videoElement.onloadedmetadata = async () => {
        try {
          // Set canvas dimensions
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          
          // Apply trim if specified
          let startTime = options.trimStart || 0;
          let endTime = options.trimEnd || videoElement.duration;
          let duration = endTime - startTime;
          
          if (startTime > 0) {
            videoElement.currentTime = startTime;
          }
          
          mediaRecorder.start();
          await videoElement.play();
          
          const processFrame = () => {
            if (videoElement.paused || videoElement.ended) return;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Apply transformations
            ctx.save();
            
            // Apply rotation
            if (options.rotation) {
              const angle = (options.rotation * Math.PI) / 180;
              ctx.translate(canvas.width / 2, canvas.height / 2);
              ctx.rotate(angle);
              ctx.translate(-canvas.width / 2, -canvas.height / 2);
            }
            
            // Apply scale
            if (options.scale) {
              ctx.scale(options.scale, options.scale);
            }
            
            // Draw video frame
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            
            // Apply color adjustments using canvas filters
            if (options.brightness || options.contrast || options.saturation) {
              const brightness = options.brightness || 0;
              const contrast = options.contrast || 0;
              const saturation = options.saturation || 0;
              
              const filter = `brightness(${1 + brightness}) contrast(${1 + contrast}) saturate(${1 + saturation})`;
              ctx.filter = filter;
              ctx.drawImage(canvas, 0, 0);
              ctx.filter = "none";
            }
            
            // Draw caption if specified
            if (options.captionText) {
              ctx.fillStyle = options.captionColor || "white";
              ctx.font = `${options.captionSize || 24}px Arial`;
              ctx.textAlign = "center";
              ctx.fillText(options.captionText, canvas.width / 2, canvas.height - 50);
            }
            
            ctx.restore();
            
            // Continue animation loop
            if (videoElement.currentTime < endTime) {
              requestAnimationFrame(processFrame);
            } else {
              mediaRecorder.stop();
              videoElement.pause();
            }
          };
          
          processFrame();
          
        } catch (error) {
          reject(error);
          URL.revokeObjectURL(videoElement.src);
        }
      };
      
      videoElement.onerror = () => {
        reject(new Error("Failed to process video"));
        URL.revokeObjectURL(videoElement.src);
      };
      
      videoElement.src = URL.createObjectURL(videoFile);
    });
  }
  
  private getFileExtension(filename: string): string {
    const parts = filename.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "mp4";
  }
}