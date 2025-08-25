"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { feature as topojsonFeature } from 'topojson-client';
import { geoContains } from 'd3-geo';

function useLand() {
	const [land, setLand] = useState(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				// Light-weight CDN fetch; no SSR since this is a client component
				const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json');
				const topo = await res.json();
				const landGeo = topojsonFeature(topo, topo.objects.land);
				if (!cancelled) setLand(landGeo);
			} catch (e) {
				console.error('Failed to load land topology', e);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	return land;
}

function DottedGlobe({ land, radius = 1.7, step = 2, dotSize = 0.012 }) {
	const instRef = useRef();

	const positions = React.useMemo(() => {
		if (!land) return [];
		const cacheKey = `landDots:v1:r${radius}:s${step}`;
		try {
			const cached = localStorage.getItem(cacheKey);
			if (cached) {
				const arr = JSON.parse(cached);
				return arr.map(([x, y, z]) => new THREE.Vector3(x, y, z));
			}
		} catch {}

		const pts = [];
		for (let lat = -80; lat <= 80; lat += step) {
			for (let lng = -180; lng < 180; lng += step) {
				if (geoContains(land, [lng, lat])) {
					const phi = (90 - lat) * (Math.PI / 180);
					const theta = (-lng + 90) * (Math.PI / 180);
					const x = radius * Math.sin(phi) * Math.cos(theta);
					const y = radius * Math.cos(phi);
					const z = radius * Math.sin(phi) * Math.sin(theta);
					pts.push(new THREE.Vector3(x, y, z));
				}
			}
		}
		// persist compactly
		try {
			localStorage.setItem(cacheKey, JSON.stringify(pts.map(v => [v.x, v.y, v.z])));
		} catch {}
		return pts;
	}, [land, radius, step]);

	useEffect(() => {
		if (!instRef.current || positions.length === 0) return;
		const m = new THREE.Matrix4();
		for (let i = 0; i < positions.length; i++) {
			m.setPosition(positions[i]);
			instRef.current.setMatrixAt(i, m);
		}
		instRef.current.instanceMatrix.needsUpdate = true;
	}, [positions]);

	if (!positions.length) return null;

	return (
		<group>
			<mesh>
				{/* radius just a hair smaller than dots */}
				<sphereGeometry args={[radius - dotSize * 0.5, 64, 64]} />
				<meshBasicMaterial
					color="#0a0a0a"
					polygonOffset
					polygonOffsetFactor={1}
					polygonOffsetUnits={1}
				/>
			</mesh>
			<instancedMesh ref={instRef} args={[null, null, positions.length]}>
				<sphereGeometry args={[dotSize, 6, 6]} />
				<meshBasicMaterial color="#e6f36a" />
			</instancedMesh>
		</group>
	);
}

function Pin({ lat, lng }) {
	const rSurf = 1.7; // globe radius used for dots
	const phi = (90 - lat) * (Math.PI / 180);
	const theta = (-lng + 90) * (Math.PI / 180);

	// surface position
	const x = rSurf * Math.sin(phi) * Math.cos(theta);
	const y = rSurf * Math.cos(phi);
	const z = rSurf * Math.sin(phi) * Math.sin(theta);
	const pos = new THREE.Vector3(x, y, z);

	// orient stem along surface normal
	const normal = pos.clone().normalize();
	const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

  // visual sizes
  const stemH = 0.16;
  const stemR = 0.008;
  const headR = 0.06;
  const headOffset = 0.015;

	return (
		<group position={pos.toArray()} quaternion={quat}>
			{/* stem */}
			<mesh position={[0, stemH / 2, 0]}>
				<cylinderGeometry args={[stemR, stemR, stemH, 8]} />
				<meshBasicMaterial color="#ffffff" />
			</mesh>

			{/* head that always faces the camera */}
      <Billboard position={[0, stemH + headOffset, 0]}>
				<group>
					<mesh>
						<circleGeometry args={[headR, 48]} />
						<meshBasicMaterial color="#ffffff" />
					</mesh>
					<mesh position={[0, 0, 0.001]}>
						<circleGeometry args={[headR * 0.92, 48]} />
						<meshBasicMaterial color="#ff4d4d" />
					</mesh>
				</group>
			</Billboard>
		</group>
	);
}

function RotatingGlobe({ pins }) {
	const land = useLand();
	const group = useRef();

	useFrame(() => {
		if (group.current) group.current.rotation.y += 0.002;
	});

	return (
		<group ref={group} rotation={[0, 0, 0]}>
      <DottedGlobe land={land} radius={1.7} step={1.5} dotSize={0.01} />
			{pins.map((pin, i) => (
				<Pin key={i} {...pin} />
			))}
		</group>
	);
}

export default function Globe({ pins }) {
	return (
    <div className="w-full h-[460px] md:h-[720px] rounded-full">
      <Canvas
        dpr={[1, 1]}
        frameloop="always"
        camera={{ position: [0, 0, 6], fov: 40 }}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={0.7} />
        <RotatingGlobe pins={pins} />
				<OrbitControls
					enablePan={false}
					enableZoom={false}
					autoRotate
					autoRotateSpeed={0.2}
					maxPolarAngle={Math.PI / 2.1 - 0.3}
					minPolarAngle={Math.PI / 2.1 - 0.3}
				/>
      </Canvas>
    </div>
	);
}