-- =====================================================
-- TRUNCATE ALL SST AND EMPLOYEE RELATED TABLES
-- =====================================================

-- Désactiver les contraintes de clé étrangère
SET FOREIGN_KEY_CHECKS = 0;

-- Tables SST (Santé et Sécurité au Travail)
TRUNCATE TABLE sst_payment_visit;
TRUNCATE TABLE sst_payments;
TRUNCATE TABLE medical_documents;
TRUNCATE TABLE medical_restrictions;
TRUNCATE TABLE examen_medicals;
TRUNCATE TABLE employe_visite;
TRUNCATE TABLE visite_s;
TRUNCATE TABLE dossier_medicals;
TRUNCATE TABLE sst_practitioners;

-- Tables Employés
TRUNCATE TABLE employes;
TRUNCATE TABLE departements;

-- Tables liées aux employés
TRUNCATE TABLE gp_conges;
TRUNCATE TABLE gp_demande_conges;
TRUNCATE TABLE gp_calendrier_employes;
TRUNCATE TABLE gp_employe_bulletins;
TRUNCATE TABLE contrats;

-- Réactiver les contraintes de clé étrangère
SET FOREIGN_KEY_CHECKS = 1;

-- Réinitialiser les auto-incréments
ALTER TABLE sst_payment_visit AUTO_INCREMENT = 1;
ALTER TABLE sst_payments AUTO_INCREMENT = 1;
ALTER TABLE medical_documents AUTO_INCREMENT = 1;
ALTER TABLE medical_restrictions AUTO_INCREMENT = 1;
ALTER TABLE examen_medicals AUTO_INCREMENT = 1;
ALTER TABLE employe_visite AUTO_INCREMENT = 1;
ALTER TABLE visite_s AUTO_INCREMENT = 1;
ALTER TABLE dossier_medicals AUTO_INCREMENT = 1;
ALTER TABLE sst_practitioners AUTO_INCREMENT = 1;
ALTER TABLE employes AUTO_INCREMENT = 1;
ALTER TABLE departements AUTO_INCREMENT = 1;
ALTER TABLE gp_conges AUTO_INCREMENT = 1;
ALTER TABLE gp_demande_conges AUTO_INCREMENT = 1;
ALTER TABLE gp_calendrier_employes AUTO_INCREMENT = 1;
ALTER TABLE gp_employe_bulletins AUTO_INCREMENT = 1;
ALTER TABLE contrats AUTO_INCREMENT = 1;

SELECT 'Tables vidées avec succès!' AS result;