'use client';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getCommandOutput } from '@/lib/commands';
import { COMMANDS, PROJECTS } from '@/lib/data';

type HistoryItem = {
  command: string;
  output: React.ReactNode;
};

export function Terminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [booting, setBooting] = useState(true);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState('');

  const suggestions = useMemo(() => {
    const normalizedInput = input.trimStart().toLowerCase();
    if (!normalizedInput) return [];
    if (normalizedInput === 'project' || normalizedInput.startsWith('project ')) {
      const typedProject = normalizedInput.replace(/^project\s*/, '');
      return PROJECTS
        .map(project => project.name)
        .filter(name => name.startsWith(typedProject))
        .map(name => `project ${name}`);
    }
    if (normalizedInput.includes(' ')) return [];
    return COMMANDS.filter(command => command.startsWith(normalizedInput));
  }, [input]);

  const hasUniqueSuggestion = suggestions.length === 1;
  const activeSuggestion = hasUniqueSuggestion ? suggestions[0] : '';
  const suggestionSuffix = hasUniqueSuggestion && input && activeSuggestion.toLowerCase().startsWith(input.toLowerCase())
    ? activeSuggestion.slice(input.length)
    : '';

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentTime(new Date().toString());
  }, []);

  useEffect(() => {
    if (!currentTime) return;

    const allBootLines = [
        `Last login: ${currentTime} on ttys001`,
        'Booting DevTerminal v1.0.0...',
        'Initializing system...',
        'Loading kernel modules... [OK]',
        'Mounting file systems... [OK]',
        'Starting network services... [OK]',
        'Checking for contraband code... [CLEAN]',
        'Calibrating humor sensors... [CALIBRATED]',
        'Connecting to portfolio matrix... [CONNECTED]',
        'Welcome, user.',
        'Type "help" to see a list of available commands.',
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < allBootLines.length) {
        setBootLines((prev) => [...prev, allBootLines[index]]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setBooting(false), 500); // Wait a bit before switching
      }
    }, 150);

    return () => clearInterval(interval);
  }, [currentTime]);

  const focusInput = useCallback(() => {
    if (!booting) {
        inputRef.current?.focus();
    }
  }, [booting]);

  useEffect(() => {
    focusInput();
  }, [focusInput, booting]);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
    if (!isProcessing && !booting) {
      focusInput();
    }
  }, [history, isProcessing, focusInput, bootLines, booting]);


  const handleCommand = useCallback(async (commandStr: string) => {
    if (booting) return;
    if (commandStr.trim().toLowerCase() === 'clear') {
        setHistory([]);
        setInput('');
        setCommandHistory(prev => [commandStr, ...prev]);
        setHistoryIndex(-1);
        return;
    }

    setIsProcessing(true);
    const newHistoryItem: HistoryItem = { command: commandStr, output: <span className="animate-pulse">Processing...</span> };
    setHistory(prev => [...prev, newHistoryItem]);
    if(commandStr.trim()){
      setCommandHistory(prev => [commandStr, ...prev]);
    }
    setHistoryIndex(-1);
    setInput('');

    const output = await getCommandOutput(commandStr);
    
    setHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].output = output;
        return newHistory;
    });

    setIsProcessing(false);
  }, [booting]);

  const applySuggestion = useCallback(() => {
    if (!activeSuggestion || !suggestionSuffix) return false;
    setInput(activeSuggestion);
    return true;
  }, [activeSuggestion, suggestionSuffix]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isProcessing || booting) return;

    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      applySuggestion();
    } else if (e.key === 'ArrowRight') {
      if (suggestionSuffix) {
        e.preventDefault();
        applySuggestion();
      }
    } else if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        setHistory([]);
    }
  };

  return (
    <div className="h-full w-full p-2 md:p-4 text-sm md:text-base" onClick={focusInput} aria-live="polite">
      <ScrollArea className="h-full" ref={scrollAreaRef}>
        <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              {bootLines.map((line, i) => (
                <p key={i} className="text-sm md:text-base">
                  {line}
                </p>
              ))}
            </div>
          {history.map((item, index) => (
            <div key={index}>
              <div className="flex items-center gap-2">
                <span className="text-accent">user@portfolio:~$</span>
                <span>{item.command}</span>
              </div>
              <div>{item.output}</div>
            </div>
          ))}
          {!isProcessing && !booting && (
             <div className="flex items-center gap-2">
              <span className="text-accent">user@portfolio:~$</span>
              <span>{input}</span>
              <span className="w-2 h-4 bg-primary animate-blink"></span>
              {suggestionSuffix && (
                <span className="text-muted-foreground">{suggestionSuffix}</span>
              )}
            </div>
          )}
          {!isProcessing && !booting && suggestions.length > 1 && (
            <div className="ml-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="text-accent/80">suggestions:</span>
              {suggestions.map(suggestion => (
                <span key={suggestion}>{suggestion}</span>
              ))}
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="opacity-0 w-0 h-0 p-0 m-0 border-0"
          autoFocus
          disabled={isProcessing || booting}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
        />
      </ScrollArea>
    </div>
  );
}
