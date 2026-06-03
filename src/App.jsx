import React from 'react';
import HeroSection from './components/HeroSection.tsx';
import DebrisSection from './components/DebrisSection';
import TerminalCursor from './components/TerminalCursor';
import TerminalSection from './components/TerminalSection';
import PythonAgentSection from './components/PythonAgentSection.tsx';

function App() {
  return (
    <main>
      <TerminalCursor />
      <HeroSection />
      <DebrisSection />
      <TerminalSection />
      <PythonAgentSection />
    </main>
  );
}

export default App;
