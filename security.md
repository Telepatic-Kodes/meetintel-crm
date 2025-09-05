# 🔒 Security Configuration - MeetingIntel Agent

## Variables de Entorno Requeridas

### 1. **OPENAI_API_KEY** (Requerido)
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```
- **Descripción**: API key de OpenAI para el procesamiento de IA
- **Seguridad**: Nunca commitees esta clave al repositorio
- **Ubicación**: `.env.local` (archivo local, no versionado)

### 2. **NODE_ENV** (Opcional)
```bash
NODE_ENV=development  # o 'production'
```
- **Descripción**: Entorno de ejecución
- **Valores**: `development`, `production`

## Configuración de Seguridad

### Rate Limiting
- **Límite**: 10 requests por minuto por IP
- **Ventana**: 60 segundos
- **Almacenamiento**: Memoria (en producción usar Redis)

### Validación de Archivos
- **Tamaño máximo**: 10MB
- **Formatos permitidos**: `.txt`, `.md`, `.docx`
- **Longitud de transcripción**: Máximo 100,000 caracteres

### Logging y Monitoreo
- **Logs estructurados**: Timestamp, IP, método, endpoint, status
- **Errores**: Logging detallado de errores de API
- **Producción**: Integración con servicios de logging externos

## Checklist de Seguridad

### ✅ Implementado
- [x] Rate limiting por IP
- [x] Validación de tamaño de archivos
- [x] Validación de longitud de transcripción
- [x] Logging estructurado
- [x] Manejo de errores mejorado
- [x] Validación de API key

### 🔄 Pendiente (Recomendaciones)
- [ ] Autenticación de usuarios
- [ ] Cifrado de datos sensibles
- [ ] Backup automático
- [ ] Monitoreo de performance
- [ ] Alertas de seguridad
- [ ] CORS configuration
- [ ] HTTPS enforcement

## Instrucciones de Instalación

1. **Copiar archivo de configuración**:
   ```bash
   cp env-template.txt .env.local
   ```

2. **Editar variables de entorno**:
   ```bash
   # Editar .env.local con tu API key real
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Verificar configuración**:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Error: "Configuración del servidor incompleta"
- **Causa**: `OPENAI_API_KEY` no está configurada
- **Solución**: Agregar la API key a `.env.local`

### Error: "Demasiadas solicitudes"
- **Causa**: Rate limit excedido
- **Solución**: Esperar 1 minuto o implementar autenticación

### Error: "Archivo demasiado grande"
- **Causa**: Archivo > 10MB
- **Solución**: Reducir tamaño del archivo o dividir en partes

## Monitoreo en Producción

### Métricas Clave
- Requests por minuto
- Tiempo de respuesta promedio
- Tasa de errores
- Uso de memoria
- Llamadas a OpenAI API

### Alertas Recomendadas
- Rate limit excedido
- Errores de API > 5%
- Tiempo de respuesta > 30s
- Uso de memoria > 80%
