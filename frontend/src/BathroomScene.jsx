import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

const MOVEMENT_SPEED = 2.5;

const BathroomScene = forwardRef(function BathroomScene(
    { roomWidth, roomDepth, roomHeight, viewMode, showGrid },
    ref,
) {
    const containerRef = useRef(null);
    const rendererRef = useRef(null);

    useImperativeHandle(ref, () => ({
        capture: () => rendererRef.current?.domElement.toDataURL("image/png"),
    }));

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return undefined;

        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f7fb);

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        const maxDim = Math.max(roomWidth, roomDepth);
        const startY = Math.max(1.6, roomHeight * 0.6);
        camera.position.set(maxDim * 1.2, startY, maxDim * 1.2);
        camera.lookAt(0, roomHeight / 2, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        rendererRef.current = renderer;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);

        let controls;
        let pointerControls;
        const moveState = { forward: false, backward: false, left: false, right: false };
        const velocity = new THREE.Vector3();
        const direction = new THREE.Vector3();
        const clock = new THREE.Clock();

        const setupControls = () => {
            if (viewMode === "First-Person") {
                pointerControls = new PointerLockControls(camera, renderer.domElement);
                const handleClick = () => pointerControls.lock();
                renderer.domElement.addEventListener("click", handleClick);

                const onKeyDown = (event) => {
                    switch (event.code) {
                        case "KeyW":
                        case "ArrowUp":
                            moveState.forward = true;
                            break;
                        case "KeyS":
                        case "ArrowDown":
                            moveState.backward = true;
                            break;
                        case "KeyA":
                        case "ArrowLeft":
                            moveState.left = true;
                            break;
                        case "KeyD":
                        case "ArrowRight":
                            moveState.right = true;
                            break;
                        default:
                            break;
                    }
                };

                const onKeyUp = (event) => {
                    switch (event.code) {
                        case "KeyW":
                        case "ArrowUp":
                            moveState.forward = false;
                            break;
                        case "KeyS":
                        case "ArrowDown":
                            moveState.backward = false;
                            break;
                        case "KeyA":
                        case "ArrowLeft":
                            moveState.left = false;
                            break;
                        case "KeyD":
                        case "ArrowRight":
                            moveState.right = false;
                            break;
                        default:
                            break;
                    }
                };

                window.addEventListener("keydown", onKeyDown);
                window.addEventListener("keyup", onKeyUp);

                return () => {
                    renderer.domElement.removeEventListener("click", handleClick);
                    window.removeEventListener("keydown", onKeyDown);
                    window.removeEventListener("keyup", onKeyUp);
                    pointerControls?.dispose();
                };
            }

            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.target.set(0, roomHeight / 2, 0);
            controls.maxPolarAngle = viewMode === "2D-Grundriss" ? Math.PI / 2 : Math.PI - 0.1;
            controls.enableRotate = viewMode !== "2D-Grundriss";
            if (viewMode === "2D-Grundriss") {
                camera.position.set(0, maxDim * 2, 0.01);
                camera.lookAt(0, 0, 0);
            }

            return () => controls.dispose();
        };

        const cleanupControls = setupControls();

        const ambient = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambient);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
        dirLight.position.set(5, 10, 5);
        dirLight.castShadow = true;
        scene.add(dirLight);

        const floorGeom = new THREE.PlaneGeometry(roomWidth, roomDepth);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0xe8eaed });
        const floor = new THREE.Mesh(floorGeom, floorMat);
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

        const wallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.BackSide });

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

        let gridHelper;
        if (showGrid) {
            gridHelper = new THREE.GridHelper(Math.max(roomWidth, roomDepth) * 2, 16, 0x9aa0a6, 0xdadce0);
            gridHelper.position.y = 0.001;
            scene.add(gridHelper);
        }

        const animate = () => {
            const delta = clock.getDelta();
            if (pointerControls) {
                velocity.x -= velocity.x * 10.0 * delta;
                velocity.z -= velocity.z * 10.0 * delta;

                direction.z = Number(moveState.forward) - Number(moveState.backward);
                direction.x = Number(moveState.right) - Number(moveState.left);
                direction.normalize();

                if (moveState.forward || moveState.backward) {
                    velocity.z -= direction.z * MOVEMENT_SPEED * delta;
                }
                if (moveState.left || moveState.right) {
                    velocity.x -= direction.x * MOVEMENT_SPEED * delta;
                }

                pointerControls.moveRight(-velocity.x * delta);
                pointerControls.moveForward(-velocity.z * delta);
            }

            controls?.update();
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
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
            cleanupControls?.();
            renderer.dispose();
            if (renderer.domElement && renderer.domElement.parentNode === container) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [roomWidth, roomDepth, roomHeight, viewMode, showGrid]);

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
});

export default BathroomScene;
