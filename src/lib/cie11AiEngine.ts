// ==============================================================================
// MOTOR CLÍNICO CIE-11 (OMS) & DR. AI COPILOT FARMACOLÓGICO PUERTA DE HIERRO
// Clasificación Internacional de Enfermedades 11.ª Revisión (WHO ICD-11)
// Cumplimiento con NOM-004-SSA3-2012, NOM-024-SSA3-2012 y GPC CENETEC
// ==============================================================================

import { Cie11Disease, AiDrugRecommendation } from '../types/hospital';

export const CIE11_MASTER_CATALOG: Cie11Disease[] = [
  // 1. CARDIOLOGÍA Y SISTEMA CIRCULATORIO (Capítulo 11)
  {
    code: 'BA00',
    title: 'Hipertensión arterial esencial primaria',
    cie10Equivalent: 'I10',
    chapter: '11 - Enfermedades del sistema circulatorio',
    clinicalCategory: 'Cardiología / Medicina Interna',
    suggestedDrugs: [
      {
        id: 'drg-ba00-1',
        drugName: 'Losartán Potásico',
        activeSubstance: 'Losartán',
        dosage: '50 mg',
        frequency: 'Cada 24 horas (Mañanas)',
        duration: 'Continuo / Permanente',
        instructions: 'Vía oral. Tomar en ayunas con medio vaso de agua. Monitorear cifras tensionales en bitácora.',
        line: 'PRIMERA_LINEA',
        rationale: 'ARA-II de elección para control tensional con protección nefrocardiovascular y mínima incidencia de tos.',
        warnings: ['Monitorear potasio sérico y creatinina periódicamente. Contraindicado en embarazo.'],
      },
      {
        id: 'drg-ba00-2',
        drugName: 'Amlodipino',
        activeSubstance: 'Amlodipino',
        dosage: '5 mg',
        frequency: 'Cada 24 horas',
        duration: 'Continuo',
        instructions: 'Vía oral. Puede combinarse con ARA-II en hipertensión grado 2 según Guía ESC/AHA.',
        line: 'PRIMERA_LINEA',
        rationale: 'Calcioantagonista dihidropiridínico con potente efecto vasodilatador periférico.',
        warnings: ['Vigilar posible edema maleolar vespertino.'],
      },
      {
        id: 'drg-ba00-3',
        drugName: 'Hidroclorotiazida',
        activeSubstance: 'Hidroclorotiazida',
        dosage: '12.5 mg - 25 mg',
        frequency: 'Cada 24 horas (Mañanas)',
        duration: 'Continuo',
        instructions: 'Vía oral con el desayuno para evitar nicturia.',
        line: 'SEGUNDA_LINEA',
        rationale: 'Diurético tiazídico coadyuvante sinérgico para optimización del volumen intravascular.',
        warnings: ['Evitar en pacientes con gota o hiperuricemia severa.'],
      }
    ],
    contraindicatedDrugs: ['Pseudoefedrina', 'Fenilefrina', 'AINEs uso crónico'],
    suggestedLabs: ['Química Sanguínea de 6 Elementos (Glucosa, Urea, Creatinina)', 'Electrolitos Séricos (Na, K, Cl)', 'Perfil de Lípidos Completo', 'Examen General de Orina (Microalbuminuria)'],
    suggestedImaging: ['Electrocardiograma de 12 derivaciones en reposo', 'Ecocardiograma Transtorácico (si hay hipertrofia ventricular izquierda)'],
    generalCare: [
      'Dieta DASH estricta: ingesta de sodio < 2 g/día (evitar embutidos y alimentos procesados).',
      'Actividad aeróbica moderada: 150 minutos a la semana (caminata rápida, natación).',
      'Bitácora matutina y vespertina de cifras tensionales (objetivo < 130/80 mmHg).'
    ],
    clinicalPearls: 'En pacientes diabéticos o con proteinuria, iniciar siempre con un IECA o ARA-II por su comprobado efecto nefroprotector.'
  },
  {
    code: 'BA41.0',
    title: 'Infarto agudo de miocardio transmural con elevación del ST (IAMCEST)',
    cie10Equivalent: 'I21.0',
    chapter: '11 - Enfermedades del sistema circulatorio',
    clinicalCategory: 'Cardiología / Urgencias Críticas',
    suggestedDrugs: [
      {
        id: 'drg-ba41-1',
        drugName: 'Aspirina Protect (Ácido Acetilsalicílico)',
        activeSubstance: 'Ácido Acetilsalicílico',
        dosage: '100 mg (Dosis de carga 300 mg masticada si es agudo)',
        frequency: 'Cada 24 horas',
        duration: 'Permanente',
        instructions: 'Vía oral después de los alimentos. Masticar dosis de carga inicial ante sospecha aguda.',
        line: 'PRIMERA_LINEA',
        rationale: 'Inhibición irreversible de ciclooxigenasa plaquetaria (TXA2) para prevenir retrombosis coronaria.',
        warnings: ['Vigilar datos de sangrado gastrointestinal o alergia a salicilatos.'],
      },
      {
        id: 'drg-ba41-2',
        drugName: 'Atorvastatina de Alta Intensidad',
        activeSubstance: 'Atorvastatina',
        dosage: '80 mg',
        frequency: 'Cada 24 horas (Noches)',
        duration: 'Continuo',
        instructions: 'Vía oral antes de dormir. Estabilizador de placa ateromatosa.',
        line: 'PRIMERA_LINEA',
        rationale: 'Estatina a dosis máxima para estabilización endotelial y reducción drástica de eventos MACE.',
        warnings: ['Control periódico de enzimas hepáticas (TGO/TGP) y CPK.'],
      },
      {
        id: 'drg-ba41-3',
        drugName: 'Clopidogrel',
        activeSubstance: 'Clopidogrel',
        dosage: '75 mg (Dosis de carga 300-600 mg)',
        frequency: 'Cada 24 horas',
        duration: '12 meses (DAPT tras angioplastia con stent)',
        instructions: 'Vía oral diaria sin suspender sin indicación cardiológica expresa.',
        line: 'PRIMERA_LINEA',
        rationale: 'Antiagregante antagonista del receptor P2Y12 plaquetario.',
        warnings: ['Riesgo incrementado de sangrado con cirugías mayores electivas.'],
      },
      {
        id: 'drg-ba41-4',
        drugName: 'Metoprolol Succinato',
        activeSubstance: 'Metoprolol',
        dosage: '50 mg',
        frequency: 'Cada 24 horas',
        duration: 'Continuo',
        instructions: 'Vía oral. Iniciar una vez que el paciente se encuentre hemodinámicamente estable sin falla cardíaca aguda.',
        line: 'SEGUNDA_LINEA',
        rationale: 'Betabloqueador cardioselectivo que reduce el consumo miocárdico de O2 y previene arritmias ventriculares.',
        warnings: ['Contraindicado en bradicardia < 50 lpm, bloqueo AV > 1er grado y asma severa.'],
      }
    ],
    contraindicatedDrugs: ['AINEs no esteroideos (Ibuprofeno, Diclofenaco)', 'Inhibidores de PDE-5 (Sildenafil) si se usan nitratos'],
    suggestedLabs: ['Troponina I de alta sensibilidad (curva seriada a las 0, 3 y 6 horas)', 'CK-MB masa', 'Biometría Hemática Completa', 'Tiempos de Coagulación (TP, TTPa, INR)'],
    suggestedImaging: ['Electrocardiograma de 12 derivaciones inmediato (< 10 min)', 'Angiografía Coronaria y Cateterismo (Sala de Hemodinamia)', 'Ecocardiograma Doppler Color'],
    generalCare: [
      'Reposo absoluto en cama monitorizada de Terapia Intensiva / Hemodinamia.',
      'Oxígeno suplementario si SpO2 < 90%.',
      'Acceso venoso periférico permeable de grueso calibre (18G).'
    ],
    clinicalPearls: 'Código Infarto activo: tiempo puerta-balón en hemodinamia debe ser menor a 90 minutos para salvamento miocárdico.'
  },
  {
    code: 'BD10',
    title: 'Insuficiencia cardíaca congestiva crónica con fracción de eyección reducida',
    cie10Equivalent: 'I50.9',
    chapter: '11 - Enfermedades del sistema circulatorio',
    clinicalCategory: 'Cardiología / Falla Cardíaca',
    suggestedDrugs: [
      {
        id: 'drg-bd10-1',
        drugName: 'Dapagliflozina',
        activeSubstance: 'Dapagliflozina',
        dosage: '10 mg',
        frequency: 'Cada 24 horas',
        duration: 'Continuo',
        instructions: 'Vía oral por la mañana. Mantener buena hidratación.',
        line: 'PRIMERA_LINEA',
        rationale: 'iSGLT2 que reduce significativamente la mortalidad cardiovascular y hospitalizaciones por falla cardíaca.',
      },
      {
        id: 'drg-bd10-2',
        drugName: 'Espironolactona',
        activeSubstance: 'Espironolactona',
        dosage: '25 mg',
        frequency: 'Cada 24 horas',
        duration: 'Continuo',
        instructions: 'Vía oral matutina. Antagonista del receptor de mineralocorticoides.',
        line: 'PRIMERA_LINEA',
        rationale: 'Inhibe el remodelado cardíaco y la fibrosis miocárdica.',
        warnings: ['Monitoreo estricto de potasio sérico. Suspender si K > 5.5 mEq/L.'],
      },
      {
        id: 'drg-bd10-3',
        drugName: 'Furosemida',
        activeSubstance: 'Furosemida',
        dosage: '40 mg',
        frequency: 'Cada 24 horas o cada 12 horas si hay congestión',
        duration: 'Según balance hídrico',
        instructions: 'Vía oral matutina. Ajustar dosis según peso diario y signos de congestión.',
        line: 'COADYUVANTE',
        rationale: 'Diurético de asa para descongestión pulmonar y periférica.',
      }
    ],
    suggestedLabs: ['Péptido Natriurético Cerebral (NT-proBNP)', 'Electrolitos Séricos con Potasio y Magnesio', 'Creatinina y Tasa de Filtración Glomerular'],
    suggestedImaging: ['Ecocardiograma Transtorácico con FEVI y deformación miocárdica (Strain)', 'Radiografía de Tórax PA (índice cardiotorácico y redistribución vascular)'],
    generalCare: [
      'Restricción hídrica estricta a 1.5 litros/día máximo.',
      'Pesarse diariamente al levantarse en ayunas. Avisar si gana > 2 kg en 3 días.',
      'Vacunación anual contra Influenza y Neumococo.'
    ],
  },

  // 2. ENDOCRINOLOGÍA Y METABOLISMO (Capítulo 05)
  {
    code: '5A11',
    title: 'Diabetes mellitus tipo 2 sin complicaciones agudas',
    cie10Equivalent: 'E11.9',
    chapter: '05 - Enfermedades endocrinas, nutricionales o metabólicas',
    clinicalCategory: 'Endocrinología / Medicina Interna',
    suggestedDrugs: [
      {
        id: 'drg-5a11-1',
        drugName: 'Metformina de Liberación Prolongada',
        activeSubstance: 'Metformina',
        dosage: '850 mg - 1000 mg',
        frequency: 'Cada 12 horas o cada 24 horas',
        duration: 'Continuo',
        instructions: 'Vía oral con la cena o comidas principales para minimizar eventos gastrointestinales.',
        line: 'PRIMERA_LINEA',
        rationale: 'Fármaco pilar sensibilizador a la insulina sin riesgo de hipoglucemia.',
        warnings: ['Contraindicado si TFG < 30 ml/min o hipoxia tisular por riesgo de acidosis láctica.'],
        requiresRenalAdjustment: true,
      },
      {
        id: 'drg-5a11-2',
        drugName: 'Empagliflozina',
        activeSubstance: 'Empagliflozina',
        dosage: '10 mg o 25 mg',
        frequency: 'Cada 24 horas',
        duration: 'Continuo',
        instructions: 'Vía oral matutina.',
        line: 'PRIMERA_LINEA',
        rationale: 'iSGLT2 con beneficio demostrado en protección renal y reducción de eventos cardiovasculares.',
        warnings: ['Higiene urogenital estricta para evitar infecciones micóticas.'],
      },
      {
        id: 'drg-5a11-3',
        drugName: 'Insulina Glargina U-100',
        activeSubstance: 'Insulina Glargina',
        dosage: '10 UI (o 0.2 UI/kg/día)',
        frequency: 'Cada 24 horas (Misma hora de la noche)',
        duration: 'Ajuste según metas glucémicas',
        instructions: 'Subcutánea en abdomen, muslo o brazo. Rotar sitios de inyección.',
        line: 'SEGUNDA_LINEA',
        rationale: 'Análogo basal para pacientes con HbA1c > 9% o falla a terapia oral múltiple.',
        warnings: ['Enseñar al paciente manejo de hipoglucemia con la regla de los 15 g.'],
      }
    ],
    contraindicatedDrugs: ['Metformina en falla renal aguda o choque'],
    suggestedLabs: ['Hemoglobina Glucosilada (HbA1c)', 'Química Sanguínea de 6 Elementos', 'Microalbuminuria en orina de 24h o índice Alb/Creatinina', 'Perfil Lipídico'],
    suggestedImaging: ['Fondo de ojo por Oftalmología (búsqueda de retinopatía diabética)'],
    generalCare: [
      'Plan nutricional bajo en azúcares simples e índice glucémico controlado.',
      'Revisión diaria e inspección minuciosa de pies (búsqueda de lesiones, maceración o úlceras).',
      'Meta de HbA1c < 7.0% en adultos sin fragilidad.'
    ],
    clinicalPearls: 'Si la HbA1c es mayor a 8.5% al diagnóstico, considerar inicio temprano de terapia combinada con iSGLT2 o análogos GLP-1.'
  },

  // 3. ENFERMEDADES INFECCIOSAS Y TROPICALES (Capítulo 01)
  {
    code: '1B10',
    title: 'Dengue con signos de alarma y manifestaciones hemorrágicas',
    cie10Equivalent: 'A97.1',
    chapter: '01 - Ciertas enfermedades infecciosas o parasitarias',
    clinicalCategory: 'Infectología / Urgencias Epidemiológicas',
    suggestedDrugs: [
      {
        id: 'drg-1b10-1',
        drugName: 'Paracetamol (Acetaminofén)',
        activeSubstance: 'Paracetamol',
        dosage: '500 mg - 1 g',
        frequency: 'Cada 6 a 8 horas (Máximo 3 g/día)',
        duration: 'Durante fase febril (3-5 días)',
        instructions: 'Vía oral. Exclusivamente para control de fiebre y mialgias intensas.',
        line: 'PRIMERA_LINEA',
        rationale: 'Único antipirético seguro y permitido según las Guías de Manejo Clínico de Dengue (OPS/OMS).',
        warnings: ['No exceder 3 g al día para evitar toxicidad hepática.'],
      },
      {
        id: 'drg-1b10-2',
        drugName: 'Solución Hartmann o Solución Fisiológica 0.9%',
        activeSubstance: 'Cristaloides Isotónicos',
        dosage: '5 - 7 ml/kg/hora según protocolo de reanimación hídrica',
        frequency: 'Infusión continua IV',
        duration: 'Primeras 24 - 48 horas críticas',
        instructions: 'Intravenoso estricto con balance de líquidos horario y monitoreo de uresis.',
        line: 'PRIMERA_LINEA',
        rationale: 'Compensar la extravasación plasmática capilar y evitar el choque por dengue.',
      }
    ],
    contraindicatedDrugs: [
      'Ácido Acetilsalicílico (Aspirina)', 
      'Ibuprofeno', 
      'Ketorolaco', 
      'Naproxeno', 
      'Diclofenaco', 
      'Metamizol (Dipirona)', 
      'Corticosteroides sistémicos',
      'Anticoagulantes orales'
    ],
    suggestedLabs: ['Biometría Hemática diaria seriada (Hematocrito y Plaquetas)', 'Antígeno NS1 / Anticuerpos IgM e IgG Dengue', 'Pruebas de Función Hepática (PFH)', 'Tiempos de Coagulación'],
    suggestedImaging: ['Ultrasonido Abdominal Focalizado (rastreo de líquido libre en fosa hepatorrenal o engrosamiento de pared vesicular)', 'Radiografía de Tórax (descarte de derrame pleural)'],
    generalCare: [
      '¡CONTRAINDICACIÓN ABSOLUTA DE AINES Y ASPIRINA! Pueden precipitar hemorragia masiva y síndrome de Reye.',
      'Monitoreo estrecho de signos de alarma: dolor abdominal intenso, vómito persistente, sangrado de mucosas, letargo o caída brusca de plaquetas con aumento del hematocrito.',
      'Uso de pabellón y repelente para cortar la cadena de transmisión vectorial.'
    ],
    clinicalPearls: 'El aumento progresivo del hematocrito refleja fuga capilar y precede al choque hipovolémico por dengue; la hidratación endovenosa oportuna salva vidas.'
  },

  // 4. NEUMOLOGÍA Y RESPIRATORIO (Capítulo 12)
  {
    code: 'CA40.0',
    title: 'Neumonía bacteriana adquirida en la comunidad (NAC)',
    cie10Equivalent: 'J15.9',
    chapter: '12 - Enfermedades del sistema respiratorio',
    clinicalCategory: 'Neumología / Medicina Interna',
    suggestedDrugs: [
      {
        id: 'drg-ca40-1',
        drugName: 'Ceftriaxona Sódica',
        activeSubstance: 'Ceftriaxona',
        dosage: '1 g - 2 g',
        frequency: 'Cada 24 horas',
        duration: '7 a 10 días',
        instructions: 'Intravenosa diluida en 100 ml de solución fisiológica en 30 minutos.',
        line: 'PRIMERA_LINEA',
        rationale: 'Cefalosporina de 3ra generación con excelente cobertura sobre Streptococcus pneumoniae y bacilos gramnegativos.',
        warnings: ['Contraindicado en pacientes con alergia grave a betalactámicos o cefalosporinas.'],
      },
      {
        id: 'drg-ca40-2',
        drugName: 'Levofloxacino',
        activeSubstance: 'Levofloxacino',
        dosage: '750 mg',
        frequency: 'Cada 24 horas',
        duration: '5 a 7 días',
        instructions: 'Vía oral o intravenosa.',
        line: 'PRIMERA_LINEA',
        rationale: 'Quinolona respiratoria de amplio espectro, ideal en pacientes con alergia a penicilinas o sospecha de gérmenes atípicos (Mycoplasma/Legionella).',
        warnings: ['Monitoreo de intervalo QTc en el EKG y evitar en deportistas por riesgo de tendinitis aquilea.'],
      },
      {
        id: 'drg-ca40-3',
        drugName: 'Claritromicina',
        activeSubstance: 'Claritromicina',
        dosage: '500 mg',
        frequency: 'Cada 12 horas',
        duration: '7 días',
        instructions: 'Vía oral con alimentos.',
        line: 'COADYUVANTE',
        rationale: 'Macrólido para terapia combinada de cobertura atípica en neumonía moderada a severa.',
      }
    ],
    contraindicatedDrugs: ['Ceftriaxona o Amoxicilina si hay antecedente de anafilaxia a Penicilinas'],
    suggestedLabs: ['Biometría Hemática con diferencial (Leucocitosis / Neutrofilia)', 'Proteína C Reactiva cuantitativa (PCR)', 'Procalcitonina sérica', 'Hemocultivos seriados (x2)', 'Gasometría Arterial si SpO2 < 92%'],
    suggestedImaging: ['Radiografía de Tórax PA y Lateral (búsqueda de consolidación lobar o broncograma aéreo)', 'Tomografía Computarizada de Tórax de Alta Resolución (TAC)'],
    generalCare: [
      'Oxigenoterapia con cánula nasal para mantener SpO2 > 92%.',
      'Fisioterapia pulmonar y ejercicios de espirómetro de incentivo.',
      'Cálculo de escala de gravedad CURB-65 para definir criterio de hospitalización.'
    ],
    clinicalPearls: 'Un puntaje CURB-65 de 2 puntos o más requiere hospitalización obligatoria en cama médica o cuidados intermedios.'
  },
  {
    code: 'CA23.0',
    title: 'Asma bronquial con exacerbación aguda',
    cie10Equivalent: 'J45.0',
    chapter: '12 - Enfermedades del sistema respiratorio',
    clinicalCategory: 'Neumología / Alergología',
    suggestedDrugs: [
      {
        id: 'drg-ca23-1',
        drugName: 'Salbutamol en Aerosol (Inhalador de Dosis Medida)',
        activeSubstance: 'Salbutamol',
        dosage: '100 mcg (2 disparos)',
        frequency: 'Cada 4 a 6 horas o según crisis de broncoespasmo',
        duration: 'Por razón necesaria (PRN)',
        instructions: 'Inhalación oral mediante cámara espaciadora / aerocámara con enjuague posterior.',
        line: 'PRIMERA_LINEA',
        rationale: 'Agonista beta-2 adrenérgico de acción corta (SABA) para broncodilatación de rescate inmediato.',
      },
      {
        id: 'drg-ca23-2',
        drugName: 'Budesonida / Formoterol',
        activeSubstance: 'Budesonida + Formoterol',
        dosage: '160/4.5 mcg',
        frequency: 'Cada 12 horas (2 disparos)',
        duration: 'Tratamiento de control continuo (GINA Track 1)',
        instructions: 'Inhalación oral matutina y nocturna.',
        line: 'PRIMERA_LINEA',
        rationale: 'Corticoide inhalado + LABA para control de la inflamación bronquial y prevención de recaídas.',
      },
      {
        id: 'drg-ca23-3',
        drugName: 'Prednisona',
        activeSubstance: 'Prednisona',
        dosage: '40 mg',
        frequency: 'Cada 24 horas (Mañanas)',
        duration: 'Ciclo corto de 5 días',
        instructions: 'Vía oral con el desayuno.',
        line: 'PRIMERA_LINEA',
        rationale: 'Corticosteroide sistémico para rescate de la crisis asmática sin necesidad de desescalamiento en ciclos < 7 días.',
      }
    ],
    contraindicatedDrugs: ['Betabloqueadores no selectivos (Propranolol, Timolol en gotas)', 'Aspirina / AINEs en pacientes con tríada de Samter'],
    suggestedLabs: ['Biometría Hemática con Eosinófilos absolutos', 'IgE sérica total'],
    suggestedImaging: ['Espirometría simple con prueba de broncodilatador (FVC, FEV1, índice FEV1/FVC)', 'Radiografía de Tórax PA (descarte de neumotórax)'],
    generalCare: [
      'Evitar alérgenos detonantes conocidos (ácaros, polen, humo de tabaco, pelo de mascotas).',
      'Técnica inhalatoria supervisada con cámara espaciadora para asegurar depósito pulmonar.',
      'Plan de acción escrito para el paciente: zona verde (control), amarilla (alerta) y roja (urgencia hospitalaria).'
    ],
  },

  // 5. GASTROENTEROLOGÍA Y CIRUGÍA (Capítulo 13)
  {
    code: 'DC10',
    title: 'Apendicitis aguda no especificada',
    cie10Equivalent: 'K35.8',
    chapter: '13 - Enfermedades del sistema digestivo',
    clinicalCategory: 'Cirugía General / Urgencias Quirúrgicas',
    suggestedDrugs: [
      {
        id: 'drg-dc10-1',
        drugName: 'Cefoxitina Sódica o Ceftriaxona + Metronidazol',
        activeSubstance: 'Cefoxitina / Metronidazol',
        dosage: 'Ceftriaxona 1g IV + Metronidazol 500mg IV',
        frequency: 'Dosis prequirúrgica única o cada 8-12 horas',
        duration: 'Profilaxis quirúrgica (24 horas)',
        instructions: 'Intravenoso 30-60 minutos antes de la incisión quirúrgica.',
        line: 'PRIMERA_LINEA',
        rationale: 'Profilaxis antimicrobiana de amplio espectro contra flora colónica entérica y anaerobia.',
      },
      {
        id: 'drg-dc10-2',
        drugName: 'Ketorolaco Trometamina',
        activeSubstance: 'Ketorolaco',
        dosage: '30 mg',
        frequency: 'Cada 8 horas IV',
        duration: 'Máximo 48 horas postquirúrgicas',
        instructions: 'Intravenoso lento diluido.',
        line: 'SEGUNDA_LINEA',
        rationale: 'Analgésico antiinflamatorio potente para dolor agudo postoperatorio.',
        warnings: ['No administrar hasta haber concluido la exploración quirúrgica o valoración por cirujano.'],
      }
    ],
    contraindicatedDrugs: ['Laxantes o enemas (riesgo inminente de perforación cecal)'],
    suggestedLabs: ['Biometría Hemática Completa con Leucocitosis y Bandemia', 'Examen General de Orina (descarte de litiasis ureteral)', 'Prueba Inmunológica de Embarazo (en mujeres en edad fértil)', 'Tiempos de Coagulación'],
    suggestedImaging: ['Ultrasonido de Apéndice y Fosa Ilíaca Derecha (diámetro > 6mm, signo de la diana)', 'Tomografía Axial Computarizada de Abdomen contrastada (TAC)'],
    generalCare: [
      'Ayuno absoluto e inicio inmediato de soluciones cristaloides parenterales.',
      'Valoración urgente por Cirugía General para Apendicectomía Laparoscópica.',
      'Monitoreo continuo de signos vitales cada 2 horas.'
    ],
    clinicalPearls: 'Escala de Alvarado > 7 puntos confiere alta probabilidad diagnóstica con indicación quirúrgica directa.'
  },
  {
    code: 'DB90.0',
    title: 'Colecistitis aguda litiásica',
    cie10Equivalent: 'K80.0',
    chapter: '13 - Enfermedades del sistema digestivo',
    clinicalCategory: 'Cirugía General / Gastroenterología',
    suggestedDrugs: [
      {
        id: 'drg-db90-1',
        drugName: 'Butilhioscina + Metamizol Sódico',
        activeSubstance: 'Butilhioscina / Metamizol',
        dosage: '20 mg / 2.5 g en infusión',
        frequency: 'Cada 8 horas IV',
        duration: 'Durante estancia hospitalaria',
        instructions: 'Intravenosa lenta diluida en 100 ml de solución fisiológica.',
        line: 'PRIMERA_LINEA',
        rationale: 'Espasmolítico visceral combinado con analgésico de alta eficacia para cólico biliar.',
        warnings: ['Monitoreo de presión arterial por posible hipotensión asociada a metamizol rápido.'],
      },
      {
        id: 'drg-db90-2',
        drugName: 'Ceftriaxona Sódica',
        activeSubstance: 'Ceftriaxona',
        dosage: '1 g',
        frequency: 'Cada 12 horas IV',
        duration: '5 a 7 días',
        instructions: 'Intravenoso.',
        line: 'PRIMERA_LINEA',
        rationale: 'Excelente concentración biliar para prevenir colangitis o bacteriemia biliar.',
      }
    ],
    suggestedLabs: ['Pruebas de Función Hepática (Bilirrubinas, Fosfatasa Alcalina, GGT, Transaminasas)', 'Amilasa y Lipasa sérica (descarte de pancreatitis biliar)', 'Biometría Hemática'],
    suggestedImaging: ['Ultrasonido Hepatobiliar en tiempo real (signo de Murphy ecográfico, litos, engrosamiento pared > 4mm)', 'Colangiorresonancia Magnética (si hay sospecha de coledocolitiasis)'],
    generalCare: [
      'Dieta cero / ayuno estricto hasta resolución del cuadro agudo.',
      'Programación de Colecistectomía Laparoscópica temprana (< 72 horas según Guías de Tokio).',
      'Reanudación de dieta con progresión baja en colecistoquinéticos (grasas, lácteos, fritos).'
    ],
  },

  // 6. NEFROLOGÍA Y UROLOGÍA (Capítulo 16)
  {
    code: 'GC08',
    title: 'Infección no especificada de las vías urinarias (IVU)',
    cie10Equivalent: 'N39.0',
    chapter: '16 - Enfermedades del sistema genitourinario',
    clinicalCategory: 'Nefrología / Urología',
    suggestedDrugs: [
      {
        id: 'drg-gc08-1',
        drugName: 'Nitrofurantoína Macropartículas',
        activeSubstance: 'Nitrofurantoína',
        dosage: '100 mg',
        frequency: 'Cada 12 horas',
        duration: '7 días',
        instructions: 'Vía oral con alimentos o un vaso de leche para mejorar biodisponibilidad y evitar náuseas.',
        line: 'PRIMERA_LINEA',
        rationale: 'Antimicrobiano de 1ra elección para cistitis no complicada con nula resistencia bacteriana cruzada.',
        warnings: ['Contraindicado si Tasa de Filtración Glomerular < 30 ml/min.'],
        requiresRenalAdjustment: true,
      },
      {
        id: 'drg-gc08-2',
        drugName: 'Fosfomicina Trometamol',
        activeSubstance: 'Fosfomicina',
        dosage: '3 g (Sobre granulado)',
        frequency: 'Dosis única',
        duration: '1 sola toma',
        instructions: 'Disolver en medio vaso de agua antes de acostarse tras vaciar la vejiga.',
        line: 'PRIMERA_LINEA',
        rationale: 'Excelente adherencia terapéutica en monodosis con altísima concentración urinaria por 72 horas.',
      },
      {
        id: 'drg-gc08-3',
        drugName: 'Fenazopiridina',
        activeSubstance: 'Fenazopiridina',
        dosage: '100 mg',
        frequency: 'Cada 8 horas',
        duration: 'Máximo 48 horas',
        instructions: 'Vía oral después de los alimentos. Exclusivamente analgésico urinario sintomático.',
        line: 'COADYUVANTE',
        rationale: 'Alivio rápido de la disuria y tenesmo vesical.',
        warnings: ['Advertir al paciente que la orina y lágrimas se teñirán de color naranja intenso.'],
      }
    ],
    suggestedLabs: ['Examen General de Orina (EGO) con sedimento urinario', 'Urocultivo con Antibiograma cuantitativo', 'Química Sanguínea (Creatinina / Urea)'],
    suggestedImaging: ['Ultrasonido Renal y Vesical con medición de orina residual'],
    generalCare: [
      'Ingesta abundante de agua natural (2 a 2.5 litros al día).',
      'Micción frecuente y completa; evitar posponer el vaciado vesical.',
      'Medidas de higiene urogenital anteroposterior.'
    ],
  },
  {
    code: 'MD81',
    title: 'Enfermedad renal crónica estadio 5 (Falla renal terminal)',
    cie10Equivalent: 'N18.5',
    chapter: '21 - Síntomas, signos o hallazgos clínicos',
    clinicalCategory: 'Nefrología / Diálisis',
    suggestedDrugs: [
      {
        id: 'drg-md81-1',
        drugName: 'Eritropoyetina Humana Recombinante',
        activeSubstance: 'Eritropoyetina',
        dosage: '4000 UI',
        frequency: '2 a 3 veces por semana',
        duration: 'Mantenimiento continuo',
        instructions: 'Subcutánea o intravenosa según sesión de hemodiálisis.',
        line: 'PRIMERA_LINEA',
        rationale: 'Manejo de la anemia de origen renal con meta de Hemoglobina entre 10 y 11.5 g/dL.',
        warnings: ['Monitorear presión arterial; puede inducir crisis hipertensiva si Hb sube bruscamente.'],
      },
      {
        id: 'drg-md81-2',
        drugName: 'Carbonato de Calcio',
        activeSubstance: 'Carbonato de Calcio',
        dosage: '500 mg',
        frequency: 'Con cada alimento (3 veces al día)',
        duration: 'Continuo',
        instructions: 'Vía oral masticado durante las comidas para quelar el fósforo alimentario.',
        line: 'PRIMERA_LINEA',
        rationale: 'Quelante de fósforo intestinal para control del hiperparatiroidismo secundario.',
      }
    ],
    contraindicatedDrugs: ['AINEs (Ketorolaco, Ibuprofeno, etc.)', 'Metformina', 'Antibióticos aminoglucósidos sin ajuste'],
    suggestedLabs: ['Química Sanguínea Completa con Nitrógeno Ureico, Creatinina y Ácido Úrico', 'Electrolitos Séricos (Potasio, Fósforo, Calcio)', 'Hormona Paratiroidea Intacta (iPTH)', 'Ferritina y Cinética de Hierro'],
    suggestedImaging: ['Ultrasonido Renal Doppler (tamaño renal, diferenciación corticomedular)'],
    generalCare: [
      'Ajuste riguroso de dosis por función renal en el 100% de fármacos prescritos.',
      'Dieta nefropatológica: restricción estricta de potasio, sodio, fósforo y líquidos.',
      'Cuidado y protección de fístula arteriovenosa o catéter de hemodiálisis.'
    ],
  },

  // 7. NEUROLOGÍA Y PSIQUIATRÍA (Capítulos 06 y 08)
  {
    code: '8B11',
    title: 'Infarto cerebral isquémico agudo (EVC Isquémico)',
    cie10Equivalent: 'I63.9',
    chapter: '08 - Enfermedades del sistema nervioso',
    clinicalCategory: 'Neurología / Urgencias Neurovasculares',
    suggestedDrugs: [
      {
        id: 'drg-8b11-1',
        drugName: 'Atorvastatina',
        activeSubstance: 'Atorvastatina',
        dosage: '80 mg',
        frequency: 'Cada 24 horas (Noches)',
        duration: 'Continuo',
        instructions: 'Vía oral. Terapia estatinizante intensiva.',
        line: 'PRIMERA_LINEA',
        rationale: 'Protección endotelial cerebral y estabilización vascular.',
      },
      {
        id: 'drg-8b11-2',
        drugName: 'Ácido Acetilsalicílico (Aspirina)',
        activeSubstance: 'AAS',
        dosage: '100 mg',
        frequency: 'Cada 24 horas',
        duration: 'Permanente',
        instructions: 'Iniciar pasadas las primeras 24 horas si no hubo trombólisis IV.',
        line: 'PRIMERA_LINEA',
        rationale: 'Prevención secundaria de nuevos eventos isquémicos arteriales.',
      }
    ],
    contraindicatedDrugs: ['Hipotensores bruscos (no descender TA bruscamente salvo que exceda 220/120 mmHg)'],
    suggestedLabs: ['Tiempos de Coagulación (TP, TTPa, INR)', 'Glucosa capilar inmediata', 'Perfil Lipídico', 'Biometría Hemática'],
    suggestedImaging: ['Tomografía Computarizada de Cráneo Simple urgente (< 20 min) para descartar hemorragia', 'Resonancia Magnética con Difusión (DWI/FLAIR)', 'Angiotomografía de Vasos Supraaórticos'],
    generalCare: [
      'Monitoreo neurológico continuo mediante escala NIHSS.',
      'Mantener cabecera a 30 grados para optimizar retorno venoso y flujo cerebral.',
      'Rehabilitación física y motora temprana desde las primeras 48 horas.'
    ],
  },
  {
    code: '6A70',
    title: 'Episodio depresivo mayor único de intensidad moderada',
    cie10Equivalent: 'F32.1',
    chapter: '06 - Trastornos mentales, del comportamiento o del neurodesarrollo',
    clinicalCategory: 'Psiquiatría / Psicología Clínica',
    suggestedDrugs: [
      {
        id: 'drg-6a70-1',
        drugName: 'Sertralina',
        activeSubstance: 'Sertralina',
        dosage: '50 mg',
        frequency: 'Cada 24 horas (Mañanas)',
        duration: 'Mínimo 6 a 12 meses',
        instructions: 'Vía oral matutina con alimentos. El efecto antidepresivo óptimo inicia entre las semanas 3 y 4.',
        line: 'PRIMERA_LINEA',
        rationale: 'ISRS de 1ra elección con excelente perfil de seguridad cardiovascular y mínima sedación.',
        warnings: ['No suspender abruptamente. Informar que el beneficio clínico pleno toma de 2 a 4 semanas.'],
      },
      {
        id: 'drg-6a70-2',
        drugName: 'Escitalopram',
        activeSubstance: 'Escitalopram',
        dosage: '10 mg',
        frequency: 'Cada 24 horas',
        duration: 'Continuo',
        instructions: 'Vía oral.',
        line: 'PRIMERA_LINEA',
        rationale: 'ISRS de alta especificidad serotonérgica con escasas interacciones farmacológicas.',
      }
    ],
    suggestedLabs: ['Perfil Tiroideo Completo (TSH, T3, T4 Libre) para descartar hipotiroidismo', 'Biometría Hemática', 'Química Sanguínea'],
    generalCare: [
      'Canalización complementaria a Psicoterapia Cognitivo-Conductual (TCC).',
      'Higiene del sueño: horarios regulares, evitar pantallas 1 hora antes de dormir.',
      'Monitoreo activo de ideación suicida y red de apoyo familiar.'
    ],
  },
  {
    code: '6B00',
    title: 'Trastorno de ansiedad generalizada (TAG) con crisis de angustia',
    cie10Equivalent: 'F41.1',
    chapter: '06 - Trastornos mentales, del comportamiento o del neurodesarrollo',
    clinicalCategory: 'Psiquiatría / Psicología',
    suggestedDrugs: [
      {
        id: 'drg-6b00-1',
        drugName: 'Clonazepam Solución Oral',
        activeSubstance: 'Clonazepam',
        dosage: '3 a 5 gotas (0.3 - 0.5 mg)',
        frequency: 'Cada 12 a 24 horas o en crisis aguda PRN',
        duration: 'Ciclo corto (máximo 4 a 6 semanas)',
        instructions: 'Vía sublingual o diluido en poca agua. Evitar consumo de alcohol.',
        line: 'PRIMERA_LINEA',
        rationale: 'Benzodiacepina de vida media intermedia para control rápido de somatización y angustia.',
        warnings: ['Uso estrictamente temporal por riesgo de tolerancia y dependencia psicológica/física.'],
      },
      {
        id: 'drg-6b00-2',
        drugName: 'Paroxetina',
        activeSubstance: 'Paroxetina',
        dosage: '20 mg',
        frequency: 'Cada 24 horas (Mañanas)',
        duration: 'Largo plazo (6-12 meses)',
        instructions: 'Vía oral con alimentos.',
        line: 'PRIMERA_LINEA',
        rationale: 'ISRS de elección para tratamiento de fondo del trastorno de ansiedad.',
      }
    ],
    contraindicatedDrugs: ['Estimulantes del SNC, cafeína en exceso, bebidas energéticas'],
    suggestedLabs: ['Electrocardiograma (descarte de arritmias)', 'Perfil Tiroideo'],
    generalCare: [
      'Técnicas de respiración diafragmática y desactivación fisiológica.',
      'Eliminar café, tabaco y bebidas con taurina/guaraná.',
      'Actividad física aeróbica regular.'
    ],
  },

  // 8. MUSCULOESQUELÉTICO Y REUMATOLOGÍA (Capítulo 15)
  {
    code: 'FA00',
    title: 'Osteoartritis de la rodilla (Gonartrosis)',
    cie10Equivalent: 'M17.9',
    chapter: '15 - Enfermedades del sistema musculoesquelético o del tejido conectivo',
    clinicalCategory: 'Traumatología y Ortopedia / Reumatología',
    suggestedDrugs: [
      {
        id: 'drg-fa00-1',
        drugName: 'Celecoxib',
        activeSubstance: 'Celecoxib',
        dosage: '200 mg',
        frequency: 'Cada 24 horas o cada 12 horas si hay inflamación aguda',
        duration: '10 a 14 días',
        instructions: 'Vía oral con alimentos.',
        line: 'PRIMERA_LINEA',
        rationale: 'Inhibidor selectivo de COX-2 con menor toxicidad gastrointestinal que los AINEs clásicos.',
        warnings: ['Precaución en pacientes con cardiopatía isquémica previa o hipertensión descontrolada.'],
      },
      {
        id: 'drg-fa00-2',
        drugName: 'Paracetamol',
        activeSubstance: 'Paracetamol',
        dosage: '1 g',
        frequency: 'Cada 8 horas',
        duration: 'Por razón necesaria',
        instructions: 'Vía oral.',
        line: 'PRIMERA_LINEA',
        rationale: 'Analgésico de base seguro para dolor osteomuscular leve a moderado.',
      },
      {
        id: 'drg-fa00-3',
        drugName: 'Glucosamina + Condroitina + MSM',
        activeSubstance: 'Sulfato de Glucosamina / Condroitina',
        dosage: '1500 mg / 1200 mg',
        frequency: 'Cada 24 horas',
        duration: 'Mínimo 3 meses',
        instructions: 'Vía oral con el desayuno.',
        line: 'COADYUVANTE',
        rationale: 'Condroprotector para ralentizar el desgaste del cartílago articular hialino.',
      }
    ],
    suggestedLabs: ['Ácido Úrico sérico', 'Factor Reumatoide y Proteína C Reactiva'],
    suggestedImaging: ['Radiografías de Rodillas comparativas AP y Lateral con apoyo monopodálico', 'Proyección axial de rótulas a 45 grados'],
    generalCare: [
      'Control y reducción de peso corporal (cada kg perdido disminuye 4 kg de carga articular en rodillas).',
      'Ejercicios isométricos de cuádriceps y natación (evitar ejercicios de impacto repetitivo).',
      'Uso de calzado con amortiguación adecuada.'
    ],
  }
];

