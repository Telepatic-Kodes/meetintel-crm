'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface TabItem {
  key: string;
  label: string;
  icon?: LucideIcon;
  badge?: string;
  content: ReactNode;
  disabled?: boolean;
}

interface AnimatedTabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function AnimatedTabs({
  items,
  defaultValue,
  value,
  onValueChange,
  className = ''
}: AnimatedTabsProps) {
  return (
    <Tabs 
      defaultValue={defaultValue} 
      value={value} 
      onValueChange={onValueChange}
      className={`w-full ${className}`}
    >
      <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 p-1 bg-gray-100 rounded-lg">
        {items.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.1, 
              duration: 0.5,
              ease: "easeOut"
            }}
            className="w-full"
          >
            <TabsTrigger 
              value={item.key} 
              disabled={item.disabled}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {item.icon && (
                <item.icon className="w-4 h-4" />
              )}
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {item.badge}
                </Badge>
              )}
            </TabsTrigger>
          </motion.div>
        ))}
      </TabsList>

      {items.map((item) => (
        <TabsContent key={item.key} value={item.key} className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.4,
                ease: "easeInOut"
              }}
              className="w-full"
            >
              {item.content}
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      ))}
    </Tabs>
  );
}

// Componente especializado para tabs de reportes
export function ReportTabs({
  items,
  defaultValue,
  value,
  onValueChange,
  className = ''
}: AnimatedTabsProps) {
  return (
    <div className={`w-full ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Análisis Estratégico
          </h2>
          <div className="text-sm text-gray-500">
            {items.length} secciones disponibles
          </div>
        </div>
      </motion.div>

      <AnimatedTabs
        items={items}
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
      />
    </div>
  );
}
