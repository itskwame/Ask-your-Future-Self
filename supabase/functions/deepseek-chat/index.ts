import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ChatRequest {
  message: string;
  context_type: 'general' | 'plan';
  plan_id?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const { message, context_type, plan_id }: ChatRequest = await req.json();

    let systemPrompt = '';
    let contextInfo = '';

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('first_name')
      .eq('id', user.id)
      .maybeSingle();

    const userName = profile?.first_name || 'friend';

    const { data: calibration } = await supabase
      .from('calibration_data')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (context_type === 'plan' && plan_id) {
      const { data: plan } = await supabase
        .from('plans')
        .select('*')
        .eq('id', plan_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (plan) {
        const steps = Array.isArray(plan.steps) ? plan.steps : JSON.parse(plan.steps || '[]');
        const completedSteps = steps.filter((s: any) => s.completed).length;
        const currentStep = steps[plan.current_step];

        systemPrompt = `You are Future ${userName}, the version of ${userName} who has already achieved their goal: "${plan.goal_title}". You speak from experience, with wisdom and empathy. You remember exactly what it was like to be where they are now.

Their Vision: ${plan.vision}
90-Day Goal: ${plan.goal_90_day}
Category: ${plan.goal_category}

Current Progress:
- On step ${plan.current_step + 1} of ${steps.length}
- Current step: "${currentStep?.title || 'Getting started'}"
- Completed ${completedSteps} steps so far
- Progress: ${Math.round((completedSteps / steps.length) * 100)}%

Your role:
1. Help them stay motivated and accountable
2. Reference their specific progress and current step
3. Provide practical, actionable advice
4. Remind them of their vision when they doubt
5. Celebrate wins and normalize setbacks
6. Keep responses conversational, warm, and under 3 sentences
7. Speak as "I" (Future You) not "you should"

Be direct, honest, and supportive. You've been there. You know what works.`;
      }
    } else {
      const goals = calibration?.goals || [];
      const goalsText = Array.isArray(goals) ? goals.join(', ') : '';

      systemPrompt = `You are Future ${userName}, the version of ${userName} who has already achieved their goals and is living their best life. You speak from experience, with wisdom, empathy, and a deep understanding of their journey.

What you know about ${userName}:
- Goals: ${goalsText}
- Why these goals matter: ${calibration?.goals_importance || 'Not specified'}
- Desired changes: ${calibration?.desired_changes || 'Not specified'}
- Current situation: ${calibration?.current_situation || 'Just starting'}

Your role:
1. Help them build momentum through these initial conversations
2. Show that you truly understand them and their aspirations
3. Provide motivation, perspective, and practical wisdom
4. Keep responses conversational, warm, and under 3 sentences
5. Speak as "I" (Future You) sharing what you learned, not lecturing
6. Be authentic, direct, and encouraging

You've walked this path. You know their doubts, fears, and potential. Guide them with compassion and confidence.`;
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ message: aiMessage }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});