// ------------------------------------------------------------------------------
// FUNCIONES Y ALGORITMOS DEL DR. AI COPILOT
// ------------------------------------------------------------------------------

/**
 * Búsqueda predictiva con lenguaje natural de diagnósticos CIE-11 y CIE-10
 */
export function searchCie11Diseases(query: string): Cie11Disease[] {
  if (!query || query.trim().length === 0) {
    return CIE11_MASTER_CATALOG.slice(0, 8);
  }
  const cleanQ = query.toLowerCase().trim();

  return CIE11_MASTER_CATALOG.filter(item => {
    const codeMatch = item.code.toLowerCase().includes(cleanQ);
    const titleMatch = item.title.toLowerCase().includes(cleanQ);
    const cie10Match = item.cie10Equivalent.toLowerCase().includes(cleanQ);
    const chapterMatch = item.chapter.toLowerCase().includes(cleanQ);
    const catMatch = item.clinicalCategory.toLowerCase().includes(cleanQ);

    // Coincidencias en fármacos sugeridos o cuidados
    const drugMatch = item.suggestedDrugs.some(d => 
      d.drugName.toLowerCase().includes(cleanQ) || 
      d.activeSubstance.toLowerCase().includes(cleanQ)
    );

    return codeMatch || titleMatch || cie10Match || chapterMatch || catMatch || drugMatch;
  });
}

