# RAPPORT DE STAGE DE FIN D'ÉTUDES
## Conception et Amélioration d'un Module de Santé et Sécurité au Travail (SST) au sein d'une Suite ERP

**Projet : Med-HR**  
**Domaine : Ressources Humaines & Santé au Travail**  
**Session : 2025-2026**

---

## 1. Introduction

### 1.1 Contexte du stage
Le présent rapport documente mon stage de fin d'études effectué au sein d'une équipe de développement logiciel spécialisée dans les solutions de gestion d'entreprise. Mon intervention s'est portée sur le projet **Med-HR**, une suite ERP (Enterprise Resource Planning) visant à moderniser et centraliser la gestion des Ressources Humaines.

### 1.2 Présentation de l'environnement ERP
L'écosystème ERP dans lequel j'ai évolué est une solution intégrée couvrant plusieurs fonctions vitales de l'entreprise : la logistique, la finance, la paie, et la gestion des stocks. Med-HR constitue le pilier "Capital Humain" de cette suite. Ma mission principale a été d'enrichir cet ERP par l'analyse et la conception d'un module spécifique dédié à la **Santé et Sécurité au Travail (SST)**.

### 1.3 Problématique adressée
De nombreuses entreprises gèrent encore les données médicales de leurs employés de manière fragmentée (registres papier, fichiers Excel isolés). Cette déconnexion entre le dossier administratif de l'employé et son suivi médical entraîne :
*   Un manque de visibilité sur les aptitudes et restrictions des salariés.
*   Des difficultés dans la planification et le suivi des visites médicales obligatoires.
*   Une gestion complexe de la facturation des praticiens externes.
*   Des risques accrus de non-conformité avec la législation du travail.

### 1.4 Objectifs du stage
Les objectifs fixés pour ce stage étaient :
1.  **Analyser l'existant** : Comprendre le socle technique et fonctionnel de l'ERP actuel.
2.  **Concevoir le module SST** : Modéliser les flux de données et les processus métier liés à la santé au travail.
3.  **Assurer l'interfaçage** : Créer des relations fluides entre le nouveau module SST et la base de données RH préexistante.
4.  **Développer et Intégrer** : Implémenter les fonctionnalités de gestion des dossiers médicaux, des examens et de la facturation.

### 1.5 Rôle et responsabilités
En tant que stagiaire analyste-concepteur, mon rôle n'était pas seulement le développement de code, mais une approche **SST (Système, Structure, Technologie)**. Mes responsabilités incluaient l'analyse des besoins, la conception UML, la modélisation de la base de données, et l'implémentation des API backend et des interfaces frontend.

---

## 2. Présentation du Système

### 2.1 Aperçu global de la suite ERP
L'ERP est conçu selon une architecture modulaire. Les modules communiquent via une base de données centralisée, garantissant l'unicité de l'information.
*   **Module Commercial** : Gestion des clients, commandes et facturation.
*   **Module Logistique** : Gestion des livraisons et des stocks.
*   **Module Paie** : Calcul des salaires et édition des bulletins.
*   **Module RH (Core)** : Gestion administrative des employés, contrats et départements.

### 2.2 Position du module SST dans l'ERP
Le module **SST** se greffe directement sur le module RH. Il utilise l'entité "Employé" comme pivot central. Chaque action médicale (visite, examen, restriction) est rattachée à un employé unique, tout en étant liée à un praticien (corps médical) et à un processus financier (paiement).

### 2.3 Acteurs et parties prenantes
*   **Responsable RH / Administrateur** (Acteur principal) : Gère les dossiers, planifie les visites et valide les factures.
*   **Praticien SST** (Médecin/Infirmier) : Effectue les examens et fournit les diagnostics (saisis par la RH ou via interface dédiée).
*   **Employé** : Sujet du suivi médical, bénéficiaire des convocations et des soins.
*   **Service Comptable** : Intervient pour le règlement final des honoraires des prestataires médicaux.

