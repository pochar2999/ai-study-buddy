import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  notes: string;
  topics: string[];
  language: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { notes, topics, language }: RequestBody = await req.json();

    const topicList = topics.length > 0 ? topics.join(", ") : "various topics covered in the notes";

    const prompt = `You are an expert educator creating study flashcards. Generate 10 concise, high-quality flashcards based on the following notes.

${topics.length > 0 ? `Focus specifically on these topics: ${topicList}` : 'Cover the key concepts from the notes.'}

Notes:
${notes}

Requirements:
- Generate flashcards in ${language === 'en' ? 'English' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : 'Mandarin Chinese'}
- Each flashcard should have a clear question and concise answer
- Assign each flashcard to one of the topics provided (or create relevant topic names if none provided)
- Focus on important concepts, definitions, and key facts
- Make questions specific and answers clear

Return ONLY a valid JSON object in this exact format (no markdown, no code blocks):
{
  "flashcards": [
    {
      "topic": "Topic Name",
      "question": "Question text?",
      "answer": "Answer text"
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
          { role: "system", content: "You are a helpful study assistant that generates flashcards in JSON format." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const result = await response.json();
    const content = result.choices[0].message.content;

    let flashcards;
    try {
      flashcards = JSON.parse(content);
    } catch (e) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    return new Response(
      JSON.stringify(flashcards),
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
