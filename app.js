let scene, camera, renderer, particleSystem;
let particles, particleVelocities = [], targetPositions = [];
let currentHand = null;
let currentTemplate = 'spiral';
let lastGestureChange = 0;

const templates = {
    spiral: { color: 0x00ffff, count: 2000 },
    heart: { color: 0xff1493, count: 1500 },
    flower: { color: 0xff69b4, count: 2000 },
    saturn: { color: 0xffd700, count: 2500 },
    fireworks: { color: 0xff4500, count: 3000 },
    galaxy: { color: 0x9370db, count: 2500 }
};

// Initialize Three.js
function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    createParticles('spiral');
}

function createParticles(templateName) {
    if (particleSystem) {
        scene.remove(particleSystem);
        particles.dispose();
    }
    
    const template = templates[templateName];
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(template.count * 3);
    const colors = new Float32Array(template.count * 3);
    
    particleVelocities = [];
    targetPositions = [];
    
    for (let i = 0; i < template.count; i++) {
        const pos = getTemplatePosition(templateName, i, template.count);
        positions[i * 3] = pos.x;
        positions[i * 3 + 1] = pos.y;
        positions[i * 3 + 2] = pos.z;
        
        targetPositions.push(pos);
        
        const color = new THREE.Color(template.color);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        
        particleVelocities.push({
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
        });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    particles = geometry;
    
    currentTemplate = templateName;
    document.getElementById('currentTemplate').textContent = templateName;
}

function getTemplatePosition(template, index, total) {
    const t = (index / total) * Math.PI * 2;
    const radius = 15;
    
    switch(template) {
        case 'spiral':
            return {
                x: Math.cos(t * 5) * radius * (index / total),
                y: Math.sin(t * 5) * radius * (index / total),
                z: (index / total) * 20 - 10
            };
        
        case 'heart':
            const heartT = t * 2;
            return {
                x: 16 * Math.pow(Math.sin(heartT), 3) * 0.8,
                y: (13 * Math.cos(heartT) - 5 * Math.cos(2 * heartT) - 2 * Math.cos(3 * heartT) - Math.cos(4 * heartT)) * 0.8,
                z: Math.sin(t * 3) * 5
            };
        
        case 'flower':
            const petalT = t * 8;
            const r = radius * (1 + 0.5 * Math.sin(petalT));
            return {
                x: r * Math.cos(t),
                y: r * Math.sin(t),
                z: Math.cos(petalT) * 3
            };
        
        case 'saturn':
            if (index < total * 0.3) {
                const sphereT = (index / (total * 0.3)) * Math.PI * 2;
                const spherePhi = Math.acos(2 * (index / (total * 0.3)) - 1);
                return {
                    x: 8 * Math.sin(spherePhi) * Math.cos(sphereT),
                    y: 8 * Math.sin(spherePhi) * Math.sin(sphereT),
                    z: 8 * Math.cos(spherePhi)
                };
            } else {
                const ringT = ((index - total * 0.3) / (total * 0.7)) * Math.PI * 2;
                const ringRadius = 12 + Math.random() * 6;
                return {
                    x: ringRadius * Math.cos(ringT),
                    y: Math.sin(ringT * 10) * 0.5,
                    z: ringRadius * Math.sin(ringT)
                };
            }
        
        case 'fireworks':
            const burst = Math.floor(index / (total / 5));
            const burstT = ((index % (total / 5)) / (total / 5)) * Math.PI * 2;
            const burstR = (index % (total / 5)) / (total / 5) * 20;
            const offset = burst * 15 - 30;
            return {
                x: burstR * Math.cos(burstT) + offset,
                y: burstR * Math.sin(burstT) + (Math.random() - 0.5) * 10,
                z: (Math.random() - 0.5) * 10
            };
        
        case 'galaxy':
            const armT = t * 3;
            const armR = (index / total) * 25;
            return {
                x: armR * Math.cos(armT + armR * 0.2),
                y: (Math.random() - 0.5) * 5,
                z: armR * Math.sin(armT + armR * 0.2)
            };
        
        default:
            return { x: 0, y: 0, z: 0 };
    }
}

// Initialize hand tracking
async function initHandTracking() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' } 
        });
        
        const videoElement = document.getElementById('video');
        videoElement.srcObject = stream;
        
        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        
        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        
        hands.onResults(onHandResults);
        
        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({ image: videoElement });
            },
            width: 640,
            height: 480
        });
        
        camera.start();
        
        document.getElementById('loading').classList.add('hidden');
    } catch (err) {
        console.error('Camera error:', err);
        document.getElementById('loading').textContent = 'Camera access denied';
    }
}

