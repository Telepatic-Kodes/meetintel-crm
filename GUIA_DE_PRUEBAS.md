# 🧪 Guía de Pruebas - MeetingIntel Agent World-Class

## 🚀 **Funcionalidades a Probar**

### **📍 Acceso a la Aplicación**
- **URL Local**: `http://localhost:3003`
- **URL Producción**: `https://meetintel-crm-1.onrender.com`

---

## **🎨 1. Sistema de Temas y Personalización**

### **Probar Configuración:**
1. **Abrir Configuración**: Haz clic en el ícono de configuración (⚙️) en el header
2. **Cambiar Tema**:
   - ☀️ **Light**: Tema claro
   - 🌙 **Dark**: Tema oscuro  
   - 🔄 **Auto**: Sigue preferencias del sistema
3. **Cambiar Color de Acento**:
   - 🔵 Blue (por defecto)
   - 🟣 Purple
   - 🟢 Green
   - 🟠 Orange
   - 🔴 Red
4. **Cambiar Tamaño de Fuente**:
   - Small, Medium, Large
5. **Modo Compacto**: Activar/desactivar
6. **Animaciones**: Habilitar/deshabilitar

### **Funciones Avanzadas:**
- **Exportar Configuración**: Descargar archivo JSON
- **Importar Configuración**: Subir archivo JSON
- **Restablecer**: Volver a configuración por defecto

---

## **⌨️ 2. Atajos de Teclado**

### **Atajos Disponibles:**
- **Ctrl+N**: Nuevo análisis
- **Ctrl+C**: Copiar resultado actual
- **Ctrl+E**: Exportar resultado actual
- **Ctrl+Tab**: Siguiente pestaña
- **Ctrl+Shift+Tab**: Pestaña anterior
- **Ctrl+K**: Enfocar búsqueda
- **Ctrl+B**: Abrir/cerrar Dashboard
- **?**: Mostrar ayuda con atajos

### **Cómo Probar:**
1. Presiona **?** para ver todos los atajos disponibles
2. Prueba cada atajo para verificar funcionalidad
3. Los atajos funcionan cuando hay contenido disponible

---

## **📊 3. Dashboard de Métricas**

### **Acceder al Dashboard:**
1. Haz clic en el ícono de dashboard (📊) en el header
2. O usa **Ctrl+B**

### **Métricas Disponibles:**
- **Sesiones Totales**: Número de sesiones en las últimas 24 horas
- **Análisis Completados**: Número de análisis realizados
- **Tiempo Promedio**: Tiempo promedio por análisis
- **Secciones Más Utilizadas**: Ranking de popularidad

### **Funcionalidades:**
- **Actualización en Tiempo Real**: Se actualiza cada 5 segundos
- **Cerrar**: Botón X o clic fuera del modal

---

## **🔍 4. Sistema de Búsqueda**

### **Probar Búsqueda:**
1. Usa el campo de búsqueda en el header
2. O presiona **Ctrl+K** para enfocar
3. Escribe términos de búsqueda
4. La búsqueda funciona en tiempo real

---

## **📝 5. Análisis de Transcripciones**

### **Probar Análisis:**
1. **Subir Archivo**:
   - Arrastra un archivo .docx, .txt, .md
   - O haz clic para seleccionar
2. **Pegar Texto**:
   - Pega transcripción directamente en el textarea
3. **Generar Análisis**:
   - Haz clic en "Generar Análisis Estratégico"
   - Observa las animaciones de carga

### **Secciones Disponibles:**
- **Resumen Ejecutivo**: Vista general
- **ICE Scoring**: Impact, Confidence, Ease
- **ROI Analysis**: Análisis de retorno de inversión
- **Strategic Insights**: Insights estratégicos
- **Follow-up Plan**: Plan de seguimiento
- **Energy Dashboard**: Dashboard de energía
- **Reporte Consolidado**: Vista consolidada
- **Deck Comercial**: Presentación comercial

---

## **🔔 6. Sistema de Notificaciones**

### **Tipos de Notificaciones:**
- **✅ Success**: Operaciones exitosas (verde)
- **⚠️ Warning**: Advertencias (amarillo)
- **ℹ️ Info**: Información general (azul)

### **Probar Notificaciones:**
1. Sube un archivo → Notificación de éxito
2. Genera un análisis → Notificación de completado
3. Copia contenido → Notificación de copiado
4. Exporta archivo → Notificación de exportado

---

## **📱 7. Responsive Design**

### **Probar en Diferentes Tamaños:**
1. **Desktop**: 1280x720 o mayor
2. **Tablet**: 768x1024
3. **Mobile**: 375x667

### **Elementos Responsive:**
- Header se adapta al tamaño
- Tabs se vuelven scrollables en móvil
- Formularios se ajustan
- Dashboard se adapta

---

## **⚡ 8. Rendimiento y Optimizaciones**

### **Verificar Rendimiento:**
1. **Carga Inicial**: Debe ser rápida (< 3 segundos)
2. **Navegación**: Transiciones suaves
3. **Animaciones**: Fluidas sin lag
4. **Memoria**: Sin memory leaks

---

## **🎯 9. Funcionalidades Avanzadas**

### **Auto-generación de Secciones:**
- Al cambiar de pestaña, se genera automáticamente
- Indicadores de estado (loading, completado, pendiente)

### **Exportación/Importación:**
- **Exportar**: Descargar análisis en Markdown
- **Copiar**: Copiar al portapapeles
- **Configuración**: Exportar/importar configuraciones

### **Persistencia:**
- Configuraciones se guardan en localStorage
- Analytics se persisten localmente
- Preferencias se mantienen entre sesiones

---

## **🧪 Checklist de Pruebas**

### **Funcionalidades Básicas:**
- [ ] Carga de la aplicación
- [ ] Formulario de transcripción
- [ ] Subida de archivos
- [ ] Generación de análisis
- [ ] Navegación entre pestañas

### **Funcionalidades Avanzadas:**
- [ ] Sistema de temas
- [ ] Dashboard de métricas
- [ ] Panel de configuración
- [ ] Atajos de teclado
- [ ] Sistema de búsqueda
- [ ] Notificaciones
- [ ] Exportación/importación

### **UX/UI:**
- [ ] Diseño responsive
- [ ] Animaciones suaves
- [ ] Indicadores de estado
- [ ] Feedback visual
- [ ] Navegación intuitiva

### **Rendimiento:**
- [ ] Carga rápida
- [ ] Transiciones fluidas
- [ ] Sin errores en consola
- [ ] Optimización de memoria

---

## **🐛 Reportar Problemas**

Si encuentras algún problema:
1. **Captura de pantalla** del error
2. **Pasos para reproducir**
3. **Navegador y versión**
4. **Consola del navegador** (F12 → Console)

---

## **🎉 ¡Disfruta Probando!**

La aplicación ahora tiene un nivel **world-class** con características **enterprise**. ¡Explora todas las funcionalidades y disfruta de la experiencia mejorada!
