"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mammoth from "mammoth";
import { ReportContent } from "@/components/reports/ReportContent";
import { motion, AnimatePresence } from "framer-motion";

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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMarkdown(null);
    
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
    if (!markdown) return;
    
    try {
      await navigator.clipboard.writeText(markdown);
      addNotification('Contenido copiado al portapapeles', 'success');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      addNotification('Error al copiar al portapapeles', 'warning');
    }
  }, [markdown, addNotification]);

  const handleExport = useCallback(async () => {
    if (!markdown) return;
    
    setExporting(true);
    
    try {
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analisis-estrategico-${new Date().toISOString().split('T')[0]}.md`;
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
  }, [markdown, addNotification]);

  const handleClear = useCallback(() => {
    setTranscript("");
    setMarkdown(null);
    setError(null);
    setUploadedFile(null);
    setActiveTab('overview');
    addNotification('Formulario limpiado', 'info');
  }, [addNotification]);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`p-4 rounded-lg shadow-lg border max-w-sm ${
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
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
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
        </motion.div>

        {/* Input Section */}
        {!markdown && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
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
          </motion.div>
        )}

        {/* Results Section */}
        <AnimatePresence>
          {markdown && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full"
            >
              <ReportContent
                markdown={markdown}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onCopy={copyToClipboard}
                onExport={handleExport}
                onNewAnalysis={handleClear}
              />
            </motion.div>
          )}
        </AnimatePresence>

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
