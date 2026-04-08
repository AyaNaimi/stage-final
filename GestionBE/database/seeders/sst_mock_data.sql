-- =====================================================
-- MOCK DATA SQL - Module Santé et Sécurité (SST)
-- =====================================================

-- =====================================================
-- 1. EMPLOYEES (existing - using sample IDs 1-10)
-- =====================================================

-- =====================================================
-- 2. MEDICAL RECORDS (dossier_medicals)
-- =====================================================

INSERT INTO dossier_medicals (id, employe_id, numero_dossier, groupe_sanguin, antecedents_personnels, antecedents_familiaux, allergies, vaccinations, notes, created_at, updated_at) VALUES
(1, 1, 'DM-2026-001', 'A+', 'Asthma léger childhood', 'Diabète type 2 (père)', 'Pénicilline', 'Diphtérie, Tétanos, Hépatite B', 'Surveillance annuelle recommandée', '2026-01-15 10:00:00', '2026-03-01 14:30:00'),
(2, 2, 'DM-2026-002', 'O+', 'Hypertension diagnostiquée 2023', 'Cardiopathie (mère)', 'Néant', 'Tétanos, Grippe saisonnière', 'Traitement antihypertenseur en cours', '2026-01-20 09:30:00', '2026-02-28 16:45:00'),
(3, 3, 'DM-2026-003', 'B+', 'Diabète type 2', 'Hypertension (père et mère)', 'Sulfa', 'Hépatite B, Grippe', 'Contrôle glycémique trimestriel', '2026-02-01 11:00:00', '2026-03-05 10:20:00'),
(4, 4, 'DM-2026-004', 'AB-', 'Aucun antécédent majeur', 'Néant', 'Latex', 'Tétanos, COVID-19', 'Port de gants recommandé pour manipulations', '2026-02-10 08:45:00', '2026-03-02 09:15:00'),
(5, 5, 'DM-2026-005', 'A-', 'Chirurgie appendicectomie 2018', 'Cancer colon (oncle)', 'Iode', 'Hépatite A et B', 'Aucun problème post-opératoire', '2026-02-15 14:00:00', '2026-03-04 11:30:00'),
(6, 6, 'DM-2026-006', 'O+', 'Migraines chroniques', 'Épilepsie (frère)', 'Aspirine', 'Tétanos, Grippe', 'Avoid bright lights during crises', '2026-02-20 10:30:00', '2026-03-06 15:00:00'),
(7, 7, 'DM-2026-007', 'B-', 'Hypothyroïdie', 'Asthme (mère)', 'Néant', 'Tétanos, Hépatite B', 'Traitement Lévothyrox en cours', '2026-02-25 13:00:00', '2026-03-07 09:45:00'),
(8, 8, 'DM-2026-008', 'A+', 'Tendinite épaule gauche', 'Arthrose (père)', 'Anti-inflammatoires', 'Grippe, Tétanos', 'Physiothérapie recommandée', '2026-03-01 08:00:00', '2026-03-08 14:20:00'),
(9, 9, 'DM-2026-009', 'AB+', 'Rhinite allergique', 'Allergies multiples (parents)', 'Pollens, Acariens', 'COVID-19, Tétanos', 'Désensibilisation en cours', '2026-03-03 11:30:00', '2026-03-09 10:00:00'),
(10, 10, 'DM-2026-010', 'O-', 'Aucune pathologie', 'Néant', 'Néant', 'Toutes vaccinations à jour', 'Bon état de santé général', '2026-03-05 09:00:00', '2026-03-10 16:30:00');

-- =====================================================
-- 3. SST PRACTITIONERS (Corps Médical)
-- =====================================================

