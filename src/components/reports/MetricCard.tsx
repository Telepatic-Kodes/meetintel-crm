'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LucideIcon } from 'lucide-react';
import { AnimatedText } from './AnimatedText';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  progress?: number;
  delay?: number;
  className?: string;
  variant?: 'default' | 'gradient' | 'minimal';
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  progress,
  delay = 0,
  className = '',
  variant = 'default'
}: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50';
      case 'down': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  const cardVariants = {
    default: 'bg-white border border-gray-200 shadow-sm hover:shadow-md',
    gradient: 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-sm hover:shadow-lg',
    minimal: 'bg-gray-50 border border-gray-100 shadow-none hover:shadow-sm'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay, 
        duration: 0.6, 
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`${cardVariants[variant]} ${className}`}
    >
      <Card className="h-full border-0 shadow-none bg-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              {Icon && <Icon className="w-4 h-4" />}
              {title}
            </CardTitle>
            {trend && trendValue && (
              <Badge variant="secondary" className={`text-xs ${getTrendColor()}`}>
                {getTrendIcon()} {trendValue}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <AnimatedText 
            variant="scaleIn" 
            delay={delay + 0.2}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            {value}
          </AnimatedText>
          
          {subtitle && (
            <AnimatedText 
              variant="fadeIn" 
              delay={delay + 0.4}
              className="text-sm text-gray-500"
            >
              {subtitle}
            </AnimatedText>
          )}
          
          {progress !== undefined && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.6 }}
              className="mt-4"
            >
              <Progress 
                value={progress} 
                className="h-2"
              />
              <div className="text-xs text-gray-500 mt-1">
                {progress}% completado
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente especializado para KPIs
export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  delay = 0
}: Omit<MetricCardProps, 'progress' | 'variant'>) {
  return (
    <MetricCard
      title={title}
      value={value}
      subtitle={subtitle}
      icon={Icon}
      trend={trend}
      trendValue={trendValue}
      delay={delay}
      variant="gradient"
      className="rounded-xl"
    />
  );
}

// Componente para métricas de progreso
export function ProgressCard({
  title,
  value,
  progress,
  subtitle,
  icon: Icon,
  delay = 0
}: Omit<MetricCardProps, 'trend' | 'trendValue' | 'variant'>) {
  return (
    <MetricCard
      title={title}
      value={value}
      subtitle={subtitle}
      icon={Icon}
      progress={progress}
      delay={delay}
      variant="minimal"
      className="rounded-lg"
    />
  );
}
