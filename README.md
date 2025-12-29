Nexus AI Assistant 🚀
Nexus AI is a premium, multi-modal artificial intelligence platform designed for seamless interaction and creativity. From text-based assistance to voice commands and high-fidelity image generation, Nexus provides a unified "Creative Studio" experience.

📸 Interface Preview
🔐 Secure Access
A clean, dark-themed authentication system with support for traditional email and OAuth (Google/GitHub) login providers.

🤖 Intelligent Assistant
The core chat interface powered by Gemini Lite, featuring real-time scoped persistence and file/image upload capabilities.

🎨 Creative Studio
A dedicated workspace for text-to-image generation. Choose your prompt, select aspect ratios (1:1, 16:9, 9:16), and "Generate Magic."

🎙️ Voice Interaction
A hands-free experience featuring a real-time audio monitor for natural conversations with the AI.

✨ Key Features
Multi-Modal Chat: Interact via text, images, or file uploads.

Creative Studio: Integrated image generation engine with customizable aspect ratios.

Voice Interaction: Real-time voice-to-text and audio standby mode for hands-free help.

Task Management: Built-in task tracking to keep your workflow organized.

Modern UI/UX: A high-end dark mode aesthetic with glassmorphism elements.

🛠️ Built With
Frontend: [e.g., Next.js 14, Tailwind CSS, Framer Motion]

AI Models: Gemini Lite (High Speed)

Auth: [e.g., NextAuth.js / Clerk]

State Management: [e.g., Zustand / Redux]

🚀 Setup & Installation
Clone the Repo

Bash

git clone https://github.com/ttNagendra/Nexus_AI_Assistant.git
Install Dependencies

Bash

npm install
Environment Config Create a .env.local file:

Code snippet

NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
Launch

Bash

npm run dev
🗺️ Roadmap
[ ] Integration of more LLM models.

[ ] History and persistent storage for generated images.

[ ] Collaborative workspaces for teams.
## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
