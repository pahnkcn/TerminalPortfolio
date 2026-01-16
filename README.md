# CLI-folio

A modern developer portfolio built with Next.js 15, featuring an interactive terminal/CLI experience theme. This project showcases web development skills through a unique command-line interface that visitors can interact with.

## 🚀 Features

- **Terminal Interface**: Interactive CLI-style portfolio navigation
- **Modern Tech Stack**: Built with Next.js 15, React 19, and TypeScript
- **AI Integration**: Powered by Google Genkit for intelligent responses
- **Responsive Design**: Mobile-friendly with Tailwind CSS
- **Dark Theme**: Eye-friendly dark mode with terminal aesthetics
- **Firebase Hosting**: Deployed on Firebase App Hosting
- **Component Library**: Built with Radix UI and shadcn/ui components

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.9
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

### Backend & AI
- **AI Framework**: Google Genkit
- **AI Provider**: Google Generative AI
- **Database**: Firebase
- **Hosting**: Firebase App Hosting

### Development Tools
- **Package Manager**: npm
- **Code Quality**: ESLint, TypeScript
- **Build Tool**: Next.js with Turbopack

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TerminalPortfolio.git
   cd TerminalPortfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   GOOGLE_GENAI_API_KEY=your_google_genai_api_key
   FIREBASE_CONFIG=your_firebase_config
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:9002](http://localhost:9002) in your browser.

## 🎯 Available Commands

The terminal interface supports various commands that visitors can use to explore your portfolio:

- `help` - Display available commands
- `about` - Learn about the developer
- `projects` - View project portfolio
- `skills` - Show technical skills
- `contact` - Get contact information
- `experience` - View work experience
- `education` - Academic background
- `clear` - Clear the terminal

## 🚀 Deployment

### Firebase App Hosting

This project is configured for Firebase App Hosting:

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```

4. **Deploy**
   ```bash
   firebase deploy
   ```

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
TerminalPortfolio/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── components/      # Page-specific components
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   └── terminal/       # Terminal-specific components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── ai/                 # AI integration logic
├── public/                 # Static assets
├── docs/                   # Documentation
├── package.json           # Dependencies and scripts
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── apphosting.yaml        # Firebase App Hosting config
```

## 🎨 Customization

### Adding New Commands

1. Create a new command handler in `src/components/terminal/commands/`
2. Register the command in the terminal component
3. Update the help command to include your new command

### Styling

The project uses Tailwind CSS with a dark theme. Modify `tailwind.config.ts` to customize colors and styling.

### AI Responses

Customize AI responses by modifying the prompts and handlers in `src/ai/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Google Genkit](https://firebase.google.com/docs/genkit) - AI framework
- [Lucide](https://lucide.dev/) - Beautiful icons

## 📞 Contact

- Portfolio: [your-portfolio-url.com](https://your-portfolio-url.com)
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [your-linkedin](https://linkedin.com/in/your-profile)
- Email: your.email@example.com

---

**Built with ❤️ and lots of ☕**