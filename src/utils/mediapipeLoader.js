// Dynamic MediaPipe script loader with caching
let loadPromise = null;

export function loadMediaPipe() {
  if (window.Hands && window.Camera && window.drawConnectors) {
    return Promise.resolve();
  }

  if (loadPromise) return loadPromise;

  const scripts = [
    'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
  ];

  loadPromise = Promise.all(
    scripts.map((src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });
    })
  );

  return loadPromise;
}
