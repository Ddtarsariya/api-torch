import React, { useState, useEffect, useRef } from "react";
import { useAppStore } from "../store";
import { Sidebar } from "./Sidebar";
import { EnvironmentSelector } from "./EnvironmentSelector";
import { Navigation } from "./Navigation";
import {
  Moon,
  Sun,
  Keyboard,
  Menu,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "./ui/button";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useAppStore();
  const [isKeyboardShortcutsModalOpen, setIsKeyboardShortcutsModalOpen] =
    useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);

  // Refs for resizable elements
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");

    const handleKeyDown = (e: KeyboardEvent) => {
      // Show keyboard shortcuts with Ctrl+/
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setIsKeyboardShortcutsModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [theme]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Handle sidebar resize
  const handleSidebarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSidebar(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSidebar) {
        const newWidth = e.clientX;
        if (newWidth >= 200 && newWidth <= 500) {
          setSidebarWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingSidebar(false);
    };

    if (isDraggingSidebar) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingSidebar]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-30">
        <div className="flex items-center">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>

          {/* Logo */}
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-2">
              <span className="text-white font-bold text-lg">AT</span>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              API Torch
            </h1>
          </div>

          {/* Navigation - hidden on mobile */}
          <div className="hidden md:block ml-6">
            <Navigation />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Environment selector - simplified on mobile */}
          <div className="hidden sm:block">
            <EnvironmentSelector />
          </div>

          {/* Action buttons */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsKeyboardShortcutsModalOpen(true)}
            title="Keyboard Shortcuts"
            className="hidden sm:flex"
          >
            <Keyboard size={18} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            className="hidden sm:flex"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground/80 hover:text-foreground"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden w-full">
        {/* Mobile sidebar overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={toggleMobileMenu}
          />
        )}

        {/* Sidebar - responsive and resizable */}
        <div
          ref={sidebarRef}
          className={`
            fixed md:relative z-50 md:z-auto h-[calc(100vh-3.5rem)] 
            transition-transform duration-300 ease-in-out
            md:translate-x-0 md:border-r md:border-border bg-card/50
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
          style={{ width: `${sidebarWidth}px` }}
        >
          <Sidebar onItemClick={() => setIsMobileMenuOpen(false)} />

          {/* Resizer handle */}
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-ew-resize bg-transparent hover:bg-primary/20 transition-colors"
            onMouseDown={handleSidebarMouseDown}
          />
        </div>

        {/* Mobile navigation - shown at bottom on mobile */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden border-t border-border bg-card z-30 px-2 py-1">
          <Navigation />

          {/* Mobile environment selector */}
          <div className="px-2 py-1">
            <EnvironmentSelector compact />
          </div>
        </div>

        {/* Main content area - takes remaining width */}
        <div
          className="flex-1 flex overflow-hidden pt-0 md:pt-0 pb-16 md:pb-0 w-full"
          style={{
            width: "100%", // Always take full width
          }}
        >
          {children}
        </div>
      </div>

      <KeyboardShortcutsModal
        isOpen={isKeyboardShortcutsModalOpen}
        onClose={() => setIsKeyboardShortcutsModalOpen(false)}
      />
    </div>
  );
};
