# PixAura

An interactive 3D particle system controlled by hand gestures using computer vision. Create mesmerizing visual patterns that respond to your hand movements in real-time.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

- **Real-time Hand Tracking**: Uses MediaPipe for accurate hand gesture recognition
- **6 Stunning Templates**: Spiral, Heart, Flower, Saturn, Fireworks, and Galaxy patterns
- **Interactive Gestures**:
  - 👌 **Pinch**: Expand particles and trigger dynamic color shifts
  - ✌️ **Peace Sign**: Cycle through different particle templates
  - ✋ **Hand Movement**: Rotate the entire particle system
- **Smooth Animations**: Physics-based particle motion with 2000-3000 particles per template
- **WebGL Rendering**: High-performance 3D graphics using Three.js

## 🚀 Demo

Open `index.html` in a modern web browser with camera access to start interacting with particles using hand gestures.

## 🛠️ Technologies

- **Three.js (r128)**: 3D rendering and particle systems
- **MediaPipe Hands**: Real-time hand tracking and gesture recognition
- **WebGL**: Hardware-accelerated graphics
- **JavaScript ES6+**: Modern web development

## 📋 Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Webcam access
- HTTPS connection (required for camera access) or localhost

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/CloneMaster2028/PixAura.git
cd PixAura
```

2. Serve the files using a local web server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server
```

3. Open your browser and navigate to:
```
http://localhost:8000
```

4. Allow camera access when prompted

## 🎮 Controls

| Gesture | Action |
|---------|--------|
| 👌 Pinch (thumb + index finger) | Expand particles and create rainbow color effects |
| ✌️ Peace Sign (2 fingers up) | Switch to next particle template |
| ✋ Move Hand | Rotate the particle system in 3D space |

## 🎨 Particle Templates

1. **Spiral** (Cyan): Rotating helix pattern
2. **Heart** (Deep Pink): 3D heart shape with depth
3. **Flower** (Hot Pink): Petal-based radial design
4. **Saturn** (Gold): Planet with ring system
5. **Fireworks** (Orange Red): Explosive burst patterns
6. **Galaxy** (Medium Purple): Spiral galaxy arms

## 📁 Project Structure

```
PixAura/
│
├── index.html          # Main HTML file
├── app.js             # Core application logic
├── styles.css         # Styling and UI
├── README.md          # This file
└── LICENSE            # MIT License
```

## 🔒 Privacy

All processing happens locally in your browser. No video or image data is transmitted or stored anywhere.

## 🐛 Troubleshooting

**Camera not working?**
- Ensure you're using HTTPS or localhost
- Check browser permissions for camera access
- Try refreshing the page

**Hand not detected?**
- Ensure good lighting conditions
- Keep your hand within the camera frame
- Try adjusting your distance from the camera

**Poor performance?**
- Close other browser tabs
- Try a different browser
- Reduce system load from other applications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Prince Kumar Jha**

## 🙏 Acknowledgments

- [Three.js](https://threejs.org/) for 3D rendering
- [MediaPipe](https://mediapipe.dev/) for hand tracking
- Inspired by interactive art and gesture-based interfaces

## 🔮 Future Enhancements

- [ ] Add more particle templates
- [ ] Implement gesture recording and playback
- [ ] Add sound reactivity
- [ ] Multi-hand support
- [ ] Custom color schemes
- [ ] Export animations as video

---

Made with ❤️ and hand gestures
