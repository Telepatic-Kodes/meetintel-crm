# 🚀 MeetingIntel Agent

> **La plataforma de análisis estratégico más avanzada para reuniones B2B**

[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991)](https://openai.com/)

## 📋 Descripción

**MeetingIntel Agent** es una aplicación web de última generación que utiliza inteligencia artificial para analizar transcripciones de reuniones B2B y generar insights estratégicos de nivel consultoría. Integra la metodología McKinsey con IA avanzada para proporcionar análisis profundos, cálculos de ROI, ICE scoring y planes de seguimiento estructurados.

## ✨ Características Principales

### 🎯 **Análisis Estratégico Completo**
- **Resumen Ejecutivo**: Análisis de alto nivel con objetivos, participantes y decisiones
- **ICE Scoring**: Priorización de iniciativas (Impact × Confidence × Ease)
- **ROI Analysis**: Cálculo de retorno de inversión con métricas financieras
- **Strategic Insights**: Mapa de dolores, ganancias y oportunidades de valor
- **Follow-up Plan**: Plan de seguimiento estructurado con CTAs específicos

### 🛡️ **Seguridad y Performance**
- **Rate Limiting**: 10 requests por minuto por IP
- **Validación Robusta**: Límites de archivos (10MB) y transcripciones (100K caracteres)
- **Logging Estructurado**: Monitoreo completo de requests y errores
- **Memory Leak Prevention**: Cleanup automático de timeouts y recursos

### 🎨 **Interfaz Profesional**
- **Diseño McKinsey**: Estilo corporativo con tipografía serif y colores profesionales
- **Responsive Design**: Optimizado para desktop, tablet y móvil
- **Drag & Drop**: Carga intuitiva de archivos
- **Exportación**: Descarga de reportes en formato Markdown

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- API Key de OpenAI

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Telepatic-Kodes/meetintel-agent.git
cd meetintel-agent
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
```bash
# Copiar archivo de configuración
cp env-template.txt .env.local

# Editar .env.local con tu API key
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 4. Ejecutar en Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🔧 Uso

### 1. **Cargar Transcripción**
- **Archivo**: Arrastra archivos .txt, .md, .docx (máx. 10MB)
- **Texto**: Pega directamente la transcripción (mín. 50 caracteres)

### 2. **Análisis Automático**
- Haz clic en "Analizar con IA"
- El sistema procesará automáticamente todas las secciones
- Los resultados aparecerán en pestañas organizadas

### 3. **Exportar Resultados**
- Usa el botón "Exportar" para descargar el reporte completo
- Copia secciones específicas con el botón "Copiar"

## 🛡️ Seguridad

### Configuración de Seguridad
- **Rate Limiting**: Protección contra abuso
- **Validación de Entrada**: Sanitización de datos
- **Logging**: Monitoreo de actividad
- **API Key**: Validación de configuración

### Variables de Entorno Requeridas
```bash
OPENAI_API_KEY=sk-your-api-key-here    # Requerido
NODE_ENV=development                    # Opcional
```

Ver [security.md](security.md) para documentación completa de seguridad.

## 📊 Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **IA**: OpenAI GPT-4o-mini
- **File Processing**: Mammoth.js (DOCX)
- **Markdown**: ReactMarkdown, remark-gfm

## 🚀 Deployment

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel --prod
```

### Docker
```bash
docker build -t meetintel-agent .
docker run -p 3000:3000 meetintel-agent
```

---

## 📚 Documentación Técnica

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

## 📈 Roadmap

### ✅ Completado
- [x] Análisis básico de transcripciones
- [x] ICE Scoring y ROI Analysis
- [x] Interfaz profesional McKinsey
- [x] Rate limiting y seguridad
- [x] Manejo de archivos grandes
- [x] Logging estructurado

### 🔄 En Desarrollo
- [ ] Autenticación de usuarios
- [ ] Dashboard de métricas
- [ ] Integración con calendarios
- [ ] Templates personalizables

### 📋 Próximas Características
- [ ] Análisis de sentimientos avanzado
- [ ] Integración con CRM
- [ ] Reportes automáticos por email
- [ ] API pública

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/Telepatic-Kodes/meetintel-agent/issues)
- **Documentación**: [Wiki del Proyecto](https://github.com/Telepatic-Kodes/meetintel-agent/wiki)
- **Seguridad**: Ver [security.md](security.md)

## 🙏 Agradecimientos

- **OpenAI** por la API de GPT-4o-mini
- **Vercel** por la plataforma de deployment
- **Tailwind CSS** por el framework de estilos
- **Next.js** por el framework de React

---

<div align="center">

**Desarrollado con ❤️ para revolucionar el análisis de reuniones B2B**

[![GitHub stars](https://img.shields.io/github/stars/Telepatic-Kodes/meetintel-agent?style=social)](https://github.com/Telepatic-Kodes/meetintel-agent/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Telepatic-Kodes/meetintel-agent?style=social)](https://github.com/Telepatic-Kodes/meetintel-agent/network)

</div>
