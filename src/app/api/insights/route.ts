import { NextRequest, NextResponse } from "next/server";

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10; // 10 requests per minute
  
  const userLimit = rateLimitStore.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// Logging function
function logRequest(ip: string, method: string, endpoint: string, status: number, error?: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${endpoint} - ${status} - IP: ${ip}${error ? ` - Error: ${error}` : ''}`);
  
  // In production, send to logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to external logging service
  }
}

export async function POST(req: NextRequest) {
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    // Check rate limit
    if (!checkRateLimit(ip)) {
      logRequest(ip, 'POST', '/api/insights', 429, 'Rate limit exceeded');
      return NextResponse.json(
        { ok: false, error: 'Demasiadas solicitudes. Intenta nuevamente en 1 minuto.' },
        { status: 429 }
      );
    }

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      logRequest(ip, 'POST', '/api/insights', 500, 'OpenAI API key not configured');
      return NextResponse.json(
        { ok: false, error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    // Log successful request start
    logRequest(ip, 'POST', '/api/insights', 200);
    const { 
      raw_transcript = "", 
      meeting_info = {},
      audio_url = null,
      analysis_section = null
    } = await req.json();

    // Extract meeting details with defaults
    const meetingTitle = meeting_info.title || "Reunión con Prospecto";
    const participants = meeting_info.participants || [];
    const meetingType = meeting_info.type || "prospecto";
    const duration = meeting_info.duration || "desconocida";
    const transcript = raw_transcript;

    // Validate input - ensure transcript is provided and has minimum length
    if (!transcript || transcript.trim().length < 50) {
      logRequest(ip, 'POST', '/api/insights', 400, 'Invalid transcript length');
      return NextResponse.json(
        { ok: false, error: 'Falta "transcript" o es muy corto (≥ 50 caracteres)' },
        { status: 400 }
      );
    }

    // Validate transcript length (max 1,000,000 characters for very long meetings)
    if (transcript.length > 1000000) {
      logRequest(ip, 'POST', '/api/insights', 400, 'Transcript too long');
      return NextResponse.json(
        { ok: false, error: 'La transcripción es demasiado larga (máximo 1,000,000 caracteres). Para reuniones muy largas, considera dividir en secciones.' },
        { status: 400 }
      );
    }

    // Set timezone for Chile
    const tz = "America/Santiago";
    const fechaCL = new Date().toLocaleString("es-CL", { timeZone: tz });

    // Define section-specific prompts
    const sectionPrompts = {
      overview: {
        system: `Eres un analista de consultoría estratégica especializado en reuniones B2B. Genera un resumen ejecutivo profesional y conciso de la reunión usando formato Markdown estructurado.`,
        user: `Analiza esta transcripción y genera un resumen ejecutivo estructurado en Markdown que incluya:

## Resumen Ejecutivo

### Objetivo de la Reunión
[Describe el propósito principal]

### Participantes Clave
- **Nombre**: Rol y responsabilidades
- **Nombre**: Rol y responsabilidades

### Principales Temas Discutidos
1. Tema 1: Descripción breve
2. Tema 2: Descripción breve
3. Tema 3: Descripción breve

### Decisiones Tomadas
- Decisión 1: Descripción y responsables
- Decisión 2: Descripción y responsables

### Próximos Pasos
- **Acción**: Responsable | Fecha | Prioridad
- **Acción**: Responsable | Fecha | Prioridad

### Nivel de Engagement
**Alto/Medio/Bajo** - Justificación breve

### Riesgos Identificados
- Riesgo 1: Descripción y mitigación
- Riesgo 2: Descripción y mitigación

Transcripción: ${transcript}`
      },
      ice: {
        system: `Eres un especialista en priorización estratégica. Calcula ICE scores (Impact·Confidence·Ease/10) para todas las iniciativas identificadas en la reunión usando formato Markdown estructurado.`,
        user: `Identifica todas las iniciativas, proyectos o oportunidades mencionadas en esta reunión y calcula su ICE score usando este formato:

## ICE Scoring Analysis

### Metodología
**ICE = (Impact × Confidence × Ease) / 10**

- **Impact**: 1-10 (impacto en el negocio)
- **Confidence**: 1-10 (confianza en el éxito)  
- **Ease**: 1-10 (facilidad de implementación)

### Iniciativas Priorizadas

| Iniciativa | Impact | Confidence | Ease | ICE Score | Prioridad |
|------------|--------|------------|------|-----------|-----------|
| Iniciativa 1 | 8 | 7 | 6 | 3.36 | Alta |
| Iniciativa 2 | 6 | 8 | 9 | 4.32 | Alta |

### Análisis Detallado

#### Iniciativa 1: [Nombre]
- **Impact (8/10)**: [Justificación del impacto]
- **Confidence (7/10)**: [Justificación de la confianza]
- **Ease (6/10)**: [Justificación de la facilidad]
- **Recomendación**: [Acción sugerida]

#### Quick Wins (ICE > 4.0)
- [Lista de iniciativas de alto impacto y fácil implementación]

#### Big Bets (Impact > 7, Ease < 6)
- [Lista de iniciativas de alto impacto pero complejas]

Transcripción: ${transcript}`
      },
      roi: {
        system: `Eres un analista financiero especializado en ROI. Calcula el retorno de inversión estimado para las oportunidades identificadas usando formato Markdown estructurado.`,
        user: `Analiza esta reunión y calcula el ROI estimado para las oportunidades identificadas usando este formato:

## ROI Analysis

### Oportunidades Identificadas

| Oportunidad | Inversión (CLP) | Inversión (USD) | Beneficios Anuales | Payback (meses) | ROI (%) |
|-------------|-----------------|-----------------|-------------------|-----------------|---------|
| Oportunidad 1 | 10,000,000 | 12,000 | 15,000,000 | 8 | 50% |
| Oportunidad 2 | 5,000,000 | 6,000 | 8,000,000 | 7.5 | 60% |

### Análisis Detallado

#### Oportunidad 1: [Nombre]
- **Inversión Total**: $10,000,000 CLP ($12,000 USD)
- **Beneficios Esperados**: $15,000,000 CLP anuales
- **Payback Period**: 8 meses
- **ROI**: 50% anual
- **Variables Críticas**: [Lista de variables que afectan el ROI]

#### Oportunidad 2: [Nombre]
- **Inversión Total**: $5,000,000 CLP ($6,000 USD)
- **Beneficios Esperados**: $8,000,000 CLP anuales
- **Payback Period**: 7.5 meses
- **ROI**: 60% anual
- **Variables Críticas**: [Lista de variables que afectan el ROI]

### Resumen Financiero
- **Inversión Total**: $15,000,000 CLP ($18,000 USD)
- **Beneficios Anuales**: $23,000,000 CLP
- **ROI Promedio**: 53%
- **Payback Promedio**: 7.8 meses

### Variables Faltantes (TBD)
- [Lista de variables que necesitan ser definidas para cálculo preciso]

### Recomendaciones
- **Prioridad Alta**: [Oportunidades con mejor ROI]
- **Consideraciones**: [Factores adicionales a evaluar]

Transcripción: ${transcript}`
      },
      insights: {
        system: `Eres un consultor estratégico senior. Identifica insights profundos y oportunidades de valor usando formato Markdown estructurado.`,
        user: `Analiza esta reunión y genera insights estratégicos usando este formato:

## Strategic Insights

### Mapa de Dolores y Ganancias

#### Dolores Identificados
- **Dolor 1**: [Descripción] - **Impacto**: Alto/Medio/Bajo
- **Dolor 2**: [Descripción] - **Impacto**: Alto/Medio/Bajo
- **Dolor 3**: [Descripción] - **Impacto**: Alto/Medio/Bajo

#### Ganancias Deseadas
- **Ganancia 1**: [Descripción] - **Prioridad**: Alta/Media/Baja
- **Ganancia 2**: [Descripción] - **Prioridad**: Alta/Media/Baja
- **Ganancia 3**: [Descripción] - **Prioridad**: Alta/Media/Baja

### Objeciones y Respuestas

| Objeción | Respuesta Sugerida | Evidencia de Apoyo |
|----------|-------------------|-------------------|
| "Es muy caro" | [Respuesta estructurada] | [Datos/ejemplos] |
| "No tenemos tiempo" | [Respuesta estructurada] | [Datos/ejemplos] |

### Oportunidades de Valor

#### Quick Wins
- **Oportunidad**: [Descripción] - **Impacto**: [Justificación]
- **Oportunidad**: [Descripción] - **Impacto**: [Justificación]

#### Big Bets
- **Oportunidad**: [Descripción] - **Impacto**: [Justificación]
- **Oportunidad**: [Descripción] - **Impacto**: [Justificación]

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Riesgo 1 | Alta/Media/Baja | Alto/Medio/Bajo | [Estrategia de mitigación] |
| Riesgo 2 | Alta/Media/Baja | Alto/Medio/Bajo | [Estrategia de mitigación] |

### Recomendaciones Estratégicas

1. **Recomendación 1**: [Descripción detallada]
   - **Justificación**: [Por qué es importante]
   - **Acciones**: [Qué hacer específicamente]

2. **Recomendación 2**: [Descripción detallada]
   - **Justificación**: [Por qué es importante]
   - **Acciones**: [Qué hacer específicamente]

### Próximos Pasos Críticos
- [Acción específica con responsable y fecha]
- [Acción específica con responsable y fecha]

Transcripción: ${transcript}`
      },
      followup: {
        system: `Eres un especialista en gestión de relaciones comerciales. Diseña un plan de seguimiento estratégico usando formato Markdown estructurado.`,
        user: `Crea un plan de seguimiento detallado usando este formato:

### Timeline de Seguimiento

| Fecha | Acción | Canal | CTA | Responsable | Estado |
|-------|--------|-------|-----|-------------|--------|
| 2025-01-15 | Envío de propuesta | Email | Revisar propuesta | [Nombre] | Pendiente |
| 2025-01-18 | Llamada de seguimiento | Teléfono | Agendar demo | [Nombre] | Pendiente |
| 2025-01-22 | Demo técnico | Video | Decisión de compra | [Nombre] | Pendiente |

### Secuencia Detallada

#### Semana 1: Inmediato (0-7 días)
- **Día 1**: Envío de resumen de reunión
  - **Canal**: Email
  - **CTA**: Confirmar recepción y próximos pasos
  - **Materiales**: Resumen ejecutivo, propuesta inicial

- **Día 3**: Llamada de seguimiento
  - **Canal**: Teléfono
  - **CTA**: Resolver dudas y agendar demo
  - **Materiales**: FAQ, casos de éxito

#### Semana 2: Profundización (8-14 días)
- **Día 8**: Demo técnico
  - **Canal**: Video conferencia
  - **CTA**: Evaluación técnica y feedback
  - **Materiales**: Demo personalizado, documentación técnica

- **Día 12**: Envío de propuesta formal
  - **Canal**: Email + Documento
  - **CTA**: Revisión y feedback
  - **Materiales**: Propuesta detallada, pricing

#### Semana 3: Cierre (15-21 días)
- **Día 15**: Llamada de negociación
  - **Canal**: Teléfono
  - **CTA**: Resolver objeciones y cerrar
  - **Materiales**: Contrato, términos y condiciones

### Canales de Comunicación

| Canal | Frecuencia | Propósito | Efectividad |
|-------|------------|-----------|-------------|
| Email | Diario | Información, documentos | Alta |
| Teléfono | 2-3x/semana | Resolución de dudas | Muy Alta |
| Video | 1x/semana | Demos, presentaciones | Alta |
| WhatsApp | Según necesidad | Comunicación rápida | Media |

### CTAs Específicos

#### Email CTAs
- "Confirmar recepción del resumen"
- "Agendar demo técnico"
- "Revisar propuesta y dar feedback"
- "Firmar contrato"

#### Llamada CTAs
- "Resolver dudas técnicas"
- "Negociar términos"
- "Confirmar decisión"
- "Agendar próxima reunión"

### Materiales de Apoyo

#### Documentos Necesarios
- [ ] Resumen ejecutivo de la reunión
- [ ] Propuesta técnica detallada
- [ ] Casos de éxito relevantes
- [ ] Pricing y términos comerciales
- [ ] Contrato base
- [ ] FAQ técnico

#### Presentaciones
- [ ] Demo técnico personalizado
- [ ] Presentación ejecutiva
- [ ] ROI calculator
- [ ] Timeline de implementación

### Métricas de Éxito

| Métrica | Objetivo | Actual | Gap |
|---------|----------|--------|-----|
| Tiempo de respuesta | < 2 horas | [Medir] | [Calcular] |
| Tasa de apertura email | > 80% | [Medir] | [Calcular] |
| Engagement en demo | > 60 min | [Medir] | [Calcular] |
| Tiempo hasta decisión | < 21 días | [Medir] | [Calcular] |

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| No respuesta | Media | Alto | Llamada de seguimiento |
| Objeciones de precio | Alta | Alto | ROI calculator, casos de éxito |
| Competencia | Media | Medio | Diferenciación, valor único |

### Próximos Pasos Inmediatos
1. **Hoy**: Enviar resumen de reunión
2. **Mañana**: Preparar demo personalizado
3. **En 3 días**: Llamada de seguimiento
4. **En 1 semana**: Demo técnico

Transcripción: ${transcript}`
      },
      energy: {
        system: `Eres un analista de comportamiento y dinámicas de grupo especializado en análisis de energía, sentimiento y probabilidad de conversión comercial. Genera un dashboard completo con KPIs específicos usando formato Markdown estructurado.`,
        user: `Analiza la energía, sentimiento y perfil de los participantes en esta reunión, incluyendo un dashboard con KPIs específicos y score de conversión usando este formato:

## 📊 Dashboard de Energía y Conversión

### 🎯 KPIs Principales

| Métrica | Valor | Estado | Tendencia |
|---------|-------|--------|-----------|
| **Energía Promedio** | [X.X]/10 | [Alto/Medio/Bajo] | [↗️/➡️/↘️] |
| **Sentimiento General** | [X]% Positivo | [Excelente/Bueno/Regular] | [↗️/➡️/↘️] |
| **Engagement Promedio** | [X.X]/10 | [Alto/Medio/Bajo] | [↗️/➡️/↘️] |
| **Score de Conversión** | [XX]% | [Alto/Medio/Bajo] | [↗️/➡️/↘️] |
| **Urgencia Percibida** | [X.X]/10 | [Alta/Media/Baja] | [↗️/➡️/↘️] |
| **Confianza en Solución** | [X.X]/10 | [Alta/Media/Baja] | [↗️/➡️/↘️] |

### 🎯 Score de Conversión a Cliente

#### Cálculo del Score (0-100%)
- **Energía y Engagement**: [XX]% (peso 25%)
- **Sentimiento y Confianza**: [XX]% (peso 25%)
- **Urgencia y Necesidad**: [XX]% (peso 20%)
- **Poder de Decisión**: [XX]% (peso 15%)
- **Señales de Compromiso**: [XX]% (peso 15%)

**Score Final**: **[XX]%** - **[Alto/Medio/Bajo] Riesgo de Conversión**

### 👥 Análisis Individual de Participantes

#### [Nombre del Participante]
- **Rol**: [Rol específico en la reunión]
- **Energía Individual**: [X.X]/10 ([Alto/Medio/Bajo])
- **Sentimiento**: [X]% Positivo ([Muy Positivo/Positivo/Neutral/Negativo])
- **Engagement**: [X.X]/10 ([Muy Alto/Alto/Medio/Bajo])
- **Estilo de Comunicación**: [Directo/Diplomático/Analítico/Expresivo]
- **Poder de Decisión**: [Alto/Medio/Bajo] ([X.X]/10)
- **Nivel de Apoyo**: [Alto/Medio/Bajo] ([X.X]/10)
- **Riesgo de Objeción**: [Alto/Medio/Bajo] ([X.X]/10)
- **Principales Preocupaciones**: [Lista específica]
- **Intereses Clave**: [Lista específica]
- **Señales de Compromiso**: [Positivas/Negativas/Neutrales]

#### [Nombre del Participante]
- **Rol**: [Rol específico en la reunión]
- **Energía Individual**: [X.X]/10 ([Alto/Medio/Bajo])
- **Sentimiento**: [X]% Positivo ([Muy Positivo/Positivo/Neutral/Negativo])
- **Engagement**: [X.X]/10 ([Muy Alto/Alto/Medio/Bajo])
- **Estilo de Comunicación**: [Directo/Diplomático/Analítico/Expresivo]
- **Poder de Decisión**: [Alto/Medio/Bajo] ([X.X]/10)
- **Nivel de Apoyo**: [Alto/Medio/Bajo] ([X.X]/10)
- **Riesgo de Objeción**: [Alto/Medio/Bajo] ([X.X]/10)
- **Principales Preocupaciones**: [Lista específica]
- **Intereses Clave**: [Lista específica]
- **Señales de Compromiso**: [Positivas/Negativas/Neutrales]

### 🏢 Análisis de Dinámicas de Grupo

#### Energía General de la Reunión
- **Nivel Promedio**: [X.X]/10 ([Alto/Medio/Bajo])
- **Momento de Mayor Energía**: [Descripción específica con timestamp aproximado]
- **Momento de Menor Energía**: [Descripción específica con timestamp aproximado]
- **Factores que Aumentaron la Energía**: [Lista específica con ejemplos]
- **Factores que Disminuyeron la Energía**: [Lista específica con ejemplos]
- **Consistencia de Energía**: [Alta/Media/Baja] ([X.X]/10)

#### Sentimiento General
- **Sentimiento Promedio**: [X]% Positivo ([Muy Positivo/Positivo/Neutral/Negativo])
- **Confianza en la Solución**: [X.X]/10 ([Alta/Media/Baja])
- **Urgencia Percibida**: [X.X]/10 ([Alta/Media/Baja])
- **Resistencia al Cambio**: [X.X]/10 ([Alta/Media/Baja])
- **Apertura a Nuevas Ideas**: [X.X]/10 ([Alta/Media/Baja])

### 🎯 Mapa de Influencia y Decisión

| Participante | Influencia | Poder Decisión | Nivel Apoyo | Riesgo Objeción | Score Individual |
|--------------|------------|----------------|-------------|-----------------|------------------|
| [Nombre] | [X.X]/10 | [X.X]/10 | [X.X]/10 | [X.X]/10 | [XX]% |
| [Nombre] | [X.X]/10 | [X.X]/10 | [X.X]/10 | [X.X]/10 | [XX]% |

### 📈 Insights de Comportamiento

#### Patrones Identificados
- **Patrón 1**: [Descripción específica del patrón observado]
- **Patrón 2**: [Descripción específica del patrón observado]
- **Patrón 3**: [Descripción específica del patrón observado]

#### Señales de Compromiso
- **Señales Positivas**: [Lista específica con ejemplos de la transcripción]
- **Señales de Preocupación**: [Lista específica con ejemplos de la transcripción]
- **Señales de Urgencia**: [Lista específica con ejemplos de la transcripción]

### 🎯 Recomendaciones Estratégicas

#### Para el Próximo Contacto
- **Enfoque Principal**: [Estrategia específica basada en el análisis]
- **Canal Preferido**: [Canal óptimo basado en el comportamiento observado]
- **Momento Óptimo**: [Timing específico basado en urgencia y disponibilidad]
- **Mensaje Clave**: [Mensaje personalizado basado en intereses y preocupaciones]

#### Estrategia de Comunicación
- **Tono Recomendado**: [Tono específico basado en el estilo de comunicación del grupo]
- **Enfoque de Valor**: [Cómo presentar el valor basado en las necesidades identificadas]
- **Manejo de Objeciones**: [Estrategia específica para las objeciones identificadas]

### ⚠️ Alertas y Acciones Críticas

#### Alertas de Riesgo
- **Riesgo Alto**: [Descripción de riesgos críticos identificados]
- **Riesgo Medio**: [Descripción de riesgos moderados identificados]
- **Oportunidades**: [Descripción de oportunidades inmediatas]

#### Acciones Inmediatas
1. **[Acción 1]**: [Descripción específica con responsable y timeline]
2. **[Acción 2]**: [Descripción específica con responsable y timeline]
3. **[Acción 3]**: [Descripción específica con responsable y timeline]

Transcripción: ${transcript}`
      }
    };

    // Select prompt based on analysis section
    const selectedPrompt = analysis_section && sectionPrompts[analysis_section as keyof typeof sectionPrompts] 
      ? sectionPrompts[analysis_section as keyof typeof sectionPrompts]
      : {
          system: `Eres MeetingIntel Agent. Toma como insumo transcripciones crudas (o audios) de reuniones con prospectos o clientes activos y genera una salida en texto estructurado lista para copiar y pegar en un documento. El agente opera en español por defecto, y mantiene el idioma original de la reunión.

El flujo que sigue es el siguiente: limpia la transcripción, extrae citas clave, genera una minuta con decisiones, próximos pasos y riesgos, identifica sentimientos y niveles de energía por participante, construye un mapa de dolores y ganancias, identifica objeciones junto con respuestas sugeridas, prioriza iniciativas con ICE, clasifica en quick wins vs big bets, sugiere una estructura de deck comercial de 5 slides, calcula ROI estimado y genera una secuencia de seguimiento con CTA y canales sugeridos.

IMPORTANTE: Debes incluir SIEMPRE un análisis detallado de energía, sentimiento y perfil de participantes que incluya:
- Perfil individual de cada participante (rol, nivel de energía 1-10, sentimiento, estilo de comunicación, engagement)
- Análisis de dinámicas de grupo (energía general, sentimiento promedio, confianza, urgencia, resistencia)
- Mapa de influencia (influencia, poder de decisión, nivel de apoyo, riesgo de objeción)
- Insights de comportamiento (patrones identificados, señales de compromiso)
- Recomendaciones de enfoque (estrategia de comunicación, manejo de objeciones)

Además, incluye automatizaciones opcionales como crear Google Docs, Slides, recordatorios en n8n, y almacenamiento ordenado de documentos. Este agente espera tres entradas: raw_transcript, meeting_info, y opcionalmente audio_url.

Debe responder rápidamente (≤2 min) para reuniones menores a 1h, calcular ICE como Impact·Confidence·Ease/10, usar CLP como moneda por defecto (con equivalente USD), y devolver todas las fechas en formato ISO para timezone America/Santiago. Si faltan datos para ROI, marcar "payback_meses" como "TBD" y listar variables faltantes.

No debe traducir ni interpretar el contenido más allá de lo explícito en la transcripción y meeting_info. Debe siempre devolver un único entregable en texto estructurado alineado al tono profesional y conciso esperado en un contexto B2B consultivo, listo para ser pegado directamente en un documento, sin formato JSON.`,
          user: `raw_transcript: ${transcript}

meeting_info: {
  title: "${meetingTitle}",
  date: "${fechaCL}",
  timezone: "America/Santiago",
  type: "${meetingType}",
  duration: "${duration}",
  participants: [${participants.length > 0 ? participants.map((p: string) => `"${p}"`).join(', ') : ''}]
}

${audio_url ? `audio_url: "${audio_url}"` : ''}

Analiza esta transcripción siguiendo el flujo completo de MeetingIntel Agent y genera el documento estructurado listo para copiar y pegar.`
        };

    // Make request to OpenAI API with correct endpoint and format
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using correct model name
        messages: [
          { role: "system", content: selectedPrompt.system },
          { role: "user", content: selectedPrompt.user },
        ],
        temperature: 0.2,
        max_tokens: transcript.length > 200000 ? 8000 : 4000, // More tokens for large files
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API Error:", errorData);
      logRequest(ip, 'POST', '/api/insights', 500, `OpenAI API Error: ${errorData}`);
      return NextResponse.json(
        { ok: false, error: "Error al procesar con OpenAI" }, 
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // Extract the content from the response
    const markdown = data.choices?.[0]?.message?.content || "No se recibió salida del modelo.";

    return NextResponse.json({
      ok: true,
      meetingTitle,
      fechaCL,
      markdown,
      insights: markdown, // For section-specific responses
      section: analysis_section || 'full'
    });
  } catch (error: any) {
    console.error("API Error:", error);
    logRequest(ip, 'POST', '/api/insights', 500, error?.message || "Unknown error");
    return NextResponse.json(
      { ok: false, error: error?.message || "Error interno del servidor" }, 
      { status: 500 }
    );
  }
}
