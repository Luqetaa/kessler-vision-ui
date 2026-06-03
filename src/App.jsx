import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection.tsx';
import DebrisSection from './components/DebrisSection';
import TerminalCursor from './components/TerminalCursor';
import TerminalSection from './components/TerminalSection';
import PythonAgentSection from './components/PythonAgentSection.tsx';

function App() {
  return (
    <main>
      <TerminalCursor />
      <Navbar />
      
      <div className="relative z-10 bg-[#050505]">
        <div id="home">
          <HeroSection />
        </div>
        
        <div id="debris">
          <DebrisSection />
        </div>
        
        <div id="terminal">
          <TerminalSection />
        </div>
        
        <div id="python-agent">
          <PythonAgentSection />
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default App;
