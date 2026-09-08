export default function handler(req: any, res: any) {
  res.status(200).json({
    hospital: "Centro Médico Puerta de Hierro Sede Tepic",
    platform: "Vercel Edge & Serverless Architecture",
    status: "OPERATIONAL_24_7",
    normativas_activas: [
      "NOM-024-SSA3-2012 (SIRES y Auditoría Forense)",
      "NOM-004-SSA3-2012 (Expediente Clínico Electrónico)",
      "NOM-016-SSA3-2012 (Infraestructura Quirúrgica y CEYE)",
      "NOM-007-SSA3-2011 (Laboratorios Clínicos)",
      "LFPDPPP (Datos Personales Sensibles de Salud)"
    ],
    timestamp: new Date().toISOString()
  });
}
