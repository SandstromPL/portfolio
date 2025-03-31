const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { Groq } = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

if (!process.env.GROQ_API_KEY) {
  console.error('ERROR: Missing Groq API key in .env file');
  process.exit(1);
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

let resumeContent = null;

async function loadResumeContent() {
  try {
    if (!resumeContent) {
      const resumePath = path.join(__dirname, '../frontend/assets/resume.txt');
      
      try {
        await fs.access(resumePath);
        resumeContent = await fs.readFile(resumePath, 'utf8');
      } catch (fileError) {
        console.error('Resume file not found at:', resumePath);
        return 'Error: Resume file not found. Please contact the site administrator.';
      }
    }
    return resumeContent;
  } catch (error) {
    console.error('Error loading resume content:', error);
    return 'Error loading resume content. Please try again later.';
  }
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const resumeData = await loadResumeContent();
    
    const systemPrompt = `
    You're a friendly assistant on Paritosh's portfolio website. Answer questions about Paritosh based on his resume:

    ${resumeData}

    Be conversational but professional. If you don't have certain info, just say so. Feel free to use formatting like **bold** for emphasis. For technical topics in Paritosh's skillset, you can show off his expertise with brief explanations.
    `;
    
    const completionPromise = groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama3-70b-8192",
      temperature: 0.6,
      max_tokens: 1024,
    });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 15000);
    });
    
    const completion = await Promise.race([completionPromise, timeoutPromise]);
    
    const botResponse = completion.choices[0]?.message?.content || "Sorry, I couldn't process your request.";
    
    return res.json({ response: botResponse });
    
  } catch (error) {
    console.error('Error processing chatbot request:', error);
    
    if (error.status) {
      return res.status(error.status).json({ 
        error: `Groq API Error: ${error.message || 'Unknown error'}` 
      });
    }
    
    if (error.message === 'Request timed out') {
      return res.status(504).json({ 
        error: 'Oops! My brain is taking too long to think. Let\'s try again.' 
      });
    }
    
    return res.status(500).json({ 
      error: 'Sorry, my circuits are a bit overloaded. Mind trying again in a moment?'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});
