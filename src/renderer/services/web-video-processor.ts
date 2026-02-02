import { VideoMetadata } from "../../types";

export const getVideoMetadataFromFile = async (file: File): Promise<VideoMetadata> => {
  return new Promise((resolve) => {
    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";
    
    videoElement.onloadedmetadata = () => {
      resolve({
        name: file.name,
        path: URL.createObjectURL(file),
        size: file.size,
        duration: videoElement.duration,
        format: file.name.split(".").pop() as VideoMetadata["format"] || "mp4"
      });
    };
    
    videoElement.src = URL.createObjectURL(file);
  });
};

export const extractAudioFromVideo = async (videoFile: File): Promise<Blob> => {
  return new Promise((resolve) => {
    const videoElement = document.createElement("video");
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const mediaElementSource = audioContext.createMediaElementSource(videoElement);
    const destination = audioContext.createMediaStreamDestination();
    
    mediaElementSource.connect(destination);
    mediaElementSource.connect(audioContext.destination);
    
    videoElement.onloadedmetadata = () => {
      const mediaRecorder = new MediaRecorder(destination.stream);
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        resolve(audioBlob);
      };
      
      videoElement.play();
      mediaRecorder.start();
      
      setTimeout(() => {
        mediaRecorder.stop();
        videoElement.pause();
      }, videoElement.duration * 1000);
    };
    
    videoElement.src = URL.createObjectURL(videoFile);
  });
};

export const processVideoWithEffects = async (
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
  }
): Promise<Blob> => {
  return new Promise((resolve) => {
    const videoElement = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    videoElement.onloadedmetadata = () => {
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      const stream = canvas.captureStream(videoElement.playbackRate || 1);
      const mediaRecorder = new MediaRecorder(stream);
      const videoChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const processedVideo = new Blob(videoChunks, { type: videoFile.type });
        resolve(processedVideo);
      };
      
      videoElement.play();
      mediaRecorder.start();
      
      const processFrame = () => {
        if (videoElement.paused || videoElement.ended) return;
        
        ctx?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Apply effects here
        // This is a simplified version - actual implementation would be more complex
        
        requestAnimationFrame(processFrame);
      };
      
      processFrame();
      
      setTimeout(() => {
        mediaRecorder.stop();
        videoElement.pause();
      }, videoElement.duration * 1000);
    };
    
    videoElement.src = URL.createObjectURL(videoFile);
  });
};