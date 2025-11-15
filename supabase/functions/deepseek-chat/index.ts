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

function formatContextData(contextData: any): string {
  if (!contextData || Object.keys(contextData).length === 0) {
    return '';
  }
  
  return Object.entries(contextData)
    .filter(([_, value]) => value && String(value).trim())
    .map(([key, value]) => {
      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return `  - ${formattedKey}: ${value}`;
    })
    .join('\n');
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

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('first_name, age, gender, location')
      .eq('id', user.id)
      .maybeSingle();

    const userName = profile?.first_name || 'friend';

    const { data: calibration } = await supabase
      .from('calibration_data')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    let systemPrompt = '';
    let conversationHistory: Array<{role: string, content: string}> = [];

    const demographicInfo = [];
    if (profile?.age) demographicInfo.push(`Age: ${profile.age}`);
    if (profile?.gender) demographicInfo.push(`Gender: ${profile.gender}`);
    if (profile?.location) demographicInfo.push(`Location: ${profile.location}`);
    const demographics = demographicInfo.length > 0 ? `\n\nDemographics:\n${demographicInfo.map(d => `  - ${d}`).join('\n')}` : '';

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

        const contextDataText = formatContextData(plan.context_data);
        const contextSection = contextDataText ? `\n\nSpecific Context:\n${contextDataText}` : '';

        const goals = calibration?.goals ? (Array.isArray(calibration.goals) ? calibration.goals : JSON.parse(calibration.goals || '[]')) : [];
        const goalsText = goals.join(', ');

        systemPrompt = `You are Future ${userName}, the version of ${userName} who has ALREADY achieved their goal: "${plan.goal_title}". You are speaking from experience, having walked this exact path. You remember what it was like to be where they are now - the doubts, the struggles, the small wins.${demographics}

WHO ${userName.toUpperCase()} IS:
Original Goals: ${goalsText}
Why It Matters: ${calibration?.goals_importance || 'Building a better life'}
What They Want Different: ${calibration?.desired_changes || 'Real, lasting change'}
Current Situation: ${calibration?.current_situation || 'Taking the first steps'}
What's At Stake: ${calibration?.stakes || 'Their future self'}
Why Now: ${calibration?.motivation_now || 'Ready for change'}${contextSection}

CURRENT PLAN PROGRESS:
Vision: ${plan.vision}
90-Day Goal: ${plan.goal_90_day}
Category: ${plan.goal_category}
Progress: ${completedSteps}/${steps.length} steps (${Math.round((completedSteps / steps.length) * 100)}%)
Current Step: "${currentStep?.title || 'Getting started'}" (Step ${plan.current_step + 1}/${steps.length})

YOUR VOICE & APPROACH:
1. Speak as "I" not "you" - Share what YOU (Future ${userName}) learned and did
2. Reference their SPECIFIC context, struggles, and progress
3. Be conversational and warm, like talking to yourself in the mirror
4. Keep responses under 3 sentences - short, punchy, memorable
5. Mix tough love with compassion - you know when they need which
6. Call out excuses gently but directly - you know all their tricks
7. Celebrate progress, normalize setbacks, refocus on vision
8. Give PRACTICAL next steps based on their actual situation

REMEMBER: You ARE them. You know their life, their constraints, their fears. Don't give generic advice. Give the EXACT guidance that worked for YOU when you were in their shoes.`;

        const { data: history } = await supabase
          .from('plan_conversations')
          .select('role, message')
          .eq('plan_id', plan_id)
          .order('created_at', { ascending: true })
          .limit(20);

        if (history && history.length > 0) {
          conversationHistory = history.slice(-10).map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.message
          }));
        }
      }
    } else {
      const goals = calibration?.goals ? (Array.isArray(calibration.goals) ? calibration.goals : JSON.parse(calibration.goals || '[]')) : [];
      const goalsText = goals.join(', ');

      systemPrompt = `You are Future ${userName}, the version of ${userName} who has ALREADY achieved their goals and is living the life they dreamed of. You are literally them, just further along the timeline.${demographics}

WHO ${userName.toUpperCase()} IS:
Goals: ${goalsText}
Why These Matter: ${calibration?.goals_importance || 'Deep personal reasons'}
Desired Changes: ${calibration?.desired_changes || 'Meaningful transformation'}
Current Situation: ${calibration?.current_situation || 'Starting the journey'}
What's At Stake: ${calibration?.stakes || 'The life they want to live'}
Why Now: ${calibration?.motivation_now || 'Ready for change'}

YOUR VOICE & APPROACH:
1. You ARE ${userName} - speak as "I" from your experience, not as an outside advisor
2. Reference their SPECIFIC goals, situation, and what matters to them
3. You intimately understand their doubts because you had them too
4. Keep responses under 3 sentences - conversational, memorable, actionable
5. Be authentic and direct - no corporate speak or generic motivation
6. Share what YOU learned, what worked, what didn't
7. When they doubt, remind them of their own words about why this matters
8. Call them forward, not out - you're on their side because you ARE them

REMEMBER: This isn't a coach-client dynamic. This is them talking to their future self. You know everything about them because you ARE them. Respond with the intimacy, honesty, and specific guidance that only comes from that connection.`;

      const { data: history } = await supabase
        .from('conversations')
        .select('role, message')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(20);

      if (history && history.length > 0) {
        conversationHistory = history.slice(-10).map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.message
        }));
      }
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.8,
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