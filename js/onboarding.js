import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

let currentStep = 0;
const totalSteps = 8;
let userData = {};
let userId = null;
let userName = '';

(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'auth.html';
        return;
    }
    userId = session.user.id;

    const { data: calibration } = await supabase
        .from('calibration_data')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (calibration?.completed_at) {
        window.location.href = 'chat.html';
    }
})();

function updateProgress() {
    const progress = document.getElementById('progress');
    const percentage = ((currentStep + 1) / (totalSteps + 1)) * 100;
    progress.style.width = `${percentage}%`;
}

window.nextStep = function() {
    const steps = document.querySelectorAll('.step');
    steps[currentStep].classList.remove('active');
    currentStep++;
    steps[currentStep].classList.add('active');
    updateProgress();
};

window.saveName = async function() {
    const name = document.getElementById('user-name').value.trim();
    if (!name) return alert('Please enter your name');

    userName = name;
    await supabase.from('user_profiles').update({ first_name: name }).eq('id', userId);
    document.getElementById('display-name').textContent = name;
    nextStep();
};

window.saveGoals = function() {
    const goals = document.getElementById('user-goals').value.trim();
    if (!goals) return alert('Please share your goals');
    userData.goals = goals.split('\n').filter(g => g.trim());
    nextStep();
};

window.saveImportance = function() {
    const importance = document.getElementById('goals-importance').value.trim();
    if (!importance) return alert('Please share why these goals matter');
    userData.goals_importance = importance;
    nextStep();
};

window.saveChanges = function() {
    const changes = document.getElementById('desired-changes').value.trim();
    if (!changes) return alert('Please share what you hope will change');
    userData.desired_changes = changes;
    nextStep();
};

window.saveMotivation = function() {
    const motivation = document.getElementById('motivation-now').value.trim();
    if (!motivation) return alert('Please share what made you decide now');
    userData.motivation_now = motivation;
    nextStep();
};

window.saveStakes = function() {
    const stakes = document.getElementById('stakes').value.trim();
    if (!stakes) return alert('Please share what\'s at stake');
    userData.stakes = stakes;
    nextStep();
};

window.saveSituation = function() {
    const situation = document.getElementById('current-situation').value.trim();
    if (!situation) return alert('Please describe your current situation');
    userData.current_situation = situation;
    nextStep();
};

window.completeOnboarding = async function() {
    await supabase.from('calibration_data').update({
        goals: JSON.stringify(userData.goals || []),
        goals_importance: userData.goals_importance || '',
        desired_changes: userData.desired_changes || '',
        motivation_now: userData.motivation_now || '',
        stakes: userData.stakes || '',
        current_situation: userData.current_situation || '',
        completed_at: new Date().toISOString()
    }).eq('user_id', userId);

    window.location.href = 'chat.html';
};
