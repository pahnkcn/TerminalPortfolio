'use client';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getCommandOutput, TERMINAL_COMMAND_EVENT } from '@/lib/commands';
import { generatePromptSuggestions } from '@/ai/flows/generate-prompt-suggestions';
import { COMMANDS, PROJECTS, SKILL_DETAILS } from '@/lib/data';

type HistoryItem = {
  command: string;
  output: React.ReactNode;
};

type AiStatus = {
  label: string;
  configured: boolean;
  provider: string;
};

type AiPrompt = {
  label: string;
  command: string;
};

const ASCII_ART = [
  '  ____ _     ___        __       _ _       ',
  ' / ___| |   |_ _|      / _| ___ | (_) ___  ',
  '| |   | |    | |______| |_ / _ \\| | |/ _ \\ ',
  '| |___| |___ | |______|  _| (_) | | | (_) |',
  ' \\____|_____|___|     |_|  \\___/|_|_|\\___/ ',
];

const QUICK_ACTIONS = ['help', 'aboutme', 'resume', 'contact'];
const DEFAULT_AI_PROMPTS: AiPrompt[] = [
  {
    label: 'Impact highlights',
    command: 'ask "What measurable impact did you drive in your roles?"',
  },
  {
    label: 'Cloud systems',
    command: 'ask "Which cloud systems or architectures are you most proud of?"',
  },
  {
    label: 'CI/CD improvements',
    command: 'ask "How did you improve CI/CD speed and reliability?"',
  },
  {
    label: 'Automation wins',
    command: 'ask "Which automation work saved the most engineering time?"',
  },
];
const AI_PROMPT_CACHE_KEY = 'terminal-ai-prompts';
const AI_PROMPT_CACHE_TIMESTAMP_KEY = 'terminal-ai-prompts:timestamp';
const AI_PROMPT_CACHE_MS = 120000;

const formatAskCommand = (question: string) => `ask "${question}"`;

const parseCachedPrompts = (raw: string | null): AiPrompt[] | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const valid = parsed
      .filter((prompt: AiPrompt) => Boolean(prompt?.label && prompt?.command))
      .map((prompt: AiPrompt) => ({
        label: prompt.label.trim(),
        command: prompt.command.trim(),
      }))
      .filter(prompt => prompt.label && prompt.command);
    return valid.length ? valid : null;
  } catch {
    return null;
  }
};

const readCachedPrompts = () => {
  if (typeof window === 'undefined') return null;
  const cached = parseCachedPrompts(window.localStorage.getItem(AI_PROMPT_CACHE_KEY));
  if (!cached) return null;
  const timestampRaw = window.localStorage.getItem(AI_PROMPT_CACHE_TIMESTAMP_KEY);
  const timestamp = Number.parseInt(timestampRaw ?? '', 10);
  return {
    prompts: cached,
    timestamp: Number.isFinite(timestamp) ? timestamp : 0,
  };
};

const writeCachedPrompts = (prompts: AiPrompt[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AI_PROMPT_CACHE_KEY, JSON.stringify(prompts));
  window.localStorage.setItem(AI_PROMPT_CACHE_TIMESTAMP_KEY, String(Date.now()));
};

const isCooldownError = (error: unknown) =>
  error instanceof Error && error.message.startsWith('AI_COOLDOWN:');

type TerminalProps = {
  aiStatus: AiStatus;
};

