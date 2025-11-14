import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

let userId = null;
let userName = '';

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
        });
    }
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

    setTimeout(() => {
        const responses = [
            "I remember asking myself that exact question. Here's what I learned: trust the process, but don't wait for perfect clarity. Start moving.",
            "You're closer than you think. The doubt you're feeling? That's growth pushing against comfort. Keep going.",
            "I know it feels overwhelming right now. But remember why you started this. That version of you who set these goals knew something important.",
            "Here's the truth: you already have what it takes. You just need to trust yourself more and second-guess yourself less.",
            "That fear you're feeling? It's not a stop sign. It's a sign you're about to level up. I've been there.",
            "Small wins matter more than you realize right now. Celebrate them. They add up to the breakthrough you're looking for."
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];
        addMessage(response, 'bot');
    }, 1000);
};

document.getElementById('input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
