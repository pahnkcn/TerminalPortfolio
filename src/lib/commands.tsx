'use client';
import React from 'react';
import {
  COMMANDS,
  ABOUTME_TEXT,
  PROJECTS,
  EXPERIENCE,
  EDUCATION,
  RESUME,
  CONTACT_INFO,
  SKILLS,
  SKILL_DETAILS,
  getPortfolioSnapshot,
} from './data';
import { generateAskResponse } from '@/ai/flows/generate-ask-response';
import { generateFortuneResponse } from '@/ai/flows/generate-fortune-response';
import { useToast } from "@/hooks/use-toast"

type AiErrorInfo = {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
};

export const TERMINAL_COMMAND_EVENT = 'terminal:command';

const parseAiError = (error: unknown): AiErrorInfo => {
  const message = error instanceof Error ? error.message : '';
  if (message.startsWith('AI_COOLDOWN:')) {
    const [, secondsRaw] = message.split(':');
    const seconds = Number.parseInt(secondsRaw ?? '', 10);
    const duration = Number.isFinite(seconds) && seconds > 0 ? `${seconds} seconds` : 'a moment';
    return {
      title: 'Cooldown active',
      description: `Please wait ${duration} before running this AI command again.`,
      variant: 'default',
    };
  }
  if (message.startsWith('Missing')) {
    return {
      title: 'AI configuration missing',
      description: `${message} Add it to your server environment (.env.local).`,
      variant: 'destructive',
    };
  }
  if (message.startsWith('Provider')) {
    return {
      title: 'AI provider error',
      description: 'The AI provider returned an error. Please try again later.',
      variant: 'destructive',
    };
  }
  return {
    title: 'AI Error',
    description: 'Failed to get response from AI model. Please check the server console or your API key.',
    variant: 'destructive',
  };
};

const AiError = ({ title, description, variant = 'destructive' }: AiErrorInfo) => {
  const { toast } = useToast();
  React.useEffect(() => {
    toast({
      title,
      description,
      variant,
    })
  }, [description, title, toast, variant]);
  return <p className="text-destructive">{description}</p>;
}

const renderAiError = (error: unknown) => {
  const info = parseAiError(error);
  return <AiError {...info} />;
};

const emitTerminalCommand = (command: string) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(TERMINAL_COMMAND_EVENT, {
      detail: { command },
    }),
  );
};

type HelpCommandProps = {
  command: string;
  children: React.ReactNode;
};

const HelpCommand = ({ command, children }: HelpCommandProps) => (
  <button
    type="button"
    onClick={() => emitTerminalCommand(command)}
    className="block w-full cursor-text border-0 bg-transparent p-0 text-left font-mono text-sm focus:outline-none select-text"
  >
    {children}
  </button>
);

type TypingResponseProps = {
  text: string;
  className?: string;
};

const TypingResponse = ({ text, className }: TypingResponseProps) => {
  const [displayed, setDisplayed] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    const reduceMotion = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setDisplayed(text);
      setIsTyping(false);
      return;
    }

    const totalDurationMs = Math.min(12000, Math.max(3200, text.length * 24));
    const intervalMs = 30;
    const step = Math.max(1, Math.ceil(text.length / (totalDurationMs / intervalMs)));
    let index = 0;
    setDisplayed('');
    setIsTyping(true);

    const interval = window.setInterval(() => {
      if (cancelled) return;
      index = Math.min(text.length, index + step);
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [text]);

  const containerClassName = ['whitespace-pre-wrap', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClassName}>
      <span>{displayed}</span>
      {isTyping && (
        <span className="ml-1 inline-block h-4 w-2 animate-blink rounded-sm bg-primary/80 align-text-bottom" />
      )}
    </div>
  );
};

const SKILL_SCORE_MAX = 100;
const SKILL_BAR_SEGMENTS = 22;

const clampScore = (score: number) => Math.min(SKILL_SCORE_MAX, Math.max(0, score));