export function Terminal({ aiStatus }: TerminalProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [booting, setBooting] = useState(true);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState('');
  const [aiPrompts, setAiPrompts] = useState<AiPrompt[]>(DEFAULT_AI_PROMPTS);
  const [cursorIndex, setCursorIndex] = useState(0);

  const typedInput = input.trimStart();
  const safeCursorIndex = Math.min(cursorIndex, input.length);
  const inputBeforeCursor = input.slice(0, safeCursorIndex);
  const inputAfterCursor = input.slice(safeCursorIndex);
  const isCursorAtEnd = safeCursorIndex === input.length;
  const normalizedInput = typedInput.toLowerCase();

  const suggestions = useMemo(() => {
    if (!normalizedInput) return [];
    const [commandToken] = normalizedInput.split(' ');
    const argsText = normalizedInput.slice(commandToken.length).trim();
    if (commandToken === 'project') {
      const typedProject = argsText;
      return PROJECTS
        .map(project => project.name)
        .filter(name => name.toLowerCase().startsWith(typedProject))
        .map(name => `project ${name}`);
    }
    if (commandToken === 'skill') {
      const typedSkill = argsText;
      return SKILL_DETAILS
        .map(skill => skill.name)
        .filter(name => name.toLowerCase().startsWith(typedSkill))
        .map(name => `skill ${name}`);
    }
    if (normalizedInput.includes(' ')) return [];
    return COMMANDS.filter(command => command.startsWith(normalizedInput));
  }, [normalizedInput]);

  const hasUniqueSuggestion = suggestions.length === 1;
  const activeSuggestion = hasUniqueSuggestion ? suggestions[0] : '';
  const suggestionSuffix = hasUniqueSuggestion && typedInput && activeSuggestion.toLowerCase().startsWith(normalizedInput)
    ? activeSuggestion.slice(typedInput.length)
    : '';
  const showSuggestion = isCursorAtEnd && suggestionSuffix;
  const primarySuggestion = suggestions[0] ?? '';
  const getSuggestionParts = useCallback((suggestion: string) => {
    if (!normalizedInput) {
      return { leading: '', trailing: suggestion };
    }
    const suggestionLower = suggestion.toLowerCase();
    if (!suggestionLower.startsWith(normalizedInput)) {
      return { leading: '', trailing: suggestion };
    }
    return {
      leading: suggestion.slice(0, typedInput.length),
      trailing: suggestion.slice(typedInput.length),
    };
  }, [normalizedInput, typedInput]);
  const statusTone = booting ? 'bg-yellow-400' : isProcessing ? 'bg-sky-400' : 'bg-emerald-400';
  const statusLabel = booting ? 'Booting systems' : isProcessing ? 'Processing' : 'System online';
  const statusHint = booting
    ? 'Loading modules'
    : isProcessing
      ? 'Executing command'
      : 'Ready for input';
  const isAiConfigured = aiStatus?.configured ?? false;
  const aiBadgeTone = isAiConfigured ? 'bg-emerald-400' : 'bg-rose-400';
  const aiBadgeLabel = isAiConfigured ? `AI online · ${aiStatus.label}` : 'AI offline';
  const activeAiPrompts = aiPrompts.length ? aiPrompts : DEFAULT_AI_PROMPTS;

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(() => {
    if (!scrollAreaRef.current) return;
    const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, []);
  const syncCursor = useCallback((nextIndex: number) => {
    setCursorIndex(nextIndex);
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(nextIndex, nextIndex);
    });
  }, []);

  useEffect(() => {
    setCurrentTime(new Date().toString());
  }, []);

  useEffect(() => {
    if (!isAiConfigured) {
      setAiPrompts(DEFAULT_AI_PROMPTS);
      return;
    }

    const cached = readCachedPrompts();
    if (cached?.prompts?.length) {
      setAiPrompts(cached.prompts);
    }

    const cacheFresh = cached && Date.now() - cached.timestamp < AI_PROMPT_CACHE_MS;
    if (cacheFresh) return;

    let cancelled = false;

    const loadPrompts = async () => {
      try {
        const result = await generatePromptSuggestions();
        if (cancelled) return;
        const prompts = result.prompts.map(prompt => ({
          label: prompt.label,
          command: formatAskCommand(prompt.question),
        }));
        if (prompts.length) {
          setAiPrompts(prompts);
          writeCachedPrompts(prompts);
        }
      } catch (error) {
        if (cancelled) return;
        if (!isCooldownError(error)) {
          console.error('Failed to load AI prompt suggestions.', error);
        }
      }
    };

    loadPrompts();

    return () => {
      cancelled = true;
    };
  }, [isAiConfigured]);

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
  }, [booting, syncCursor]);

  useEffect(() => {
    focusInput();
  }, [focusInput, booting]);
  
  useEffect(() => {
    scrollToBottom();
    if (!isProcessing && !booting) {
      focusInput();
    }
  }, [history, isProcessing, focusInput, bootLines, booting, scrollToBottom]);

  useEffect(() => {
    if (suggestions.length > 0) {
      scrollToBottom();
    }
  }, [suggestions.length, scrollToBottom]);


  const handleCommand = useCallback(async (commandStr: string) => {
    if (booting) return;
    if (commandStr.trim().toLowerCase() === 'clear') {
        setHistory([]);
        setBootLines([]);
        setInput('');
        syncCursor(0);
        setCommandHistory(prev => [commandStr, ...prev]);
        setHistoryIndex(-1);
        return;
    }

    setIsProcessing(true);
    const normalizedCommand = commandStr.trim().toLowerCase();
    const isAskCommand = normalizedCommand === 'ask' || normalizedCommand.startsWith('ask ');
    const processingLabel = isAskCommand ? 'Consulting AI model...' : 'Processing...';
    const newHistoryItem: HistoryItem = {
      command: commandStr,
      output: (
        <span className={`animate-pulse mt-2 ${isAskCommand ? 'text-accent' : ''}`}>
          {processingLabel}
        </span>
      ),
    };
    setHistory(prev => [...prev, newHistoryItem]);
    if(commandStr.trim()){
      setCommandHistory(prev => [commandStr, ...prev]);
    }
    setHistoryIndex(-1);
    setInput('');
    syncCursor(0);

    const output = await getCommandOutput(commandStr);
    
    setHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].output = output;
        return newHistory;
    });

    setIsProcessing(false);
  }, [booting, syncCursor]);

  const handleQuickAction = useCallback((action: string) => {
    if (isProcessing || booting) return;
    setInput(action);
    syncCursor(action.length);
    focusInput();
  }, [booting, focusInput, isProcessing, syncCursor]);

  useEffect(() => {
    const handleTerminalCommand = (event: Event) => {
      const detail = (event as CustomEvent<{ command?: string }>).detail;
      if (!detail?.command) return;
      handleQuickAction(detail.command);
    };

    window.addEventListener(TERMINAL_COMMAND_EVENT, handleTerminalCommand);
    return () => {
      window.removeEventListener(TERMINAL_COMMAND_EVENT, handleTerminalCommand);
    };
  }, [handleQuickAction]);

  const applySuggestion = useCallback(() => {
    if (!activeSuggestion || !suggestionSuffix || !isCursorAtEnd) return false;
    setInput(activeSuggestion);
    syncCursor(activeSuggestion.length);
    return true;
  }, [activeSuggestion, isCursorAtEnd, suggestionSuffix, syncCursor]);

  const applyHistoryIndex = useCallback((nextIndex: number) => {
    if (nextIndex < 0) {
      setHistoryIndex(-1);
      setInput('');
      syncCursor(0);
      return;
    }
    const nextCommand = commandHistory[nextIndex] ?? '';
    setHistoryIndex(nextIndex);
    setInput(nextCommand);
    syncCursor(nextCommand.length);
  }, [commandHistory, syncCursor]);

  const navigateHistory = useCallback((direction: 'up' | 'down') => {
    if (direction === 'up') {
      if (historyIndex < commandHistory.length - 1) {
        applyHistoryIndex(historyIndex + 1);
      }
      return;
    }
    if (historyIndex > 0) {
      applyHistoryIndex(historyIndex - 1);
    } else {
      applyHistoryIndex(-1);
    }
  }, [applyHistoryIndex, commandHistory.length, historyIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isProcessing || booting) return;

    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateHistory('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistory('down');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      applySuggestion();
    } else if (e.key === 'ArrowLeft') {
      if (safeCursorIndex > 0) {
        e.preventDefault();
        const nextIndex = safeCursorIndex - 1;
        syncCursor(nextIndex);
      }
    } else if (e.key === 'ArrowRight') {
      if (showSuggestion) {
        e.preventDefault();
        applySuggestion();
        return;
      }
      if (safeCursorIndex < input.length) {
        e.preventDefault();
        const nextIndex = safeCursorIndex + 1;
        syncCursor(nextIndex);
      }
    } else if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        setHistory([]);
        setBootLines([]);
    }
  };

  const handleSelectionChange = useCallback((event: React.SyntheticEvent<HTMLInputElement>) => {
    const nextCursor = event.currentTarget.selectionStart ?? event.currentTarget.value.length;
    setCursorIndex(nextCursor);
  }, []);

  return (
    <div
      className="relative h-full w-full p-3 sm:p-4 md:p-5 text-sm md:text-base"
      onClick={focusInput}
      aria-live="polite"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(152,251,152,0.15),_rgba(18,18,18,0.9)_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(255,255,255,0.04)_0%,_rgba(0,0,0,0)_35%,_rgba(0,0,0,0.12)_100%)]" />
        <div className="absolute inset-x-0 -top-1/2 h-[200%] animate-scanline bg-[linear-gradient(180deg,_rgba(255,255,255,0)_0%,_rgba(152,251,152,0.08)_50%,_rgba(255,255,255,0)_100%)]" />
      </div>
      <ScrollArea className="relative h-full terminal-scroll-area" ref={scrollAreaRef}>
        <div className="flex flex-col gap-4 pb-5 sm:gap-5 sm:pb-6">
          <div className="rounded-xl border border-border/60 bg-background/70 px-3 py-3 shadow-[0_0_25px_rgba(152,251,152,0.12)] sm:px-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.35em] text-muted-foreground">
              <span>CLI-folio</span>
              <span className="flex items-center gap-2 text-xs font-medium normal-case tracking-normal text-foreground/80">
                <span className={`h-2 w-2 rounded-full ${statusTone} animate-pulse`} />
                {statusLabel}
              </span>
            </div>
            <pre className="mt-3 whitespace-pre text-xs leading-tight text-primary/90 animate-flicker">
              {ASCII_ART.join('\n')}
            </pre>
            <p className="mt-2 text-xs text-muted-foreground">
              Tip: use <span className="text-foreground">Tab</span> to autocomplete, <span className="text-foreground">↑</span>/<span className="text-foreground">↓</span> to browse history.
            </p>
            <div className="mt-3 rounded-xl border border-accent/40 bg-[radial-gradient(circle_at_top,_rgba(173,216,230,0.18),_rgba(18,18,18,0.95)_65%)] px-3 py-3 text-xs shadow-[0_0_25px_rgba(173,216,230,0.15)] sm:mt-4 sm:px-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-accent/80">Ask AI</p>
                  <p className="mt-1 text-sm text-foreground/90">
                    Ask the portfolio AI about impact, projects, or systems. It answers using verified portfolio data.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-background/50 px-2.5 py-1 text-xs text-accent sm:px-3">
                  <span className={`h-2 w-2 rounded-full ${aiBadgeTone} ${isAiConfigured ? 'animate-pulse' : ''}`} />
                  {aiBadgeLabel}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeAiPrompts.map((prompt: AiPrompt) => (
                  <button
                    key={prompt.label}
                    type="button"
                    onClick={() => handleQuickAction(prompt.command)}
                    disabled={isProcessing || booting || !isAiConfigured}
                    className="rounded-full border border-accent/40 bg-secondary/60 px-2.5 py-1 text-xs text-foreground/80 transition hover:border-accent hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {isAiConfigured ? (
                  <>Try typing <span className="text-foreground">ask "&lt;question&gt;"</span> or tap a prompt.</>
                ) : (
                  <>AI needs an API key in <span className="text-foreground">.env.local</span> to answer questions.</>
                )}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:mt-4">
              <span className="text-muted-foreground">Quick actions:</span>
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action}
                  type="button"
                  onClick={() => handleQuickAction(action)}
                  disabled={isProcessing || booting}
                  className="rounded-full border border-border/60 bg-secondary/70 px-2.5 py-1 text-foreground/80 transition hover:border-accent/70 hover:bg-secondary/90 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
                >
                  {action}
                </button>
              ))}
              <span className="ml-auto text-xs text-muted-foreground">{statusHint}</span>
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
              <div className="grid grid-cols-[auto,1fr] items-start gap-x-2">
                <span className="text-accent drop-shadow font-semibold text-sm sm:text-base">
                  user@portfolio:~$
                </span>
                <span className="min-w-0 whitespace-pre-wrap break-words font-medium text-foreground">
                  {item.command}
                </span>
              </div>
              <div className="text-foreground/90">{item.output}</div>
            </div>
          ))}
          {!isProcessing && !booting && (
            <div className="grid grid-cols-[auto,1fr] items-start gap-x-2 animate-rise">
              <span className="text-accent drop-shadow font-semibold text-sm sm:text-base">
                user@portfolio:~$
              </span>
              <div className="relative min-w-0 whitespace-pre-wrap break-words text-foreground">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    const nextCursor = e.target.selectionStart ?? nextValue.length;
                    setInput(nextValue);
                    setCursorIndex(nextCursor);
                  }}
                  onKeyDown={handleKeyDown}
                  onSelect={handleSelectionChange}
                  onClick={handleSelectionChange}
                  className="absolute inset-0 z-0 h-full w-full bg-transparent text-transparent caret-transparent outline-none"
                  autoFocus
                  disabled={isProcessing || booting}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  aria-label="Terminal input"
                />
                <span className="relative z-10 pointer-events-none font-medium">
                  {inputBeforeCursor}
                  <span className="inline-block h-[1em] w-2 align-text-bottom rounded-sm bg-primary shadow-[0_0_12px_rgba(152,251,152,0.7)] animate-blink"></span>
                  {inputAfterCursor}
                </span>
                {showSuggestion && (
                  <button
                    type="button"
                    onClick={() => {
                      applySuggestion();
                      focusInput();
                    }}
                    className="relative z-10 inline-flex items-baseline border-0 bg-transparent p-0 text-muted-foreground/70 transition hover:text-foreground"
                  >
                    <span className="text-accent/90">{primarySuggestion.slice(0, typedInput.length)}</span>
                    {suggestionSuffix}
                  </button>
                )}
              </div>
            </div>
          )}
          {!isProcessing && !booting && commandHistory.length > 0 && (
            <div className="flex flex-wrap gap-2 sm:hidden">
              <button
                type="button"
                onClick={() => navigateHistory('up')}
                disabled={historyIndex >= commandHistory.length - 1}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs text-foreground/80 transition hover:border-accent/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="text-accent/90">↑</span>
                Previous command
              </button>
              <button
                type="button"
                onClick={() => navigateHistory('down')}
                disabled={historyIndex < 0}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs text-foreground/80 transition hover:border-accent/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="text-accent/90">↓</span>
                Newer command
              </button>
            </div>
          )}
          {!isProcessing && !booting && suggestions.length > 1 && (
            <div className="ml-0 flex flex-wrap gap-x-4 gap-y-1 rounded-lg border border-border/40 bg-secondary/40 px-3 py-2 text-xs text-muted-foreground sm:ml-6">
              <span className="text-accent/80 flex items-center justify-center">suggestions:</span>
              {suggestions.map(suggestion => {
                const parts = getSuggestionParts(suggestion);
                return (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleQuickAction(suggestion)}
                    className="rounded-full border border-border/50 bg-background/40 px-2 py-0.5 text-xs text-foreground/70 transition hover:border-accent/60 hover:text-foreground"
                  >
                    <span className="text-accent/80">{parts.leading}</span>
                    <span>{parts.trailing}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
