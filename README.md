# Plataforma Hospitalaria Integral — Centro Médico Puerta de Hierro (Tepic)

Plataforma médica, quirúrgica y administrativa de alta especialidad diseñada para el **Hospital Puerta de Hierro (Sede Tepic, Nayarit)**. Cumple con los estándares más rigurosos de la legislación sanitaria en México (**NOM-024-SSA3-2012**, **NOM-004-SSA3-2012**, **NOM-016-SSA3-2012**, **NOM-007-SSA3-2011** y **LFPDPPP**).

Implementa la interfaz visual **Neo-Tactile Glassmorphism** (basada fielmente en la guía de diseño proporcionada `diseño color hospital puerta de hierro.jpg`), incorporando el logotipo oficial del hospital, botones convexos táctiles de doble estado (`Defart` y `active` con resplandor azul cobalto y neón `#2563EB` / `#06B6D4`), controles 3D, chat médico interno estilo WhatsApp en tiempo real, somatometría con cálculo de IMC y soporte multi-dispositivo (Smartphones, iPad/Tabletas, Laptops y PCs).

---

## 🏥 Estructura de Módulos Clínicos y Administrativos

1. **Tablero General (Dashboard) y KPIs en Vivo**:
   - Ocupación porcentual de camas en tiempo real por áreas críticas (UCI, UCIN, Terapia Intermedia, Pisos y Suites).
   - Pacientes activos en Triage Manchester estratificados por color de urgencia.
   - Recaudación del turno y desglose de convenios con aseguradoras (GNP, AXA, MetLife).
   - Alertas críticas automáticas de laboratorio, farmacia y CEYE.

2. **Triage y Urgencias 24/7 (Sistema Manchester)**:
   - Estratificación en 5 niveles: Rojo (0 min), Naranja (<10 min), Amarillo (<60 min), Verde (<120 min), Azul (<240 min).
   - Monitor de signos vitales completos: Presión Arterial, FC, FR, Temp, SpO2, Glucosa y Escala EVA del dolor.
   - **Somatometría Avanzada**: Captura de **Peso (kg)** y **Talla (cm)** con **Cálculo Automático de IMC (Índice de Masa Corporal)** y semáforo nutricional.
   - Impresión oficial de Ficha de Triage en PDF y asignación inmediata a cama de choque o consultorios.

3. **Admisión Hospitalaria Programada (Cirugías y Electivas)**:
   - Agenda para pacientes programados a cirugías electivas, procedimientos en sala de hemodinamia e internamiento planeado.
   - Verificación estricta de protocolo preoperatorio: Valoración Preanestésica, Horas de Ayuno y Consentimiento Informado Firmado.
   - Asignación previa de cama y quirófano (Quirófano 1 Cardiovascular, Quirófano 2 Laparoscopía, Quirófano 3 Tococirugía, Hemodinamia).
   - Flujo de estados: *Programado ➔ En Preoperatorio ➔ En Quirófano ➔ En Cama*.

4. **Consultorios y Expediente Clínico Electrónico (NOM-004 y NOM-024)**:
   - Elaboración de Notas de Evolución, Historias Clínicas, Notas Preoperatorias y de Egreso.
   - Catálogo de diagnósticos con codificación internacional **CIE-10**.
   - Prescripción médica electrónica con firma digital criptográfica SHA-256 inmutable.
   - Generador e impresión de **Receta Médica Oficial en PDF** con membrete institucional, cédula profesional y código de validación.

5. **Hospitalización y Censo Dinámico de Camas**:
   - Mapa interactivo de camas estilo Neo-Tactile Glass: UCI Adultos, UCIN Neonatal, Terapia Intermedia, Pisos 2/3 y Suites Puerta de Hierro.
   - Estados clínicos: *Disponible, Ocupada, Limpieza/Desinfección Terminal, Aislamiento Infeccioso*.
   - Ficha del paciente en cama: Médico tratante, enfermera responsable, tipo de dieta y alertas de alergias destacadas.
   - Asignación, alta médica y protocolo de desinfección hospitalaria.

6. **Farmacia Hospitalaria y Control COFEPRIS**:
   - Catálogo clasificado por Fracciones COFEPRIS (Fracc. I y II: Psicotrópicos y Narcóticos; Fracc. IV: Antibióticos; Fracc. V y VI: Venta libre).
   - Trazabilidad de lotes, fechas de caducidad con alertas de vencimiento y control de cadena de frío (refrigeradores 2-8°C).
   - Surtimiento de recetas intrahospitalarias y exportación de kardex a Excel (.xlsx).

7. **Laboratorio Clínico 24 Horas (NOM-007-SSA3-2011)**:
   - Hematología, Bioquímica 36 elementos, Tiempos de coagulación, Troponinas de alta sensibilidad y Gasometría.
   - Detección visual automática de **Valores Críticos**.
   - Validación analítica firmada por el Químico Fármaco Biólogo (QFB) con Cédula Profesional y reporte en PDF oficial.

8. **Rayos X, Imagenología y Hemodinamia**:
   - Modalidades de Puerta de Hierro Tepic: Tomografía Computarizada Multicorte (TC), Resonancia Magnética (RM), Rayos X Digitales, Ultrasonido y Angiografía Coronaria.
   - **Visor Médico Interactivo**: Controles táctiles de Zoom, Nivel de Brillo, Contraste e Inversión de Negativo Radiológico.
   - Dictamen e informe estructurado con firma digital del Médico Radiólogo.