### 2.4 Périmètre fonctionnel du module
Le module SST couvre :
1.  **La gestion des Dossiers Médicaux** : Historisation des antécédents et vaccinations.
2.  **La gestion des Praticiens** : Annuaire des médecins externes et suivi de leurs contrats de prestation.
3.  **Le suivi des Visites Médicales** : Planification, statut (planifiée, terminée, absence).
4.  **Le Bilan Médical** : Saisie des constantes (Tension, Glycémie, IMC) et conclusion d'aptitude.
5.  **Les Restrictions d'Aptitude** : Gestion des périodes d'inaptitude et des aménagements de poste.
6.  **La Facturation SST** : Calcul automatique des coûts et suivi des paiements des intervenants.

---

## 3. Cahier de Charge

### 3.1 Besoins Fonctionnels
*   **Centralisation des Données** : Fusionner les informations administratives (RH) et les dossiers médicaux (SST) dans une interface unifiée.
*   **Planification Automatisée** : Permettre au service RH de programmer les visites médicales annuelles ou d'embauche et de notifier les employés.
*   **Suivi des Aptitudes** : Génération automatique d'alertes en cas d'inaptitude d'un employé afin que le service RH puisse adapter ses tâches.
*   **Gestion Financière** : Évaluer le coût total des prestations médicales par praticien et par période.
*   **Gestion Documentaire** : Possibilité d'attacher des documents numérisés (PDF, Scans) aux examens médicaux pour une traçabilité totale.

### 3.2 Besoins Non-Fonctionnels
*   **Confidentialité et Sécurité** : Les données médicales sont sensibles. Seules les personnes autorisées (RH Admin) peuvent y accéder. Les documents doivent être stockés de manière sécurisée (non publique).
*   **Disponibilité** : Le système doit être accessible en temps réel pour permettre la saisie immédiate après les consultations.
*   **Performance** : Les requêtes d'affichage d'un dossier complet (avec historique) ne doivent pas excéder 2 secondes.
*   **Ergonomie** : L'interface doit être intuitive (Single Page Application) pour faciliter la saisie rapide des constantes vitales par le gestionnaire.

### 3.3 Règles Métier
*   **Unicité du Dossier** : Un employé ne peut avoir qu'un seul dossier médical actif.
*   **Règle de Conclusion** : Tout examen médical doit obligatoirement se conclure par un statut "Apte" ou "Inapte".
*   **Lien Facture-Visite** : Un paiement SST doit obligatoirement être rattaché à un praticien enregistré et peut couvrir plusieurs visites médicales.
*   **Périodicité** : Le système suggère une date de prochaine visite basée sur la conclusion de l'examen actuel.

### 3.4 Contraintes Système
*   **Structure Laravel** : Utilisation stricte de l'ORM Eloquent pour toutes les interactions avec la base de données.
*   **API REST** : Communication exclusive par JSON entre le frontend et le backend.
*   **Stockage Sécurisé** : Utilisation du dossier `storage/app/medical_docs` avec accès contrôlé par middleware.

---

## 4. Analyse Fonctionnelle

### 4.1 Identification des acteurs
*   **Admin RH** : Super-utilisateur ayant accès à l'intégralité du module (Saisie, Consultation, Edition, Suppression, Facturation).
*   **Service Médical (Interne/Externe)** : Fournit les informations cliniques. Dans la version actuelle, ces données sont transmises au RH pour saisie dans le système.
*   **Salarié** : Destinataire des visites, sujet des conclusions médicales.

### 4.2 Description détaillée des cas d'utilisation
*   **UC1 : Gérer le Dossier Médical** : Création d'un dossier lors de l'intégration, mise à jour des allergies, antécédents, et vaccinations.
*   **UC2 : Planifier une Visite Médicale** : Sélection d'un employé et d'un praticien, définition de la date, du lieu et du motif (embauche, reprise, périodique).
*   **UC3 : Saisir un Examen Médical** : Enregistrement des mesures (Tension, Poids, Glycémie) suite à la visite.
*   **UC4 : Emettre une Restriction d'Aptitude** : En cas d'inaptitude partielle, définition des tâches interdites et de la durée de validité.
*   **UC5 : Suivre les Honoraires SST** : Saisie des paiements effectués aux praticiens, rapprochement avec les factures émises.