INSERT INTO sst_practitioners (id, name, first_name, specialty, type, phone, email, photo, diplome, other_docs, status, contract_type, remuneration_amount, remuneration_type, service, created_at, updated_at) VALUES
(1, 'Alami', 'Hassan', 'Médecin du travail', 'Interne', '0522-123456', 'alami.hassan@medhr.ma', NULL, 'DU Médecine du travail - Casablanca', NULL, 'active', 'CDI', 15000, 'monthly', 'Médecine du travail', '2025-06-01 08:00:00', '2026-03-01 10:00:00'),
(2, 'Bennani', 'Fatima', 'Cardiologue', 'Externe', '0522-234567', 'bennani.fatima@medhr.ma', NULL, ' Spécialisation Cardiologie - Rabat', NULL, 'active', 'Honoraire', 800, 'per_visit', 'Consultation cardiologique', '2025-07-15 09:00:00', '2026-02-20 14:00:00'),
(3, 'Chraibi', 'Omar', 'Pneumologue', 'Externe', '0522-345678', 'chraibi.omar@medhr.ma', NULL, 'DESC Pneumologie', NULL, 'active', 'Honoraire', 750, 'per_visit', 'Exploration respiratoire', '2025-08-10 10:00:00', '2026-03-05 11:00:00'),
(4, 'Diallo', 'Aminata', 'Infirmière SST', 'Interne', '0522-456789', 'diallo.aminata@medhr.ma', NULL, 'Diplôme Infirmier + Formation SST', NULL, 'active', 'CDI', 6000, 'monthly', 'Soins infirmiers SST', '2025-09-01 08:00:00', '2026-03-08 09:00:00'),
(5, 'El Mountassir', 'Youssef', 'Ophtalmologue', 'Externe', '0522-567890', 'elmountassir.youssef@medhr.ma', NULL, 'DESC Ophtalmologie', NULL, 'inactive', 'Honoraire', 900, 'per_visit', 'Examens visuels', '2025-10-01 09:00:00', '2026-01-15 16:00:00'),
(6, 'Faouzi', 'Nadia', 'Médecin généraliste', 'Interne', '0522-678901', 'faouzi.nadia@medhr.ma', NULL, 'Docteur en Médecine + Formation SST', NULL, 'active', 'CDI', 12000, 'monthly', 'Médecine préventive', '2025-11-15 08:00:00', '2026-03-10 10:00:00'),
(7, 'Ghmadi', 'Rachid', 'ORL', 'Externe', '0522-789012', 'ghmadi.rachid@medhr.ma', NULL, 'DESC ORL', NULL, 'active', 'Honoraire', 850, 'per_visit', 'Examens auditifs', '2025-12-01 10:00:00', '2026-02-28 15:00:00'),
(8, 'Haddad', 'Leila', 'Psychologue du travail', 'Externe', '0522-890123', 'haddad.leila@medhr.ma', NULL, 'Master Psychologie du travail', NULL, 'active', 'Vacataire', 600, 'per_session', 'Soutien psychologique', '2026-01-10 09:00:00', '2026-03-07 14:00:00');

-- =====================================================
-- 4. VISITES MÉDICALES (visites)
-- =====================================================

INSERT INTO visites (id, date, time, type, statut, emplacement, lieu, medecin_nom, doctor, notes, practitioner_id, unit_cost, total_cost, payment_status, created_at, updated_at) VALUES
(1, '2026-01-15', '09:00:00', 'Periodique', 'Terminee', 'Cabinet médical', 'Clinique MedCare, Casablanca', 'Dr. Alami Hassan', NULL, 'Visite annuelle routine -RAS', 1, 300, 300, 'paid', '2026-01-15 09:00:00', '2026-01-20 11:00:00'),
(2, '2026-01-22', '10:30:00', 'Embauche', 'Terminee', 'Cabinet médical', 'Centre de Santé Entreprise', 'Dr. Alami Hassan', NULL, 'Visite d\'embauche - Apte', 1, 250, 250, 'paid', '2026-01-22 10:30:00', '2026-01-25 14:00:00'),
(3, '2026-02-05', '14:00:00', 'Accident', 'Terminee', 'Urgences', 'Hôpital Cheikh Zaid', 'Dr. Bennani Fatima', NULL, 'Suite à accident du travail - Traumatisme mineur', 2, 500, 500, 'paid', '2026-02-05 14:00:00', '2026-02-10 16:00:00'),
(4, '2026-02-12', '09:30:00', 'Periodique', 'Terminee', 'Cabinet médical', 'Clinique MedCare', 'Dr. Alami Hassan', NULL, 'Contrôle trimestriel - Tension élevée', 1, 300, 300, 'paid', '2026-02-12 09:30:00', '2026-02-18 10:00:00'),
(5, '2026-02-20', '11:00:00', 'Reprise', 'Terminee', 'Cabinet médical', 'Cabinet Dr. Faouzi', 'Dr. Faouzi Nadia', NULL, 'Reprise après maladie longue durée', 6, 200, 200, 'paid', '2026-02-20 11:00:00', '2026-02-22 15:00:00'),
(6, '2026-02-28', '10:00:00', 'Periodique', 'Terminee', 'Cabinet médical', 'Clinique MedCare', 'Dr. Chraibi Omar', NULL, 'Examen pneumologique - Asthme surveillé', 3, 400, 400, 'paid', '2026-02-28 10:00:00', '2026-03-05 14:00:00'),
(7, '2026-03-03', '09:00:00', 'Embauche', 'Terminee', 'Cabinet médical', 'Centre de Santé Entreprise', 'Dr. Alami Hassan', NULL, 'Nouvelle recrue - Apte avec restrictions', 1, 250, 250, 'paid', '2026-03-03 09:00:00', '2026-03-05 11:00:00'),
(8, '2026-03-05', '14:30:00', 'Accident', 'En_cours', 'Atelier', 'Site industriel', 'Inf. Diallo Aminata', NULL, 'Accident sur site - Prise en charge initiale', 4, 150, 150, 'pending', '2026-03-05 14:30:00', '2026-03-05 16:00:00'),
(9, '2026-03-08', '10:30:00', 'Periodique', 'Planifiee', 'Cabinet médical', 'Clinique MedCare', 'Dr. El Mountassir Youssef', NULL, 'Contrôle visuel annuel', 5, 350, 350, 'pending', '2026-03-08 10:30:00', '2026-03-08 12:00:00'),
(10, '2026-03-10', '11:00:00', 'Suivi', 'Planifiee', 'Bureau', 'Salle de repos', 'Dr. Haddad Leila', NULL, 'Entretien psychologique de suivi', 8, 400, 400, 'pending', '2026-03-10 11:00:00', '2026-03-10 13:00:00');