9. **Caja, Cobro y Convenios Aseguradoras**:
   - Cuentas maestras con cargos automáticos consolidados.
   - Manejo de seguros de Gastos Médicos Mayores (GNP, MetLife, AXA, Seguros Monterrey, Inbursa) con desglose de coaseguro y deducible.
   - Múltiples formas de pago (Efectivo, Tarjeta, Transferencia SPEI, Aseguradora Directo).
   - Corte de caja diario y por turnos con balance automático y exportación a Excel (.xlsx).

10. **CEYE (Central de Equipos y Esterilización - NOM-016-SSA3-2012)**:
    - Control de autoclaves de vapor (Matachana 134°C) y gas plasma (Sterrad).
    - Registro de variables críticas: Temperatura (°C), Presión (PSI) y Tiempo de meseta.
    - Validación de indicadores químicos Clase 5 e incubación de indicadores biológicos.
    - Trazabilidad de cajas quirúrgicas y entrega formal a quirófanos.

11. **Chat Médico Interno en Tiempo Real (Estilo WhatsApp)**:
    - Interfaz idéntica a WhatsApp adaptada al ámbito intrahospitalario.
    - Canales de guardia departamentales (`#Urgencias-Triage`, `#Quirófanos-CEYE`, `#Hospitalización`, `#Laboratorio`, `#Guardia-Médica`).
    - Conversaciones 1 a 1 entre médicos y enfermería.
    - Confirmación de lectura con doble palomita azul (`✓✓`), estados en línea, adjuntos médicos y notas de voz simuladas.

12. **Personal, Turnos y Bitácora de Auditoría NOM-024**:
    - Gestión por turnos: Matutino (07:00-15:00), Vespertino (14:30-21:30), Nocturno A/B (21:00-08:00) y Jornada Especial.
    - Matriz de permisos RBAC según el perfil (Director, Urgenciólogo, Especialista, Enfermera Jefa, QFB, Radiólogo, Farmacéutico, CEYE, Caja).
    - **Bitácora Inmutable NOM-024**: Registro indeleble de cada acceso, modificación o exportación con timestamp UTC, usuario, rol, IP y hash criptográfico SHA-256.

---

## ⚖️ Cumplimiento Normativo Sanitario Mexicano

| Norma Oficial Mexicana | Ámbito de Aplicación | Implementación en la Plataforma |
| :--- | :--- | :--- |
| **NOM-024-SSA3-2012** | Sistemas de Información de Registro Electrónico para la Salud (SIRES) | Bitácora de auditoría inmutable forense (*audit trail*), firmas criptográficas SHA-256, autenticación RBAC y módulos de interoperabilidad HL7. |
| **NOM-004-SSA3-2012** | Del Expediente Clínico Electrónico | Notas estructuradas (subjetivo, objetivo, análisis, CIE-10, pronóstico), somatometría (peso/talla/IMC), alerta de alergias y recetas médicas con cédula profesional. |
| **NOM-016-SSA3-2012** | Infraestructura hospitalaria y áreas quirúrgicas | Módulo de CEYE con control de ciclos de autoclaves, indicadores biológicos y dotación estéril a quirófanos. |
| **NOM-007-SSA3-2011** | Organización y funcionamiento de laboratorios | Validación por QFB, rangos de referencia, alertas de valores críticos e informes acreditados. |
| **LFPDPPP** | Datos Personales Sensibles de Salud | Aislamiento estricto de base de datos con **Row Level Security (RLS)**, cifrado en reposo (AES-256) y en tránsito (TLS 1.3). |

---

## 🚀 Puesta en Marcha y Ejecución Local

### 1. Requisitos Previos
- Node.js versión 20 o superior.
- NPM versión 10 o superior.
- Docker y Docker Compose (opcional para despliegue contenerizado).

### 2. Instalación de Dependencias
```bash
npm install
```

### 3. Ejecución en Modo Desarrollo
```bash
npm run dev
```
Abre tu navegador en `http://localhost:5173`.

### 4. Compilación para Producción
```bash
npm run build
```

---

## 🐳 Despliegue con Docker y Docker Compose

Para levantar la plataforma completa (Frontend PWA en Nginx + Microservicio Python auxiliar):

```bash
docker-compose up --build -d
```
- **Plataforma Web Hospitalaria**: `http://localhost:8080`
- **Microservicio Python (Normativas y HL7)**: `http://localhost:8000`

---

## ☁️ Configuración de la Base de Datos en Supabase

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Ve al **SQL Editor** en tu consola de Supabase.
3. Copia y ejecuta el script de migración ubicado en:
   `supabase/migrations/20260908000000_hospital_puerta_de_hierro_schema.sql`
   *(Este script crea todas las tablas, tipos enumerados, triggers de inmutabilidad NOM-024 y políticas RLS)*.
4. En tu archivo `.env`, configura tus claves:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
   ```

---

## 📱 Experiencia Multi-dispositivo (PWA)

- **iPad y Tabletas**: Interfaz táctil optimizada para rondas médicas y enfermería en estaciones de hospitalización.
- **Teléfonos Inteligentes (iPhone / Android)**: Barra de navegación inferior rápida y chat médico a pantalla completa. Puede instalarse directamente en la pantalla de inicio como App nativa mediante el botón "Agregar a pantalla de inicio" gracias al `manifest.json`.
- **Laptops y Estaciones de Escritorio**: Panel de control expandido con analítica completa y visor de rayos X de alta resolución.
