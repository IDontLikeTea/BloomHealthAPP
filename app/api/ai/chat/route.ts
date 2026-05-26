import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { COMPANION_SYSTEM_PROMPT } from '@/lib/compassionate-prompts';

export const dynamic = 'force-dynamic';

const AGENT_SYSTEM_ADDENDUM = `

AGENT CAPABILITIES — MEAL LOGGING:
You can log meals directly for the user. When a user tells you they ate something, you MUST:
1. Identify the food(s) they mentioned
2. Estimate realistic calories and macros (protein, carbs, fat in grams)
3. Determine the meal type (breakfast/lunch/dinner/snack) based on context or time of day
4. Present a summary in EXACTLY this format — do NOT deviate:

---MEAL_PROPOSAL---
Name: [concise meal name]
Type: [breakfast/lunch/dinner/snack]
Calories: [number]
Protein: [number]g
Carbs: [number]g
Fat: [number]g
---END_PROPOSAL---

Then ask: "Does this look right? I can adjust anything before logging it."

IMPORTANT RULES:
- ALWAYS use the ---MEAL_PROPOSAL--- format when the user describes food they ate. No exceptions.
- Estimates should be realistic (e.g., a banana is ~105 cal, not 50 or 200).
- If the user says "log it" or "looks good" or confirms, respond with EXACTLY:
---LOG_CONFIRMED---
[repeat the same proposal details]
---END_CONFIRMED---
- If the user wants edits (e.g., "make it 400 calories" or "I had a large portion"), adjust and show a new ---MEAL_PROPOSAL---.
- Do NOT include the proposal markers in casual conversation — only when the user describes food they ate.
- You should still be helpful for general health questions too.
`;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { message, companionName, context } = body;

    // Save user message to database
    await prisma.chatMessage.create({
      data: {
        userId,
        role: 'user',
        content: message,
      },
    });

    // Build system prompt with context
    const basePrompt = COMPANION_SYSTEM_PROMPT
      .replace('{name}', companionName || 'Sage')
      .replace('{goal}', context?.goalType || 'general wellness')
      .replace('{progress}', (() => {
        const net = context?.todaySummary?.netCalories || 0;
        const goal = context?.calorieGoal || 2000;
        const pct = Math.round((net / goal) * 100);
        let severity = '';
        if (pct > 150) severity = ' WARNING: This is a MAJOR BINGE (>150% of goal). Use binge-specific guidance from your instructions — do NOT treat this like mild overeating.';
        else if (pct > 110) severity = ' Note: Slightly over goal — keep response light and reassuring.';
        return `${net} calories consumed today, which is ${pct}% of their ${goal} kcal goal.${severity}`;
      })())
      .replace('{recentActivity}', `${context?.todaySummary?.mealsLogged || 0} meals and ${context?.todaySummary?.exercisesLogged || 0} exercises logged today`);

    const systemPrompt = basePrompt + AGENT_SYSTEM_ADDENDUM;

    // Get recent chat history for context
    const recentMessages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const chatHistory = recentMessages.reverse().map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Call LLM API with streaming
    const response = await fetch('https://routellm.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatHistory.slice(-8),
          { role: 'user', content: message },
        ],
        stream: true,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('LLM API error:', error);
      throw new Error('Failed to get AI response');
    }

    // Stream the response back
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let fullContent = '';

        try {
          while (true) {
            const { done, value } = await (reader?.read() ?? Promise.resolve({ done: true, value: undefined }));
            if (done) break;

            const chunk = decoder.decode(value);
            controller.enqueue(encoder.encode(chunk));

            // Parse content for saving
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(data);
                  fullContent += parsed?.choices?.[0]?.delta?.content ?? '';
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }

          // Save assistant response to database
          if (fullContent) {
            await prisma.chatMessage.create({
              data: {
                userId,
                role: 'assistant',
                content: fullContent,
              },
            });
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat' },
      { status: 500 }
    );
  }
}
