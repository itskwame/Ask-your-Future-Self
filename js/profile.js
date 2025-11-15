import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userId = null;
let userProfile = null;

(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'auth.html';
        return;
    }

    userId = session.user.id;

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (profile) {
        userProfile = profile;
        document.getElementById('profile-name').textContent = profile.first_name;
        document.getElementById('profile-email').textContent = session.user.email;
        document.getElementById('name-value').textContent = profile.first_name;
        document.getElementById('email-value').textContent = session.user.email;

        const trialEnd = new Date(profile.trial_ends_at);
        const today = new Date();
        const daysLeft = Math.ceil((trialEnd - today) / (1000 * 60 * 60 * 24));

        if (profile.is_premium) {
            document.getElementById('trial-card').style.display = 'none';
        } else if (daysLeft > 0) {
            document.getElementById('trial-status').textContent = 'Your free trial is active';
            document.getElementById('trial-days').textContent = `${daysLeft} days left`;
        } else {
            document.getElementById('trial-status').textContent = 'Your free trial has ended';
            document.getElementById('trial-days').textContent = 'Upgrade to continue';
        }
    }
})();

window.editName = async function() {
    const newName = prompt('Enter your new name:', userProfile.first_name);
    if (newName && newName.trim()) {
        await supabase
            .from('user_profiles')
            .update({ first_name: newName.trim() })
            .eq('id', userId);

        userProfile.first_name = newName.trim();
        document.getElementById('profile-name').textContent = newName.trim();
        document.getElementById('name-value').textContent = newName.trim();
    }
};

window.signOut = async function() {
    if (confirm('Are you sure you want to sign out?')) {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    }
};
