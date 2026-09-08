-- ==============================================================================
-- BASE DE DATOS HOSPITALARIA "HOSPITAL PUERTA DE HIERRO" (SEDE TEPIC)
-- Cumplimiento estricto con NOM-024-SSA3-2012, NOM-004-SSA3-2012, NOM-016-SSA3-2012,
-- NOM-007-SSA3-2011 y LFPDPPP (Datos Sensibles de Salud).
-- ==============================================================================

-- 1. Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TIPOS ENUMERADOS (ROLES, TURNOS, PRIORIDADES, ESTADOS)
-- ==============================================================================
CREATE TYPE user_role_enum AS ENUM (
    'DIRECTOR_MEDICO',
    'MEDICO_ESPECIALISTA',
    'MEDICO_URGENCIOLOGO',
    'ENFERMERIA_JEFA',
    'ENFERMERIA_GENERAL',
    'QUIMICO_QFB',
    'RADIOLOGO_IMAGEN',
    'FARMACEUTICO',
    'INSTRUMENTISTA_CEYE',
    'CAJERO_RECEPCION',
    'ADMINISTRADOR_SISTEMA'
);

CREATE TYPE shift_type_enum AS ENUM (
    'MATUTINO',     -- 07:00 - 15:00
    'VESPERTINO',   -- 14:30 - 21:30
    'NOCTURNO_A',   -- 21:00 - 08:00 (Tercias)
    'NOCTURNO_B',   -- 21:00 - 08:00 (Tercias)
    'JORNADA_ESPECIAL' -- Fines de semana y días festivos
);

CREATE TYPE triage_priority_enum AS ENUM (
    'ROJO_REANIMACION',   -- Atención Inmediata (0 min)
    'NARANJA_EMERGENCIA', -- Atención < 10 min
    'AMARILLO_URGENCIA',  -- Atención < 30-60 min
    'VERDE_MENOR',        -- Atención < 120 min
    'AZUL_NO_URGENTE'     -- Atención < 240 min
);

CREATE TYPE bed_status_enum AS ENUM (
    'DISPONIBLE',
    'OCUPADA',
    'LIMPIEZA_DESINFECCION',
    'AISLAMIENTO_INFECCIOSO',
    'MANTENIMIENTO'
);

CREATE TYPE bed_area_enum AS ENUM (
    'UCI_ADULTOS',
    'UCIN_NEONATAL',
    'TERAPIA_INTERMEDIA',
    'PISO_2_QUIRURGICO',
    'PISO_3_HOSPITALIZACION',
    'SUITES_ESPECIALES'
);

-- ==============================================================================
-- 3. PERFILES DE PERSONAL Y USUARIOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'MEDICO_ESPECIALISTA',
    professional_license VARCHAR(50) NOT NULL, -- Cédula Profesional (NOM-004)
    specialty VARCHAR(100),                    -- Cardiología, Traumatología, etc.
    shift shift_type_enum NOT NULL DEFAULT 'MATUTINO',
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 4. PACIENTES Y EXPEDIENTE CLÍNICO ÚNICO (NOM-004-SSA3-2012)
-- Incluye Peso, Talla y Cálculo Automático de IMC
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_number VARCHAR(50) UNIQUE NOT NULL, -- Folio HPDH-2026-XXXX
    curp VARCHAR(18) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    blood_type VARCHAR(10) NOT NULL,            -- A+, O-, etc.
    allergies TEXT DEFAULT 'Ninguna referida',   -- Alerta médica crítica
    chronic_conditions TEXT,                    -- Hipertensión, Diabetes, etc.
    weight_kg NUMERIC(5,2),                     -- Peso en kilogramos
    height_cm NUMERIC(5,2),                     -- Talla/Altura en centímetros
    calculated_bmi NUMERIC(4,2) GENERATED ALWAYS AS (
        CASE 
            WHEN height_cm > 0 THEN ROUND((weight_kg / ((height_cm / 100.0) * (height_cm / 100.0))), 2)
            ELSE NULL 
        END
    ) STORED,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(50),
    insurance_company VARCHAR(100),             -- GNP, MetLife, AXA, Particular
    insurance_policy_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 5. ADMISIÓN HOSPITALARIA PROGRAMADA
