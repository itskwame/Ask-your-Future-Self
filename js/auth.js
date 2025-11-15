import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

let isSignUp = false;

document.getElementById('toggle-link').addEventListener('click', (e) => {
    e.preventDefault();
    isSignUp = !isSignUp;

    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const toggleMessage = document.getElementById('toggle-message');
    const toggleLink = document.getElementById('toggle-link');

    if (isSignUp) {
        signinForm.classList.remove('active');
        signupForm.classList.add('active');
        title.textContent = 'Create Account';
        subtitle.textContent = 'Start your journey to your Future Self';
        toggleMessage.textContent = 'Already have an account?';
        toggleLink.textContent = 'Sign in';
    } else {
        signupForm.classList.remove('active');
        signinForm.classList.add('active');
        title.textContent = 'Welcome Back';
        subtitle.textContent = 'Your Future Self is waiting';
        toggleMessage.textContent = "Don't have an account?";
        toggleLink.textContent = 'Sign up';
    }
});

document.getElementById('signin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    const button = e.target.querySelector('button');
    const errorDiv = document.getElementById('signin-error');

    button.disabled = true;
    button.textContent = 'Signing in...';
    errorDiv.classList.remove('show');

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

        if (profile) {
            const { data: calibration } = await supabase
                .from('calibration_data')
                .select('completed_at')
                .eq('user_id', data.user.id)
                .maybeSingle();

            if (calibration?.completed_at) {
                window.location.href = 'chat.html';
            } else {
                window.location.href = 'onboarding.html';
            }
        }
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.add('show');
        button.disabled = false;
        button.textContent = 'Sign In';
    }
});

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const age = document.getElementById('signup-age').value;
    const gender = document.getElementById('signup-gender').value;
    const location = document.getElementById('signup-location').value;
    const button = e.target.querySelector('button');
    const errorDiv = document.getElementById('signup-error');

    button.disabled = true;
    button.textContent = 'Creating account...';
    errorDiv.classList.remove('show');

    try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
            const profileData = {
                id: data.user.id,
                first_name: name,
                trial_started_at: new Date().toISOString(),
                trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                is_premium: false
            };

            if (age) profileData.age = parseInt(age);
            if (gender) profileData.gender = gender;
            if (location) profileData.location = location;

            await supabase.from('user_profiles').insert([profileData]);
            await supabase.from('calibration_data').insert([{ user_id: data.user.id }]);

            window.location.href = 'onboarding.html';
        }
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.add('show');
        button.disabled = false;
        button.textContent = 'Create Account';
    }
});

(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.href = 'chat.html';
    }
})();
