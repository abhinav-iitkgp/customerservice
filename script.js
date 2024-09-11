document.addEventListener('DOMContentLoaded', (event) => {
    setTimeout(() => showTypingIndicator(), 1000);
    setTimeout(() => sendBotMessage("Hello! I'm Sara, your MyGate Customer Service assistant. How can I help you today?"), 3000);
});

function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');
    chatMessages.appendChild(typingIndicator);
    typingIndicator.style.display = 'flex';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    document.getElementById('typingIndicator').style.display = 'none';
}

function sendBotMessage(message) {
    hideTypingIndicator();
    const chatMessages = document.getElementById('chatMessages');
    const botMessage = document.createElement('div');
    botMessage.className = 'message bot-message';
    
    // Convert markdown to HTML and sanitize
    const htmlContent = DOMPurify.sanitize(marked.parse(message));
    
    botMessage.innerHTML = htmlContent;
    
    // Ensure all links open in new tabs and appear below text
    botMessage.querySelectorAll('a').forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.style.display = 'block'; // Add block display
        link.style.marginTop = '10px'; // Add spacing above the link
    });
    
    // Ensure images appear below text
    botMessage.querySelectorAll('img').forEach(img => {
        img.style.display = 'block'; // Add block display
        img.style.marginTop = '10px'; // Add spacing above the image
        img.addEventListener('click', () => showImagePopup(img.src));
    });

    chatMessages.appendChild(botMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


function showImagePopup(src) {
    const popup = document.createElement('div');
    popup.className = 'image-popup';
    popup.innerHTML = `
        <div class="popup-content">
            <span class="close-popup">&times;</span>
            <img src="${src}" alt="Enlarged view">
        </div>
    `;
    document.body.appendChild(popup);
    
    popup.querySelector('.close-popup').addEventListener('click', () => {
        document.body.removeChild(popup);
    });
}

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');

    if (userInput.value.trim() === '') return;

    // Add user message to chat
    const userMessage = document.createElement('div');
    userMessage.className = 'message user-message';
    userMessage.textContent = userInput.value;
    chatMessages.appendChild(userMessage);

    // Clear input field
    const userQuestion = userInput.value;
    userInput.value = '';

    // Scroll to bottom of chat
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Show typing indicator
    showTypingIndicator();

    try {
        const response = await fetch('http://localhost:5000/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: userQuestion }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        hideTypingIndicator();
        sendBotMessage(data.response);
    } catch (error) {
        console.error('Error:', error);
        hideTypingIndicator();
        sendBotMessage("I'm sorry, but I encountered an error. Please try again later.");
    }
}

// Allow sending message with Enter key
document.getElementById('userInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});