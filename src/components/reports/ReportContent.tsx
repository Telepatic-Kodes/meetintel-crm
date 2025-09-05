'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ReportHeader, 
  ReportTabs, 
  ReportSection, 
  AnimatedText,
  MetricCard,
  KPICard,
  ProgressCard,
  AnimatedList,
  AnimatedTimeline
} from './index';
import { 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Lightbulb, 
  Calendar, 
  Zap, 
  BarChart3,
  Presentation
} from 'lucide-react';

interface ReportContentProps {
  markdown: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCopy: () => void;
  onExport: () => void;
  onNewAnalysis: () => void;
}

export function ReportContent({
  markdown,
  activeTab,
  onTabChange,
  onCopy,
  onExport,
  onNewAnalysis
}: ReportContentProps) {
  // Configuración de las pestañas
  const tabs = [
    {
      key: 'overview',
      label: 'Resumen Ejecutivo',
      icon: FileText,
      content: (
        <ReportSection
          title="Resumen Ejecutivo"
          subtitle="Análisis completo de la reunión"
          icon={FileText}
          variant="highlighted"
          delay={0.2}
        >
          <AnimatedText variant="fadeIn" delay={0.4}>
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            </div>
          </AnimatedText>
        </ReportSection>
      )
    },
    {
      key: 'ice',
      label: 'ICE Scoring',
      icon: TrendingUp,
      content: (
        <ReportSection
          title="ICE Scoring"
          subtitle="Impact, Confidence, Ease Analysis"
          icon={TrendingUp}
          delay={0.3}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <KPICard
              title="Impact"
              value="8.5"
              subtitle="Alto impacto en objetivos"
              icon={TrendingUp}
              trend="up"
              trendValue="+12%"
              delay={0.5}
            />
            <KPICard
              title="Confidence"
              value="7.2"
              subtitle="Confianza moderada"
              icon={TrendingUp}
              trend="up"
              trendValue="+5%"
              delay={0.6}
            />
            <KPICard
              title="Ease"
              value="6.8"
              subtitle="Implementación media"
              icon={TrendingUp}
              trend="neutral"
              trendValue="0%"
              delay={0.7}
            />
          </div>
          
          <AnimatedText variant="fadeIn" delay={0.8}>
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            </div>
          </AnimatedText>
        </ReportSection>
      )
    },
    {
      key: 'roi',
      label: 'ROI Analysis',
      icon: DollarSign,
      content: (
        <ReportSection
          title="Análisis ROI"
          subtitle="Retorno de Inversión y Métricas Financieras"
          icon={DollarSign}
          delay={0.4}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="ROI Proyectado"
              value="245%"
              subtitle="En 12 meses"
              icon={DollarSign}
              trend="up"
              trendValue="+45%"
              delay={0.6}
            />
            <MetricCard
              title="Payback Period"
              value="8.2"
              subtitle="Meses"
              icon={Calendar}
              trend="down"
              trendValue="-2.1m"
              delay={0.7}
            />
            <MetricCard
              title="NPV"
              value="$2.4M"
              subtitle="Valor presente neto"
              icon={DollarSign}
              trend="up"
              trendValue="+18%"
              delay={0.8}
            />
            <MetricCard
              title="IRR"
              value="28.5%"
              subtitle="Tasa interna de retorno"
              icon={TrendingUp}
              trend="up"
              trendValue="+3.2%"
              delay={0.9}
            />
          </div>
          
          <AnimatedText variant="fadeIn" delay={1.0}>
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            </div>
          </AnimatedText>
        </ReportSection>
      )
    },
    {
      key: 'insights',
      label: 'Strategic Insights',
      icon: Lightbulb,
      content: (
        <ReportSection
          title="Insights Estratégicos"
          subtitle="Oportunidades y Recomendaciones Clave"
          icon={Lightbulb}
          delay={0.5}
        >
          <AnimatedText variant="fadeIn" delay={0.7}>
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            </div>
          </AnimatedText>
        </ReportSection>
      )
    },
    {
      key: 'followup',
      label: 'Follow-up Plan',
      icon: Calendar,
      content: (
        <ReportSection
          title="Plan de Seguimiento"
          subtitle="Próximos Pasos y Cronograma"
          icon={Calendar}
          delay={0.6}
        >
          <AnimatedTimeline
            items={[
              {
                title: "Revisión de Propuesta",
                description: "Adaptar presentación del programa de eventos para incluir modelo de patrocinio único",
                date: "2025-09-12",
                status: "pending"
              },
              {
                title: "Ajuste de Detalles",
                description: "Modificar detalles del evento para asegurar consistencia en la propuesta",
                date: "2025-09-15",
                status: "pending"
              },
              {
                title: "Implementación de Herramientas",
                description: "Integrar tema de e-tool en la propuesta del evento",
                date: "2025-09-20",
                status: "pending"
              }
            ]}
            delay={0.8}
          />
          
          <AnimatedText variant="fadeIn" delay={1.2}>
            <div className="prose prose-lg max-w-none mt-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            </div>
          </AnimatedText>
        </ReportSection>
      )
    },
    {
      key: 'energy',
      label: 'Energy Dashboard',
      icon: Zap,
      content: (
        <ReportSection
          title="Dashboard de Energía"
          subtitle="Métricas de Engagement y Participación"
          icon={Zap}
          delay={0.7}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <ProgressCard
              title="Engagement Level"
              value="Alto"
              subtitle="Participación activa"
              icon={Zap}
              progress={85}
              delay={0.9}
            />
            <ProgressCard
              title="Decision Making"
              value="Efectivo"
              subtitle="Decisiones concretas"
              icon={BarChart3}
              progress={78}
              delay={1.0}
            />
            <ProgressCard
              title="Action Items"
              value="3"
              subtitle="Tareas asignadas"
              icon={Calendar}
              progress={60}
              delay={1.1}
            />
          </div>
          
          <AnimatedText variant="fadeIn" delay={1.3}>
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            </div>
          </AnimatedText>
        </ReportSection>
      )
    },
    {
      key: 'consolidated',
      label: 'Reporte Consolidado',
      icon: BarChart3,
      content: (
        <ReportSection
          title="Reporte Consolidado"
          subtitle="Vista General del Análisis Completo"
          icon={BarChart3}
          delay={0.8}
        >
          <AnimatedText variant="fadeIn" delay={1.0}>
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            </div>
          </AnimatedText>
        </ReportSection>
      )
    },
    {
      key: 'deck',
      label: 'Deck Comercial',
      icon: Presentation,
      content: (
        <ReportSection
          title="Deck Comercial"
          subtitle="Presentación Ejecutiva con Estilo McKinsey"
          icon={Presentation}
          variant="highlighted"
          delay={0.9}
        >
          <AnimatedText variant="fadeIn" delay={1.1}>
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            </div>
          </AnimatedText>
        </ReportSection>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header del Reporte */}
      <ReportHeader
        title="Análisis Estratégico"
        subtitle="Resultados del análisis"
        date="5 de Septiembre, 2025"
        participants={["Tomás Schiappacasse", "Constanza Vásquez"]}
        duration="45 minutos"
        status="completed"
        onCopy={onCopy}
        onExport={onExport}
        onNewAnalysis={onNewAnalysis}
        delay={0.1}
      />

      {/* Tabs de Navegación */}
      <ReportTabs
        items={tabs}
        value={activeTab}
        onValueChange={onTabChange}
      />
    </div>
  );
}