const buildAsciiBar = (score: number) => {
  const normalized = clampScore(score);
  const filled = Math.round((normalized / SKILL_SCORE_MAX) * SKILL_BAR_SEGMENTS);
  return `${'#'.repeat(filled)}${'-'.repeat(SKILL_BAR_SEGMENTS - filled)}`;
};

const formatSkillScore = (score: number) => `${Math.round(score)}%`;

const CAT_ART = [
  '⠀⠀⠀⢀⡴⠲⣄⠀⠀⢀⡶⠲⡄⠀⣀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⣀⣀⣀⣾⠁⠀⠹⠿⠟⠟⠀⠀⠙⣛⣉⡻⠿⠋⣿⣷⢦⣄⠀⠀⠀⠀⠀⠀',
  '⠭⠭⣽⠇⠀⠶⠀⢴⣦⠀⠶⠆⠸⠯⠭⠄⠀⠀⠀⠀⠀⠙⢧⡀⠀⢀⣤⣤',
  '⠀⠀⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢷⣤⣾⣻⡟',
  '⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣧⠽⠋⠀',
  '⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⠀⠀⠀⠀',
  '⠀⠀⢷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡟⠀⠀⠀⠀',
  '⠀⠀⠈⠳⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⠟⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠉⠿⠟⠛⠛⠻⠾⠛⠛⠛⠛⠻⠟⠛⠛⠻⠾⠃⠀⠀⠀⠀⠀⠀'
].join('\n');

const COFFEE_ART = [
  '   ( (',
  '    ) )',
  '  ........',
  '  |      |]',
  '  \\      /',
  "   `----'",
].join('\n');

const COFFEE_OUTPUT = [COFFEE_ART, '', 'Coffee deployed.'].join('\n');

const renderAscii = (text: string, className = 'text-accent') => (
  <pre className={`whitespace-pre-wrap ${className}`}>{text}</pre>
);

const getEditDistance = (source: string, target: string) => {
  const sourceLength = source.length;
  const targetLength = target.length;
  const distance = Array.from({ length: sourceLength + 1 }, () => Array(targetLength + 1).fill(0));

  for (let i = 0; i <= sourceLength; i += 1) {
    distance[i][0] = i;
  }

  for (let j = 0; j <= targetLength; j += 1) {
    distance[0][j] = j;
  }

  for (let i = 1; i <= sourceLength; i += 1) {
    for (let j = 1; j <= targetLength; j += 1) {
      const cost = source[i - 1] === target[j - 1] ? 0 : 1;
      distance[i][j] = Math.min(
        distance[i - 1][j] + 1,
        distance[i][j - 1] + 1,
        distance[i - 1][j - 1] + cost,
      );
    }
  }

  return distance[sourceLength][targetLength];
};

const getClosestCommand = (input: string) => {
  const normalizedInput = input.toLowerCase();
  const maxDistance = normalizedInput.length <= 4 ? 1 : 2;
  let closestCommand = '';
  let closestDistance = Number.POSITIVE_INFINITY;

  COMMANDS.forEach(command => {
    const distance = getEditDistance(normalizedInput, command);
    if (distance < closestDistance) {
      closestCommand = command;
      closestDistance = distance;
    }
  });

  return closestDistance <= maxDistance ? closestCommand : '';
};