function onHandResults(results) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        currentHand = results.multiHandLandmarks[0];
        
        const indexTip = currentHand[8];
        const thumbTip = currentHand[4];
        const middleTip = currentHand[12];
        const ringTip = currentHand[16];
        const pinkyTip = currentHand[20];
        
        const distance = Math.sqrt(
            Math.pow(indexTip.x - thumbTip.x, 2) + 
            Math.pow(indexTip.y - thumbTip.y, 2)
        );
        
        const fingerCount = [
            indexTip.y < currentHand[6].y,
            middleTip.y < currentHand[10].y,
            ringTip.y < currentHand[14].y,
            pinkyTip.y < currentHand[18].y
        ].filter(Boolean).length;
        
        const now = Date.now();
        
        if (distance < 0.05) {
            updateStatus('Pinch detected - Expanding particles!');
        } else if (fingerCount === 2 && now - lastGestureChange > 2000) {
            const templateNames = Object.keys(templates);
            const currentIndex = templateNames.indexOf(currentTemplate);
            const newIndex = (currentIndex + 1) % templateNames.length;
            const newTemplate = templateNames[newIndex];
            
            createParticles(newTemplate);
            updateStatus(`Peace sign - Switched to ${newTemplate}!`);
            lastGestureChange = now;
        } else if (fingerCount >= 3) {
            updateStatus('Open hand - Normal flow');
        } else {
            updateStatus('Hand detected');
        }
    } else {
        currentHand = null;
        updateStatus('Waiting for hand...');
    }
}

function updateStatus(text) {
    document.getElementById('status').textContent = text;
}

function animate() {
    requestAnimationFrame(animate);
    
    if (particles) {
        const positions = particles.attributes.position.array;
        const colors = particles.attributes.color.array;
        
        let expansionFactor = 1;
        let colorShift = 0;
        
        if (currentHand) {
            const indexTip = currentHand[8];
            const thumbTip = currentHand[4];
            const distance = Math.sqrt(
                Math.pow(indexTip.x - thumbTip.x, 2) + 
                Math.pow(indexTip.y - thumbTip.y, 2)
            );
            
            if (distance < 0.05) {
                expansionFactor = 2 + Math.sin(Date.now() * 0.005);
                colorShift = Date.now() * 0.001;
            }
            
            const palmX = (currentHand[0].x - 0.5) * 100;
            const palmY = -(currentHand[0].y - 0.5) * 100;
            
            particleSystem.rotation.y += (palmX - particleSystem.rotation.y) * 0.05;
            particleSystem.rotation.x += (palmY - particleSystem.rotation.x) * 0.05;
        }
        
        for (let i = 0; i < positions.length / 3; i++) {
            const target = targetPositions[i];
            const vel = particleVelocities[i];
            
            positions[i * 3] += vel.x;
            positions[i * 3 + 1] += vel.y;
            positions[i * 3 + 2] += vel.z;
            
            const dx = (target.x * expansionFactor) - positions[i * 3];
            const dy = (target.y * expansionFactor) - positions[i * 3 + 1];
            const dz = (target.z * expansionFactor) - positions[i * 3 + 2];
            
            vel.x += dx * 0.001;
            vel.y += dy * 0.001;
            vel.z += dz * 0.001;
            
            vel.x *= 0.95;
            vel.y *= 0.95;
            vel.z *= 0.95;
            
            if (colorShift > 0) {
                const hue = (i / (positions.length / 3) + colorShift) % 1;
                const color = new THREE.Color().setHSL(hue, 1, 0.5);
                colors[i * 3] = color.r;
                colors[i * 3 + 1] = color.g;
                colors[i * 3 + 2] = color.b;
            }
        }
        
        particles.attributes.position.needsUpdate = true;
        if (colorShift > 0) {
            particles.attributes.color.needsUpdate = true;
        }
    }
    
    if (particleSystem) {
        particleSystem.rotation.y += 0.001;
    }
    
    renderer.render(scene, camera);
}

function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', handleResize);

// Start everything when page loads
window.addEventListener('DOMContentLoaded', () => {
    initThree();
    initHandTracking();
    animate();
});

