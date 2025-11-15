import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { getQuestionsForCategory } from './context-questions.js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userId = null;
let currentPlan = null;
let allPlans = [];
let selectedCategory = '';
let contextData = {};

(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'auth.html';
        return;
    }

    userId = session.user.id;
    await loadPlans();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('create') === 'true') {
        openCreatePlanModal();
    }
})();

async function loadPlans() {
    const { data: plans } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    allPlans = plans || [];

    const plansList = document.getElementById('plans-list');
    plansList.innerHTML = '';

    if (allPlans.length === 0) {
        plansList.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-clipboard-list"></i>
                <h2>No plans yet</h2>
                <p>Create your first action plan to start making progress on your goals</p>
                <button class="btn-primary" onclick="openCreatePlanModal()" style="width: auto; margin-top: 1rem;">
                    <i class="fas fa-plus"></i> Create Your First Plan
                </button>
            </div>
        `;
        return;
    }

    allPlans.forEach((plan, index) => {
        const steps = Array.isArray(plan.steps) ? plan.steps : JSON.parse(plan.steps || '[]');
        const completedSteps = steps.filter(s => s.completed).length;
        const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

        const card = document.createElement('div');
        card.className = 'plan-card';
        if (index === 0 && !currentPlan) card.classList.add('active');
        card.onclick = () => selectPlan(plan.id);
        card.innerHTML = `
            <div class="goal-category"><i class="fas fa-tag"></i> ${plan.goal_category || 'General'}</div>
            <h3>${plan.goal_title || 'Action Plan'}</h3>
            <p style="color: #718096; font-size: 0.875rem; margin-top: 0.5rem;">${completedSteps} of ${steps.length} steps completed</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
        `;
        plansList.appendChild(card);
    });

    if (allPlans.length > 0) {
        selectPlan(allPlans[0].id);
    }
}

async function selectPlan(planId) {
    const plan = allPlans.find(p => p.id === planId);
    if (!plan) return;

    currentPlan = plan;

    document.querySelectorAll('.plan-card').forEach(card => card.classList.remove('active'));
    event.target.closest('.plan-card')?.classList.add('active');

    await renderPlanDetail(plan);
}

async function renderPlanDetail(plan) {
    const steps = Array.isArray(plan.steps) ? plan.steps : JSON.parse(plan.steps || '[]');
    const detailDiv = document.getElementById('plan-detail');
    detailDiv.className = 'plan-detail active';

    let stepsHTML = '';
    if (steps.length === 0) {
        stepsHTML = '<p style="color: #718096; text-align: center; padding: 2rem;">No steps yet. Chat with Future You below to create action steps!</p>';
    } else {
        stepsHTML = steps.map((step, index) => {
            let statusClass = '';
            if (step.completed) statusClass = 'completed';
            else if (index === plan.current_step) statusClass = 'current';

            return `
                <div class="step-item ${statusClass}">
                    <div class="step-number">${index + 1}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #2d3748;">${step.title}</div>
                        ${step.description ? `<div style="font-size: 0.875rem; color: #718096; margin-top: 0.25rem;">${step.description}</div>` : ''}
                    </div>
                    ${!step.completed ? `<button class="btn-small" onclick="markStepComplete(${index})"><i class="fas fa-check"></i></button>` : '<i class="fas fa-check-circle" style="color: #48bb78;"></i>'}
                </div>
            `;
        }).join('');
    }

    const { data: chatMessages } = await supabase
        .from('plan_conversations')
        .select('*')
        .eq('plan_id', plan.id)
        .order('created_at', { ascending: true });

    let chatHTML = '';
    if (chatMessages && chatMessages.length > 0) {
        chatHTML = chatMessages.map(msg => `
            <div class="message ${msg.role === 'user' ? 'user' : 'bot'}">
                <div class="bubble">${msg.message}</div>
            </div>
        `).join('');
    } else {
        chatHTML = `
            <div class="message bot">
                <div class="bubble">Hey! I'm here to help you stay on track with "${plan.goal_title}". Ask me anything about your progress, next steps, or if you need motivation!</div>
            </div>
        `;
    }

    detailDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 2rem;">
            <div>
                <div style="color: #718096; font-size: 0.875rem; margin-bottom: 0.5rem;">
                    <i class="fas fa-tag"></i> ${plan.goal_category || 'General'}
                </div>
                <h2 style="margin-bottom: 0.5rem;">${plan.goal_title || 'Action Plan'}</h2>
                <p style="color: #718096;">${plan.vision || 'No vision set'}</p>
            </div>
            <button class="btn-small" onclick="editPlan()"><i class="fas fa-edit"></i> Edit</button>
        </div>

        <div class="plan-sections">
            <div class="plan-section">
                <h3><i class="fas fa-bullseye"></i> 90-Day Goal</h3>
                <p style="color: #2d3748;">${plan.goal_90_day || 'No goal set'}</p>
            </div>

            <div class="plan-section">
                <h3><i class="fas fa-chart-line"></i> Progress</h3>
                <div style="font-size: 2rem; font-weight: 700; color: #667eea;">
                    ${steps.filter(s => s.completed).length}/${steps.length}
                </div>
                <p style="color: #718096; font-size: 0.875rem;">Steps completed</p>
            </div>

            <div class="plan-section" style="grid-column: 1 / -1;">
                <h3><i class="fas fa-list-ol"></i> Action Steps</h3>
                <div class="steps-list">${stepsHTML}</div>
                <button class="btn-small" onclick="addStep()" style="margin-top: 1rem; width: 100%;">
                    <i class="fas fa-plus"></i> Add Step
                </button>
            </div>

            <div class="chat-section">
                <h3><i class="fas fa-comments"></i> Plan Chat - Talk to Future You</h3>
                <p style="color: #718096; font-size: 0.875rem; margin-bottom: 1rem;">
                    Future You knows exactly where you are in this plan and will help keep you motivated and on track.
                </p>
                <div class="chat-messages" id="plan-chat-messages">${chatHTML}</div>
                <div class="chat-input-container">
                    <input type="text" id="plan-chat-input" placeholder="Ask Future You for guidance..." onkeydown="if(event.key==='Enter') sendPlanMessage()">
                    <button onclick="sendPlanMessage()"><i class="fas fa-paper-plane"></i> Send</button>
                </div>
            </div>
        </div>
    `;

    const chatDiv = document.getElementById('plan-chat-messages');
    if (chatDiv) chatDiv.scrollTop = chatDiv.scrollHeight;
}

window.openCreatePlanModal = function() {
    document.getElementById('create-plan-modal').classList.add('active');
    document.getElementById('plan-step-1').classList.add('active');
    document.getElementById('plan-step-2').classList.remove('active');
    contextData = {};
    selectedCategory = '';
};

window.closeCreatePlanModal = function() {
    document.getElementById('create-plan-modal').classList.remove('active');
    document.getElementById('goal-title').value = '';
    document.getElementById('goal-category').value = '';
    document.getElementById('vision').value = '';
    document.getElementById('goal-90-day').value = '';
    contextData = {};
    selectedCategory = '';
};

window.onCategoryChange = function() {
    selectedCategory = document.getElementById('goal-category').value;
};

window.goToContextStep = function() {
    const goalTitle = document.getElementById('goal-title').value.trim();
    const goalCategory = document.getElementById('goal-category').value;
    const vision = document.getElementById('vision').value.trim();
    const goal90Day = document.getElementById('goal-90-day').value.trim();

    if (!goalTitle || !goalCategory || !vision || !goal90Day) {
        alert('Please fill in all fields before continuing');
        return;
    }

    const questions = getQuestionsForCategory(goalCategory);
    const container = document.getElementById('context-questions-container');

    container.innerHTML = questions.questions.map(q => `
        <div class="form-group">
            <label>${q.question}</label>
            <textarea
                id="context-${q.id}"
                rows="3"
                placeholder="${q.placeholder}"
            ></textarea>
            <small style="color: #718096; font-size: 0.875rem; margin-top: 0.25rem; display: block;">
                ${q.hint}
            </small>
        </div>
    `).join('');

    document.getElementById('plan-step-1').classList.remove('active');
    document.getElementById('plan-step-2').classList.add('active');
};

window.goBackToStep1 = function() {
    document.getElementById('plan-step-2').classList.remove('active');
    document.getElementById('plan-step-1').classList.add('active');
};

window.createPlanWithContext = async function() {
    const goalTitle = document.getElementById('goal-title').value;
    const goalCategory = document.getElementById('goal-category').value;
    const vision = document.getElementById('vision').value;
    const goal90Day = document.getElementById('goal-90-day').value;

    const questions = getQuestionsForCategory(goalCategory);
    const contextData = {};

    questions.questions.forEach(q => {
        const value = document.getElementById(`context-${q.id}`)?.value.trim();
        if (value) {
            contextData[q.id] = value;
        }
    });

    const { data: newPlan } = await supabase
        .from('plans')
        .insert([{
            user_id: userId,
            goal_title: goalTitle,
            goal_category: questions.category,
            vision: vision,
            goal_90_day: goal90Day,
            context_data: contextData,
            steps: JSON.stringify([]),
            current_step: 0,
            is_active: true
        }])
        .select()
        .single();

    closeCreatePlanModal();
    await loadPlans();
};

window.sendPlanMessage = async function() {
    const input = document.getElementById('plan-chat-input');
    const message = input.value.trim();
    if (!message || !currentPlan) return;

    input.value = '';

    await supabase.from('plan_conversations').insert([{
        plan_id: currentPlan.id,
        user_id: userId,
        role: 'user',
        message: message
    }]);

    const chatDiv = document.getElementById('plan-chat-messages');
    chatDiv.innerHTML += `
        <div class="message user">
            <div class="bubble">${message}</div>
        </div>
    `;
    chatDiv.scrollTop = chatDiv.scrollHeight;

    try {
        const { data: { session } } = await supabase.auth.getSession();
        const apiUrl = `${SUPABASE_URL}/functions/v1/deepseek-chat`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                context_type: 'plan',
                plan_id: currentPlan.id
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get response');
        }

        const data = await response.json();

        await supabase.from('plan_conversations').insert([{
            plan_id: currentPlan.id,
            user_id: userId,
            role: 'future_self',
            message: data.message
        }]);

        chatDiv.innerHTML += `
            <div class="message bot">
                <div class="bubble">${data.message}</div>
            </div>
        `;
        chatDiv.scrollTop = chatDiv.scrollHeight;
    } catch (error) {
        console.error('Error:', error);
        chatDiv.innerHTML += `
            <div class="message bot">
                <div class="bubble">I'm having trouble connecting right now. Please try again in a moment.</div>
            </div>
        `;
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }
};

