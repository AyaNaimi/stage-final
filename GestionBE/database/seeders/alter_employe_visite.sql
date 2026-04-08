ALTER TABLE employe_visite 
ADD COLUMN resultat_aptitude VARCHAR(50) NULL,
ADD COLUMN observations TEXT NULL,
ADD COLUMN date_examen DATE NULL,
ADD COLUMN heure_examen TIME NULL;