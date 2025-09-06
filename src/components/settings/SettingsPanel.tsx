'use client';

import { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { config, updateConfig, resetToDefaults } = useTheme();
  const [activeTab, setActiveTab] = useState<'appearance' | 'behavior' | 'advanced'>('appearance');

  if (!isOpen) return null;

  const tabs = [
    { id: 'appearance', label: 'Apariencia', icon: '🎨' },
    { id: 'behavior', label: 'Comportamiento', icon: '⚙️' },
    { id: 'advanced', label: 'Avanzado', icon: '🔧' }
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Configuración</h2>
              <p className="text-sm text-gray-500">Personaliza tu experiencia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Theme */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tema
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['light', 'dark', 'auto'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => updateConfig({ theme })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        config.theme === theme
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">
                          {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '🔄'}
                        </div>
                        <div className="text-sm font-medium capitalize">{theme}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Color de Acento
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {(['blue', 'purple', 'green', 'orange', 'red'] as const).map((color) => (
                    <button
                      key={color}
                      onClick={() => updateConfig({ accentColor: color })}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        config.accentColor === color
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        backgroundColor: {
                          blue: '#3B82F6',
                          purple: '#8B5CF6',
                          green: '#10B981',
                          orange: '#F59E0B',
                          red: '#EF4444'
                        }[color]
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tamaño de Fuente
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateConfig({ fontSize: size })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        config.fontSize === size
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`mb-2 ${
                          size === 'small' ? 'text-sm' : size === 'medium' ? 'text-base' : 'text-lg'
                        }`}>
                          Aa
                        </div>
                        <div className="text-sm font-medium capitalize">{size}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'behavior' && (
            <div className="space-y-6">
              {/* Animations */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Animaciones
                  </label>
                  <p className="text-sm text-gray-500">Habilita transiciones suaves</p>
                </div>
                <button
                  onClick={() => updateConfig({ animations: !config.animations })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.animations ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.animations ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Compact Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Modo Compacto
                  </label>
                  <p className="text-sm text-gray-500">Reduce el espaciado para más contenido</p>
                </div>
                <button
                  onClick={() => updateConfig({ compactMode: !config.compactMode })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.compactMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.compactMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              {/* Reset to Defaults */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                      Restablecer Configuración
                    </h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      Esto restablecerá todas las configuraciones a sus valores predeterminados.
                    </p>
                    <button
                      onClick={resetToDefaults}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
                    >
                      Restablecer Todo
                    </button>
                  </div>
                </div>
              </div>

              {/* Export/Import Settings */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Configuración</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const dataStr = JSON.stringify(config, null, 2);
                      const dataBlob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'meetintel-settings.json';
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Exportar Configuración
                  </button>
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            try {
                              const config = JSON.parse(e.target?.result as string);
                              updateConfig(config);
                            } catch (error) {
                              console.error('Error importing config:', error);
                            }
                          };
                          reader.readAsText(file);
                        }
                      };
                      input.click();
                    }}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    Importar Configuración
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