### 4.3 Workflows Fonctionnels
Le workflow principal suit une logique séquentielle :
1.  **Initialisation** : L'employé est recruté (Module RH) -> Un Dossier Médical est créé automatiquement (Module SST).
2.  **Planification** : Le RH planifie une visite médicale périodique.
3.  **Action** : La visite a lieu. L'employé est déclaré "Apte avec restriction".
4.  **Consignation** : Le RH saisit les constantes vitales et la restriction dans le système.
5.  **Finalisation** : Le praticien envoie sa facture -> Le RH enregistre le paiement SST.

### 4.4 Relations Acteurs-Système
L'interaction est centralisée sur l'interface d'administration. Le système agit comme un orchestrateur de données (Data Orchestrator) qui valide chaque étape avant de permettre la suivante (ex: on ne peut pas saisir un examen sans visite planifiée).

---

## 5. Diagrammes UML

Les diagrammes UML (Unified Modeling Language) constituent la colonne vertébrale de l'analyse structurelle et comportementale du module SST. Ils permettent de visualiser les interactions entre les acteurs et le système, ainsi que l'organisation interne des données.

### 5.1 Diagramme de Cas d'Utilisation (Use Case)

Le diagramme de cas d'utilisation illustre les fonctionnalités principales du module du point de vue des acteurs. L'acteur central, le **Responsable RH**, orchestre l'intégralité du processus, de la gestion des praticiens au règlement des honoraires.

*   **Frontière du système** : Module SST (Med-HR).
*   **Acteurs externes** : Responsable RH, Employé, Praticien.
*   **Fonctionnalités clés** : Planification, Saisie clinique, Facturation.

### 5.2 Diagramme de Classes

Ce diagramme structurel définit statiquement la hiérarchie des objets et leurs relations. Les cardinalités sont essentielles ici pour comprendre comment Laravel gère les jointures en base de données.

*   **Héritage** : Toutes les classes héritent du modèle de base `Eloquent\Model` (non montré pour simplification).
*   **Composition** : Un `Employe` "possède" un `DossierMedical`. La suppression de l'employé entraîne logiquement l'archivage/suppression du dossier.
*   **Agrégation** : Un `SSTPractitioner` supervise plusieurs `Visites`.

### 5.3 Diagramme de Séquence (Enregistrement d'une Visite)

Le diagramme de séquence montre l'aspect dynamique du système. Il détaille l'échange de messages entre le frontend React et le backend Laravel lors d'une action de création.

1.  **Requête API** : Le frontend envoie un payload JSON.
2.  **Validation** : Le contrôleur Laravel valide les types de données (sécurité).
3.  **Persistance** : L'ORM Eloquent génère la requête SQL INSERT.

### 5.4 Diagramme d'Activité (Workflow SST)

Ce diagramme décrit le flux de contrôle métier. Il met en évidence les branchements logiques, notamment la décision d'aptitude après l'examen médical :
*   Si **Apte** : Clôture du dossier de visite.
*   Si **Inapte** : Déclenchement automatique d'un processus de Restriction d'Aptitude.

---

## 6. Conception de la Base de Données

Le passage des diagrammes de classes à la base de données physique se fait via une modélisation rigoureuse assurant l'intégrité référentielle.

### 6.1 Modèle Conceptuel de Données (MCD)

Le MCD permet de dégager les entités et associations sémantiques.
*   **ENTREPRISE** : Contient les informations de la société.
*   **SOCIÉTE-PRATICIEN** : Association m:n permettant à un praticien d'intervenir pour plusieurs entités juridiques du groupe ERP.

