import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  content: string;
  topics: string[];
  language: string;
  source: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { content, topics, language, source }: RequestBody = await req.json();

    const topicFilter = topics.length > 0 ? `Focus on these topics: ${topics.join(", ")}` : '';

    const prompt = `You are an expert educator creating a practice quiz. Generate 5 high-quality multiple-choice questions based on the following ${source === 'flashcards' ? 'flashcards' : 'notes'}.

${topicFilter}

Content:
${content}

Requirements:
- Generate questions in ${language === 'en' ? 'English' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : 'Mandarin Chinese'}
- Each question should have 4 answer choices
- Exactly one answer must be correct
- Include the index of the correct answer (0-3)
- Include the topic for each question
- Make questions challenging but fair

Return ONLY a valid JSON object in this exact format (no markdown, no code blocks):
{
  "questions": [
    {
      "question": "Question text?",
      "choices": ["Choice A", "Choice B", "Choice C", "Choice D"],
      "answer_index": 0,
      "topic": "Topic Name"
    }
  ]
}`;

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful study assistant that generates quiz questions in JSON format." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const result = await response.json();
    const resultContent = result.choices[0].message.content;

    let questions;
    try {
      questions = JSON.parse(resultContent);
    } catch (e) {
      const jsonMatch = resultContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    return new Response(
      JSON.stringify(questions),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
