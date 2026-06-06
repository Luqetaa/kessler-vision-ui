import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';

const TelemetryLine = ({ start, end, color, speed = 2, dashScale = 20, dashSize = 2 }) => {
  const lineRef = useRef();

  useFrame((state, delta) => {
    if (lineRef.current && lineRef.current.material) {
      // O dashOffset decresce para dar a impressão de fluxo do 'start' para o 'end'
      lineRef.current.material.dashOffset -= delta * speed;
    }
  });

  // Ponto de controle empurrado radialmente para fora para evitar que a curva cruze por dentro da Terra
  const mid = useMemo(() => {
    const midX = (start[0] + end[0]) / 2;
    const midY = (start[1] + end[1]) / 2;
    const midZ = (start[2] + end[2]) / 2;
    
    const dist = Math.sqrt(midX * midX + midY * midY + midZ * midZ);
    if (dist > 0.01) {
      // Como os satélites estão entre 8.2 e 11.7, um raio de 12.0 para o ponto de controle
      // garante uma curvatura perfeita por cima da atmosfera terrestre.
      const targetRadius = 12.0;
      return [
        (midX / dist) * targetRadius,
        (midY / dist) * targetRadius,
        (midZ / dist) * targetRadius
      ];
    }
    return [midX * 1.2, midY * 1.2, midZ * 1.2];
  }, [start, end]);

  return (
    <QuadraticBezierLine
      ref={lineRef}
      start={start}
      end={end}
      mid={mid}
      color={color}
      lineWidth={1.5}
      dashed={true}
      dashScale={dashScale}
      dashSize={dashSize}
      transparent={true}
      opacity={0.6}
    />
  );
};



const DataFlowPrediction = () => {
  const groupRef = useRef();
  const meshRef = useRef();
  
  const debrisCount = 600;
  const colorsArray = ['#000000', '#111111', '#222222', '#333333'];

  // Gera dados estáticos dos satélites
  const { positions, colors, scales, rotations } = useMemo(() => {
    const positions = new Float32Array(debrisCount * 3);
    const colors = new Float32Array(debrisCount * 3);
    const scales = new Float32Array(debrisCount);
    const rotations = new Float32Array(debrisCount * 3);
    const colorObject = new THREE.Color();
    
    for (let i = 0; i < debrisCount; i++) {
      // Começa colado na atmosfera da Terra (8.2) até 11.7
      const radius = 8.2 + Math.random() * 3.5; 
      
      // Limitar a distribuição para o hemisfério superior (visível da câmera)
      // v entre 0.55 e 1.0 garante que fique do equador pra cima
      const v = 0.55 + Math.random() * 0.45;
      const phi = Math.acos(2.0 * v - 1.0); // Phi vai de 0 (Polo Norte) até quase PI/2 (Equador)
      
      // u para cobrir 360 graus ao redor do eixo Y
      const u = Math.random();
      const theta = u * 2.0 * Math.PI;
      
      // Mapeamento Esférico Padrão do Three.js (Eixo Y para cima)
      positions[i * 3 ] = radius * Math.sin(phi) * Math.sin(theta);     // X
      positions[i * 3  + 1] = radius * Math.cos(phi);                   // Y
      positions[i * 3  + 2] = radius * Math.sin(phi) * Math.cos(theta); // Z

      const randomColorHex = colorsArray[Math.floor(Math.random() * colorsArray.length)];
      colorObject.set(randomColorHex);
      colors[i * 3] = colorObject.r;
      colors[i * 3 + 1] = colorObject.g;
      colors[i * 3 + 2] = colorObject.b;

      scales[i] = 0.02 + Math.random() * 0.05;

      rotations[i * 3] = Math.random() * Math.PI;
      rotations[i * 3 + 1] = Math.random() * Math.PI;
      rotations[i * 3 + 2] = Math.random() * Math.PI;
    }
    
    return { positions, colors, scales, rotations };
  }, [debrisCount]);

  // Criação da InstancedMesh
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  useLayoutEffect(() => {
    if (meshRef.current) {
      for (let i = 0; i < debrisCount; i++) {
        dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        dummy.rotation.set(rotations[i * 3], rotations[i * 3 + 1], rotations[i * 3 + 2]);
        
        const scale = scales[i];
        dummy.scale.set(scale, scale, scale);
        
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        
        const color = new THREE.Color(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]);
        meshRef.current.setColorAt(i, color);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [dummy, positions, colors, scales, rotations, debrisCount]);

  // Gera conexões de trajetórias aleatórias entre satélites
  const activeConnections = useMemo(() => {
    const connections = [];
    for (let i = 0; i < 45; i++) {
      const idxStart = Math.floor(Math.random() * debrisCount) * 3;
      let idxEnd = Math.floor(Math.random() * debrisCount) * 3;
      // Garante que a conexão não ligue o satélite a ele mesmo
      while (idxEnd === idxStart) {
        idxEnd = Math.floor(Math.random() * debrisCount) * 3;
      }
      
      connections.push({
        start: [positions[idxStart], positions[idxStart + 1], positions[idxStart + 2]],
        end: [positions[idxEnd], positions[idxEnd + 1], positions[idxEnd + 2]]
      });
    }
    return connections;
  }, [positions, debrisCount]);



  useLayoutEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.set(0, 0, 0);
    }
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[0, -7, 0]}>
      {/* Satélites de Fundo */}
      <instancedMesh ref={meshRef} args={[null, null, debrisCount]} raycast={() => null}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* Fluxos de Trajetória Aleatórios entre Satélites */}
      {activeConnections.map((conn, idx) => (
        <TelemetryLine 
          key={`telemetry-${idx}`} 
          start={conn.start} 
          end={conn.end} 
          color="#ef4444" 
          speed={2 + Math.random() * 2} 
          dashScale={30}
          dashSize={3}
        />
      ))}


    </group>
  );
};

export default DataFlowPrediction;