/**
 * Obtiene patología CIE-11 por código exacto
 */
export function getCie11ByCode(code: string): Cie11Disease | undefined {
  return CIE11_MASTER_CATALOG.find(d => d.code.toUpperCase() === code.toUpperCase().trim());
}

/**
 * Verificador inteligente de alergias farmacológicas del paciente
 */
export function checkPatientDrugAllergies(
  patientAllergies: string,
  drugName: string,
  activeSubstance?: string
): { hasConflict: boolean; severity: 'ALTA_CRITICA' | 'MODERADA' | 'NINGUNA'; warningMessage?: string } {
  if (!patientAllergies || patientAllergies.toLowerCase().includes('negad') || patientAllergies.toLowerCase().includes('ningun')) {
    return { hasConflict: false, severity: 'NINGUNA' };
  }

  const pAll = patientAllergies.toLowerCase();
  const dName = drugName.toLowerCase();
  const aSub = (activeSubstance || '').toLowerCase();

  // 1. Familia Betalactámicos / Penicilinas / Cefalosporinas
  const isBetaLactamAllergy = pAll.includes('penicilin') || pAll.includes('betalactam') || pAll.includes('ampicilin') || pAll.includes('amoxi');
  const isBetaLactamDrug = 
    dName.includes('penicil') || dName.includes('amoxi') || dName.includes('ampicil') ||
    dName.includes('ceftriax') || dName.includes('cefal') || dName.includes('cefox') ||
    aSub.includes('penicil') || aSub.includes('amoxi') || aSub.includes('ceftriax') || aSub.includes('cefal');

  if (isBetaLactamAllergy && isBetaLactamDrug) {
    return {
      hasConflict: true,
      severity: 'ALTA_CRITICA',
      warningMessage: `¡ALERTA ROJA DE ANAFILAXIA! El paciente es alérgico a [${patientAllergies}] y el fármaco "${drugName}" pertenece a la familia de betalactámicos/penicilinas/cefalosporinas con alto riesgo de reactividad cruzada fatal.`,
    };
  }

  // 2. AINEs y Salicilatos (Aspirina, Ibuprofeno, Ketorolaco, Naproxeno)
  const isAineAllergy = pAll.includes('aine') || pAll.includes('aspirin') || pAll.includes('ibuprofen') || pAll.includes('ketorolac') || pAll.includes('naproxen') || pAll.includes('diclofenac');
  const isAineDrug = 
    dName.includes('aspirin') || dName.includes('ibuprof') || dName.includes('ketorolac') || 
    dName.includes('naprox') || dName.includes('diclofen') || dName.includes('celecox') ||
    aSub.includes('acetilsalicil') || aSub.includes('ibuprof') || aSub.includes('ketorolac');

  if (isAineAllergy && isAineDrug) {
    return {
      hasConflict: true,
      severity: 'ALTA_CRITICA',
      warningMessage: `¡CONTRAINDICACIÓN POR ALERGIA! Paciente alérgico a AINEs/Salicilatos. El medicamento "${drugName}" puede inducir broncoespasmo severo, angioedema o anafilaxia.`,
    };
  }

  // 3. Sulfas / Sulfametoxazol
  const isSulfaAllergy = pAll.includes('sulfa') || pAll.includes('trimetoprim');
  const isSulfaDrug = dName.includes('sulfa') || aSub.includes('sulfa');
  if (isSulfaAllergy && isSulfaDrug) {
    return {
      hasConflict: true,
      severity: 'ALTA_CRITICA',
      warningMessage: `¡ALERTA CRÍTICA! Paciente alérgico a Sulfamidas. "${drugName}" está estrictamente contraindicado por riesgo de Síndrome de Stevens-Johnson.`,
    };
  }

  // 4. Metamizol / Pirazolonas
  const isDipyroneAllergy = pAll.includes('metamizol') || pAll.includes('dipirona') || pAll.includes('pirazolon');
  const isDipyroneDrug = dName.includes('metamizol') || dName.includes('dipiron') || aSub.includes('metamizol');
  if (isDipyroneAllergy && isDipyroneDrug) {
    return {
      hasConflict: true,
      severity: 'ALTA_CRITICA',
      warningMessage: `¡ALERTA CRÍTICA! Paciente con alergia a Metamizol / Pirazolonas. Fármaco contraindicado.`,
    };
  }

  return { hasConflict: false, severity: 'NINGUNA' };
}

