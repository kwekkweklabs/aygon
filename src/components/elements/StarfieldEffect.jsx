import { useFrame } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
} from "@react-three/postprocessing";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const COUNT = 600;
const TRAIL_LENGTH = 20;
const XY_BOUNDS = 30;
const Z_BOUNDS = 50;
const MAX_SPEED = 2.5;
const MIN_SPEED = 0.5;
const PARTICLE_SIZE = 0.05;
const TRAIL_SIZE_DECAY = 0.85;
const GLOW_COLOR = new THREE.Color("#849afa");

export const StarfieldEffect = () => {
  const pointsRef = useRef(null);
  const trailsRef = useRef(null);
  const particles = useRef([]);
  const positions = useRef(new Float32Array(COUNT * 3));
  const colors = useRef(new Float32Array(COUNT * 3));
  const trailPositions = useRef(new Float32Array(COUNT * TRAIL_LENGTH * 3));
  const trailColors = useRef(new Float32Array(COUNT * TRAIL_LENGTH * 3));

  // Initialize particles with trail history
  useEffect(() => {
    particles.current = Array.from({ length: COUNT }, () => {
      // Distribute particles across the full Z range initially
      const z = Math.random() * Z_BOUNDS - Z_BOUNDS / 2;
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * XY_BOUNDS,
        (Math.random() - 0.5) * XY_BOUNDS,
        z
      );

      return {
        speed: MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED),
        pos,
        // Initialize trail with gradually spaced positions behind the particle
        trail: Array(TRAIL_LENGTH)
          .fill(null)
          .map((_, i) => {
            const trailPos = pos.clone();
            trailPos.z -= i * 0.1; // Space out trail points slightly
            return trailPos;
          }),
        alpha: Math.max(0.3, Math.random()), // Vary initial intensity
      };
    });

    // Set initial positions
    updatePositionsAndColors();
  }, []);

  const updatePositionsAndColors = () => {
    // Update main particles
    particles.current.forEach((particle, i) => {
      const i3 = i * 3;
      positions.current[i3] = particle.pos.x;
      positions.current[i3 + 1] = particle.pos.y;
      positions.current[i3 + 2] = particle.pos.z;

      // Adjust intensity calculation to be less intense initially
      const intensity =
        ((particle.pos.z + Z_BOUNDS / 2) / Z_BOUNDS) * particle.alpha;
      const color = GLOW_COLOR.clone().multiplyScalar(intensity * 2.0); // Reduced initial brightness

      colors.current[i3] = color.r;
      colors.current[i3 + 1] = color.g;
      colors.current[i3 + 2] = color.b;

      // Update trail positions and colors
      particle.trail.forEach((trailPos, j) => {
        const ti3 = (i * TRAIL_LENGTH + j) * 3;
        trailPositions.current[ti3] = trailPos.x;
        trailPositions.current[ti3 + 1] = trailPos.y;
        trailPositions.current[ti3 + 2] = trailPos.z;

        // Trail colors fade out more quickly
        const trailIntensity = intensity * Math.pow(TRAIL_SIZE_DECAY, j + 1);
        const trailColor = GLOW_COLOR.clone().multiplyScalar(trailIntensity);
        trailColors.current[ti3] = trailColor.r;
        trailColors.current[ti3 + 1] = trailColor.g;
        trailColors.current[ti3 + 2] = trailColor.b;
      });
    });

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.color.needsUpdate = true;
    }
    if (trailsRef.current) {
      trailsRef.current.geometry.attributes.position.needsUpdate = true;
      trailsRef.current.geometry.attributes.color.needsUpdate = true;
    }
  };

  useFrame((_state, delta) => {
    particles.current.forEach((particle) => {
      // Update trail history
      for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
        particle.trail[i].copy(particle.trail[i - 1]);
      }
      particle.trail[0].copy(particle.pos);

      // Update particle position
      particle.pos.z += particle.speed * delta;

      // Reset position if particle goes too far
      if (particle.pos.z > Z_BOUNDS / 2) {
        particle.pos.z = -Z_BOUNDS / 2;
        particle.pos.x = (Math.random() - 0.5) * XY_BOUNDS;
        particle.pos.y = (Math.random() - 0.5) * XY_BOUNDS;
        // Reset trail positions
        particle.trail.forEach((pos) => pos.copy(particle.pos));
      }

      // Gradually increase alpha to full intensity if it's not there yet
      if (particle.alpha < 1) {
        particle.alpha = Math.min(1, particle.alpha + delta * 0.5);
      }
    });

    updatePositionsAndColors();
  });

  return (
    <>
      <color args={["#0a0814"]} attach="background" />

      {/* Main particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={COUNT}
            array={positions.current}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={COUNT}
            array={colors.current}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={PARTICLE_SIZE}
          vertexColors
          transparent
          opacity={0.8} // Slightly reduced opacity
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Trails */}
      <points ref={trailsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={COUNT * TRAIL_LENGTH}
            array={trailPositions.current}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={COUNT * TRAIL_LENGTH}
            array={trailColors.current}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={PARTICLE_SIZE * 0.8}
          vertexColors
          transparent
          opacity={0.6} // Reduced trail opacity
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      <EffectComposer>
        <Bloom
          intensity={8} // Slightly reduced bloom intensity
          luminanceThreshold={0.3} // Increased threshold to reduce initial bloom
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
};

export default StarfieldEffect;