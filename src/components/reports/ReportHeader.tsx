'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Copy, 
  Download, 
  FileText, 
  Calendar, 
  Users, 
  Clock,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { AnimatedText, AnimatedTitle } from './AnimatedText';

interface ReportHeaderProps {
  title: string;
  subtitle?: string;
  date?: string;
  participants?: string[];
  duration?: string;
  status?: 'completed' | 'in-progress' | 'pending';
  onCopy?: () => void;
  onExport?: () => void;
  onNewAnalysis?: () => void;
  delay?: number;
}

export function ReportHeader({
  title,
  subtitle,
  date,
  participants = [],
  duration,
  status = 'completed',
  onCopy,
  onExport,
  onNewAnalysis,
  delay = 0
}: ReportHeaderProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return { 
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          text: 'Completado'
        };
      case 'in-progress':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock,
          text: 'En Progreso'
        };
      case 'pending':
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          text: 'Pendiente'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay, 
        duration: 0.8, 
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      }}
      className="w-full"
    >
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-lg">
        <CardContent className="p-8">
          {/* Header Principal */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: delay + 0.3, 
                    duration: 0.6,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="p-3 bg-white rounded-xl shadow-sm"
                >
                  <FileText className="w-6 h-6 text-blue-600" />
                </motion.div>
                
                <div className="flex-1">
                  <AnimatedTitle delay={delay + 0.2}>
                    {title}
                  </AnimatedTitle>
                  
                  {subtitle && (
                    <AnimatedText 
                      variant="fadeIn" 
                      delay={delay + 0.4}
                      className="text-lg text-gray-600 mt-2"
                    >
                      {subtitle}
                    </AnimatedText>
                  )}
                </div>
              </div>

              {/* Badges de Estado */}
              <div className="flex items-center gap-3 mb-4">
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
                  <Badge className={`${statusConfig.color} border`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.text}
                  </Badge>
                </motion.div>

                {date && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      delay: delay + 0.7, 
                      duration: 0.4,
                      type: "spring",
                      stiffness: 300
                    }}
                  >
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {date}
                    </Badge>
                  </motion.div>
                )}

                {duration && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      delay: delay + 0.8, 
                      duration: 0.4,
                      type: "spring",
                      stiffness: 300
                    }}
                  >
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {duration}
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Botones de Acción */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.5, duration: 0.6 }}
              className="flex gap-2"
            >
              {onNewAnalysis && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onNewAnalysis}
                  className="bg-white hover:bg-gray-50"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Nuevo Análisis
                </Button>
              )}
              
              {onCopy && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onCopy}
                  className="bg-white hover:bg-gray-50"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              )}
              
              {onExport && (
                <Button 
                  size="sm"
                  onClick={onExport}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              )}
            </motion.div>
          </div>

          {/* Información de Participantes */}
          {participants.length > 0 && (
            <>
              <Separator className="my-6" />
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay + 0.9, duration: 0.6 }}
                className="flex items-center gap-4"
              >
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Participantes:</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {participants.map((participant, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        delay: delay + 1.0 + (index * 0.1), 
                        duration: 0.4,
                        type: "spring",
                        stiffness: 300
                      }}
                    >
                      <Badge variant="secondary" className="text-xs">
                        {participant}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
