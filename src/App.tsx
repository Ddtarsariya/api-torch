// src/App.tsx (updated with keyboard shortcuts)
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Runner } from './pages/Runner';
import { Toaster } from './components/ui/toaster';
import { useAppStore } from './store';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';
import './App.css';

function App() {
  const { theme } = useAppStore();
  useKeyboardShortcuts();

  useEffect(() => {
    // Apply dark mode class to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <div className="h-full w-full flex flex-col">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/runner" element={<Runner />} />
          </Routes>
        </Layout>
        <Toaster />
      </div>
    </Router>
  );

}

export default App;