-- =====================================================
-- 5. EMPLOYE_VISITE (Pivot - Employés assignés aux visites)
-- =====================================================

INSERT INTO employe_visite (employe_id, visite_id, statut_individuel, created_at, updated_at) VALUES
(1, 1, 'Complété', '2026-01-15 09:00:00', '2026-01-20 11:00:00'),
(2, 1, 'Complété', '2026-01-15 09:00:00', '2026-01-20 11:00:00'),
(3, 1, 'Complété', '2026-01-15 09:00:00', '2026-01-20 11:00:00'),
(4, 1, 'Complété', '2026-01-15 09:00:00', '2026-01-20 11:00:00'),
(5, 1, 'Complété', '2026-01-15 09:00:00', '2026-01-20 11:00:00'),
(2, 2, 'Complété', '2026-01-22 10:30:00', '2026-01-25 14:00:00'),
(3, 3, 'Complété', '2026-02-05 14:00:00', '2026-02-10 16:00:00'),
(4, 4, 'Complété', '2026-02-12 09:30:00', '2026-02-18 10:00:00'),
(5, 5, 'Complété', '2026-02-20 11:00:00', '2026-02-22 15:00:00'),
(6, 6, 'Complété', '2026-02-28 10:00:00', '2026-03-05 14:00:00'),
(7, 7, 'Complété', '2026-03-03 09:00:00', '2026-03-05 11:00:00'),
(8, 8, 'En_cours', '2026-03-05 14:30:00', '2026-03-05 16:00:00'),
(9, 9, 'Inscrit', '2026-03-08 10:30:00', '2026-03-08 12:00:00'),
(10, 10, 'Inscrit', '2026-03-10 11:00:00', '2026-03-10 13:00:00'),
(1, 2, 'Complété', '2026-01-22 10:30:00', '2026-01-25 14:00:00'),
(6, 3, 'Complété', '2026-02-05 14:00:00', '2026-02-10 16:00:00');

-- =====================================================
-- 6. EXAMENS MÉDICAUX (examen_medicals)
-- =====================================================

