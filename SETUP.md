# MeetingIntel Agent - Setup Instructions

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
1. Copy `env-template.txt` to `.env.local`
2. Replace `sk-your-openai-api-key-here` with your actual OpenAI API key
3. Get your API key from: https://platform.openai.com/api-keys

### 3. Run the Development Server
```bash
npm run dev
```

### 4. Open Your Browser
Navigate to `http://localhost:3000`

## 📋 How to Use

1. **Upload or Paste Transcript**: Choose one of two options:
   - **📁 Upload File**: Click to upload or drag & drop a transcript file (.txt, .md, .doc, .docx)
   - **📝 Paste Text**: Copy and paste the complete meeting transcript directly (minimum 50 characters)

2. **Generate Analysis**: Click "🤖 Analizar con MeetingIntel Agent" to run the comprehensive analysis

3. **Clear Form**: Use the "🗑️ Limpiar" button to reset the form and start over

4. **Review Results**: The MeetingIntel Agent provides a complete structured analysis including:
   - **Limpieza y Resumen**: Cleaned transcript and executive summary
   - **Análisis de Participantes**: Sentiments, energy levels, and roles
   - **Mapa de Dolores y Ganancias**: Pain points and potential gains
   - **Decisiones y Próximos Pasos**: Decisions made and next steps with ISO dates
   - **Objeciones y Respuestas**: Objections with suggested responses
   - **Priorización ICE**: Initiatives scored with Impact·Confidence·Ease/10
   - **Quick Wins vs Big Bets**: Classification of opportunities
   - **Estructura Comercial**: 5-slide deck suggestion
   - **ROI y Seguimiento**: ROI calculation (CLP/USD), payback period, follow-up sequence
   - **Citas Clave**: 5-7 most important quotes with context

5. **Export Results**: Use the export buttons to:
   - 📋 **Copiar Texto**: Copy the analysis to clipboard
   - 💾 **Exportar .md**: Download as a Markdown file

## 🛠️ Technical Details

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS (black and white theme)
- **AI Model**: GPT-4o-mini for cost efficiency
- **Language**: Spanish (Chilean timezone)
- **Agent**: MeetingIntel Agent with comprehensive B2B analysis
- **Output**: Beautiful Markdown rendering with react-markdown
- **Export**: Download as .md files or copy to clipboard
- **UX**: Loading states, progress indicators, and smooth animations
- **Analysis**: ICE scoring, ROI calculation, follow-up sequences
- **Currency**: CLP with USD equivalents
- **Dates**: ISO format for America/Santiago timezone

## 🔧 Customization

The AI prompt is configured for B2B consulting analysis. You can modify the system prompt in `src/app/api/insights/route.ts` to adjust the analysis style or focus areas.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── insights/
│   │       └── route.ts    # API endpoint for transcript analysis
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main application page
├── package.json
└── tsconfig.json
```

## 🚨 Important Notes

- Keep your OpenAI API key secure and never commit it to version control
- The application requires a minimum of 50 characters in the transcript
- All analysis is done in Spanish with Chilean timezone
- Results are displayed in Markdown format for easy reading and copying
