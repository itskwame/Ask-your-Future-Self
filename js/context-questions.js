export const contextQuestions = {
    health: {
        category: 'Health & Fitness',
        questions: [
            {
                id: 'current_fitness_level',
                question: "Tell me about your current fitness level",
                placeholder: "e.g., I can walk for 30 minutes, but running is challenging...",
                hint: "This helps me understand where you're starting from"
            },
            {
                id: 'physical_limitations',
                question: "Are there any physical limitations or considerations I should know about?",
                placeholder: "e.g., knee issues, recovering from injury, chronic conditions...",
                hint: "So I can design a plan that works for YOUR body"
            },
            {
                id: 'dietary_preferences',
                question: "What's your relationship with food like right now?",
                placeholder: "e.g., vegetarian, no time to cook, emotional eating...",
                hint: "Food is personal. I need to know what works for you"
            },
            {
                id: 'schedule_constraints',
                question: "Walk me through your typical day",
                placeholder: "e.g., busy mornings, free evenings, unpredictable work hours...",
                hint: "Let's build something that fits your actual life"
            },
            {
                id: 'past_attempts',
                question: "Have you tried to get healthier before? What happened?",
                placeholder: "e.g., lost motivation, too restrictive, life got in the way...",
                hint: "Understanding what didn't work helps me help you avoid those traps"
            }
        ]
    },

    career: {
        category: 'Career & Business',
        questions: [
            {
                id: 'current_role',
                question: "What's your current professional situation?",
                placeholder: "e.g., software engineer at startup, unemployed, freelancing...",
                hint: "Let's start with where you are now"
            },
            {
                id: 'experience_level',
                question: "Tell me about your background and skills",
                placeholder: "e.g., 5 years in marketing, self-taught designer, career switcher...",
                hint: "Your experience shapes what's possible"
            },
            {
                id: 'target_outcome',
                question: "What does success look like for you specifically?",
                placeholder: "e.g., $120K salary, remote work, own business, leadership role...",
                hint: "Be specific. Vague goals get vague results"
            },
            {
                id: 'obstacles',
                question: "What's been holding you back so far?",
                placeholder: "e.g., lack of network, confidence, time, specific skills...",
                hint: "Honest answer = better plan"
            },
            {
                id: 'resources',
                question: "What do you have going for you right now?",
                placeholder: "e.g., savings to invest, strong portfolio, supportive partner...",
                hint: "Let's leverage what you already have"
            }
        ]
    },

    relationships: {
        category: 'Relationships & Social',
        questions: [
            {
                id: 'relationship_type',
                question: "What kind of relationship are you focusing on?",
                placeholder: "e.g., romantic partner, family connections, friendships...",
                hint: "Different relationships need different approaches"
            },
            {
                id: 'current_status',
                question: "Where are things at right now?",
                placeholder: "e.g., single and dating, married but distant, want more friends...",
                hint: "Tell me the real situation"
            },
            {
                id: 'past_patterns',
                question: "Looking back, what patterns do you notice in your relationships?",
                placeholder: "e.g., choose wrong people, avoid conflict, don't make time...",
                hint: "Awareness is the first step to change"
            },
            {
                id: 'desired_change',
                question: "What specifically needs to be different?",
                placeholder: "e.g., better communication, more quality time, healthier boundaries...",
                hint: "The more specific, the better I can guide you"
            },
            {
                id: 'readiness',
                question: "What are you willing to do differently?",
                placeholder: "e.g., be more vulnerable, say no more often, show up consistently...",
                hint: "Change requires changing. What's on the table?"
            }
        ]
    },

    finance: {
        category: 'Finance & Money',
        questions: [
            {
                id: 'current_situation',
                question: "Where are you financially right now?",
                placeholder: "e.g., $5K in debt, living paycheck to paycheck, have savings...",
                hint: "No judgment. Just facts so I can help"
            },
            {
                id: 'income_source',
                question: "Tell me about your income",
                placeholder: "e.g., $60K salary, variable freelance income, multiple streams...",
                hint: "Helps me understand what you're working with"
            },
            {
                id: 'spending_patterns',
                question: "What's your relationship with spending like?",
                placeholder: "e.g., impulse buyer, too restrictive, no tracking system...",
                hint: "Understanding patterns helps break bad ones"
            },
            {
                id: 'financial_goal',
                question: "What's the specific financial outcome you want?",
                placeholder: "e.g., save $10K, pay off debt, invest $500/month...",
                hint: "Concrete numbers lead to concrete plans"
            },
            {
                id: 'money_mindset',
                question: "What beliefs about money might be holding you back?",
                placeholder: "e.g., money is hard to make, I'm bad with it, I don't deserve it...",
                hint: "Mindset matters as much as strategy"
            }
        ]
    },

    personal_growth: {
        category: 'Personal Development',
        questions: [
            {
                id: 'growth_area',
                question: "What aspect of yourself do you want to develop?",
                placeholder: "e.g., confidence, discipline, creativity, emotional intelligence...",
                hint: "Be specific about what you want to improve"
            },
            {
                id: 'why_now',
                question: "What made you decide to work on this now?",
                placeholder: "e.g., tired of playing small, major life change, hitting a wall...",
                hint: "Understanding your 'why' keeps you going"
            },
            {
                id: 'current_habits',
                question: "What does a typical day look like for you?",
                placeholder: "e.g., rushed mornings, scroll social media, no downtime...",
                hint: "We'll build on what's already there"
            },
            {
                id: 'support_system',
                question: "Who's in your corner for this?",
                placeholder: "e.g., partner supports me, doing this alone, mentor at work...",
                hint: "Support matters. Let's acknowledge what you have"
            },
            {
                id: 'measurement',
                question: "How will you know you're making progress?",
                placeholder: "e.g., speak up in meetings, say no without guilt, daily meditation...",
                hint: "Growth needs milestones, even small ones"
            }
        ]
    },

    learning: {
        category: 'Learning & Skills',
        questions: [
            {
                id: 'skill_to_learn',
                question: "What specific skill do you want to master?",
                placeholder: "e.g., Spanish, programming, public speaking, guitar...",
                hint: "The clearer the target, the better the plan"
            },
            {
                id: 'current_level',
                question: "Where are you with this skill right now?",
                placeholder: "e.g., complete beginner, know basics, rusty but had training...",
                hint: "Starting point matters for pacing"
            },
            {
                id: 'learning_style',
                question: "How do you learn best?",
                placeholder: "e.g., hands-on practice, structured courses, reading, teaching others...",
                hint: "Let's match the method to how you actually learn"
            },
            {
                id: 'time_commitment',
                question: "How much time can you realistically dedicate?",
                placeholder: "e.g., 30 min daily, weekends only, 10 hours/week...",
                hint: "Honest answer > ambitious lie"
            },
            {
                id: 'application',
                question: "Why does this skill matter to you?",
                placeholder: "e.g., career change, personal passion, business need...",
                hint: "Purpose fuels persistence"
            }
        ]
    }
};

export function getQuestionsForCategory(category) {
    const categoryMap = {
        'health': contextQuestions.health,
        'fitness': contextQuestions.health,
        'career': contextQuestions.career,
        'business': contextQuestions.career,
        'relationships': contextQuestions.relationships,
        'social': contextQuestions.relationships,
        'finance': contextQuestions.finance,
        'money': contextQuestions.finance,
        'personal': contextQuestions.personal_growth,
        'growth': contextQuestions.personal_growth,
        'learning': contextQuestions.learning,
        'skills': contextQuestions.learning,
        'education': contextQuestions.learning
    };

    const key = category?.toLowerCase() || '';
    return categoryMap[key] || contextQuestions.personal_growth;
}

export function formatContextForAI(contextData) {
    if (!contextData || Object.keys(contextData).length === 0) {
        return "No additional context provided yet.";
    }

    return Object.entries(contextData)
        .filter(([_, value]) => value && value.trim())
        .map(([key, value]) => {
            const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return `${formattedKey}: ${value}`;
        })
        .join('\n');
}
