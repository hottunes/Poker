import * as THREE from "three";
import { Character } from "./character/Character";
import { CharacterUI } from "./character/CharacterUI";

export class Game {
    constructor() {
        // Initialize Three.js scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer({ antialias: true });

        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.z = 5;

        // Add basic lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 0);
        this.scene.add(directionalLight);

        // Initialize character
        this.character = new Character("플레이어", "분석형");
        this.characterUI = new CharacterUI(this.character);

        // Start animation loop
        this.animate();

        // Add Vibe Jam badge
        this.addVibeJamBadge();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

    onResize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    addVibeJamBadge() {
        const badge = document.createElement("a");
        badge.href = "https://jam.pieter.com";
        badge.target = "_blank";
        badge.style.cssText = `
            font-family: 'system-ui', sans-serif;
            position: fixed;
            bottom: -1px;
            right: -1px;
            padding: 7px;
            font-size: 14px;
            font-weight: bold;
            background: #fff;
            color: #000;
            text-decoration: none;
            z-index: 10000;
            border-top-left-radius: 12px;
            border: 1px solid #fff;
        `;
        badge.textContent = "🕹️ Vibe Jam 2025";
        document.body.appendChild(badge);
    }
}
