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
}

export default function Page() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingFile, setProcessingFile] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to results when they appear
  useEffect(() => {
    if (markdown && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 500);
    }
  }, [markdown]);
  
  const [analysisSections, setAnalysisSections] = useState<AnalysisSections>({
    overview: { loading: false, content: '' },
    ice: { loading: false, content: '' },
    roi: { loading: false, content: '' },
    insights: { loading: false, content: '' },
    followup: { loading: false, content: '' }
  });

  const analyzeSection = useCallback(async (section: keyof AnalysisSections) => {
    setAnalysisSections(prev => ({
      ...prev,
      [section]: { ...prev[section], loading: true }
    }));

    try {
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
  }, [transcript]);

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
      followup: { loading: false, content: '' }
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
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let text = '';

      if (fileExtension === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (fileExtension === 'txt' || fileExtension === 'md') {
        text = await file.text();
      } else {
        throw new Error(`Formato de archivo no soportado: ${fileExtension}`);
      }

      if (text.trim().length < 50) {
        throw new Error('El archivo contiene muy poco texto (mínimo 50 caracteres)');
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

  const markdownComponents = {
    h1: ({children}: any) => <h1 className="text-3xl font-bold text-slate-900 mb-6 pb-3 border-b border-slate-200">{children}</h1>,
    h2: ({children}: any) => <h2 className="text-2xl font-semibold text-slate-800 mb-4 mt-8">{children}</h2>,
    h3: ({children}: any) => <h3 className="text-lg font-semibold text-slate-700 mb-3 mt-6">{children}</h3>,
    p: ({children}: any) => <p className="text-slate-700 mb-4 leading-relaxed">{children}</p>,
    ul: ({children}: any) => <ul className="space-y-2 mb-6">{children}</ul>,
    ol: ({children}: any) => <ol className="space-y-2 mb-6 ml-6">{children}</ol>,
    li: ({children}: any) => <li className="flex items-start gap-3 text-slate-700">
      <span className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
      <span>{children}</span>
    </li>,
    strong: ({children}: any) => <strong className="font-semibold text-slate-900">{children}</strong>,
    em: ({children}: any) => <em className="italic text-slate-600">{children}</em>,
    blockquote: ({children}: any) => <blockquote className="border-l-4 border-slate-300 pl-6 py-2 bg-slate-50 rounded-r-lg my-6 italic text-slate-600">{children}</blockquote>,
    code: ({children}: any) => <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono text-slate-800">{children}</code>,
    pre: ({children}: any) => <pre className="bg-slate-900 text-slate-100 p-6 rounded-xl overflow-x-auto text-sm my-6 font-mono">{children}</pre>,
    table: ({children}: any) => <div className="overflow-x-auto my-6"><table className="w-full border-collapse border border-slate-200 rounded-lg overflow-hidden">{children}</table></div>,
    th: ({children}: any) => <th className="border border-slate-200 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">{children}</th>,
    td: ({children}: any) => <td className="border border-slate-200 px-4 py-3 text-slate-700">{children}</td>,
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
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <div className="absolute inset-0 opacity-40" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
            
            <div className="relative max-w-7xl mx-auto px-6 py-24">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl mb-8 shadow-2xl">
                  <span className="text-white text-3xl font-bold">M</span>
                </div>
                
                <h1 className="text-6xl font-bold text-slate-900 mb-6 font-serif">
                  MeetingIntel Agent
                </h1>
                
                <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-12">
                  La plataforma de análisis estratégico más avanzada para reuniones B2B. 
                  <span className="font-semibold text-slate-900"> Metodología McKinsey</span> integrada con 
                  <span className="font-semibold text-slate-900"> IA de última generación</span>.
                </p>
                
                <div className="flex justify-center gap-4 flex-wrap mb-12">
                  {[
                    "Análisis con IA",
                    "ICE Scoring", 
                    "ROI Calculation",
                    "Strategic Insights",
                    "Follow-up Plans"
                  ].map((feature) => (
                    <span key={feature} className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-sm font-medium text-slate-700 shadow-sm">
                      {feature}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-center items-center gap-8 text-sm text-slate-500">
                  {[
                    { label: "Enterprise Ready", color: "bg-emerald-500" },
                    { label: "McKinsey Methodology", color: "bg-blue-500" },
                    { label: "World-Class UX", color: "bg-slate-500" }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${item.color}`} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto px-6 py-16">
            {/* Upload Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-10 mb-16">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Análisis Inteligente de Reuniones</h2>
                <p className="text-lg text-slate-600">Sube tu transcripción y obtén insights estratégicos de nivel consultoría</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Two Column Input Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-6">Transcripción de la Reunión</h3>
                  
                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
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
                                  Extrayendo contenido con IA
                                </p>
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
                                  .txt, .md, .doc, .docx • Máx. 10MB
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
              
                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={loading || transcript.length < 50}
                    className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl hover:from-slate-800 hover:to-slate-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analizando con IA avanzada...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Analizar con MeetingIntel Agent
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={loading}
                    className="bg-white text-slate-700 border border-slate-200 font-medium py-4 px-6 rounded-xl shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Limpiar
                  </button>
                </div>
              </form>
            </div>
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
              <div ref={resultsRef} className="bg-white rounded-2xl shadow-xl border border-slate-100">
                <div className="p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">MeetingIntel Analysis</h2>
                        <p className="text-slate-600">Análisis estratégico completo</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={copyToClipboard}
                        className="bg-white text-slate-900 border border-slate-200 font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        Copiar Texto
                      </button>
                      <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-gradient-to-r from-slate-900 to-slate-800 text-white font-medium py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {exporting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Exportando...
                          </>
                        ) : (
                          "Exportar .md"
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
                        { key: 'followup', label: 'Follow-up Plan' }
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

                  {/* Tab Content */}
                  <div className="p-8 bg-slate-50 rounded-xl border border-slate-200">
                    {analysisSections[activeTab as keyof AnalysisSections].loading ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
                          <span className="text-slate-600">Analizando {activeTab}...</span>
                        </div>
                      </div>
                    ) : analysisSections[activeTab as keyof AnalysisSections].content ? (
                      <div className="prose prose-slate max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {analysisSections[activeTab as keyof AnalysisSections].content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-center py-16 text-slate-500">
                        <p>Haz clic en &quot;Analizar&quot; para generar el {activeTab}</p>
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
        </>
      )}
    </main>
  );
}