# Ambuj's Resume Bot 🤖

A professional resume chatbot built with **MS Bot Framework SDK** and **Gemini API**. This bot answers questions about Ambuj Kumar Tripathi's professional background, skills, experience, and projects.

![Bot Framework](https://img.shields.io/badge/Bot%20Framework-SDK-blue)
![Gemini](https://img.shields.io/badge/Gemini-1.5%20Flash-orange)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)

## 🚀 Features

- **AI-Powered Responses**: Uses Gemini 1.5 Flash for intelligent, context-aware answers
- **Multi-turn Conversations**: Remembers conversation history for natural dialogue
- **Modern UI**: Glassmorphism design with responsive layout
- **Quick Actions**: Pre-built question buttons for common queries
- **Creator Branding**: Professional presentation of Ambuj's profile

## 📁 Project Structure

```
ms-bot-framework-resume-bot/
├── index.js              # Express server + API endpoints
├── bot.js                # Bot Framework ActivityHandler (optional)
├── services/
│   └── geminiService.js  # Gemini API integration
├── data/
│   └── resumeData.json   # Ambuj's CV data
├── public/
│   └── index.html        # Web Chat UI
├── .env                  # API keys (create from .env.example)
└── package.json
```

## 🛠️ Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Gemini API key
# Get it from: https://aistudio.google.com/
```

### 3. Run the Bot
```bash
npm start
```

### 4. Open in Browser
Navigate to `http://localhost:3978`

## 🌐 Deploy to Render.com

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your GitHub repo
4. Add environment variable: `GEMINI_API_KEY`
5. Deploy!

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Web Chat UI |
| `/api/messages` | POST | Chat endpoint |
| `/api/health` | GET | Health check |
| `/api/clear` | POST | Clear conversation |

## 💬 Example Questions

- "Who is Ambuj?"
- "What are his skills?"
- "Tell me about his projects"
- "What's his work experience?"
- "How can I contact him?"

## 🔧 Technologies Used

- **Backend**: Node.js, Express, Bot Framework SDK
- **AI**: Google Gemini 1.5 Flash API
- **Frontend**: HTML5, CSS3, JavaScript
- **Hosting**: Render.com (free tier)

## 👨‍💻 Author

**Ambuj Kumar Tripathi**
- Portfolio: https://ambuj-portfolio-v2.netlify.app/
- GitHub: https://github.com/Ambuj123-lab
- Email: kumarambuj8@gmail.com

## 📄 License

MIT License