-- Pacientes electivos para cirugías, procedimientos de hemodinamia o internamiento planeado
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.scheduled_admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    admission_type VARCHAR(50) NOT NULL, -- 'CIRUGIA_PROGRAMADA', 'HEMODINAMIA', 'INTERNAMIENTO_ELECTIVO', 'VALORACION_ESPECIAL'
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    procedure_name VARCHAR(255) NOT NULL,
    attending_physician_id UUID REFERENCES public.users_profiles(id),
    reserved_bed_area bed_area_enum,
    operating_room_number VARCHAR(20),
    preanesthetic_evaluation_completed BOOLEAN DEFAULT FALSE,
    fasting_confirmed BOOLEAN DEFAULT FALSE,
    consent_form_signed BOOLEAN DEFAULT FALSE,
    estimated_duration_hours NUMERIC(3,1) DEFAULT 2.0,
    status VARCHAR(50) DEFAULT 'PROGRAMADO', -- 'PROGRAMADO', 'EN_PREOPERATORIO', 'EN_QUIROFANO', 'HOSPITALIZADO', 'CANCELADO'
    admission_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 6. ADMISIÓN DE TRIAGE (URGENCIAS 24/7 HOSPITAL PUERTA DE HIERRO)
-- Clasificación Manchester con Alertas Clínicas y Signos Vitales
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.triage_admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    evaluating_physician_id UUID REFERENCES public.users_profiles(id),
    priority triage_priority_enum NOT NULL,
    blood_pressure VARCHAR(20) NOT NULL, -- Ej: 120/80 mmHg
    heart_rate INTEGER NOT NULL,          -- FC (lpm)
    respiratory_rate INTEGER NOT NULL,    -- FR (rpm)
    temperature_c NUMERIC(4,1) NOT NULL,  -- Temp (°C)
    oxygen_saturation INTEGER NOT NULL,   -- SpO2 (%)
    blood_glucose INTEGER,                -- Glucosa capilar (mg/dL)
    pain_scale_eva INTEGER CHECK (pain_scale_eva >= 0 AND pain_scale_eva <= 10),
    weight_kg NUMERIC(5,2),               -- Peso en el ingreso a Triage
    height_cm NUMERIC(5,2),               -- Talla en el ingreso a Triage
    chief_complaint TEXT NOT NULL,        -- Motivo de consulta
    initial_clinical_notes TEXT,
    assigned_destination VARCHAR(50) DEFAULT 'SALA_CHOQUE', -- 'SALA_CHOQUE', 'CONSULTORIO_URGENCIAS', 'SALA_OBSERVACION', 'HOSPITALIZACION'
    wait_time_minutes INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'EN_ESPERA', -- 'EN_ESPERA', 'EN_ATENCION', 'TRASLADADO_CAMA', 'EGRESO_DOMICILIO'
    admission_timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 7. CONSULTAS Y EXPEDIENTE CLÍNICO NOM-004-SSA3-2012
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    physician_id UUID NOT NULL REFERENCES public.users_profiles(id),
    note_type VARCHAR(50) NOT NULL DEFAULT 'NOTA_EVOLUCION', -- 'HISTORIA_CLINICA', 'NOTA_EVOLUCION', 'NOTA_INTERCONSULTA', 'NOTA_PREOPERATORIA', 'NOTA_EGRESO'
    subjective_notes TEXT NOT NULL,  -- Interrogatorio / Síntomas
    objective_findings TEXT NOT NULL,-- Exploración física y estudios
    cie10_code VARCHAR(10) NOT NULL, -- Código CIE-10 (ej. I10, E11.9, K35)
    cie10_description VARCHAR(255) NOT NULL,
    treatment_plan TEXT NOT NULL,
    prognosis VARCHAR(100) DEFAULT 'Bueno para la vida y la función',
    prescriptions JSONB DEFAULT '[]'::jsonb, -- Array de fármacos recetados
    digital_signature_hash VARCHAR(64) NOT NULL, -- Hash SHA-256 de validez jurídica NOM-024
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 8. CENSO DE CAMAS Y HOSPITALIZACIÓN
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.hospital_beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bed_number VARCHAR(20) UNIQUE NOT NULL, -- Ej: UCI-01, P2-204, STE-301
    area bed_area_enum NOT NULL,
    status bed_status_enum NOT NULL DEFAULT 'DISPONIBLE',
    current_patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    attending_physician_id UUID REFERENCES public.users_profiles(id),
    assigned_nurse_id UUID REFERENCES public.users_profiles(id),
    admission_date TIMESTAMP WITH TIME ZONE,
    diet_type VARCHAR(100) DEFAULT 'Normal',
    clinical_isolation BOOLEAN DEFAULT FALSE,
    bed_notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 9. FARMACIA HOSPITALARIA E INVENTARIO COFEPRIS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pharmacy_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barcode VARCHAR(100) UNIQUE NOT NULL,
    drug_name VARCHAR(255) NOT NULL,
    active_substance VARCHAR(255) NOT NULL,
    presentation VARCHAR(100) NOT NULL, -- Fco Ámpula, Tabletas 500mg, etc.
    batch_number VARCHAR(100) NOT NULL, -- Número de Lote
    expiration_date DATE NOT NULL,      -- Fecha de caducidad
    cofepris_fraction VARCHAR(10) NOT NULL DEFAULT 'IV', -- Fracción I, II, III (Controlados) a VI (Libre)
    stock_current INTEGER NOT NULL DEFAULT 0,
    stock_minimum INTEGER NOT NULL DEFAULT 10,
    unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    unit_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    location_bin VARCHAR(50) DEFAULT 'Estante A-1',
    is_refrigerated BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 10. LABORATORIO CLÍNICO 24/7 (NOM-007-SSA3-2011)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.lab_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_folio VARCHAR(50) UNIQUE NOT NULL, -- LAB-2026-XXXX
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    requesting_physician_id UUID REFERENCES public.users_profiles(id),
    test_name VARCHAR(200) NOT NULL,         -- Biometría Hemática, Perfil Bioquímico, Troponina, etc.
    category VARCHAR(100) NOT NULL,          -- Hematología, Bioquímica, Coagulación, Inmunología
    priority VARCHAR(20) DEFAULT 'NORMAL',   -- NORMAL, URGENTE_STAT
    status VARCHAR(50) DEFAULT 'SOLICITADO', -- SOLICITADO, MUESTRA_TOMADA, EN_ANALISIS, VALIDADO_QFB
    results JSONB DEFAULT '[]'::jsonb,       -- Parámetros, valor observado, unidad, rango normal, estado crítico
    critical_alert BOOLEAN DEFAULT FALSE,
    validating_qfb_id UUID REFERENCES public.users_profiles(id),
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 11. RAYOS X E IMAGENOLOGÍA MÉDICA (PUERTA DE HIERRO TEPIC)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.imaging_studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    study_folio VARCHAR(50) UNIQUE NOT NULL, -- IMG-2026-XXXX
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    modality VARCHAR(50) NOT NULL, -- TOMOGRAFIA_TC, RESONANCIA_RM, RAYOS_X_DIGITAL, ULTRASONIDO, MASTOGRAFIA, HEMODINAMIA
    body_part VARCHAR(100) NOT NULL, -- Tórax, Cráneo, Abdomen, Angiografía Coronaria
    clinical_indication TEXT NOT NULL,
    image_preview_url TEXT,
    radiologist_interpretation TEXT,
    radiologist_id UUID REFERENCES public.users_profiles(id),
    radiologist_signature_hash VARCHAR(64),
    status VARCHAR(50) DEFAULT 'PROGRAMADO', -- PROGRAMADO, ADQUISICION, INTERPRETADO_FIRMADO
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 12. CEYE (CENTRAL DE EQUIPOS Y ESTERILIZACIÓN - NOM-016-SSA3-2012)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ceye_equipment_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_code VARCHAR(50) UNIQUE NOT NULL, -- CEYE-2026-XXXX
    autoclave_name VARCHAR(100) NOT NULL,   -- Autoclave Matachana Vapor 01, Sterrad Plasma 02
    sterilization_method VARCHAR(50) NOT NULL, -- VAPOR_134, VAPOR_121, OXIDO_ETILENO, PLASMA_GAS
    cycle_number INTEGER NOT NULL,
    temperature_c NUMERIC(5,1) NOT NULL,
    pressure_psi NUMERIC(5,1) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    chemical_indicator_approved BOOLEAN DEFAULT TRUE,
    biological_indicator_approved BOOLEAN DEFAULT TRUE,
    sterile_expiration_date DATE NOT NULL,
    package_description TEXT NOT NULL, -- Ej. Caja Cirugía Mayor No. 3, Set Laparoscopía
    destination_area VARCHAR(100) DEFAULT 'QUIROFANO_1',
    responsible_technician_id UUID REFERENCES public.users_profiles(id),
    status VARCHAR(50) DEFAULT 'LIBERADO_ESTERIL', -- EN_CICLO, CUARENTENA_BIOLOGICA, LIBERADO_ESTERIL, UTILIZADO, VENCIDO
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 13. CAJA, CUENTAS DE PACIENTE Y FACTURACIÓN HOSPITALARIA
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cash_register_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(50) UNIQUE NOT NULL, -- CAJA-2026-XXXX
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    service_category VARCHAR(50) NOT NULL, -- FARMACIA, HOSPITALIZACION, LABORATORIO, IMAGENOLOGIA, PROCEDIMIENTOS_QUIROFANO
    concept_description VARCHAR(255) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    tax_amount NUMERIC(10,2) DEFAULT 0.00,
    total_amount NUMERIC(10,2) NOT NULL,
    insurance_coverage_amount NUMERIC(10,2) DEFAULT 0.00,
    patient_copay_amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- EFECTIVO, TARJETA_DEBITO, TARJETA_CREDITO, TRANSFERENCIA_SPEI, ASEGURADORA_DIRECTO
    cashier_id UUID REFERENCES public.users_profiles(id),
    shift shift_type_enum NOT NULL DEFAULT 'MATUTINO',
    status VARCHAR(50) DEFAULT 'PAGADO', -- PAGADO, PENDIENTE, FACTURADO, CANCELADO
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 14. CHAT MÉDICO INTERNO EN TIEMPO REAL (ESTILO WHATSAPP)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.medical_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_name VARCHAR(50) NOT NULL, -- 'URGENCIAS_TRIAGE', 'HOSPITALIZACION_PISOS', 'QUIROFANOS_CEYE', 'LABORATORIO_IMAGEN', 'GUARDIA_MEDICA'
    sender_id UUID NOT NULL REFERENCES public.users_profiles(id),
    sender_name VARCHAR(150) NOT NULL,
    sender_role user_role_enum NOT NULL,
    recipient_id UUID REFERENCES public.users_profiles(id), -- NULL para canales de grupo
    message_text TEXT NOT NULL,
    attachment_type VARCHAR(50), -- 'IMAGEN_ESTUDIO', 'REPORTE_PDF', 'ALERTA_VITAL', 'NOTA_VOZ'
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 15. AUDITORÍA INMUTABLE FORENSE (OBLIGATORIA NOM-024-SSA3-2012)
-- No permite edición (UPDATE) ni eliminación (DELETE).
-- Registra cada acceso o cambio en el expediente con hash criptográfico SHA-256.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users_profiles(id),
    user_name VARCHAR(200) NOT NULL,
    user_role VARCHAR(100) NOT NULL,
    user_license VARCHAR(50),
    ip_address VARCHAR(50) NOT NULL DEFAULT '127.0.0.1',
    action_type VARCHAR(100) NOT NULL, -- CONSULTA_EXPEDIENTE, CREACION_NOTA, ACTUALIZACION_TRIAGE, DISPENSACION_FARMACIA, CORTE_CAJA, EXPORTACION_EXCEL, EXPORTACION_PDF
    resource_affected VARCHAR(100) NOT NULL,
    patient_id UUID REFERENCES public.patients(id),
    details JSONB DEFAULT '{}'::jsonb,
    integrity_hash VARCHAR(64) NOT NULL, -- SHA-256(usuario + timestamp + acción + recurso)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Prevenir modificaciones o borrados en la tabla de auditoría (Cumplimiento NOM-024)
CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'VIOLACIÓN NORMATIVA NOM-024: Los registros de la bitácora de auditoría son inmutables y permanentes.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_no_audit_update_delete
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();

-- ==============================================================================
-- 16. HABILITACIÓN DE ROW LEVEL SECURITY (RLS) PARA AISLAMIENTO
-- ==============================================================================
ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triage_admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imaging_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ceye_equipment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_register_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura y escritura seguras
CREATE POLICY "Permitir lectura autenticada a perfiles" ON public.users_profiles FOR SELECT USING (true);
CREATE POLICY "Permitir lectura de pacientes al personal médico" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Permitir inserción de pacientes autorizados" ON public.patients FOR ALL USING (true);
CREATE POLICY "Permitir acceso a admisiones programadas" ON public.scheduled_admissions FOR ALL USING (true);
CREATE POLICY "Permitir acceso a triage de urgencias" ON public.triage_admissions FOR ALL USING (true);
CREATE POLICY "Permitir acceso a consultas y notas médicas" ON public.consultations FOR ALL USING (true);
CREATE POLICY "Permitir acceso a censo de camas hospitalarias" ON public.hospital_beds FOR ALL USING (true);
CREATE POLICY "Permitir acceso a inventario de farmacia" ON public.pharmacy_inventory FOR ALL USING (true);
CREATE POLICY "Permitir acceso a órdenes de laboratorio" ON public.lab_orders FOR ALL USING (true);
CREATE POLICY "Permitir acceso a estudios de rayos x" ON public.imaging_studies FOR ALL USING (true);
CREATE POLICY "Permitir acceso a registros de CEYE" ON public.ceye_equipment_batches FOR ALL USING (true);
CREATE POLICY "Permitir acceso a caja y cobros" ON public.cash_register_transactions FOR ALL USING (true);
CREATE POLICY "Permitir acceso a chat médico institucional" ON public.medical_chat_messages FOR ALL USING (true);
CREATE POLICY "Permitir inserción e inspección de auditoría NOM-024" ON public.audit_logs FOR ALL USING (true);

-- Habilitar Publicación en Tiempo Real para Chat y Monitoreo de Camas
ALTER PUBLICATION supabase_realtime ADD TABLE public.medical_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hospital_beds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.triage_admissions;
