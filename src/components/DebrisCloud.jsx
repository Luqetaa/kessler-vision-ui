import React, { useRef, useMemo, useLayoutEffect, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// Componente auxiliar para os detritos com labels
const LabeledDebris = ({ position, label, isRawSatellite }) => {
  return (
    <group position={position}>
      {/* 
        Oclusão TOTAL ativada.
        Adicionamos pointerEvents: 'none' para que o HTML se torne "fantasma" para o mouse.
        Isso impede que o texto roube o evento de ponteiro do Canvas, evitando o glitch
        da câmera (Parallax) pular quando passamos o mouse sobre as letras.
      */}
      <Html style={{ pointerEvents: 'none' }} occlude distanceFactor={15} zIndexRange={[100, 0]}>
        <div className="debris-id">
          {isRawSatellite ? (
            <span className="raw-sat-icon">
              <span className="sat-pipes">|||</span>
              <span className="sat-core">■</span>
              <span className="sat-pipes">|||</span>
            </span>
          ) : (
            `||| ${label}`
          )}
        </div>
      </Html>
    </group>
  );
};

const DebrisCloud = () => {
  const groupRef = useRef();
  const meshRef = useRef();
  
  const debrisCount = 2000;
  const colorsArray = ['#000000', '#111111', '#222222', '#333333'];

  // Dados gerados na inicialização para o InstancedMesh (Lixo Menor genérico)
  const { positions, colors, scales, rotations } = useMemo(() => {
    const positions = new Float32Array(debrisCount * 3);
    const colors = new Float32Array(debrisCount * 3);
    const scales = new Float32Array(debrisCount);
    const rotations = new Float32Array(debrisCount * 3);
    const colorObject = new THREE.Color();
    
    for (let i = 0; i < debrisCount; i++) {
      // Compressão Orbital:
      // O raio da Terra é 8. O lixo agora começa colado na atmosfera (8.2)
      // e se afasta no máximo 3.5 unidades (atingindo 11.7 de raio máximo), 
      // concentrando a nuvem de forma densa e próxima.
      const radius = 8.2 + Math.random() * 3.5; 
      
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const randomColorHex = colorsArray[Math.floor(Math.random() * colorsArray.length)];
      colorObject.set(randomColorHex);
      colors[i * 3] = colorObject.r;
      colors[i * 3 + 1] = colorObject.g;
      colors[i * 3 + 2] = colorObject.b;

      scales[i] = 0.02 + Math.random() * 0.06;

      rotations[i * 3] = Math.random() * Math.PI;
      rotations[i * 3 + 1] = Math.random() * Math.PI;
      rotations[i * 3 + 2] = Math.random() * Math.PI;
    }
    
    return { positions, colors, scales, rotations };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Geração algorítmica de espalhamento dos Labels para evitar aglomerações (Clustering)
  const generatedLabels = useMemo(() => {
    const labels = [];
    const count = 40; // Reduzido drasticamente de 150 para 40. <Html> com occlude custa MUITO processamento.
    
    // Usando distribuição em Espiral de Fibonacci para garantir espalhamento matemático perfeito
    for (let i = 0; i < count; i++) {
      // Compressão Orbital para a Telemetria Visual (hugging the Earth)
      const radius = 8.8 + Math.random() * 2.5; 
      
      // Espiral de Fibonacci
      const phi = Math.acos(1 - 2 * (i + 0.5) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      
      // Queremos que os labels se concentrem primariamente no hemisfério superior (visível)
      // Para isso dividimos phi (que vai de 0 a PI) pela metade.
      const topPhi = phi / 1.5; 
      
      const x = radius * Math.sin(topPhi) * Math.cos(theta);
      const y = radius * Math.cos(topPhi);
      const z = radius * Math.sin(topPhi) * Math.sin(theta);
      
      let labelStr = '';
      let isRawSatellite = false;
      
      // Alarmes amarelos removidos. Distribuição calibrada para apenas telemetria padrão.
      if (i < 12) {
        // ~30% Lixo Catalogado (IDs dinâmicos cinzas)
        labelStr = `19${Math.floor(70 + Math.random()*28)}-0${i}A`; 
      } else {
        // ~70% Satélites Brutos (Padrão |||■|||)
        isRawSatellite = true;
      }
      
      labels.push({ id: i, position: [x, y, z], label: labelStr, isRawSatellite });
    }
    return labels;
  }, []);

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

  // Fator de Aceleração Dinâmica (Scroll Momentum)
  const scrollVelocity = useRef(1);

  // Escuta o evento de Scroll (Roda do Mouse ou Trackpad) globalmente
  useEffect(() => {
    const handleWheel = (event) => {
      // Independentemente se o scroll é para cima ou para baixo, injetamos energia cinética
      scrollVelocity.current += Math.abs(event.deltaY) * 0.003;
      
      // Limitador de velocidade (Terminal Velocity) para não quebrar a engine
      if (scrollVelocity.current > 10) {
        scrollVelocity.current = 10;
      }
    };
    
    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Cinemática base multiplicada pelo momento do scroll
      groupRef.current.rotation.y += delta * 0.12 * scrollVelocity.current;
      
      // Atrito no vácuo (Decay): Se a velocidade estiver acima do normal (1),
      // ela decai suavemente de volta ao repouso a cada frame.
      if (scrollVelocity.current > 1) {
        // Taxa de desaceleração (Damping)
        scrollVelocity.current -= delta * 15; 
        if (scrollVelocity.current < 1) {
          scrollVelocity.current = 1;
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, -7, 0]}>
      {/* 
        Optimização de Big O(N):
        O raycast={() => null} desliga a colisão da malha instanciada.
        Isso impede que os 60 painéis HTML disparem raios contra 2.000 cubos
        a cada frame (o que gerava 120.000 cálculos inúteis por frame e travava a CPU).
      */}
      <instancedMesh 
        ref={meshRef} 
        args={[null, null, debrisCount]} 
        raycast={() => null} 
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* Renderização do mapeamento algorítmico perfeito */}
      {generatedLabels.map((data) => (
        <LabeledDebris 
          key={data.id}
          position={data.position}
          label={data.label}
          isRawSatellite={data.isRawSatellite}
        />
      ))}
    </group>
  );
};

export default DebrisCloud;
