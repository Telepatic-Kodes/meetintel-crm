# Meeting Intelligence MVP - Documentation

¡Hecho! Aquí tienes el **MVP más simple posible**: una sola página en Next.js (Cursor) que pega tu transcripción, llama a una **API interna** (sin exponer tu key) y **muestra los insights en el front-end**. Sin n8n, sin Google Docs—solo ver en pantalla.

---

# 1) API interna (App Router)

**`app/api/insights/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { transcript = "", meetingTitle = "Reunión" } = await req.json();

    if (!transcript || transcript.trim().length < 50) {
      return NextResponse.json(
        { ok: false, error: 'Falta "transcript" o es muy corto (≥ 50 caracteres)' },
        { status: 400 }
      );
    }

    const tz = "America/Santiago";
    const fechaCL = new Date().toLocaleString("es-CL", { timeZone: tz });

    const system = `Eres un analista senior de reuniones B2B. Extraes insights accionables, riesgos, próximos pasos, ofertas, objeciones y decisiones. Escribe claro, en español neutro, con bullets y secciones. Tono profesional, conciso, estilo consultoría. Devuelve Markdown.`;

    const user = `Contexto: AIAIAI Consulting (IA, automatizaciones, CRM, RAG).
Objetivo: entregar “meeting intel” ejecutivo en Markdown, listo para leer en frontend.

Estructura EXACTA:
1) Título y Datos Rápidos (fecha ${fechaCL}, participantes si aparecen, objetivo)
2) Resumen Ejecutivo (5 bullets)
3) Insights Clave (10–15 bullets, etiqueta cada bullet con: Necesidad/Dolor/Objetivo/Decisor/Timing/Presupuesto)
4) Riesgos / Objeciones
5) Próximos Pasos (responsable + fecha DD/MM/YYYY)
6) Oportunidades de Oferta
7) Citas textuales (3–5)
8) Anexos

Transcripción completa:
${transcript}`;

    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.2,
        input: [
          { role: "system", content: system },
          { role: "user", content: [{ type: "text", text: user }] },
        ],
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return NextResponse.json({ ok: false, error: err }, { status: 500 });
    }

    const data = await resp.json();
    // Responses API suele traer 'output_text'
    const md =
      data.output_text ??
      data.output?.[0]?.content?.[0]?.text ??
      "No se recibió salida del modelo.";

    return NextResponse.json({
      ok: true,
      meetingTitle,
      fechaCL,
      markdown: md,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Error" }, { status: 500 });
  }
}
```

---

# 2) Página única (UI super simple)

**`app/page.tsx`**

```tsx
"use client";

import { useState } from "react";

export default function Page() {
  const [meetingTitle, setMeetingTitle] = useState("Reunión con Prospecto");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMarkdown(null);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingTitle, transcript }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Error al generar insights");
      setMarkdown(json.markdown);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Meeting Intel – MVP</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border rounded p-2"
          placeholder="Título de la reunión"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
        />
        <textarea
          className="w-full h-56 border rounded p-2"
          placeholder="Pega aquí la transcripción completa… (mínimo 50 caracteres)"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded border"
        >
          {loading ? "Generando..." : "Generar Meeting Intel"}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-red-600">
          {error}
        </p>
      )}

      {markdown && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Resultado</h2>
          {/* Mostramos el Markdown sin parsearlo para mantener el MVP ultra simple */}
          <pre className="whitespace-pre-wrap bg-gray-50 border rounded p-4">
            {markdown}
          </pre>
        </section>
      )}
    </main>
  );
}
```

---

# 3) Variables y arranque

1. Crea **`.env.local`**:

   ```
   OPENAI_API_KEY=sk-xxxxxx
   ```
2. Asegúrate de estar en Next.js (>=13) con **App Router** habilitado.
3. `npm run dev` y abre `http://localhost:3000`.

> Pegas la transcripción, clic en **Generar Meeting Intel**, y verás el **Markdown** con todo el contenido en la misma página. Si luego quieres estilos bonitos, agregamos un renderizador Markdown (ej. `react-markdown`)—pero para el MVP lo dejamos **texto plano**.

---

## Siguientes pasos (cuando quieras, sin romper la simpleza)

* **Render Markdown**: instalar `react-markdown` para visualizar encabezados y listas.
* **Guardar JSON**: botón “Exportar .md” o “Copiar”.
* **Switch de modelo**: `gpt-4o-mini` / `o4-mini` si quieres bajar costo/latencia.
* **n8n**: cambiar el POST `/api/insights` por un Webhook n8n… y listo.

¿Quieres que lo convierta al **pages router** o te agrego el renderizador Markdown en 1 minuto?
