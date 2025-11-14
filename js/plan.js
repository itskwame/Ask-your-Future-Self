import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

let userId = null;
let currentPlan = null;

(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '/auth.html';
        return;
    }

    userId = session.user.id;
    await loadPlan();
})();

async function loadPlan() {
    const { data: plan } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

    if (plan) {
        currentPlan = plan;
        document.getElementById('vision').value = plan.vision || '';
        document.getElementById('goal').value = plan.goal_90_day || '';
        loadHabits(plan.daily_habits);
    } else {
        const { data: newPlan } = await supabase
            .from('plans')
            .insert([{ user_id: userId }])
            .select()
            .single();
        currentPlan = newPlan;
    }
}

function loadHabits(habits) {
    const list = document.getElementById('habits-list');
    const habitsArray = Array.isArray(habits) ? habits : JSON.parse(habits || '[]');

    list.innerHTML = '';
    habitsArray.forEach((habit, i) => {
        const div = document.createElement('div');
        div.className = 'habit-item';
        div.innerHTML = `
            <input type="checkbox" ${habit.completed_today ? 'checked' : ''} onchange="toggleHabit(${i})">
            <span>${habit.text}</span>
        `;
        list.appendChild(div);
    });
}

window.savePlan = async function() {
    const vision = document.getElementById('vision').value;
    const goal = document.getElementById('goal').value;

    await supabase
        .from('plans')
        .update({ vision, goal_90_day: goal, updated_at: new Date().toISOString() })
        .eq('id', currentPlan.id);

    alert('Plan saved!');
};

window.addHabit = async function() {
    const input = document.getElementById('new-habit');
    const text = input.value.trim();
    if (!text) return;

    const habits = JSON.parse(currentPlan.daily_habits || '[]');
    habits.push({ text, completed_today: false });

    await supabase
        .from('plans')
        .update({ daily_habits: JSON.stringify(habits) })
        .eq('id', currentPlan.id);

    currentPlan.daily_habits = JSON.stringify(habits);
    input.value = '';
    loadHabits(habits);
};

window.toggleHabit = async function(index) {
    const habits = JSON.parse(currentPlan.daily_habits || '[]');
    habits[index].completed_today = !habits[index].completed_today;

    await supabase
        .from('plans')
        .update({ daily_habits: JSON.stringify(habits) })
        .eq('id', currentPlan.id);

    currentPlan.daily_habits = JSON.stringify(habits);
};
