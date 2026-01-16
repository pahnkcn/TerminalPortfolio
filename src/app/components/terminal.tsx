'use client';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getCommandOutput } from '@/lib/commands';
import { COMMANDS, PROJECTS } from '@/lib/data';

type HistoryItem = {
  command: string;
  output: React.ReactNode;
};

const ASCII_ART = [
  '  ____ _     ___        __       _ _       ',
  ' / ___| |   |_ _|      / _| ___ | (_) ___  ',
  '| |   | |    | |______| |_ / _ \\| | |/ _ \\ ',
  '| |___| |___ | |______|  _| (_) | | | (_) |',
  ' \\____|_____|___|     |_|  \\___/|_|_|\\___/ ',
];

const QUICK_ACTIONS = ['help', 'projects', 'about', 'contact'];

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
  const statusTone = booting ? 'bg-yellow-400' : isProcessing ? 'bg-sky-400' : 'bg-emerald-400';
  const statusLabel = booting ? 'Booting systems' : isProcessing ? 'Processing' : 'System online';
  const statusHint = booting
    ? 'Loading modules'
    : isProcessing
      ? 'Executing command'
      : 'Ready for input';

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentTime(new Date().toString());
  }, []);

  useEffect(() => {
    if (!currentTime) return;

    const allBootLines = [
        `Last login: ${currentTime} on ttys001`,
        'Booting CLI-folio v1.0.0...',
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

  const handleQuickAction = useCallback((action: string) => {
    if (isProcessing || booting) return;
    setInput(action);
    focusInput();
  }, [booting, focusInput, isProcessing]);

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
    <div
      className="relative h-full w-full p-3 md:p-5 text-sm md:text-base"
      onClick={focusInput}
      aria-live="polite"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(152,251,152,0.15),_rgba(18,18,18,0.9)_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(255,255,255,0.04)_0%,_rgba(0,0,0,0)_35%,_rgba(0,0,0,0.12)_100%)]" />
        <div className="absolute inset-x-0 -top-1/2 h-[200%] animate-scanline bg-[linear-gradient(180deg,_rgba(255,255,255,0)_0%,_rgba(152,251,152,0.08)_50%,_rgba(255,255,255,0)_100%)]" />
      </div>
      <ScrollArea className="relative h-full" ref={scrollAreaRef}>
        <div className="flex flex-col gap-5 pb-6">
          <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3 shadow-[0_0_25px_rgba(152,251,152,0.12)]">
            <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              <span>CLI-folio</span>
              <span className="flex items-center gap-2 text-[11px] font-medium normal-case tracking-normal text-foreground/80">
                <span className={`h-2 w-2 rounded-full ${statusTone} animate-pulse`} />
                {statusLabel}
              </span>
            </div>
            <pre className="mt-3 whitespace-pre text-[10px] leading-tight text-primary/90 md:text-xs animate-flicker">
              {ASCII_ART.join('\n')}
            </pre>
            <p className="mt-2 text-xs text-muted-foreground">
              Tip: use <span className="text-foreground">Tab</span> to autocomplete, <span className="text-foreground">↑</span>/<span className="text-foreground">↓</span> to browse history.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground">Quick actions:</span>
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action}
                  type="button"
                  onClick={() => handleQuickAction(action)}
                  disabled={isProcessing || booting}
                  className="rounded-full border border-border/60 bg-secondary/70 px-3 py-1 text-foreground/80 transition hover:border-accent/70 hover:bg-secondary/90 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {action}
                </button>
              ))}
              <span className="ml-auto text-[11px] text-muted-foreground">{statusHint}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-sm md:text-base text-foreground/90">
            {bootLines.map((line, i) => (
              <p key={i} className="animate-rise text-muted-foreground">
                {line}
              </p>
            ))}
          </div>
          {history.map((item, index) => (
            <div key={index} className="space-y-1 animate-rise">
              <div className="flex items-center gap-2">
                <span className="text-accent drop-shadow">user@portfolio:~$</span>
                <span>{item.command}</span>
              </div>
              <div className="text-foreground/90">{item.output}</div>
            </div>
          ))}
          {!isProcessing && !booting && (
            <div className="flex items-center gap-2 animate-rise">
              <span className="text-accent drop-shadow">user@portfolio:~$</span>
              <span>{input}</span>
              <span className="h-4 w-2 rounded-sm bg-primary shadow-[0_0_12px_rgba(152,251,152,0.7)] animate-blink"></span>
              {suggestionSuffix && (
                <span className="text-muted-foreground">{suggestionSuffix}</span>
              )}
            </div>
          )}
          {!isProcessing && !booting && suggestions.length > 1 && (
            <div className="ml-6 flex flex-wrap gap-x-4 gap-y-1 rounded-lg border border-border/40 bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
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
