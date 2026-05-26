import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { MEAL_ANALYSIS_PROMPT } from '@/lib/compassionate-prompts';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert image to base64
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = imageFile.type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Call LLM API for image analysis
    const response = await fetch('https://routellm.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: MEAL_ANALYSIS_PROMPT,
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('LLM API error:', error);
      throw new Error('Failed to analyze image');
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? '{}';

    // Parse JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse LLM response:', content);
      // Return default values if parsing fails
      analysisResult = {
        foods: ['Unknown food'],
        calories: { min: 200, max: 400, estimate: 300 },
        protein: 10,
        carbs: 30,
        fat: 15,
        positiveNote: 'Thanks for sharing your meal!',
        gentleInsight: 'Remember, nourishing your body is an act of self-care.',
      };
    }

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Meal analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze meal' },
      { status: 500 }
    );
  }
}
