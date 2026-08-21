// High-Performance Python Backend WebSocket & REST Bridge (Strictly Zero Emojis)

class PythonBridge {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    
    // Automatically detect production vs local development URLs
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    this.serverUrl = isDev ? 'http://localhost:8000' : `${protocol}//${window.location.host}`;
    this.wsUrl = isDev ? 'ws://localhost:8000/ws/physics' : `${wsProtocol}//${window.location.host}/ws/physics`;
    
    this.latency = 0;
    this.onFrameCallback = null;
    this.onStatusCallback = null;
    this.reconnectTimer = null;
    this.lastPingTime = 0;
  }

  connect(onFrame, onStatus) {
    this.onFrameCallback = onFrame;
    this.onStatusCallback = onStatus;

    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // ignore
      }
    }

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        if (this.onStatusCallback) {
          this.onStatusCallback({ status: 'online', latency: this.latency });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.lastPingTime > 0) {
            this.latency = Math.round((performance.now() - this.lastPingTime) * 10) / 10;
          }
          if (this.onFrameCallback && data.type === 'physics_frame') {
            this.onFrameCallback(data);
          }
          if (this.onStatusCallback) {
            this.onStatusCallback({ status: 'online', latency: this.latency });
          }
        } catch (err) {
          console.error('Error parsing Python WS message:', err);
        }
      };

      this.ws.onerror = () => {
        this.isConnected = false;
        if (this.onStatusCallback) {
          this.onStatusCallback({ status: 'offline', latency: null });
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        if (this.onStatusCallback) {
          this.onStatusCallback({ status: 'offline', latency: null });
        }
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          if (!this.isConnected) {
            this.connect(this.onFrameCallback, this.onStatusCallback);
          }
        }, 3000);
      };
    } catch (err) {
      console.warn('Python WebSocket unavailable, using client-side compute:', err);
      this.isConnected = false;
      if (this.onStatusCallback) {
        this.onStatusCallback({ status: 'offline', latency: null });
      }
    }
  }

  sendStep(attractorData) {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.lastPingTime = performance.now();
    const payload = {
      cmd: 'step',
      attractor_x: attractorData.x || 0,
      attractor_y: attractorData.y || 0,
      attractor_z: attractorData.z || 0,
      attractor_strength: attractorData.strength || 1.5,
      dt: 0.016,
    };
    this.ws.send(JSON.stringify(payload));
  }

  sendReset(presetId, particleCount, params = {}) {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const payload = {
      cmd: 'reset',
      preset_id: presetId,
      particle_count: particleCount,
      params,
    };
    this.ws.send(JSON.stringify(payload));
  }

  async checkHealth() {
    try {
      const res = await fetch(`${this.serverUrl}/api/health`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Backend not running
    }
    return null;
  }

  async exportDataset(positions, velocities, format = 'csv', metadata = {}) {
    try {
      const res = await fetch(`${this.serverUrl}/api/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positions,
          velocities,
          format,
          metadata,
        }),
      });

      if (!res.ok) throw new Error(`Export failed with status ${res.status}`);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pixaura_dataset_${Date.now()}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error('Export error:', err);
      return false;
    }
  }

  disconnect() {
    clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const pythonBridge = new PythonBridge();
