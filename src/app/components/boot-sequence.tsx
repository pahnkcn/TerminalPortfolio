'use client';

import { useEffect, useState, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentTime(new Date().toString());
  }, []);

  useEffect(() => {
    if (!currentTime) return;

    const bootLines = [
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
      if (index < bootLines.length) {
        setLines((prev) => [...prev, bootLines[index]]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 500); // Wait a bit before switching
      }
    }, 150);

    return () => clearInterval(interval);
  }, [onComplete, currentTime]);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [lines]);

  return (
    <ScrollArea className="h-full w-full p-2 md:p-4" ref={scrollAreaRef}>
      <div className="flex flex-col">
        {lines.map((line, i) => (
          <p key={i} className="text-sm md:text-base">
            {line}
          </p>
        ))}
      </div>
    </ScrollArea>
  );
}