window.markStepComplete = async function(stepIndex) {
    if (!currentPlan) return;

    const steps = Array.isArray(currentPlan.steps) ? currentPlan.steps : JSON.parse(currentPlan.steps || '[]');
    steps[stepIndex].completed = true;

    let newCurrentStep = currentPlan.current_step;
    if (stepIndex === currentPlan.current_step) {
        newCurrentStep = stepIndex + 1;
    }

    await supabase
        .from('plans')
        .update({
            steps: JSON.stringify(steps),
            current_step: newCurrentStep,
            updated_at: new Date().toISOString()
        })
        .eq('id', currentPlan.id);

    currentPlan.steps = JSON.stringify(steps);
    currentPlan.current_step = newCurrentStep;

    await loadPlans();
};

window.addStep = async function() {
    if (!currentPlan) return;

    const title = prompt('What\'s the next action step?');
    if (!title) return;

    const steps = Array.isArray(currentPlan.steps) ? currentPlan.steps : JSON.parse(currentPlan.steps || '[]');
    steps.push({
        title: title,
        description: '',
        completed: false
    });

    await supabase
        .from('plans')
        .update({
            steps: JSON.stringify(steps),
            updated_at: new Date().toISOString()
        })
        .eq('id', currentPlan.id);

    currentPlan.steps = JSON.stringify(steps);
    await renderPlanDetail(currentPlan);
};

window.editPlan = function() {
    alert('Edit functionality coming soon!');
};
