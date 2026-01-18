# CLI-folio

CLI-folio is a terminal-style developer portfolio built with Next.js App Router. It simulates a boot sequence, accepts CLI commands, and surfaces your profile data from a single config file. Optional AI commands answer questions about your experience using server-side provider routing.

## Features

- Boot sequence animation with ASCII banner, scanline glow, and blinking cursor.
- Command history (arrow keys), tab autocomplete, and quick-action buttons.
- Data-driven sections for about, skills, projects, experience, education, resume, and contact.
- AI-powered `ask` command with prompt suggestions and cooldown protection.
- Daily `fortune` command with local caching to reduce repeat requests.
- Source Code Pro typography and configurable terminal theme.

## Tech Stack

**Frontend**
- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS + shadcn/ui (Radix UI primitives)
- Lucide icons

**AI and Server**
- Server Actions with a fetch-based provider router (Gemini, OpenAI, DeepSeek, xAI Grok)
- Zod validation for AI outputs

**Tooling**
- npm scripts with Turbopack dev server
- ESLint and TypeScript

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```
2. Configure environment
   ```bash
   copy .env.example .env.local
   ```
   Then add your API keys.
3. Run the dev server
   ```bash
   npm run dev
   ```
   Open http://localhost:9002.

## Environment Variables

```
AI_PROVIDER=gemini            # gemini | openai | deepseek | grok
GEMINI_API_KEY=your_key
OPENAI_API_KEY=your_key
DEEPSEEK_API_KEY=your_key
XAI_API_KEY=your_key
GEMINI_MODEL=gemini-2.5-flash
OPENAI_MODEL=gpt-4o-mini
DEEPSEEK_MODEL=deepseek-chat
XAI_MODEL=grok-4
AI_COOLDOWN_MS=15000
```

AI keys stay server-side only. If no key is configured, AI commands remain offline.

## Commands

Core commands:
- `help`
- `aboutme`
- `skills`
- `skill <name>`
- `projects`
- `project <name>`
- `experience`
- `education`
- `resume`
- `contact`
- `clear`

AI and extra commands:
- `ask "<question>"` (AI)
- `fortune` (AI daily fortune)
- `cat` / `coffee` (ASCII art)

## Project Structure

```
src/
  app/
    components/terminal.tsx
    layout.tsx
    page.tsx
  ai/
    client.ts
    flows/
  lib/
    data.ts
    commands.tsx
  components/ui/
  hooks/
docs/
```

## Customize

- Update portfolio content in `src/lib/data.ts`.
- Add or modify commands in `src/lib/commands.tsx`.
- Adjust UI/behavior in `src/app/components/terminal.tsx`.
- Edit theme tokens in `src/app/globals.css` and `tailwind.config.ts`.
- Update metadata and fonts in `src/app/layout.tsx`.

## Build and Run

```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide](https://lucide.dev/) - Beautiful icons

## Contact

- Portfolio: [your-portfolio-url.com](https://your-portfolio-url.com)
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [your-linkedin](https://linkedin.com/in/your-profile)
- Email: your.email@example.com

---

**Built with ❤️ and lots of ☕**