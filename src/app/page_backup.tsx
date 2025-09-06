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
  energy: AnalysisSection;
  consolidated: AnalysisSection;
  deck: AnalysisSection;
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
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'success' | 'info' | 'warning'}>>([]);
  const [analysisSections, setAnalysisSections] = useState<AnalysisSections>({
    overview: { loading: false, content: '' },
    ice: { loading: false, content: '' },
    roi: { loading: false, content: '' },
    insights: { loading: false, content: '' },
    followup: { loading: false, content: '' },
    energy: { loading: false, content: '' },
    consolidated: { loading: false, content: '' },
    deck: { loading: false, content: '' }
  });
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
      
      return () => clearTimeout(timeoutId);
    }
  }, [markdown]);

  // Add notification function
  const addNotification = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Remove notification function
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    setProcessingFile(true);
    setProcessingProgress(0);
    setUploadedFile(file);

    try {
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      let text = '';
      
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else {
        text = await file.text();
      }

      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      setTimeout(() => {
        setTranscript(text);
        setProcessingFile(false);
        setProcessingProgress(0);
        addNotification('Archivo procesado exitosamente', 'success');
      }, 500);

    } catch (error) {
      console.error('Error processing file:', error);
      setProcessingFile(false);
      setProcessingProgress(0);
      addNotification('Error al procesar el archivo', 'warning');
    }
  }, [addNotification]);

  const analyzeSection = useCallback(async (sectionKey: keyof AnalysisSections) => {
    if (!transcript.trim()) return;

    setAnalysisSections(prev => ({
      ...prev,
      [sectionKey]: { loading: true, content: '' }
    }));

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw_transcript: transcript,
          meeting_info: {
            title: "Reunión Analizada",
            type: "prospecto",
            participants: [],
            duration: "desconocida"
          },
          section: sectionKey
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysisSections(prev => ({
        ...prev,
        [sectionKey]: { loading: false, content: data[sectionKey] || data.overview || '' }
      }));

    } catch (error) {
      console.error(`Error analyzing ${sectionKey}:`, error);
      setAnalysisSections(prev => ({
        ...prev,
        [sectionKey]: { loading: false, content: '' }
      }));
      addNotification(`Error al generar ${sectionKey}`, 'warning');
    }
  }, [transcript, addNotification]);

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
      energy: { loading: false, content: '' },
      consolidated: { loading: false, content: '' },
      deck: { loading: false, content: '' }
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

      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMarkdown(data.overview);
      setAnalysisSections(prev => ({
        ...prev,
        overview: { loading: false, content: data.overview || '' }
      }));
      
      addNotification('Análisis completado exitosamente', 'success');
      
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      addNotification('Error al generar el análisis', 'warning');
    } finally {
      setLoading(false);
    }
  }, [transcript, addNotification]);

  const copyToClipboard = useCallback(async () => {
    const content = analysisSections[activeTab as keyof AnalysisSections]?.content || markdown;
    if (!content) return;
    
    try {
      await navigator.clipboard.writeText(content);
      addNotification('Contenido copiado al portapapeles', 'success');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      addNotification('Error al copiar al portapapeles', 'warning');
    }
  }, [analysisSections, activeTab, markdown, addNotification]);

  const handleExport = useCallback(async () => {
    const content = analysisSections[activeTab as keyof AnalysisSections]?.content || markdown;
    if (!content) return;
    
    setExporting(true);
    
    try {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analisis-estrategico-${activeTab}-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addNotification('Archivo exportado exitosamente', 'success');
    } catch (error) {
      console.error('Error exporting file:', error);
      addNotification('Error al exportar el archivo', 'warning');
    } finally {
      setExporting(false);
    }
  }, [analysisSections, activeTab, markdown, addNotification]);

  const handleClear = useCallback(() => {
    setTranscript("");
    setMarkdown(null);
    setError(null);
    setUploadedFile(null);
    setActiveTab('overview');
    setAnalysisSections({
      overview: { loading: false, content: '' },
      ice: { loading: false, content: '' },
      roi: { loading: false, content: '' },
      insights: { loading: false, content: '' },
      followup: { loading: false, content: '' },
      energy: { loading: false, content: '' },
      consolidated: { loading: false, content: '' },
      deck: { loading: false, content: '' }
    });
    addNotification('Formulario limpiado', 'info');
  }, [addNotification]);

  // Markdown components for enhanced styling
  const markdownComponents = {
    h1: ({children}: any) => (
      <h1 className="text-3xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-3">
        {children}
      </h1>
    ),
    h2: ({children}: any) => (
      <h2 className="text-2xl font-bold text-slate-800 mb-4 mt-8">
        {children}
      </h2>
    ),
    h3: ({children}: any) => (
      <h3 className="text-xl font-semibold text-slate-700 mb-3 mt-6">
        {children}
      </h3>
    ),
    p: ({children}: any) => (
      <p className="text-slate-600 leading-relaxed mb-4">
        {children}
      </p>
    ),
    ul: ({children}: any) => (
      <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2">
        {children}
      </ul>
    ),
    ol: ({children}: any) => (
      <ol className="list-decimal list-inside text-slate-600 mb-4 space-y-2">
        {children}
      </ol>
    ),
    li: ({children}: any) => (
      <li className="text-slate-600 leading-relaxed">
        {children}
      </li>
    ),
    strong: ({children}: any) => (
      <strong className="font-semibold text-slate-800">
        {children}
      </strong>
    ),
    em: ({children}: any) => (
      <em className="italic text-slate-700">
        {children}
      </em>
    ),
    blockquote: ({children}: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-600 bg-blue-50 py-2 rounded-r">
        {children}
      </blockquote>
    ),
    code: ({children}: any) => (
      <code className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({children}: any) => (
      <pre className="bg-slate-100 text-slate-800 p-4 rounded-lg overflow-x-auto mb-4">
        {children}
      </pre>
    ),
    table: ({children}: any) => (
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border border-slate-200 rounded-lg">
          {children}
        </table>
      </div>
    ),
    th: ({children}: any) => (
      <th className="border border-slate-200 px-4 py-2 bg-slate-50 font-semibold text-slate-800 text-left">
        {children}
      </th>
    ),
    td: ({children}: any) => (
      <td className="border border-slate-200 px-4 py-2 text-slate-600">
        {children}
      </td>
    ),
    hr: ({children}: any) => (
      <hr className="my-8 border-slate-200" />
    ),
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg border max-w-sm transform transition-all duration-300 ${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800'
                : notification.type === 'warning'
                ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{notification.message}</span>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">M</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MeetingIntel Agent
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            La plataforma de análisis estratégico más avanzada para reuniones B2B con metodología McKinsey
          </p>
        </div>

        {/* Input Section */}
        {!markdown && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="transcript" className="block text-sm font-semibold text-slate-700 mb-3">
                    Transcripción de la Reunión
                  </label>
                  
                  {/* File Upload Area */}
                  <div className="mb-4">
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        id="file-upload"
                        accept=".txt,.md,.doc,.docx"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-lg font-medium text-slate-700">
                              {uploadedFile ? uploadedFile.name : 'Arrastra tu archivo aquí o haz clic para seleccionar'}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                              Soporta archivos .txt, .md, .doc, .docx
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                    
                    {processingFile && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                          <span>Procesando archivo...</span>
                          <span>{processingProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${processingProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <textarea
                    id="transcript"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Pega aquí la transcripción de tu reunión o sube un archivo..."
                    className="w-full h-64 p-4 border border-slate-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading || !transcript.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analizando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Generar Análisis Estratégico
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Results Section */}
        {markdown && (
          <div ref={resultsRef} className="bg-white rounded-xl shadow-lg border border-slate-200 transform transition-all duration-500 ease-in-out">
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
                    onClick={handleClear}
                    className="bg-slate-100 text-slate-700 border border-slate-200 font-medium py-2 px-3 rounded-lg shadow-sm hover:bg-slate-200 transition-colors text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nuevo Análisis
                  </button>
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
                    { key: 'energy', label: '⚡ Energy Dashboard' },
                    { key: 'consolidated', label: '📊 Reporte Consolidado' },
                    { key: 'deck', label: '🎯 Deck Comercial' }
                  ].map((tab) => {
                    const section = analysisSections[tab.key as keyof AnalysisSections];
                    const isActive = activeTab === tab.key;
                    const isLoading = section?.loading || false;
                    const isCompleted = section?.content && !section?.loading;
                    
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
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {analysisSections[activeTab as keyof AnalysisSections]?.loading ? (
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
                                    activeTab === 'energy' ? 'Energy Dashboard' :
                                    activeTab === 'consolidated' ? 'Reporte Consolidado' :
                                    'Deck Comercial'}...
                        </h3>
                        <p className="text-slate-600">Aplicando metodología McKinsey con IA avanzada</p>
                        <div className="mt-4 w-64 bg-slate-100 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : analysisSections[activeTab as keyof AnalysisSections]?.content ? (
                  <div className="p-10">
                    <div className="prose prose-slate max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {analysisSections[activeTab as keyof AnalysisSections]?.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        {activeTab === 'deck' ? 'Deck Comercial' : 'Sección'} no disponible
                      </h3>
                      <p className="text-slate-600 mb-4">
                        {activeTab === 'deck' 
                          ? 'Haz clic en "Generar Deck Comercial" para crear la presentación'
                          : 'Esta sección se generará automáticamente'
                        }
                      </p>
                      {activeTab === 'deck' && (
                        <button
                          onClick={() => analyzeSection('deck')}
                          disabled={analysisSections.deck.loading}
                          className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                        >
                          {analysisSections.deck.loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Generando...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Generar Deck Comercial
                            </>
                          )}
                        </button>
                      )}
                    </div>
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
    </main>
  );
}