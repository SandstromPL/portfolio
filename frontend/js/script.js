document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');
        hamburger.classList.toggle('toggle');
    });
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            if (navLinks.classList.contains('nav-active')) {
                navLinks.classList.remove('nav-active');
                hamburger.classList.remove('toggle');
            }
            
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    const resumeBtn = document.querySelector('.download-btn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', function(e) {
            fetch(resumeBtn.href)
                .then(response => {
                    if (!response.ok) {
                        alert('Sorry, the resume file is currently unavailable.');
                        e.preventDefault();
                    }
                })
                .catch(error => {
                    console.error('Error checking resume file:', error);
                });
        });
    }
    
    const chatMessages = document.getElementById('chat-messages');
    const userMessageInput = document.getElementById('user-message');
    const sendBtn = document.getElementById('send-btn');
    
    function addMessage(message, isUser = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(isUser ? 'user' : 'bot');
        
        const messageText = document.createElement('p');
        
        if (!isUser) {
            message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            message = message.replace(/\*(.*?)\*/g, '<em>$1</em>');
            message = message.replace(/- (.*?)(\n|$)/g, '<li>$1</li>');
            
            if (message.includes('<li>')) {
                message = message.replace(/<li>.*?<\/li>/gs, match => `<ul>${match}</ul>`);
                message = message.replace(/<ul>(\s*<ul>)/g, '<ul>');
                message = message.replace(/<\/ul>(\s*<\/ul>)/g, '</ul>');
            }
            
            messageText.innerHTML = message;
        } else {
            messageText.textContent = message;
        }
        
        messageElement.appendChild(messageText);
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    async function sendMessageToBackend(message) {
        try {
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });
            
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get response from the chatbot');
            }
            
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error:', error);
            return `Sorry, I couldn't connect to my brain right now! Let's try again in a moment.`;
        }
    }
    
    sendBtn.addEventListener('click', async () => {
        const message = userMessageInput.value.trim();
        
        if (message !== '') {
            addMessage(message, true);
            userMessageInput.value = '';
            
            const typingIndicator = document.createElement('div');
            typingIndicator.classList.add('message', 'bot', 'typing-indicator');
            typingIndicator.innerHTML = '<p><i class="fas fa-spinner fa-pulse"></i> Thinking...</p>';
            chatMessages.appendChild(typingIndicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            const response = await sendMessageToBackend(message);
            chatMessages.removeChild(typingIndicator);
            addMessage(response);
        }
    });
    
    userMessageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });
    
    document.querySelector('.chatbot-container').addEventListener('click', () => {
        userMessageInput.focus();
    });
    
    userMessageInput.focus();
});