const getHelp = () => (
  <div className="space-y-6 mt-2">
    <div className="space-y-3">
      <div className="border-l-2 border-accent/20 pl-4 mb-1">
        <HelpCommand command="help">help</HelpCommand>
        <div className="text-xs text-muted-foreground">Show this help message with all available commands</div>
      </div>

      <div className="border-l-2 border-accent/20 pl-4 mb-1">
        <HelpCommand command='ask "'>ask "&lt;question&gt;"</HelpCommand>
        <div className="text-xs text-muted-foreground">Ask me anything! Get AI-powered responses to your questions</div>
      </div>

      <div className="border-l-2 border-accent/20 pl-4 mb-1">
        <HelpCommand command="aboutme">aboutme</HelpCommand>
        <div className="text-xs text-muted-foreground">Learn more about my background and what I do</div>
      </div>

      <div className="border-l-2 border-accent/20 pl-4 mb-1">
        <HelpCommand command="skills">skills</HelpCommand>
        <div className="text-xs text-muted-foreground">View all my technical skills organized by category</div>
      </div>

      <div className="border-l-2 border-accent/20 pl-4 mb-1">
        <HelpCommand command={'skill '}>skill &lt;name&gt;</HelpCommand>
        <div className="text-xs text-muted-foreground">Get detailed information about a specific skill</div>
      </div>

      <div className="border-l-2 border-accent/20 pl-4 mb-1">
        <HelpCommand command="projects">projects</HelpCommand>
        <div className="text-xs text-muted-foreground">Browse my portfolio of projects</div>
      </div>

      <div className="border-l-2 border-accent/20 pl-4 mb-1">
        <HelpCommand command={'project '}>project &lt;name&gt;</HelpCommand>
        <div className="text-xs text-muted-foreground">View detailed information about a specific project</div>
      </div>

      <div className="border-l-2 border-accent/20 pl-4 mb-1">
        <HelpCommand command="experience">experience</HelpCommand>
        <div className="text-xs text-muted-foreground">View my work experience and professional history</div>
      </div>

      <div className="border-l-2 border-accent/20 pl-4 mb-1">
        <HelpCommand command="education">education</HelpCommand>
        <div className="text-xs text-muted-foreground">View my educational background</div>
      </div>

      <div className="border-l-2 border-accent/20 pl-4 mb-1">
        <HelpCommand command="resume">resume</HelpCommand>
        <div className="text-xs text-muted-foreground">Get a link to download my full resume</div>
      </div>

      <div className="border-l-2 border-accent/20 pl-4 mb-1">
        <HelpCommand command="contact">contact</HelpCommand>
        <div className="text-xs text-muted-foreground">View my contact information and social links</div>
      </div>

      <div className="border-l-2 border-accent/20 pl-4">
        <HelpCommand command="clear">clear</HelpCommand>
        <div className="text-xs text-muted-foreground">Clear the terminal screen</div>
      </div>
    <div className="mt-4"></div>
  </div>

    <div className="text-xs text-muted-foreground border-t border-accent/20 pt-3">
      <p>💡 <strong>Tip:</strong> Use arrow keys to navigate through command history!</p>
      <p>🤖 <strong>AI Commands:</strong> 'ask' and 'fortune' use AI with a 15-second delay between requests</p>
    </div>
  </div>
);

const getAboutMe = () => (
  <p className="whitespace-pre-wrap text-sm mt-2">{ABOUTME_TEXT}</p>
);

const getSkills = () => (
  <div className="space-y-4 text-sm mt-2">
    <p>Use 'skill &lt;name&gt;' to view details.</p>
    {SKILLS.map(group => (
      <div key={group.category}>
        <p className="text-xs uppercase tracking-[0.2em] text-accent/80">{group.category}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
          {group.items.map(item => <span key={item}>{item}</span>)}
        </div>
      </div>
    ))}
  </div>
);

const FORTUNE_STORAGE_KEY = 'terminal-portfolio:fortune';

const getLocalDayKey = () => new Date().toISOString().split('T')[0];

const readDailyFortune = (dayKey: string) => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(FORTUNE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { dayKey?: string; fortune?: string };
    if (parsed.dayKey === dayKey && parsed.fortune) return parsed.fortune;
  } catch {
    return null;
  }
  return null;
};

const writeDailyFortune = (dayKey: string, fortune: string) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      FORTUNE_STORAGE_KEY,
      JSON.stringify({ dayKey, fortune })
    );
  } catch {
    return;
  }
};

