import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';

const Earth = () => {
  const earthRef = useRef();

  // Engine de Rotação Planetária Constante (Eixo Y)
  useFrame((state, delta) => {
    if (earthRef.current) {
      // Velocidade de rotação aumentada conforme requisitado
      earthRef.current.rotation.y += delta * 0.1; 
    }
  });

  return (
    // Posição no eixo Y rebaixada para [0, -7, 0]
    <mesh ref={earthRef} position={[0, -7, 0]}>
      {/* 
        Geometria recalibrada:
        - 32 segmentos verticais (diminuídos conforme solicitado)
        - 24 segmentos horizontais
        Mantém o balanço sem sobrecarregar a visão vertical.
      */}
      <sphereGeometry args={[8, 32, 24]} />
      
      {/* 
        Adicionado polygonOffset para resolver o Z-fighting.
        Isso empurra a face sólida para trás no cálculo de profundidade,
        garantindo que as listras do radar fiquem contínuas, nítidas e sem serrilhados.
      */}
      <meshBasicMaterial 
        color="#eaeaea" 
        polygonOffset={true}
        polygonOffsetFactor={1}
        polygonOffsetUnits={1}
      />
      
      {/* 
        O limiar foi reduzido drasticamente para 0.1.
        Como diminuímos as linhas verticais (de 64 para 48) e aumentamos as horizontais (de 16 para 24),
        o ângulo diedro no polo diminuiu ainda mais (a malha ficou mais "plana" no topo).
        Com 0.1, garantimos a leitura do radar no polo sem revelar as diagonais!
      */}
      <Edges 
        threshold={0.1} 
        color="#3b82f6" 
      />
    </mesh>
  );
};

export default Earth;
