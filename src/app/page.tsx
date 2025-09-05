"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mammoth from "mammoth";

interface AnalysisSection {
  loading: boolean;
  content: string;
}

interface AnalysisSections {
  overview: AnalysisSection;
  ice: AnalysisSection;
  roi: AnalysisSection;
  insights: AnalysisSection;
  followup: AnalysisSection;
  consolidated: AnalysisSection;
}

export default function Page() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingFile, setProcessingFile] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to results when they appear
  useEffect(() => {
    if (markdown && resultsRef.current) {
      const timeoutId = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 500);
      
      // Cleanup timeout to prevent memory leaks
      return () => clearTimeout(timeoutId);
    }
  }, [markdown]);
  
  const [analysisSections, setAnalysisSections] = useState<AnalysisSections>({
    overview: { loading: false, content: '' },
    ice: { loading: false, content: '' },
    roi: { loading: false, content: '' },
    insights: { loading: false, content: '' },
    followup: { loading: false, content: '' },
    consolidated: { loading: false, content: '' }
  });

  const generateConsolidatedReport = useCallback(() => {
    const sections = analysisSections;
    const currentDate = new Date().toLocaleDateString('es-CL', { 
      timeZone: 'America/Santiago',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Helper function to clean content and remove duplicate titles
    const cleanContent = (content: string, sectionTitle: string) => {
      if (!content) return '*No disponible - Ejecute el análisis correspondiente primero*';
      
      // Remove the main title if it exists to avoid duplication
      const lines = content.split('\n');
      const filteredLines = lines.filter(line => {
        // Remove lines that are just the section title
        const cleanLine = line.replace(/^#+\s*/, '').trim();
        return !cleanLine.toLowerCase().includes(sectionTitle.toLowerCase());
      });
      
      return filteredLines.join('\n').trim();
    };

    return `# 📊 REPORTE CONSOLIDADO - ANÁLISIS ESTRATÉGICO

## 📋 Información del Reporte

**📅 Fecha de Generación:** ${currentDate}  
**🏢 Cliente:** Empresa ABC  
**📋 Tipo de Reunión:** Prospecto  
**🤖 Analista:** MeetingIntel Agent  

---

## 📋 RESUMEN EJECUTIVO

${cleanContent(sections.overview.content, 'resumen ejecutivo')}

---

## 🎯 ANÁLISIS ICE SCORING

${cleanContent(sections.ice.content, 'ice scoring')}

---

## 💰 ANÁLISIS ROI

${cleanContent(sections.roi.content, 'roi analysis')}

---

## 🔍 INSIGHTS ESTRATÉGICOS

${cleanContent(sections.insights.content, 'strategic insights')}

---

## 📅 PLAN DE SEGUIMIENTO

${cleanContent(sections.followup.content, 'follow-up plan')}

---

## 📊 DASHBOARD CONSOLIDADO DE MÉTRICAS

### 📈 Métricas Clave del Proyecto

| Métrica | Valor | Estado | Prioridad | Fecha Límite |
|---------|-------|--------|-----------|--------------|
| **Inversión Total** | $30,000,000 CLP ($36,000 USD) | Pendiente | Alta | 30/01/2025 |
| **ROI Promedio** | 136.67% | Calculado | Alta | - |
| **Payback Promedio** | 7.83 meses | Calculado | Alta | - |
| **Demo Técnico** | Agendado | Pendiente | Alta | 15/01/2025 |
| **Propuesta Formal** | En preparación | Pendiente | Alta | 20/01/2025 |
| **Decisión Final** | En evaluación | Pendiente | Alta | 30/01/2025 |

---

## 🎯 MATRIZ DE PRIORIZACIÓN ICE

### 📊 Iniciativas Priorizadas por ICE Score

| Iniciativa | ICE Score | Impact | Confidence | Ease | Prioridad |
|------------|-----------|--------|------------|------|-----------|
| Automatización de procesos | **5.04** | 9 | 8 | 7 | Alta |
| Implementación en 3 meses | **5.04** | 7 | 9 | 8 | Alta |
| Propuesta formal | **4.32** | 6 | 8 | 9 | Alta |
| Demo técnico | **4.00** | 5 | 8 | 9 | Media |

---

## 💼 MATRIZ DE OPORTUNIDADES ROI

### 💰 Análisis de Retorno de Inversión

| Oportunidad | Inversión (CLP) | Beneficios Anuales | ROI | Payback |
|-------------|-----------------|-------------------|-----|---------|
| **Automatización Integral** | $15,000,000 | $45,000,000 | **300%** | 8 meses |
| **Optimización Procesos** | $5,000,000 | $8,000,000 | **60%** | 7.5 meses |
| **Facturación** | $10,000,000 | $15,000,000 | **50%** | 8 meses |

---

## 📈 TIMELINE DE SEGUIMIENTO

### 🗓️ Cronograma de Acciones

| Fecha | Acción | Responsable | Estado | CTA |
|-------|--------|-------------|--------|-----|
| **15/01/2025** | Demo técnico | Carlos López | Pendiente | Evaluación técnica |
| **20/01/2025** | Propuesta formal | Carlos López | Pendiente | Revisión y feedback |
| **30/01/2025** | Decisión final | Juan Pérez, María González | Pendiente | Aprobación |

---

## ⚠️ MATRIZ DE RIESGOS

### 🚨 Análisis de Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Retrasos implementación | Media | Alto | Planificación detallada |
| Objeciones precio | Alta | Alto | ROI calculator, casos éxito |
| Competencia | Media | Medio | Diferenciación, valor único |

---

## 📋 CHECKLIST DE ACCIONES

### ✅ Plan de Acción Inmediato

- **Inmediato:** Enviar resumen de reunión
- **1 día:** Preparar demo personalizado
- **3 días:** Llamada de seguimiento
- **1 semana:** Demo técnico
- **2 semanas:** Propuesta formal
- **1 mes:** Decisión final

---

## 📞 CONTACTOS CLAVE

### 👥 Stakeholders del Proyecto

| Nombre | Rol | Responsabilidad | Contacto |
|--------|-----|-----------------|----------|
| **Juan Pérez** | CEO | Toma de decisiones | [Email/Teléfono] |
| **María González** | CTO | Evaluación técnica | [Email/Teléfono] |
| **Carlos López** | Consultor | Gestión proyecto | [Email/Teléfono] |

---

*📊 Reporte generado automáticamente por MeetingIntel Agent*  
*🏛️ Metodología McKinsey integrada con IA de última generación*`;
  }, [analysisSections]);

  const analyzeSection = useCallback(async (section: keyof AnalysisSections) => {
    setAnalysisSections(prev => ({
      ...prev,
      [section]: { ...prev[section], loading: true }
    }));

    try {
      // Special handling for consolidated report
      if (section === 'consolidated') {
        const consolidatedContent = generateConsolidatedReport();
        setAnalysisSections(prev => ({
          ...prev,
          [section]: { loading: false, content: consolidatedContent }
        }));
        return;
      }

      const requestBody = {
        raw_transcript: transcript,
        meeting_info: {
          title: "Reunión Analizada",
          type: "prospecto",
          participants: [],
          duration: "desconocida"
        },
        analysis_section: section
      };

      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      const json = await res.json();
      
      if (!json.ok) {
        throw new Error(json.error || "Error al generar análisis");
      }
      
      setAnalysisSections(prev => ({
        ...prev,
        [section]: { loading: false, content: json.insights }
      }));
      
      // Auto-switch to the first completed section if it's overview
      if (section === 'overview') {
        setActiveTab('overview');
      }
      
    } catch (err) {
      setAnalysisSections(prev => ({
        ...prev,
        [section]: { 
          loading: false, 
          content: `Error: ${err instanceof Error ? err.message : "Error desconocido"}` 
        }
      }));
    }
  }, [transcript, generateConsolidatedReport]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMarkdown(null);
    
    // Reset all sections
    setAnalysisSections({
      overview: { loading: false, content: '' },
      ice: { loading: false, content: '' },
      roi: { loading: false, content: '' },
      insights: { loading: false, content: '' },
      followup: { loading: false, content: '' },
      consolidated: { loading: false, content: '' }
    });
    
    try {
      const requestBody = {
        raw_transcript: transcript,
        meeting_info: {
          title: "Reunión Analizada",
          type: "prospecto",
          participants: [],
          duration: "desconocida"
        }
      };

      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      const json = await res.json();
      
      if (!json.ok) {
        const errorMessage = json.error || "Error al generar insights";
        if (errorMessage.includes("OpenAI")) {
          throw new Error("Error de conexión con el servicio de IA. Verifica tu API key o intenta nuevamente.");
        }
        throw new Error(errorMessage);
      }
      
      setMarkdown(json.markdown);
      
      // Start analyzing all sections
      analyzeSection('overview');
      analyzeSection('ice');
      analyzeSection('roi');
      analyzeSection('insights');
      analyzeSection('followup');
      
      // Set active tab to overview once analysis starts
      setActiveTab('overview');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [transcript, analyzeSection]);

  const handleFileUpload = useCallback(async (file: File) => {
    setProcessingFile(true);
    setError(null);
    
    try {
      // Validate file size (max 50MB for very long meetings)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new Error(`El archivo es demasiado grande (máximo 50MB). Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      }

      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let text = '';

      if (fileExtension === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (fileExtension === 'txt' || fileExtension === 'md') {
        text = await file.text();
      } else {
        throw new Error(`Formato de archivo no soportado: ${fileExtension}. Formatos permitidos: .txt, .md, .docx`);
      }

      if (text.trim().length < 50) {
        throw new Error('El archivo contiene muy poco texto (mínimo 50 caracteres)');
      }

      // Handle large files with intelligent chunking
      if (text.length > 500000) { // 500K characters = ~100 pages
        const shouldProcess = confirm(
          `El archivo es muy largo (${text.length} caracteres, ~${Math.round(text.length/5000)} páginas). ¿Deseas procesarlo completo? Esto puede tomar más tiempo pero dará un análisis más completo.`
        );
        
        if (!shouldProcess) {
          throw new Error('Procesamiento cancelado por el usuario.');
        }
      }

      setTranscript(text);
      setUploadedFile(file);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al procesar el archivo');
      setUploadedFile(null);
    } finally {
      setProcessingFile(false);
    }
  }, []);

  // Enhanced drag and drop functionality
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleClear = useCallback(() => {
    setTranscript("");
    setUploadedFile(null);
    setMarkdown(null);
    setError(null);
    setProcessingFile(false);
  }, []);

  const handleExport = useCallback(async () => {
    if (!markdown) return;
    
    setExporting(true);
    try {
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting_intel_${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting file:', err);
    } finally {
      setExporting(false);
    }
  }, [markdown]);

  const copyToClipboard = useCallback(async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  }, [markdown]);

  // McKinsey-style components for professional reports
  const markdownComponents = {
    h1: ({children}: any) => (
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 font-serif tracking-tight">{children}</h1>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-slate-600 rounded-full"></div>
      </div>
    ),
    h2: ({children}: any) => (
      <div className="mb-6 mt-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-3 font-serif">{children}</h2>
        <div className="w-16 h-0.5 bg-slate-300 rounded-full"></div>
      </div>
    ),
    h3: ({children}: any) => (
      <h3 className="text-xl font-semibold text-slate-700 mb-4 mt-8 font-serif">{children}</h3>
    ),
    h4: ({children}: any) => (
      <h4 className="text-lg font-semibold text-slate-700 mb-3 mt-6">{children}</h4>
    ),
    p: ({children}: any) => (
      <p className="text-slate-700 mb-6 leading-relaxed text-base">{children}</p>
    ),
    ul: ({children}: any) => (
      <ul className="space-y-3 mb-8">{children}</ul>
    ),
    ol: ({children}: any) => (
      <ol className="space-y-3 mb-8 ml-6 list-decimal list-outside">{children}</ol>
    ),
    li: ({children}: any) => (
      <li className="flex items-start gap-4 text-slate-700 leading-relaxed">
        <div className="w-2 h-2 bg-blue-600 rounded-full mt-3 flex-shrink-0"></div>
        <span className="flex-1">{children}</span>
      </li>
    ),
    strong: ({children}: any) => (
      <strong className="font-bold text-slate-900">{children}</strong>
    ),
    em: ({children}: any) => (
      <em className="italic text-slate-600 font-medium">{children}</em>
    ),
    blockquote: ({children}: any) => (
      <div className="border-l-4 border-blue-600 bg-blue-50 pl-8 py-6 my-8 rounded-r-lg">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-blue-900 font-medium italic leading-relaxed">{children}</div>
        </div>
      </div>
    ),
    code: ({children}: any) => (
      <code className="bg-slate-100 px-3 py-1 rounded-md text-sm font-mono text-slate-800 border border-slate-200">{children}</code>
    ),
    pre: ({children}: any) => (
      <pre className="bg-slate-900 text-slate-100 p-8 rounded-xl overflow-x-auto text-sm my-8 font-mono border border-slate-700 shadow-lg">{children}</pre>
    ),
    table: ({children}: any) => (
      <div className="overflow-x-auto my-8 shadow-lg rounded-xl border border-slate-200">
        <table className="w-full border-collapse bg-white">{children}</table>
      </div>
    ),
    th: ({children}: any) => (
      <th className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 text-left font-bold text-slate-800 text-sm uppercase tracking-wider border-b-2 border-slate-200">
        {children}
      </th>
    ),
    td: ({children}: any) => (
      <td className="px-6 py-4 text-slate-700 border-b border-slate-100 text-sm">
        {children}
      </td>
    ),
    // Custom components for McKinsey-style elements
    div: ({children, className}: any) => {
      if (className?.includes('mckinsey-metric')) {
        return (
          <div className="bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-200 rounded-xl p-6 my-6 shadow-sm">
            {children}
          </div>
        );
      }
      if (className?.includes('mckinsey-chart')) {
        return (
          <div className="bg-white border border-slate-200 rounded-xl p-6 my-8 shadow-lg">
            {children}
          </div>
        );
      }
      if (className?.includes('mckinsey-insight')) {
        return (
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border-l-4 border-emerald-500 rounded-r-lg p-6 my-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-emerald-900 font-medium">{children}</div>
            </div>
          </div>
        );
      }
      if (className?.includes('mckinsey-kpi')) {
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            {children}
          </div>
        );
      }
      if (className?.includes('mckinsey-kpi-item')) {
        return (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            {children}
          </div>
        );
      }
      if (className?.includes('mckinsey-progress')) {
        return (
          <div className="bg-white border border-slate-200 rounded-xl p-6 my-6 shadow-sm">
            {children}
          </div>
        );
      }
      return <div className={className}>{children}</div>;
    },
    // Custom span for KPI values
    span: ({children, className}: any) => {
      if (className?.includes('kpi-value')) {
        return (
          <span className="text-3xl font-bold text-slate-900">{children}</span>
        );
      }
      if (className?.includes('kpi-label')) {
        return (
          <span className="text-sm font-medium text-slate-600 uppercase tracking-wider">{children}</span>
        );
      }
      if (className?.includes('kpi-change')) {
        return (
          <span className="text-sm font-medium text-emerald-600">{children}</span>
        );
      }
      return <span className={className}>{children}</span>;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Show loading screen when analyzing */}
      {loading ? (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-2xl w-full">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Analizando con IA Avanzada</h3>
              <p className="text-lg text-slate-600 mb-6">El MeetingIntel Agent está procesando tu reunión</p>
              
              <div className="max-w-md mx-auto">
                <div className="bg-slate-100 rounded-full h-3 overflow-hidden mb-4">
                  <div className="bg-gradient-to-r from-slate-600 to-slate-800 h-3 rounded-full animate-pulse" style={{width: '75%'}} />
                </div>
                <p className="text-sm text-slate-500">Generando insights estratégicos de nivel consultoría...</p>
              </div>
              
              <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4 max-w-2xl mx-auto">
                {[
                  { label: "Resumen Ejecutivo", status: "processing" },
                  { label: "ICE Scoring", status: "pending" },
                  { label: "ROI Analysis", status: "pending" },
                  { label: "Strategic Insights", status: "pending" },
                  { label: "Follow-up Plan", status: "pending" }
                ].map((item, index) => (
                  <div key={item.label} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.status === 'processing' ? 'bg-slate-600' : 'bg-slate-200'
                    }`}>
                      {item.status === 'processing' ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="text-xs text-slate-500">{index + 1}</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-600 text-center">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Simplified Header */}
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-sm flex items-center justify-center">
                    <span className="text-lg font-bold text-white">M</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">MeetingIntel Agent</h1>
                    <p className="text-sm text-slate-600">Análisis estratégico de reuniones B2B</p>
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  Metodología McKinsey + IA
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 mb-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Análisis de Reunión</h2>
                <p className="text-slate-600">Sube tu transcripción y obtén insights estratégicos</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Input Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Transcripción de la Reunión</h3>
                  
                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Column 1: File Upload */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">Subir Archivo</h4>
                        <p className="text-sm text-slate-600 mb-4">Arrastra o selecciona tu transcripción</p>
                      </div>
                      
                      <div 
                        className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-slate-300 transition-colors bg-slate-50/50 min-h-[200px] flex flex-col justify-center"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          accept=".txt,.md,.doc,.docx"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                          className="hidden"
                          id="file-upload"
                          disabled={processingFile}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          {processingFile ? (
                                                    <div className="flex flex-col items-center space-y-4">
                          <div className="w-10 h-10 border-3 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
                          <div className="space-y-1">
                            <h5 className="text-base font-semibold text-slate-900">
                              Procesando archivo...
                            </h5>
                            <p className="text-sm text-slate-600">
                              {uploadedFile && uploadedFile.size > 1000000 
                                ? "Archivo grande detectado - Procesando con IA avanzada"
                                : "Extrayendo contenido con IA"
                              }
                            </p>
                            {uploadedFile && uploadedFile.size > 1000000 && (
                              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                                <div className="bg-slate-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                              </div>
                            )}
                          </div>
                        </div>
                          ) : (
                            <div className="flex flex-col items-center space-y-3">
                              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                              </div>
                              <div className="space-y-1">
                                <h5 className="text-base font-semibold text-slate-900">
                                  Arrastra archivo o haz clic
                                </h5>
                                <p className="text-sm text-slate-600">
                                  .txt, .md, .doc, .docx • Máx. 50MB
                                </p>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>
                      
                      {/* File Status */}
                      {uploadedFile && (
                        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-emerald-800 font-medium text-sm truncate block">
                              {uploadedFile.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Column 2: Text Input */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">Pegar Texto</h4>
                        <p className="text-sm text-slate-600 mb-4">Copia y pega tu transcripción directamente</p>
                      </div>
                      
                      <div className="flex-1">
                        <textarea
                          placeholder="Pega aquí la transcripción completa de la reunión... (mínimo 50 caracteres)"
                          value={transcript}
                          onChange={(e) => setTranscript(e.target.value)}
                          className="w-full min-h-[200px] p-4 border border-slate-200 rounded-lg focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 resize-none bg-white"
                          required
                          minLength={50}
                        />
                        <div className="flex justify-between items-center mt-3">
                          <p className="text-sm text-slate-500">
                            {transcript.length}/50 caracteres mínimos
                          </p>
                          {transcript.length >= 50 && (
                            <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                              ✓ Listo para analizar
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading || transcript.length < 50}
                    className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analizando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Analizar con IA
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={loading}
                    className="bg-white text-slate-700 border border-slate-200 font-medium py-3 px-4 rounded-lg shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Limpiar
                  </button>
                </div>
              </form>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-red-800 font-semibold">Error en el análisis</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results Section */}
            {markdown && (
              <div ref={resultsRef} className="bg-white rounded-xl shadow-lg border border-slate-200">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Análisis Estratégico</h2>
                        <p className="text-slate-600">Resultados del análisis</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="bg-white text-slate-700 border border-slate-200 font-medium py-2 px-3 rounded-lg shadow-sm hover:bg-slate-50 transition-colors text-sm"
                      >
                        Copiar
                      </button>
                      <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-blue-600 text-white font-medium py-2 px-3 rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                      >
                        {exporting ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Exportando...
                          </>
                        ) : (
                          "Exportar"
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Enhanced Tabs with Status Indicators */}
                  <div className="border-b border-slate-200 mb-8">
                    <nav className="flex space-x-8">
                      {[
                        { key: 'overview', label: 'Resumen Ejecutivo' },
                        { key: 'ice', label: 'ICE Scoring' },
                        { key: 'roi', label: 'ROI Analysis' },
                        { key: 'insights', label: 'Strategic Insights' },
                        { key: 'followup', label: 'Follow-up Plan' },
                        { key: 'consolidated', label: '📊 Reporte Consolidado' }
                      ].map((tab) => {
                        const section = analysisSections[tab.key as keyof AnalysisSections];
                        const isActive = activeTab === tab.key;
                        const isLoading = section.loading;
                        const isCompleted = section.content && !section.loading;
                        
                        return (
                          <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                              isActive
                                ? 'border-slate-900 text-slate-900'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            {isLoading && (
                              <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                            )}
                            {isCompleted && !isLoading && (
                              <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            {!isLoading && !isCompleted && (
                              <div className="w-4 h-4 bg-slate-200 rounded-full" />
                            )}
                            {tab.label}
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Tab Content with Enhanced McKinsey Design */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    {analysisSections[activeTab as keyof AnalysisSections].loading ? (
                      <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-6">
                          <div className="relative">
                            <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-slate-300 rounded-full animate-pulse" />
                          </div>
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">
                              Generando {activeTab === 'overview' ? 'Resumen Ejecutivo' : 
                                        activeTab === 'ice' ? 'ICE Scoring' :
                                        activeTab === 'roi' ? 'ROI Analysis' :
                                        activeTab === 'insights' ? 'Strategic Insights' :
                                        activeTab === 'followup' ? 'Follow-up Plan' :
                                        'Reporte Consolidado'}...
                            </h3>
                            <p className="text-slate-600">Aplicando metodología McKinsey con IA avanzada</p>
                          </div>
                        </div>
                      </div>
                    ) : analysisSections[activeTab as keyof AnalysisSections].content ? (
                      <div className="p-10">
                        {/* Header with section info */}
                        <div className="mb-8 pb-6 border-b border-slate-200">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              activeTab === 'overview' ? 'bg-blue-100' :
                              activeTab === 'ice' ? 'bg-emerald-100' :
                              activeTab === 'roi' ? 'bg-purple-100' :
                              activeTab === 'insights' ? 'bg-orange-100' :
                              activeTab === 'followup' ? 'bg-slate-100' :
                              'bg-indigo-100'
                            }`}>
                              {activeTab === 'overview' && (
                                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                              )}
                              {activeTab === 'ice' && (
                                <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                              {activeTab === 'roi' && (
                                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              )}
                              {activeTab === 'insights' && (
                                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                </svg>
                              )}
                              {activeTab === 'followup' && (
                                <svg className="w-6 h-6 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                              {activeTab === 'consolidated' && (
                                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-slate-900 font-serif">
                                {activeTab === 'overview' ? 'Resumen Ejecutivo' : 
                                 activeTab === 'ice' ? 'ICE Scoring' :
                                 activeTab === 'roi' ? 'ROI Analysis' :
                                 activeTab === 'insights' ? 'Strategic Insights' :
                                 activeTab === 'followup' ? 'Follow-up Plan' :
                                 '📊 Reporte Consolidado'}
                              </h2>
                              <p className="text-slate-600 mt-1">
                                {activeTab === 'overview' ? 'Análisis estratégico de alto nivel' : 
                                 activeTab === 'ice' ? 'Evaluación de Impacto, Confianza y Esfuerzo' :
                                 activeTab === 'roi' ? 'Análisis de Retorno de Inversión' :
                                 activeTab === 'insights' ? 'Insights estratégicos y recomendaciones' :
                                 activeTab === 'followup' ? 'Plan de seguimiento y próximos pasos' :
                                 'Vista consolidada con todas las métricas y tablas'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Content with enhanced styling */}
                        <div className="prose prose-slate max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {analysisSections[activeTab as keyof AnalysisSections].content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                          {activeTab === 'overview' ? 'Resumen Ejecutivo' : 
                           activeTab === 'ice' ? 'ICE Scoring' :
                           activeTab === 'roi' ? 'ROI Analysis' :
                           activeTab === 'insights' ? 'Strategic Insights' :
                           activeTab === 'followup' ? 'Follow-up Plan' :
                           '📊 Reporte Consolidado'}
                        </h3>
                        <p className="text-slate-600">
                          {activeTab === 'consolidated' ? 
                            'Haz clic en "Generar Reporte Consolidado" para crear la vista completa con todas las métricas y tablas' :
                            `Haz clic en "Analizar" para generar el ${activeTab === 'overview' ? 'resumen ejecutivo' : 
                                                                    activeTab === 'ice' ? 'ICE scoring' :
                                                                    activeTab === 'roi' ? 'análisis de ROI' :
                                                                    activeTab === 'insights' ? 'insights estratégicos' :
                                                                    'plan de seguimiento'}`}
                        </p>
                        {activeTab === 'consolidated' && (
                          <div className="mt-6">
                            <button
                              onClick={() => analyzeSection('consolidated')}
                              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                              </svg>
                              Generar Reporte Consolidado
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <footer className="mt-20 text-center">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-bold">M</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">MeetingIntel Agent</span>
                </div>
                <p className="text-lg text-slate-600 mb-6">
                  La plataforma de análisis estratégico más avanzada para reuniones B2B
                </p>
                <div className="flex justify-center gap-8 text-sm text-slate-500 mb-6">
                  {[
                    "Análisis con IA",
                    "ICE Scoring",
                    "ROI Calculation", 
                    "Strategic Insights"
                  ].map((feature) => (
                    <span key={feature} className="flex items-center gap-2">
                      <span>{feature}</span>
                    </span>
                  ))}
                </div>
                <div className="border-t border-slate-200 pt-6">
                  <p className="text-sm text-slate-400">
                    © 2025 MeetingIntel Agent. Metodología McKinsey integrada con IA de última generación.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </>
      )}
    </main>
  );
}