const normalizeLookupValue = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const getSkillDetails = (name: string) => {
  const normalizedName = normalizeLookupValue(name);
  const skill = SKILL_DETAILS.find(item => normalizeLookupValue(item.name) === normalizedName);
  if (!skill) {
    return <p>Skill not found: {name}. Try 'skills' to see a list of available skills.</p>;
  }

  return (
    <div className="text-sm mt-2">
      <h3 className="font-bold text-accent">{skill.name}</h3>
      <p className="text-xs uppercase tracking-[0.2em] text-accent/80">
        {skill.level}{typeof skill.score === 'number' ? ` · ${formatSkillScore(skill.score)}` : ''}
      </p>
      {typeof skill.score === 'number' && (
        <pre className="mt-2 font-mono text-sm text-foreground/80">
          [{buildAsciiBar(skill.score)}]
        </pre>
      )}
      <p className="mt-2 whitespace-pre-wrap">{skill.summary}</p>
    </div>
  );
};

type ProjectItem = (typeof PROJECTS)[number];

const groupProjectsByCategory = (projects: ProjectItem[]) =>
  projects.reduce((acc, project) => {
    const category = project.category ?? 'Other';
    const existingGroup = acc.find(group => group.category === category);
    if (existingGroup) {
      existingGroup.items.push(project);
    } else {
      acc.push({ category, items: [project] });
    }
    return acc;
  }, [] as { category: string; items: ProjectItem[] }[]);

