export async function extractFrame(file: File, timeInSeconds: number = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    
    const url = URL.createObjectURL(file);
    video.src = url;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      video.load();
    };

    video.onloadedmetadata = () => {
      // Small delay to ensure Android 11+ video decoder is ready
      setTimeout(() => {
        const validDuration = video.duration > 0 && video.duration !== Infinity ? video.duration : 10;
        // Ensure we seek to a non-zero value so onseeked always fires
        video.currentTime = Math.max(0.1, Math.min(timeInSeconds, validDuration / 2));
      }, 100);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimize canvas context
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          cleanup();
          resolve(dataUrl);
        } else {
          cleanup();
          reject(new Error("Could not get canvas context"));
        }
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = (e) => {
      cleanup();
      reject(e);
    };
  });
}

export async function getVideoMetadata(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    
    const url = URL.createObjectURL(file);
    video.src = url;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      video.load();
    };

    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration || 0,
        width: video.videoWidth || 0,
        height: video.videoHeight || 0,
      });
      cleanup();
    };

    video.onerror = (e) => {
      cleanup();
      reject(e);
    };
  });
}
