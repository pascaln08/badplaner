import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function BathroomScene({ roomWidth, roomDepth, roomHeight }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xaaaaaa);

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        const maxDim = Math.max(roomWidth, roomDepth);
        camera.position.set(maxDim * 1.5, roomHeight * 1.2, maxDim * 1.5);
        camera.lookAt(0, roomHeight / 2, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.target.set(0, roomHeight / 2, 0);

        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambient);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
        dirLight.position.set(5, 10, 5);
        scene.add(dirLight);

        const floorGeom = new THREE.PlaneGeometry(roomWidth, roomDepth);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });
        const floor = new THREE.Mesh(floorGeom, floorMat);
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

        const wallMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            side: THREE.BackSide,
        });

        const northWallGeom = new THREE.PlaneGeometry(roomWidth, roomHeight);
        const northWall = new THREE.Mesh(northWallGeom, wallMat);
        northWall.position.set(0, roomHeight / 2, -roomDepth / 2);
        scene.add(northWall);

        const southWallGeom = new THREE.PlaneGeometry(roomWidth, roomHeight);
        const southWall = new THREE.Mesh(southWallGeom, wallMat);
        southWall.position.set(0, roomHeight / 2, roomDepth / 2);
        southWall.rotation.y = Math.PI;
        scene.add(southWall);

        const westWallGeom = new THREE.PlaneGeometry(roomDepth, roomHeight);
        const westWall = new THREE.Mesh(westWallGeom, wallMat);
        westWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
        westWall.rotation.y = Math.PI / 2;
        scene.add(westWall);

        const eastWallGeom = new THREE.PlaneGeometry(roomDepth, roomHeight);
        const eastWall = new THREE.Mesh(eastWallGeom, wallMat);
        eastWall.position.set(roomWidth / 2, roomHeight / 2, 0);
        eastWall.rotation.y = -Math.PI / 2;
        scene.add(eastWall);

        const cubeGeom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const cubeMat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(cubeGeom, cubeMat);
        cube.position.set(0, 0.25, 0);
        scene.add(cube);

        const axesHelper = new THREE.AxesHelper(Math.max(roomWidth, roomDepth));
        scene.add(axesHelper);

        const animate = () => {
            requestAnimationFrame(animate);
            cube.rotation.y += 0.01;
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            const newWidth = container.clientWidth || window.innerWidth;
            const newHeight = container.clientHeight || window.innerHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            controls.dispose();
            renderer.dispose();
            if (renderer.domElement && renderer.domElement.parentNode === container) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [roomWidth, roomDepth, roomHeight]);

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
            }}
        />
    );
}