const getProjects = () => {
  const groupedProjects = groupProjectsByCategory(PROJECTS);
  return (
    <div className="space-y-4 text-sm mt-2">
      <p>Here are my projects. Use 'project &lt;name&gt;' to see details.</p>
      {groupedProjects.map(group => (
        <div key={group.category}>
          <p className="text-xs uppercase tracking-[0.2em] text-accent/80">{group.category}</p>
          <ul className="list-disc list-inside">
            {group.items.map(project => (
              <li key={project.name}>
                <span className="font-bold w-36 inline-block">{project.name}</span> - {project.title}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

const getProjectDetails = (name: string) => {
  const normalizedName = normalizeLookupValue(name);
  const project = PROJECTS.find(p => normalizeLookupValue(p.name) === normalizedName);
  if (!project) {
    return <p>Project not found: {name}. Try 'projects' to see a list of available projects.</p>;
  }

  return (
      <div className="text-sm mt-2">
          <h3 className="font-bold text-accent">{project.title}</h3>
          <p className="text-xs uppercase tracking-[0.2em] text-accent/80">{project.category}</p>
          <p className="font-mono text-muted-foreground">{project.technologies}</p>
          <p className="mt-2 whitespace-pre-wrap">{project.description}</p>
          {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline mt-2 inline-block">View on GitHub</a>}
      </div>
  );
};


const getExperience = () => (
    <div className="space-y-4 text-sm mt-2">
      {EXPERIENCE.map((exp, index) => (
        <div key={index}>
          <h3 className="font-bold text-accent">{exp.role} @ {exp.company}</h3>
          <p className="text-muted-foreground">{exp.period}</p>
          <p className="mt-1">{exp.description}</p>
        </div>
      ))}
    </div>
);

const getEducation = () => (
  <div className="space-y-4 text-sm mt-2">
    {EDUCATION.map((edu, index) => (
      <div key={`${edu.school}-${index}`}>
        <h3 className="font-bold text-accent">{edu.program}</h3>
        <p className="text-muted-foreground">{edu.school} · {edu.period}</p>
        <ul className="mt-2 list-disc list-inside space-y-1">
          {edu.highlights.map((highlight, highlightIndex) => (
            <li key={`${edu.school}-${highlightIndex}`}>{highlight}</li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

const getResume = () => (
  <div className="space-y-4 text-sm mt-2">
    <div>
      <h3 className="font-bold text-accent">{RESUME.headline}</h3>
      <p className="text-xs uppercase tracking-[0.2em] text-accent/80">
        Updated {RESUME.lastUpdated}
      </p>
      <p className="mt-2 whitespace-pre-wrap">{RESUME.summary}</p>
    </div>
    <ul className="list-disc list-inside space-y-1">
      {RESUME.highlights.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
    <div className="mt-2">
      {RESUME.downloadLink ? (
      <a
        href={RESUME.downloadLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent hover:underline"
      >
        Download resume
      </a>
    ) : (
      <p className="text-muted-foreground">Resume download link available on request.</p>
    )}
    </div>
  </div>
);

const getContact = () => (
  <div className="space-y-1 text-sm mt-2">
    {CONTACT_INFO.map(item => (
      <div key={item.name} className="flex items-center gap-4">
        <span className="w-16">{item.name}:</span>
        <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-accent hover:underline">
          <item.icon className="w-4 h-4" />
          <span>{item.value}</span>
        </a>
      </div>
    ))}
  </div>
);

const getAskResponse = async (question: string) => {
  const trimmedQuestion = question.trim();
  if (!trimmedQuestion) {
    return <p>Please provide a question after "ask". Example: ask "Tell me about your projects."</p>;
  }

  if (!trimmedQuestion.startsWith('"')) {
    return <p>Please enclose your question in double quotes. Example: ask "Tell me about your projects."</p>;
  }

  const unquoted = trimmedQuestion.endsWith('"')
    ? trimmedQuestion.slice(1, -1).trim()
    : trimmedQuestion.slice(1).trim();

  if (!unquoted) {
    return <p>Please provide a question inside the quotes. Example: ask "Tell me about your projects."</p>;
  }

  try {
    const { answer } = await generateAskResponse({
      question: unquoted,
      portfolio: getPortfolioSnapshot(),
    });
    return <TypingResponse text={answer} className="text-sm mt-2" />;
  } catch (error) {
    console.error(error);
    return renderAiError(error);
  }
};

const getFortuneResponse = async () => {
  const dayKey = getLocalDayKey();
  const cached = readDailyFortune(dayKey);
  if (cached) {
    return <TypingResponse text={cached} className="text-accent text-sm mt-2" />;
  }
  try {
    const { fortune } = await generateFortuneResponse();
    writeDailyFortune(dayKey, fortune);
    return <TypingResponse text={fortune} className="text-accent text-sm mt-2" />;
  } catch (error) {
    console.error(error);
    return renderAiError(error);
  }
};

export const getCommandOutput = async (commandStr: string): Promise<React.ReactNode> => {
  const trimmed = commandStr.trim();
  if (!trimmed) return '';
  const [commandRaw, ...args] = trimmed.split(' ');
  const command = commandRaw.toLowerCase();
  const argsText = trimmed.slice(commandRaw.length).trim();

  switch(command) {
    case 'help':
      return getHelp();
    case 'aboutme':
      return getAboutMe();
    case 'skills':
      return getSkills();
    case 'skill':
      if (args.length === 0) return <p>Please specify a skill name. Use 'skills' to see a list.</p>;
      return getSkillDetails(args.join(' '));
    case 'projects':
      return getProjects();
    case 'project':
      if (args.length === 0) return <p>Please specify a project name. Use 'projects' to see a list.</p>;
      return getProjectDetails(args.join(' '));
    case 'experience':
      return getExperience();
    case 'education':
      return getEducation();
    case 'resume':
      return getResume();
    case 'contact':
      return getContact();
    case 'ask':
      return await getAskResponse(argsText);
    case 'clear':
      return ''; // special case handled in terminal component
    case 'cat':
      return renderAscii(CAT_ART);
    case 'fortune':
      return await getFortuneResponse();
    case 'coffee':
      return renderAscii(COFFEE_OUTPUT);
    default:
      const closestCommand = getClosestCommand(command);
      if (closestCommand) {
        return (
          <p>
            Command not found: {command}. Did you mean: <span className="text-accent">{closestCommand}</span>?
          </p>
        );
      }
      return <p>Command not found: {command}. Type 'help' for a list of commands.</p>;
  }
};