INSERT INTO examen_medicals (id, visite_id, employe_id, date_examen, motif, poids, taille, imc, ta_systolique, ta_diastolique, pouls, temperature, glycemie, spo2, vision_droite, vision_gauche, audition_droite, audition_gauche, tour_taille, notes_subjectives, notes_objectives, evaluation, plan, aptitude, date_prochaine_visite, doctor_name, created_at, updated_at) VALUES
(1, 1, 1, '2026-01-15 09:30:00', 'Visite annuelle', 72, 175, 23.5, 120, 80, 72, 36.8, 5.2, 98, 10/10, 10/10, 'Normal', 'Normal', 82, 'Aucun symptôme', 'Bon état général, poids stable', 'Excellent', 'Continuer suivi annuel', 'Apte', '2027-01-15', 'Dr. Alami Hassan', '2026-01-15 10:00:00', '2026-01-20 11:00:00'),
(2, 2, 2, '2026-01-22 11:00:00', 'Embauche', 85, 170, 29.4, 145, 90, 80, 36.9, 6.1, 97, 9/10, 9/10, 'Normal', 'Normal', 95, 'Souci de santé', 'Surpoids, hypertension modérée', 'Bon', 'Réduction poids, régime', 'Apte avec restrictions', '2026-04-22', 'Dr. Alami Hassan', '2026-01-22 11:30:00', '2026-01-25 14:00:00'),
(3, 3, 3, '2026-02-05 15:00:00', 'Accident travail', 78, 172, 26.4, 130, 85, 75, 37.2, 5.8, 96, 10/10, 10/10, 'Normal', 'Normal', 88, 'Douleurs lombaires après chute', 'Lombalgie aiguë, pas de fracture', 'Modéré', 'Kinésithérapie, antalgiques', 'Apte temporairement', '2026-03-05', 'Dr. Bennani Fatima', '2026-02-05 16:00:00', '2026-02-10 16:00:00'),
(4, 4, 4, '2026-02-12 10:00:00', 'Contrôle trimestriel', 68, 168, 24.1, 125, 78, 70, 36.7, 5.0, 99, 10/10, 10/10, 'Normal', 'Normal', 75, 'Très bonne forme', 'Excellent état cardiovasculaire', 'Excellent', 'Continuer activités physiques', 'Apte', '2026-05-12', 'Dr. Alami Hassan', '2026-02-12 10:30:00', '2026-02-18 10:00:00'),
(5, 5, 5, '2026-02-20 12:00:00', 'Reprise maladie', 70, 174, 23.1, 118, 75, 68, 36.6, 4.9, 98, 10/10, 10/10, 'Normal', 'Normal', 80, 'Guéri, prêt à reprendre', 'Retour à normale, cicatrices visibles', 'Bon', 'Reprise progressive', 'Apte', '2026-06-20', 'Dr. Faouzi Nadia', '2026-02-20 13:00:00', '2026-02-22 15:00:00'),
(6, 6, 6, '2026-02-28 11:00:00', 'Examen pneumologique', 65, 165, 23.9, 115, 72, 65, 36.5, 4.7, 94, 9/10, 9/10, 'Normal', 'Diminué', 78, 'Essoufflement à l\'effort', 'Asthme bien contrôlé, quelques sibilances', 'Bon', 'Continuer traitement, contrôle 6 mois', 'Apte avec restrictions', '2026-08-28', 'Dr. Chraibi Omar', '2026-02-28 12:00:00', '2026-03-05 14:00:00'),
(7, 7, 7, '2026-03-03 10:00:00', 'Embauche', 62, 160, 24.2, 110, 70, 72, 36.8, 4.5, 98, 10/10, 10/10, 'Normal', 'Normal', 72, 'Aucun problème de santé', 'Excellent état, hypothyroïdie équilibrée', 'Excellent', 'Suivi hormonal trimestriel', 'Apte', '2026-06-03', 'Dr. Alami Hassan', '2026-03-03 10:30:00', '2026-03-05 11:00:00');

-- =====================================================
-- 7. MEDICAL RESTRICTIONS (Restrictions médicales)
-- =====================================================

INSERT INTO medical_restrictions (id, employe_id, examen_medical_id, description, date_debut, date_fin, est_permanent, statut, created_at, updated_at) VALUES
(1, 2, 2, 'Eviter les efforts physiques intenses pendant 3 mois', '2026-01-22', '2026-04-22', 0, 'active', '2026-01-25 14:00:00', '2026-01-25 14:00:00'),
(2, 3, 3, 'Ne pas lever de charges lourdes > 10kg pendant 1 mois', '2026-02-05', '2026-03-05', 0, 'active', '2026-02-10 16:00:00', '2026-02-10 16:00:00'),
(3, 6, 6, 'Restriction aux poussières et produits chimiques', '2026-02-28', NULL, 1, 'active', '2026-03-05 14:00:00', '2026-03-05 14:00:00'),
(4, 6, 6, 'Porter un masque dans les zones poussiéreuses', '2026-02-28', '2026-08-28', 0, 'active', '2026-03-05 14:00:00', '2026-03-05 14:00:00'),
(5, 7, 7, 'Eviter le travail de nuit de manière régulière', '2026-03-03', NULL, 1, 'active', '2026-03-05 11:00:00', '2026-03-05 11:00:00');

-- =====================================================
-- 8. MEDICAL DOCUMENTS (Documents médicaux)
-- =====================================================