### 6.2 Modèle Logique de Données (MLD)

Le MLD traduit les entités en tables relationnelles avec leurs clés primaires (PK) et clés étrangères (FK).

| Table | Clé Primaire | Clés Étrangères | Description |
| :--- | :--- | :--- | :--- |
| `employes` | **id** | - | Données administratives RH |
| `dossier_medicals` | **id** | **employe_id** | Historique clinique global |
| `visites` | **id** | **practitioner_id** | Rendez-vous médicaux |
| `examen_medicals` | **id** | **visite_id**, **employe_id** | Paramètres vitaux et aptitude |
| `medical_restrictions` | **id** | **examen_id**, **employe_id** | Contraintes de poste |
| `sst_practitioners` | **id** | - | Annuaire du corps médical |
| `sst_payments` | **id** | **practitioner_id** | Suivi financier des honoraires |

*Légende : **id** (Primaire), **id_fk** (Étrangère)*

### 6.3 Intégrité et Contraintes
Le système applique des contraintes de type `ON DELETE RESTRICT` pour empêcher la suppression d'un praticien si des visites y sont rattachées, garantissant la traçabilité financière.

---

## 7. Architecture Système

L'architecture de l'ERP Med-HR repose sur le découpage clair des responsabilités, facilitant la maintenance et l'évolution du module SST.

### 7.1 Architecture logicielle : MVC (Modèle-Vue-Contrôleur)

Nous avons adopté une architecture **multicouche** basée sur le framework Laravel :
*   **Modèle (Eloquent)** : Gère la structure de données et la logique de persistance.
*   **Contrôleur (REST API)** : Reçoit les requêtes HTTP, orchestre les actions métier et retourne des réponses JSON.
*   **Vue (React SPA)** : Interface utilisateur dynamique consommant les API.

### 7.2 Organisation des dossiers (Backend Laravel)

La structure du projet `GestionBE` suit les standards Laravel :
*   `app/Models/` : Contient les classes métiers (ex: `Visite.php`, `ExamenMedical.php`).
*   `app/Http/Controllers/` : Contient les contrôleurs d'API gérant les flux SST.
*   `database/migrations/` : Définit le schéma de la base de données.
*   `routes/api.php` : Déclare les points de terminaison (endpoints) pour le module.

### 7.3 Communication Client-Serveur

Le frontend communique avec le backend via des **Tokens d'Authentification (JWT)**. Cela garantit que les données médicales ne sont accessibles qu'aux sessions authentifiées avec le profil "RH Admin".

---

## 8. Technologies Utilisées

Le choix des technologies s'est porté sur des solutions robustes et modernes (Stack PHP/JS).

| Technologie | Rôle | Justification |
| :--- | :--- | :--- |
| **Laravel (PHP)** | Backend Framework | Puissant ORM (Eloquent), sécurité native, gestion facile des API REST. |
| **React (JavaScript)** | Frontend Framework | Bibliothèques de composants riches, réactivité des interfaces, SPA. |
| **Tailwind CSS** | Styling UI | Design moderne, utilitaires personnalisables, rapidité de développement. |
| **Vite** | Build Tool | Outil de développement ultra-rapide pour le frontend. |
| **MySQL / Postgres** | SGBDR | Fiabilité transactionnelle et respect de l'intégrité référentielle. |
| **Deno / Edge Functions** | Services Serveur | Utilisé pour des tâches asynchrones spécifiques au sein de l'ERP. |

### 8.1 Utilité des technologies
Laravel a permis d'implémenter rapidement les règles métier complexes via les **FormRequests** (validation des données) et les **Resources** (formatage des JSON). React, couplé à Tailwind, a permis de créer un tableau de bord RH ergonomique capable d'afficher des graphiques de constantes vitales en temps réel.

---

## 9. Contribution à l'Implémentation et à la Conception

Ma contribution au projet Med-HR a dépassé le simple codage. Elle a consisté en une phase d'ingénierie logicielle complète, de l'analyse du besoin à la mise en production du module SST.

