import { Terminal } from '@/app/components/terminal';
import { getAiStatus } from '@/ai/client';

export default function Home() {
  const aiStatus = getAiStatus();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-5xl h-[90vh] lg:h-[80vh] bg-background text-foreground font-code rounded-lg border-2 border-border shadow-2xl shadow-primary/20 overflow-hidden">
        <div className="w-full h-8 bg-border/50 flex items-center px-4 gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <p className="flex-grow text-center text-sm text-muted-foreground">user@portfolio -- zsh</p>
        </div>
        <div className="h-[calc(100%-2rem)]">
          <Terminal aiStatus={aiStatus} />
        </div>
      </div>
    </main>
  );
}
