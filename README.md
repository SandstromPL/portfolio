# Personal Portfolio with AI Chatbot

A responsive personal portfolio website with an integrated Groq-powered chatbot that can answer questions about my resume.

## Features

- Responsive design for desktop and mobile devices
- Interactive sections: Home, Introduction, Skills, Resume, Chatbot, and Contact
- Downloadable resume
- AI Chatbot using Groq Cloud to answer professional questions

## Project Structure

```
portfolio/
├── frontend/
│   ├── assets/
│   │   ├── profile.jpg
│   │   ├── resume.pdf
│   │   └── resume.txt
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   └── index.html
└── backend/
    ├── .env
    ├── package.json
    └── server.js
```

## Setup and Installation

1. Clone the repository
2. Install dependencies for the backend:
   ```
   cd backend
   npm install
   ```
3. Create a `.env` file in the backend directory with your Groq API key
4. Start the server:
   ```
   npm start
   ```
5. Access the portfolio at: `http://localhost:3000`

## Chatbot Functionality

The chatbot uses Groq's LLM API with the llama3-70b-8192 model to answer questions based on resume information, providing users with accurate responses about skills and experience.

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- AI: Groq Cloud (llama3-70b-8192 model)

## License

MIT