INSERT INTO medical_documents (id, employe_id, examen_medical_id, type_document, file_path, description, created_at, updated_at) VALUES
(1, 1, 1, 'Certificat médical', '/documents/sst/certificats/2026/EMP001_CERT_001.pdf', 'Certificat de visite annuelle', '2026-01-20 11:00:00', '2026-01-20 11:00:00'),
(2, 3, 3, 'Rapport accident', '/documents/sst/accidents/2026/EMP003_RAP_001.pdf', 'Rapport d\'accident du travail', '2026-02-10 16:00:00', '2026-02-10 16:00:00'),
(3, 2, 2, 'Ordonnance', '/documents/sst/ordonnances/2026/EMP002_ORD_001.pdf', 'Ordonnance traitement antihypertenseur', '2026-01-25 14:00:00', '2026-01-25 14:00:00'),
(4, 6, 6, 'Rapport spécialisé', '/documents/sst/rapports/2026/EMP006_RAP_002.pdf', 'Rapport pneumologique détaillé', '2026-03-05 14:00:00', '2026-03-05 14:00:00'),
(5, 7, 7, 'Certificat medical', '/documents/sst/certificats/2026/EMP007_CERT_002.pdf', 'Certificat d\'embauche', '2026-03-05 11:00:00', '2026-03-05 11:00:00');

-- =====================================================
-- 9. SST PAYMENTS (Paiements aux praticiens)
-- =====================================================

INSERT INTO sst_payments (id, practitioner_id, amount, reference, status, payment_date, notes, created_at, updated_at) VALUES
(1, 1, 4500, 'SST-PAY-2026-001', 'paid', '2026-01-31', 'Paiement mensuel Janvier 2026 - 15 consultations', '2026-01-31 10:00:00', '2026-01-31 14:00:00'),
(2, 2, 2000, 'SST-PAY-2026-002', 'paid', '2026-02-15', 'Honoraires Febrero 2026 - 2 consultations cardiologiques', '2026-02-15 11:00:00', '2026-02-15 15:00:00'),
(3, 3, 1500, 'SST-PAY-2026-003', 'paid', '2026-02-28', 'Honoraires Février 2026 - 2 consultations pneumologiques', '2026-02-28 09:00:00', '2026-02-28 12:00:00'),
(4, 4, 6000, 'SST-PAY-2026-004', 'paid', '2026-02-28', 'Salaire Février 2026 - Infirmière SST', '2026-02-28 10:00:00', '2026-02-28 14:00:00'),
(5, 1, 4500, 'SST-PAY-2026-005', 'paid', '2026-02-28', 'Paiement mensuel Février 2026', '2026-02-28 11:00:00', '2026-02-28 15:00:00'),
(6, 6, 6000, 'SST-PAY-2026-006', 'pending', '2026-03-15', 'Salaire Mars 2026 - Médecin préventif (partiel)', '2026-03-15 08:00:00', '2026-03-15 08:00:00'),
(7, 8, 1200, 'SST-PAY-2026-007', 'pending', '2026-03-20', '2 séances Mars 2026 - Psychologue', '2026-03-20 09:00:00', '2026-03-20 09:00:00');

-- =====================================================
-- 10. SST PAYMENT VISIT (Pivot - Paiements liés aux visites)
-- =====================================================

INSERT INTO sst_payment_visit (sst_payment_id, visite_id, created_at, updated_at) VALUES
(1, 1, '2026-01-31 10:00:00', '2026-01-31 14:00:00'),
(1, 2, '2026-01-31 10:00:00', '2026-01-31 14:00:00'),
(1, 4, '2026-01-31 10:00:00', '2026-01-31 14:00:00'),
(2, 3, '2026-02-15 11:00:00', '2026-02-15 15:00:00'),
(3, 6, '2026-02-28 09:00:00', '2026-02-28 12:00:00'),
(5, 5, '2026-02-28 11:00:00', '2026-02-28 15:00:00'),
(5, 7, '2026-02-28 11:00:00', '2026-02-28 15:00:00');

-- =====================================================
-- RÉSUMÉ DES DONNÉES
-- =====================================================
-- dossier_medicals: 10 records
-- sst_practitioners: 8 records (4 actifs internes, 4 actifs externes, 1 inactif)
-- visite_s: 10 records (7 terminées, 1 en cours, 2 planifiées)
-- employe_visite: 10 records
-- examen_medicals: 7 records
-- medical_restrictions: 5 records
-- medical_documents: 5 records
-- sst_payments: 7 records (5 payés, 2 en attente)
-- sst_payment_visit: 7 pivot records