/**
 * Verificador de contraindicaciones estrictas según patología CIE-11
 */
export function checkPathologyContraindications(
  diseaseCode: string,
  drugName: string
): { isContraindicated: boolean; warning?: string } {
  const code = diseaseCode.toUpperCase();
  const dName = drugName.toLowerCase();

  // Dengue vs AINEs / Aspirina
  if (code.startsWith('1B10') || code.includes('DENGUE')) {
    const isAntiplateletOrNsaid = 
      dName.includes('aspirin') || dName.includes('ibuprof') || dName.includes('ketorolac') || 
      dName.includes('naprox') || dName.includes('diclofen') || dName.includes('metamizol');
    if (isAntiplateletOrNsaid) {
      return {
        isContraindicated: true,
        warning: `¡CONTRAINDICACIÓN ABSOLUTA EN DENGUE! Los AINEs, Aspirina y Metamizol alteran la agregación plaquetaria e inducen hemorragia masiva por Dengue. Prescribir exclusivamente Paracetamol.`,
      };
    }
  }

  // Asma vs Betabloqueadores
  if (code.startsWith('CA23') || code.includes('ASMA')) {
    if (dName.includes('metoprolol') || dName.includes('propranolol') || dName.includes('timolol') || dName.includes('atenolol')) {
      return {
        isContraindicated: true,
        warning: `¡PRECAUCIÓN EN ASMA! Los betabloqueadores pueden antagonizar el tono bronquial e inducir broncoespasmo potencialmente refractario.`,
      };
    }
  }

  // Falla Renal Terminal vs AINEs
  if (code.startsWith('MD81') || code.includes('RENAL')) {
    if (dName.includes('ketorolac') || dName.includes('ibuprof') || dName.includes('naprox')) {
      return {
        isContraindicated: true,
        warning: `¡CONTRAINDICADO EN INSUFICIENCIA RENAL! Los AINEs inhiben las prostaglandinas renales, precipitando necrosis tubular aguda y anuria.`,
      };
    }
  }

  return { isContraindicated: false };
}
