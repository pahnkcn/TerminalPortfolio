# **App Name**: CLI-folio

## Core Features:

- Boot Sequence Animation: Simulate a system boot sequence with loading messages and initializations upon loading the page.
- Terminal Interface: Create a terminal-like interface where users can type commands and receive outputs.
- Command Handling: Implement command parsing to recognize and execute predefined commands such as 'help', 'whoami', 'skills', 'projects', 'project <name>', 'experience', 'contact', and 'clear'.
- Command History: Enable users to cycle through previously entered commands using the up and down arrow keys.
- Autocomplete: Provide command autocompletion suggestions as the user types, triggered by the tab key.
- Dynamic Content Display: Render project and work experience details based on the selected 'project <name>' and 'experience' commands.  Content should be tool assisted in its placement.
- Contact Information: Display contact information (email, GitHub, LinkedIn) when the 'contact' command is entered.

## Style Guidelines:

- Primary color: Bright green (#98FB98), reminiscent of classic terminal displays. In HSL it is hue 120, saturation 83%, lightness 79%. This provides a clear, contrasting foreground against the dark background, ensuring readability and a nostalgic terminal aesthetic.
- Background color: Very dark grey (#121212), close to black. In HSL it is hue 0, saturation 0%, lightness 7%.  This simulates the default background of a terminal, creating an immersive experience.
- Accent color: Soft blue (#ADD8E6), an analogous color shifted towards blue to complement the green while offering subtle visual contrast, in HSL it is hue 197, saturation 53%, lightness 75%.
- Font: 'Source Code Pro' (monospace) for a classic terminal code display. This font will be used for all text elements to ensure consistent and authentic look and feel.
- Minimal icons: Use simple line-based icons where necessary, matching the primary color to maintain consistency with the terminal theme. For example, simple logos of external services such as Github.
- Terminal Window: Mimic the layout of a real terminal window, including a top bar with close, minimize, and maximize buttons (purely decorative). The main area should take up most of the screen.
- Blinking cursor: Implement a blinking cursor at the end of the input line to signal the active terminal state.