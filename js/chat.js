import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

let userId = null;
let userName = '';
let userMessageCount = 0;
let hasSeenPlanPrompt = false;

(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '/auth.html';
        return;
    }

    userId = session.user.id;

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('first_name')
        .eq('id', userId)
        .maybeSingle();

    if (profile) {
        userName = profile.first_name;
        document.getElementById('user-name').textContent = userName;
    }

    await loadMessages();
})();

async function loadMessages() {
    const { data: messages } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    if (messages && messages.length > 0) {
        document.getElementById('messages').innerHTML = '';
        messages.forEach(msg => {
            addMessage(msg.message, msg.role === 'user' ? 'user' : 'bot', false);
            if (msg.role === 'user') userMessageCount++;
        });
    }

    const { data: plans } = await supabase
        .from('plans')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

    hasSeenPlanPrompt = plans && plans.length > 0;
}

function addMessage(text, type, save = true) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;

    messageDiv.appendChild(bubble);
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    if (save) {
        supabase.from('conversations').insert([{
            user_id: userId,
            role: type === 'user' ? 'user' : 'future_self',
            message: text
        }]);
    }
}

window.sendMessage = async function() {
    const input = document.getElementById('input');
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    addMessage(message, 'user');
    userMessageCount++;

    try {
        const { data: { session } } = await supabase.auth.getSession();
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deepseek-chat`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                context_type: 'general'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get response');
        }

        const data = await response.json();
        addMessage(data.message, 'bot');

        if (userMessageCount >= 5 && !hasSeenPlanPrompt) {
            setTimeout(() => {
                showPlanPrompt();
            }, 1500);
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage("I'm having trouble connecting right now. Please try again in a moment.", 'bot');
    }
};

function showPlanPrompt() {
    hasSeenPlanPrompt = true;
    const messagesDiv = document.getElementById('messages');
    const promptDiv = document.createElement('div');
    promptDiv.className = 'message bot plan-prompt';
    promptDiv.innerHTML = `
        <div class="bubble" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem;">
            <p style="margin-bottom: 1rem; font-weight: 600;">I can see you're serious about making progress. Let's turn these conversations into action.</p>
            <p style="margin-bottom: 1rem;">Want to create a personalized plan to help you reach your goals?</p>
            <button onclick="window.location.href='/plan.html?create=true'" style="background: white; color: #667eea; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; width: 100%; margin-top: 0.5rem;">Let's Create Your Action Plan</button>
        </div>
    `;
    messagesDiv.appendChild(promptDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

document.getElementById('input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
