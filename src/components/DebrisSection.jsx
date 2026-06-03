import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import Earth from './Earth';
import DebrisCloud from './DebrisCloud';
import './DebrisSection.css';

// Rig interativo para mover a câmera com o mouse (Efeito Parallax Tático)
const CameraRig = () => {
  const vec = new THREE.Vector3();
  // Subimos o alvo da câmera de 3 para 4.5.
  // Fica no meio-termo: corta um pouco a base da Terra, mas sem exagerar,
  // garantindo que não suma demais da tela.
  const target = new THREE.Vector3(0, 4.5, 0); 
  
  useFrame((state) => {
    // Câmera ancorada em uma altitude brutal (Y = 24).
    // Conforme requisitado, o movimento do mouse (state.pointer) afeta apenas o 
    // deslocamento horizontal (Eixo X). O Eixo Y fica travado, zerando o Parallax vertical.
    vec.set(state.pointer.x * 6, 12, 22);
    state.camera.position.lerp(vec, 0.05);
    
    // A câmera trava no novo alvo mais alto
    state.camera.lookAt(target);
  });
  return null;
};

const kesslerText = "A Síndrome de Kessler é um cenário teórico no qual a órbita baixa da Terra fica tão congestionada por lixo espacial que colisões entre objetos geram uma reação em cadeia. Esse efeito cascata multiplicaria os detritos a ponto de inviabilizar o uso de satélites e a exploração espacial por gerações.";
const words = kesslerText.split(" ");

const DebrisSection = () => {
  const wrapperRef = React.useRef(null);
  const wordsRef = React.useRef(new Array(words.length).fill(null));

  React.useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!wrapperRef.current) {
            ticking = false;
            return;
          }
          
          const rect = wrapperRef.current.getBoundingClientRect();
          
          // A animação começa antes mesmo de colar no topo (ex: quando está na metade da tela)
          const startPoint = window.innerHeight * 0.5;
          
          // E termina completamente quando o usuário tiver scrollado 1 tela inteira (-100vh)
          // Como o wrapper tem 300vh, isso significa que a animação terminará muito ANTES 
          // do scroll travado acabar (o scroll travado acaba em -200vh).
          const endPoint = -window.innerHeight * 1.0; 
          
          const totalAnimDistance = startPoint - endPoint;
          
          let scrollProgress = (startPoint - rect.top) / totalAnimDistance;
          
          // Limita o progresso firmemente entre 0 (início) e 1 (100% preenchido)
          scrollProgress = Math.max(0, Math.min(1, scrollProgress));
          
          // Lê o total de palavras direto da referência atual para evitar bugs de cache do Live Reload (HMR)
          const totalWords = wordsRef.current.filter(Boolean).length;
          const activeIndex = scrollProgress * totalWords;

          for (let i = 0; i < wordsRef.current.length; i++) {
            const wordSpan = wordsRef.current[i];
            if (wordSpan) {
              const wordProgress = Math.max(0, Math.min(1, activeIndex - i));
              const rgbValue = Math.round(204 - (wordProgress * (204 - 17)));
              wordSpan.style.color = `rgb(${rgbValue}, ${rgbValue}, ${rgbValue})`;
            }
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Trigger initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="hero-scroll-wrapper" ref={wrapperRef}>
      <div className="hero-container">

        {/* HTML Overlay (Texto Superior) */}
        <div className="overlay-ui">
          <div className="ui-content">
            <h2 className="ui-kessler-text">
              {words.map((word, index) => (
                <span 
                  key={index} 
                  ref={el => wordsRef.current[index] = el}
                  className="kessler-word"
                >
                  {word}{' '}
                </span>
              ))}
            </h2>
          </div>
        </div>

        {/* 3D Scene WebGL */}
        <Canvas style={{ background: '#eaeaea' }}>
          {/* 
            Câmera base. A rotação estática foi removida pois o CameraRig 
            agora controla dinamicamente o lookAt (pitch/yaw) a cada frame.
          */}
          <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={30} />
          
          {/* Injeção do Controlador Interativo */}
          <CameraRig />
          
          {/* Iluminação */}
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} />

          {/* Instâncias Separadas e Componentizadas */}
          <Earth />
          <DebrisCloud />
        </Canvas>
      </div>
    </div>
  );
};

export default DebrisSection;
