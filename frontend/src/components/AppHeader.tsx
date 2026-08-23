import React from 'react';
import { Github, Sun, Moon } from 'lucide-react';

interface AppHeaderProps {
  onOpenCommandPalette: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenCommandPalette,
  isDarkMode,
  onToggleTheme,
}) => {
  return (
    <header className="h-12 bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between select-none">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm text-text-primary tracking-tight">
          SHANNON
        </span>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3 text-xs">
        <button
          onClick={onOpenCommandPalette}
          className="text-text-secondary hover:text-text-primary transition"
          title="Open Command Palette (Cmd+K)"
        >
          Commands
        </button>

        <button
          onClick={onToggleTheme}
          className="text-text-secondary hover:text-text-primary transition p-1"
          title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        <a
          href="https://github.com/atharveeee-netizen/shannon"
          target="_blank"
          rel="noreferrer"
          className="text-text-secondary hover:text-text-primary transition p-1"
          title="GitHub Repository"
          aria-label="GitHub Repository"
        >
          <Github className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
};