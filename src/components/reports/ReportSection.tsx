'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { AnimatedText, AnimatedTitle, AnimatedSubtitle } from './AnimatedText';
import { ReactNode } from 'react';

interface ReportSectionProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
  delay?: number;
  variant?: 'default' | 'highlighted' | 'minimal';
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function ReportSection({
  title,
  subtitle,
  icon: Icon,
  children,
  delay = 0,
  variant = 'default',
  badge,
  badgeVariant = 'default'
}: ReportSectionProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'highlighted':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg';
      case 'minimal':
        return 'bg-gray-50 border-gray-100 shadow-sm';
      default:
        return 'bg-white border-gray-200 shadow-sm';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay, 
        duration: 0.8, 
        ease: "easeOut",
        type: "spring",
        stiffness: 80
      }}
      className="w-full"
    >
      <Card className={`${getVariantStyles()} border-0 shadow-none`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: delay + 0.3, 
                    duration: 0.6,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="p-2 bg-blue-100 rounded-lg"
                >
                  <Icon className="w-5 h-5 text-blue-600" />
                </motion.div>
              )}
              <div>
                <AnimatedTitle delay={delay + 0.2}>
                  {title}
                </AnimatedTitle>
                {subtitle && (
                  <AnimatedSubtitle delay={delay + 0.4}>
                    {subtitle}
                  </AnimatedSubtitle>
                )}
              </div>
            </div>
            {badge && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: delay + 0.6, 
                  duration: 0.4,
                  type: "spring",
                  stiffness: 300
                }}
              >
                <Badge variant={badgeVariant} className="text-xs">
                  {badge}
                </Badge>
              </motion.div>
            )}
          </div>
        </CardHeader>
        
        <Separator className="mb-6" />
        
        <CardContent className="pt-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.8, duration: 0.6 }}
          >
            {children}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente para listas animadas
export function AnimatedList({
  items,
  delay = 0,
  className = ''
}: {
  items: string[];
  delay?: number;
  className?: string;
}) {
  return (
    <motion.ul 
      className={`space-y-3 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay + 0.5, duration: 0.6 }}
    >
      {items.map((item, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            delay: delay + 0.7 + (index * 0.1), 
            duration: 0.5,
            ease: "easeOut"
          }}
          className="flex items-start gap-3 text-gray-700"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: delay + 0.8 + (index * 0.1), 
              duration: 0.3,
              type: "spring",
              stiffness: 300
            }}
            className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"
          />
          <span className="leading-relaxed">{item}</span>
        </motion.li>
      ))}
    </motion.ul>
  );
}

// Componente para timeline animado
export function AnimatedTimeline({
  items,
  delay = 0
}: {
  items: Array<{
    title: string;
    description: string;
    date?: string;
    status?: 'completed' | 'pending' | 'in-progress';
  }>;
  delay?: number;
}) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay + 0.5, duration: 0.6 }}
    >
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
      
      <div className="space-y-6">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              delay: delay + 0.7 + (index * 0.2), 
              duration: 0.6,
              ease: "easeOut"
            }}
            className="relative flex gap-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: delay + 0.9 + (index * 0.2), 
                duration: 0.4,
                type: "spring",
                stiffness: 300
              }}
              className={`w-8 h-8 rounded-full ${getStatusColor(item.status)} flex items-center justify-center flex-shrink-0 relative z-10`}
            >
              <div className="w-3 h-3 bg-white rounded-full" />
            </motion.div>
            
            <div className="flex-1 pb-6">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                {item.date && (
                  <Badge variant="outline" className="text-xs">
                    {item.date}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
