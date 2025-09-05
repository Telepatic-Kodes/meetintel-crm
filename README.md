# 🧠 MeetingIntel Agent

> **Plataforma de análisis estratégico de reuniones B2B con IA avanzada**

[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-green?style=for-the-badge&logo=openai)](https://openai.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 🎯 Descripción

**MeetingIntel Agent** es una plataforma avanzada que utiliza inteligencia artificial para analizar transcripciones de reuniones B2B y generar insights estratégicos de nivel consultoría. Integra la metodología McKinsey con IA de última generación para proporcionar análisis profundos y accionables.

## ✨ Características Principales

### 🧠 **Análisis con IA Avanzada**
- **GPT-4 Integration** para análisis contextual profundo
- **Metodología McKinsey** integrada
- **Análisis en español** con timezone de Chile
- **Procesamiento de archivos grandes** (hasta 1M caracteres)

### 📊 **Tipos de Análisis**
- **📋 Resumen Ejecutivo** - Vista general estructurada
- **🎯 ICE Scoring** - Priorización de iniciativas (Impact × Confidence × Ease)
- **💰 ROI Analysis** - Cálculo de retorno de inversión
- **🔍 Strategic Insights** - Insights profundos y oportunidades
- **📅 Follow-up Plan** - Plan de seguimiento estructurado
- **📊 Reporte Consolidado** - Vista completa con métricas

### 🚀 **Funcionalidades Técnicas**
- **Soporte multi-formato**: `.txt`, `.md`, `.doc`, `.docx`
- **Drag & Drop** para carga de archivos
- **Rate Limiting** para seguridad
- **Exportación** a Markdown
- **Interfaz responsive** y moderna
- **Análisis en tiempo real** con indicadores de progreso

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **IA**: OpenAI GPT-4
- **File Processing**: Mammoth.js (para archivos .docx)
- **Markdown**: React Markdown con remark-gfm
- **Deployment**: Vercel Ready

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- API Key de OpenAI

### 1. Clonar el repositorio
```bash
git clone https://github.com/Telepatic-Kodes/meetintel-agent.git
cd meetintel-agent
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp env-template.txt .env.local
```

Edita `.env.local` y agrega tu API key de OpenAI:
```env
OPENAI_API_KEY=sk-tu-api-key-aqui
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📖 Uso

### 1. **Cargar Transcripción**
- **Opción A**: Arrastra y suelta un archivo (.txt, .md, .doc, .docx)
- **Opción B**: Pega directamente la transcripción en el área de texto

### 2. **Analizar con IA**
- Haz clic en "Analizar con IA"
- La aplicación procesará la transcripción y generará múltiples análisis

### 3. **Explorar Resultados**
- Navega entre las diferentes pestañas de análisis
- Cada análisis se genera automáticamente con IA
- Exporta los resultados a Markdown

## 📊 Ejemplo de Análisis

### Resumen Ejecutivo
```
## Resumen Ejecutivo

### Objetivo de la Reunión
Evaluación de solución de automatización de procesos

### Participantes Clave
- **Juan Pérez**: CEO - Toma de decisiones
- **María González**: CTO - Evaluación técnica
- **Carlos López**: Consultor - Gestión proyecto

### Principales Temas Discutidos
1. Automatización de procesos manuales
2. ROI y beneficios esperados
3. Demo técnica y próximos pasos
```

### ICE Scoring
```
| Iniciativa | Impact | Confidence | Ease | ICE Score | Prioridad |
|------------|--------|------------|------|-----------|-----------|
| Automatización Integral | 9 | 8 | 7 | 5.04 | Alta |
| Demo Técnico | 5 | 8 | 9 | 3.60 | Media |
```

## 🔧 API Endpoints

### POST `/api/insights`
Analiza una transcripción y genera insights estratégicos.

**Request Body:**
```json
{
  "raw_transcript": "Transcripción de la reunión...",
  "meeting_info": {
    "title": "Reunión con Prospecto",
    "type": "prospecto",
    "participants": ["Juan Pérez", "María González"],
    "duration": "45 minutos"
  },
  "analysis_section": "overview" // opcional
}
```

**Response:**
```json
{
  "ok": true,
  "markdown": "Análisis en formato Markdown...",
  "insights": "Insights específicos...",
  "section": "overview"
}
```

## 🏗️ Estructura del Proyecto

```
meetintel-agent/
├── src/
│   ├── app/
│   │   ├── api/insights/route.ts    # API de análisis
│   │   ├── globals.css              # Estilos globales
│   │   ├── layout.tsx               # Layout principal
│   │   └── page.tsx                 # Página principal
│   ├── components/ui/               # Componentes UI
│   ├── lib/                         # Utilidades
│   └── types/                       # Tipos TypeScript
├── public/                          # Archivos estáticos
├── package.json                     # Dependencias
├── tailwind.config.ts               # Configuración Tailwind
├── next.config.js                   # Configuración Next.js
└── README.md                        # Este archivo
```

## 🚀 Deployment

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Agrega la variable de entorno `OPENAI_API_KEY`
3. Deploy automático en cada push

### Otras plataformas
- **Netlify**: Compatible con Next.js
- **Railway**: Deploy con Docker
- **Heroku**: Con buildpack de Node.js

## 🔒 Seguridad

- **Rate Limiting**: 10 requests por minuto por IP
- **API Key Protection**: Variables de entorno seguras
- **Input Validation**: Validación de archivos y contenido
- **Error Handling**: Manejo robusto de errores

## 📈 Roadmap

- [ ] **Integración con calendarios** (Google Calendar, Outlook)
- [ ] **Análisis de audio** directo (speech-to-text)
- [ ] **Dashboard de métricas** históricas
- [ ] **Integración CRM** (Salesforce, HubSpot)
- [ ] **Templates personalizables** de análisis
- [ ] **API pública** para integraciones
- [ ] **Análisis multi-idioma** automático

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Telepatic-Kodes**
- GitHub: [@Telepatic-Kodes](https://github.com/Telepatic-Kodes)

## 🙏 Agradecimientos

- **OpenAI** por la API de GPT-4
- **Vercel** por la plataforma de deployment
- **McKinsey & Company** por la metodología de análisis
- **Next.js Team** por el framework

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:

- **Issues**: [GitHub Issues](https://github.com/Telepatic-Kodes/meetintel-agent/issues)
- **Email**: [Tu email de contacto]

---

<div align="center">

**⭐ Si te gusta este proyecto, ¡dale una estrella! ⭐**

[![GitHub stars](https://img.shields.io/github/stars/Telepatic-Kodes/meetintel-agent?style=social)](https://github.com/Telepatic-Kodes/meetintel-agent/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Telepatic-Kodes/meetintel-agent?style=social)](https://github.com/Telepatic-Kodes/meetintel-agent/network)

</div>