import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { reply: "La clave de API de OpenAI no está configurada. Añade OPENAI_API_KEY en tus variables de entorno para activar el chat con IA." },
      { status: 200 }
    );
  }

  try {
    const body = await req.json() as { messages: { role: string; content: string }[] };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: body.messages,
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.json() as { error?: { message?: string } };
      throw new Error(err.error?.message ?? "OpenAI error");
    }

    const data = await res.json() as {
      choices: { message: { content: string } }[];
    };

    const reply = data.choices[0]?.message?.content ?? "Sin respuesta.";
    return NextResponse.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { reply: `Error al contactar con la IA: ${message}` },
      { status: 200 }
    );
  }
}