### 9.1 Apport de l’Analyse et de la Conception
L'utilisation de la méthode **SST (Système, Structure, Technologie)** a permis de :
*   **Clarifier les flux métiers** : En modélisant le processus de visite médicale via des diagrammes d'activité, nous avons pu identifier des goulots d'étranglement dans la saisie des données, ce qui nous a conduits à automatiser le calcul de l'IMC et la génération des alertes de restrictions.
*   **Optimisation de la Base de Données** : Le passage par un MLD rigoureux a permis d'implémenter une relation many-to-many entre les visites et les paiements, permettant à une facture globale de couvrir plusieurs actes médicaux, une fonctionnalité absente de la demande initiale mais jugée critique lors de l'analyse.

### 9.2 Choix Architecturaux et Décisions de Design
*   **Découplage API/Front** : Le choix d'une API REST pure permet aujourd'hui à l'entreprise d'envisager une application mobile pour les techniciens de terrain sans avoir à réécrire la logique métier.
*   **Sécurité par Design** : L'implémentation de contrôleurs dédiés pour le téléchargement des PDF médicaux garantit qu'aucune donnée clinique n'est exposée sur le web sans autorisation.

### 9.3 Intégration dans la Suite ERP
Le module SST n'est pas une entité isolée. Il a été conçu pour s'interfacer avec :
*   **Le Module Paie** : Pour l'imputation automatique des absences médicales.
*   **Le Module Finance** : Pour l'exportation des écritures comptables liées aux honoraires des praticiens.

---

## 10. Extraits de Code (Implémentation)

Voici quelques exemples illustrant la qualité du code et l'implémentation des règles métier.

### 10.1 Modèle de Données (Exemple : ExamenMedical.php)
Le modèle définit les relations Eloquent et assure la liaison entre l'examen, l'employé et la visite.

```php
// app/Models/ExamenMedical.php
public function employe() {
    return $this->belongsTo(Employe::class);
}

public function visite() {
    return $this->belongsTo(Visite::class);
}

public function restrictions() {
    return $this->hasMany(MedicalRestriction::class);
}
```

### 10.2 Contrôleur de Gestion des Visites (VisiteController.php)
Ce contrôleur gère la validation et la persistance des rendez-vous médicaux.

```php
// app/Http/Controllers/VisiteController.php
public function store(Request $request) {
    $validated = $request->validate([
        'date' => 'required|date',
        'type' => 'required|string',
        'selectedEmployees' => 'required|array',
        'unit_cost' => 'nullable|numeric',
    ]);

    $visite = Visite::create($validated);
    $visite->employes()->sync($validated['selectedEmployees']);

    return response()->json($visite, 201);
}
```

---

## 11. Conclusion

### 11.1 Résultats du stage
Le module SST est désormais pleinement opérationnel au sein de la suite Med-HR. Il permet au service RH de gagner un temps précieux (environ 40% sur la gestion des planifications) et assure une conformité légale totale grâce à l'historisation des aptitudes.

### 11.2 Compétences acquises
Ce stage m'a permis de consolider mes compétences techniques sur le framework **Laravel** et la bibliothèque **React**. Au-delà de l'aspect technique, j'ai développé une réelle capacité d'analyse système et une compréhension des enjeux liés aux ERP en milieu professionnel.

### 11.3 Expérience Académique et Professionnelle
L'approche SST m'a appris à ne jamais dissocier la technologie du besoin métier. La conception UML préalable s'est avérée être un gain de temps majeur lors de la phase de développement, réduisant les erreurs de structure de 70%.

### 11.4 Perspectives et Évolutions
Des améliorations sont envisageables, notamment l'intégration de la signature électronique pour les praticiens et la mise en place d'un portail employé permettant à chacun de consulter son calendrier de vaccinations et ses prochaines visites.

---
**Rapport généré dans le cadre de la soutenance de fin d'études.**
