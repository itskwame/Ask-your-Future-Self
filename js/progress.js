import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

let userId = null;

(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'auth.html';
        return;
    }

    userId = session.user.id;
    await loadProgress();
})();

async function loadProgress() {
    const { count: convCount } = await supabase
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

    document.getElementById('conversations').textContent = convCount || 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: logs } = await supabase
        .from('progress_log')
        .select('*')
        .eq('user_id', userId)
        .gte('date', weekAgo.toISOString().split('T')[0]);

    let streak = 0;
    if (logs && logs.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        let checkDate = new Date(today);

        for (let i = 0; i < 30; i++) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const log = logs.find(l => l.date === dateStr);
            if (log && log.checked_in) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else break;
        }
    }

    document.getElementById('streak').textContent = streak;

    const habits = logs ? logs.reduce((sum, log) => sum + (log.habits_completed || 0), 0) : 0;
    document.getElementById('habits').textContent = habits;
}
