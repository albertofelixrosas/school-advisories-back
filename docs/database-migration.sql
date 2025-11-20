-- ============================================================
-- NOTA IMPORTANTE: NO ES NECESARIO EJECUTAR ESTE ARCHIVO
-- ============================================================
--
-- Los cambios en la base de datos se aplicarán automáticamente
-- cuando TypeORM sincronice las entidades.
--
-- La entidad SubjectDetails ya incluye:
-- - @Column({ default: true }) is_active: boolean;
-- - @CreateDateColumn() created_at: Date;
-- - @UpdateDateColumn() updated_at: Date;
--
-- TypeORM creará las columnas automáticamente con:
-- - Valores por defecto correctos
-- - Timestamps automáticos
-- - Actualizaciones automáticas de updated_at
--
-- ============================================================
-- QUERIES DE VERIFICACIÓN (Después de sincronizar)
-- ============================================================

-- Verificar estructura de subject_details
DESCRIBE subject_details;

-- Verificar que las columnas existen
SELECT 
  subject_detail_id, 
  is_active, 
  created_at, 
  updated_at 
FROM subject_details 
LIMIT 10;

-- Contar asignaciones activas/inactivas
SELECT 
  COUNT(*) as total_assignments,
  SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_assignments,
  SUM(CASE WHEN is_active = false THEN 1 ELSE 0 END) as inactive_assignments
FROM subject_details;

-- Verificar plantillas de email
SELECT 
  template_key, 
  template_name, 
  is_active 
FROM email_templates 
ORDER BY created_at DESC;
