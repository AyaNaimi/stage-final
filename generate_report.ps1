param(
  [string]$OutPath = "C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\rapport_stage_Med-HR_a.docx"
)

$ErrorActionPreference = 'Stop'

$analysisPath = "C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\analysis_clean.json"
$data = Get-Content -Raw -Path $analysisPath | ConvertFrom-Json

# Metadata (mock)
$student = 'a'
$academic = 'b'
$mentor = 'c'
$establishment = 'd'
$company = 'e'
$session = '2026'
$period = '12 février 2026 – 12 mars 2026'
$projectName = 'Med-HR'
$reportTitle = "Rapport de stage de fin d'études"
$projectSubtitle = "Conception et amélioration du module SST"

# Word constants
$wdSectionBreakNextPage = 2
$wdPageBreak = 7
$wdFieldTOC = 13
$wdFieldTOF = 18
$wdAlignParagraphCenter = 1
$wdAlignParagraphJustify = 3
$wdAlignParagraphLeft = 0
$wdAlignParagraphRight = 2

# Colors (BGR)
$wdColorNavy = 0x45250B # #0B2545
$wdColorTeal = 0x5B6D00  # #006D5B
$wdColorGold = 0x2A92B8  # #B8922A
$wdColorText = 0x1E0F05  # #050F1E
$wdColorGrey = 0xFAF8F7  # #F7F8FA
$wdColorLightGrey = 0xDDE3EA
$wdColorCharcoal = 0x2B2B2B

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Add()

# Page setup
$doc.PageSetup.PaperSize = 7 # A4
$doc.PageSetup.LeftMargin = 72 * 1.18
$doc.PageSetup.RightMargin = 72 * 0.76
$doc.PageSetup.TopMargin = 72
$doc.PageSetup.BottomMargin = 72

function Add-Para([string]$text, [int]$size=21, [bool]$bold=$false, [bool]$italic=$false, [int]$align=$wdAlignParagraphJustify, [string]$font='Georgia', [int]$spaceAfter=14) {
  $p = $doc.Paragraphs.Add()
  $p.Range.Text = $text
  $p.Range.Font.Name = $font
  $p.Range.Font.Size = $size
  $p.Range.Font.Bold = [int]$bold
  $p.Range.Font.Italic = [int]$italic
  $p.Alignment = $align
  $p.Range.ParagraphFormat.SpaceAfter = $spaceAfter
  $p.Range.ParagraphFormat.LineSpacingRule = 0
  $p.Range.ParagraphFormat.LineSpacing = 24
  $p.Range.InsertParagraphAfter() | Out-Null
  return $p
}

function Add-Heading([string]$text, [int]$level=1) {
  $p = $doc.Paragraphs.Add()
  $p.Range.Text = $text
  if ($level -eq 1) {
    $p.Range.Style = 'Heading 1'
    $p.Range.Font.Name = 'Arial'
    $p.Range.Font.Size = 28
    $p.Range.Font.Bold = 1
    $p.Range.Font.Color = $wdColorNavy
  } elseif ($level -eq 2) {
    $p.Range.Style = 'Heading 2'
    $p.Range.Font.Name = 'Arial'
    $p.Range.Font.Size = 23
    $p.Range.Font.Bold = 1
    $p.Range.Font.Color = $wdColorNavy
  } else {
    $p.Range.Style = 'Heading 3'
    $p.Range.Font.Name = 'Arial'
    $p.Range.Font.Size = 21
    $p.Range.Font.Bold = 1
    $p.Range.Font.Color = $wdColorNavy
  }
  $p.Range.InsertParagraphAfter() | Out-Null
}

function Add-PageBreak(){
  $doc.Paragraphs.Last.Range.InsertBreak($wdPageBreak) | Out-Null
}

function Add-SectionBreak(){
  $doc.Paragraphs.Last.Range.InsertBreak($wdSectionBreakNextPage) | Out-Null
}

function Add-Image([string]$path, [int]$width=420, [int]$height=0){
  $rng = $doc.Paragraphs.Add().Range
  $shape = $doc.InlineShapes.AddPicture($path, $false, $true, $rng)
  if ($width -gt 0) { $shape.Width = $width }
  if ($height -gt 0) { $shape.Height = $height }
  $doc.Paragraphs.Last.Alignment = $wdAlignParagraphCenter
  $doc.Paragraphs.Last.Range.InsertParagraphAfter() | Out-Null
}

# Cover page
$coverTable = $doc.Tables.Add($doc.Range(0,0), 1, 2)
$coverTable.Columns.Item(1).Width = $doc.PageSetup.PageWidth * 0.64
$coverTable.Columns.Item(2).Width = $doc.PageSetup.PageWidth * 0.36

$left = $coverTable.Cell(1,1).Range
$left.Text = "LOGO OFPPT    |    LOGO ENTREPRISE`r`n"
$left.Font.Name = 'Arial'
$left.Font.Size = 16
$left.ParagraphFormat.Alignment = $wdAlignParagraphLeft

$left.InsertParagraphAfter() | Out-Null
$band = $coverTable.Cell(1,1).Range.Paragraphs.Add()
$band.Range.Text = ""
$band.Range.Shading.BackgroundPatternColor = 0x1038C4 # #C43810
$band.Range.ParagraphFormat.SpaceAfter = 6
$band.Range.ParagraphFormat.SpaceBefore = 6

$left.InsertParagraphAfter() | Out-Null
$tbl = $coverTable.Cell(1,1).Tables.Add($coverTable.Cell(1,1).Range, 1, 1)
$tbl.Cell(1,1).Shading.BackgroundPatternColor = $wdColorNavy
$tbl.Cell(1,1).Range.Text = "$reportTitle`r`n$projectName`r`n$projectSubtitle"
$tbl.Cell(1,1).Range.Font.Name = 'Arial'
$tbl.Cell(1,1).Range.Font.Size = 32
$tbl.Cell(1,1).Range.Font.Bold = 1
$tbl.Cell(1,1).Range.Font.Color = 0xFFFFFF
$tbl.Cell(1,1).Range.ParagraphFormat.Alignment = $wdAlignParagraphLeft

$meta = $coverTable.Cell(1,1).Tables.Add($coverTable.Cell(1,1).Range, 3, 2)
$meta.Cell(1,1).Range.Text = "Étudiant"
$meta.Cell(1,2).Range.Text = $student
$meta.Cell(2,1).Range.Text = "Période"
$meta.Cell(2,2).Range.Text = $period
$meta.Cell(3,1).Range.Text = "Établissement"
$meta.Cell(3,2).Range.Text = $establishment
$meta.Range.Font.Name = 'Arial'
$meta.Range.Font.Size = 14
$meta.Range.Font.Color = $wdColorText

$right = $coverTable.Cell(1,2).Range
$right.Shading.BackgroundPatternColor = $wdColorNavy
$right.Text = ""

$conf = $doc.Paragraphs.Add()
$conf.Range.Text = "CONFIDENTIEL"
$conf.Range.Font.Name = 'Arial'
$conf.Range.Font.Size = 16
$conf.Range.Font.Bold = 1
$conf.Range.Font.Color = 0xFFFFFF
$conf.Range.Shading.BackgroundPatternColor = $wdColorCharcoal
$conf.Alignment = $wdAlignParagraphCenter

Add-SectionBreak

$sec = $doc.Sections.Item(2)
$sec.Headers.Item(1).Range.Text = "$projectName   |   "
$sec.Headers.Item(1).Range.Font.Name = 'Arial'
$sec.Headers.Item(1).Range.Font.Size = 10
$sec.Headers.Item(1).Range.Font.Bold = 1
$sec.Footers.Item(1).Range.Text = "CONFIDENTIEL  USAGE STRICTEMENT INTERNE"
$sec.Footers.Item(1).Range.Font.Name = 'Arial'
$sec.Footers.Item(1).Range.Font.Size = 9

# Dedication
Add-Heading "Dédicace" 1
Add-Para "Je dédie ce travail à ma famille et à toutes les personnes qui ont soutenu mon parcours." 21 $false $false $wdAlignParagraphCenter 'Georgia' 24
Add-SectionBreak

# Thanks
Add-Heading "Remerciements" 1
Add-Para "Je remercie mon encadrant académique, $academic, pour ses conseils et sa disponibilité." 21
Add-Para "Je remercie mon maître de stage, $mentor, pour son accompagnement et son exigence professionnelle." 21
Add-Para "Je remercie l'entreprise $company pour l'opportunité et la confiance accordées." 21
Add-SectionBreak

# Resume / Abstract
Add-Heading "Résumé" 1
Add-Para "Ce rapport présente la conception et l'implémentation du module SST au sein de la suite $projectName. L'analyse s'appuie sur le code source réel (Laravel 10 / React 18) afin de décrire les modèles, les routes API, la base de données et les interfaces." 21
Add-Para "Mots-clés : SST, Med-HR, Laravel, React, API REST, Dossier médical" 20 $false $true $wdAlignParagraphLeft 'Georgia' 14
Add-SectionBreak

Add-Heading "Abstract" 1
Add-Para "This report presents the design and implementation of the SST module within the $projectName suite. The analysis is grounded in the actual source code (Laravel 10 / React 18) to document models, API routes, database schema, and user interfaces." 21
Add-Para "Keywords: SST, Med-HR, Laravel, React, REST API, Medical record" 20 $false $true $wdAlignParagraphLeft 'Georgia' 14
Add-SectionBreak

# TOC
Add-Heading "Table des matières" 1
$doc.Fields.Add($doc.Paragraphs.Last.Range, $wdFieldTOC) | Out-Null
Add-SectionBreak

# List of figures/tables
Add-Heading "Liste des figures" 1
$doc.Fields.Add($doc.Paragraphs.Last.Range, $wdFieldTOF) | Out-Null
Add-SectionBreak

Add-Heading "Liste des tableaux" 1
$doc.Fields.Add($doc.Paragraphs.Last.Range, $wdFieldTOF) | Out-Null
Add-SectionBreak

# Glossary
Add-Heading "Glossaire" 1
$gTable = $doc.Tables.Add($doc.Paragraphs.Last.Range, 6, 3)
$gTable.Range.Font.Name = 'Arial'
$gTable.Range.Font.Size = 12
$gTable.Rows.Item(1).Range.Shading.BackgroundPatternColor = $wdColorNavy
$gTable.Rows.Item(1).Range.Font.Color = 0xFFFFFF
$gTable.Cell(1,1).Range.Text = "Abréviation"
$gTable.Cell(1,2).Range.Text = "Signification"
$gTable.Cell(1,3).Range.Text = "Contexte"
$gTable.Cell(2,1).Range.Text = "SST"
$gTable.Cell(2,2).Range.Text = "Santé et Sécurité au Travail"
$gTable.Cell(2,3).Range.Text = "Module médical"
$gTable.Cell(3,1).Range.Text = "API"
$gTable.Cell(3,2).Range.Text = "Application Programming Interface"
$gTable.Cell(3,3).Range.Text = "Communication front/back"
$gTable.Cell(4,1).Range.Text = "ORM"
$gTable.Cell(4,2).Range.Text = "Object Relational Mapping"
$gTable.Cell(4,3).Range.Text = "Eloquent"
$gTable.Cell(5,1).Range.Text = "SPA"
$gTable.Cell(5,2).Range.Text = "Single Page Application"
$gTable.Cell(5,3).Range.Text = "Interface React"
$gTable.Cell(6,1).Range.Text = "MLD"
$gTable.Cell(6,2).Range.Text = "Modèle Logique de Données"
$gTable.Cell(6,3).Range.Text = "Schéma DB"
Add-SectionBreak

# Chapter 1
Add-Heading "CHAPITRE 1 — INTRODUCTION GÉNÉRALE" 1
Add-Heading "1.1 Contexte du stage" 2
Add-Para "Stage de fin d'études réalisé dans le cadre de la conception et l'amélioration du module SST de $projectName. L'analyse s'appuie sur le code backend Laravel (GestionBE) et le frontend React (ProjetFront)." 21
Add-Heading "1.2 Présentation de l'environnement du projet" 2
Add-Para "Le projet est structuré en deux applications : un backend Laravel 10 exposant des endpoints REST et un frontend React 18 consommant ces APIs. La base de données est versionnée par migrations." 21
Add-Heading "1.3 Problématique" 2
Add-Para "Assurer un suivi médical structuré (visites, examens, restrictions, documents) tout en maintenant la cohérence avec les données RH et la traçabilité financière des prestations SST." 21
Add-Heading "1.4 Objectifs et structure du rapport" 2
Add-Para "Décrire le besoin, modéliser les données et les flux, présenter l'architecture, puis documenter la réalisation technique à partir du code réel." 21
Add-SectionBreak

# Chapter 2
Add-Heading "CHAPITRE 2 — PRÉSENTATION DE L'ORGANISME" 1
Add-Heading "2.1 L'entreprise d'accueil" 2
Add-Para "Entreprise : $company. Le stage porte sur un module logiciel de gestion RH/SST intégré à $projectName." 21
Add-Heading "2.2 Système existant / suite logicielle" 2
Add-Para "Le socle applicatif couvre la gestion RH, la logistique, la finance et la facturation. Le module SST s'intègre au noyau RH via l'entité Employe et ses relations médicales." 21
Add-Heading "2.3 Acteurs et parties prenantes" 2
Add-Para "Les acteurs identifiés dans le code sont principalement les responsables RH, les praticiens SST et les employés suivis." 21
Add-SectionBreak

# Chapter 3
Add-Heading "CHAPITRE 3 — CAHIER DES CHARGES" 1
Add-Heading "3.1 Besoins fonctionnels" 2
Add-Para "Les besoins sont déduits des modèles et routes SST : gestion des dossiers médicaux, planification des visites, saisie des examens, gestion des restrictions et des documents, gestion financière des praticiens et paiements." 21
Add-Heading "3.2 Exigences non-fonctionnelles" 2
Add-Para "Sécurisation des données médicales, accessibilité via API REST, traçabilité des opérations, et performances acceptables pour l'affichage des dossiers complets." 21
Add-Heading "3.3 Règles métier" 2
Add-Para "Un employé possède un dossier médical, des examens et des restrictions; une visite peut concerner plusieurs employés; un paiement peut couvrir plusieurs visites (table pivot sst_payment_visit)." 21
Add-Heading "3.4 Contraintes système" 2
Add-Para "Utilisation de Laravel 10 (Eloquent) et React 18 (SPA), base de données migrée par scripts PHP." 21
Add-SectionBreak

# Chapter 4
Add-Heading "CHAPITRE 4 — ANALYSE FONCTIONNELLE" 1
Add-Heading "4.1 Identification des acteurs" 2
Add-Para "Responsable RH (administration), Praticien SST (prestataire), Employé (sujet médical)." 21

$ucs = @(
  @{id='UC1'; title='Gérer les dossiers médicaux'; desc='Création, consultation et mise à jour du dossier médical via /dossiers-medicaux et /employes/{employe}/dossier-medical.'},
  @{id='UC2'; title='Planifier une visite médicale'; desc='Création et suivi des visites via /visites et association des employés via employe_visite.'},
  @{id='UC3'; title='Saisir un examen médical'; desc='Saisie des constantes et conclusions via /examens-medicaux.'},
  @{id='UC4'; title='Gérer les restrictions médicales'; desc='Création et suivi des restrictions via /restrictions-medicales.'},
  @{id='UC5'; title='Gérer les documents médicaux'; desc='Upload et consultation via /documents-medicaux.'},
  @{id='UC6'; title='Gérer les praticiens SST'; desc='Gestion des praticiens via /sst-practitioners.'},
  @{id='UC7'; title='Gérer les paiements SST'; desc='Gestion financière via /sst-payments et pivot sst_payment_visit.'}
)

foreach ($uc in $ucs) {
  Add-Heading "4.2 $($uc.id) — $($uc.title)" 2
  Add-Para $uc.desc 21
  Add-Para "Acteur principal : Responsable RH" 21
  Add-Para "Préconditions : employé existant (table employes), droits d'accès API." 21
  Add-Para "Postconditions : données persistées en base via migrations SST." 21
  Add-PageBreak
}

Add-Heading "4.3 Diagramme de cas d'utilisation" 2
Add-Image "C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\generated_assets\\diagram_use_case.svg" 420
Add-Heading "4.4 Workflow fonctionnel" 2
Add-Image "C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\generated_assets\\diagram_activity.svg" 420
Add-SectionBreak

# Chapter 5 UML
Add-Heading "CHAPITRE 5 — MODÉLISATION UML" 1
Add-Heading "5.1 Diagramme de classes" 2
Add-Image "C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\generated_assets\\diagram_class.svg" 420
Add-Heading "5.2 Diagramme de séquence" 2
Add-Image "C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\generated_assets\\diagram_sequence.svg" 420
Add-Heading "5.3 Diagramme d'activité" 2
Add-Image "C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\generated_assets\\diagram_activity.svg" 420
Add-SectionBreak

# Chapter 6 DB
Add-Heading "CHAPITRE 6 — CONCEPTION BASE DE DONNÉES" 1
Add-Heading "6.1 MCD" 2
Add-Para "Le MCD met en évidence les entités employes, dossiers médicaux, visites, examens, restrictions, documents et praticiens SST." 21
Add-Heading "6.2 MLD" 2
Add-Image "C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\generated_assets\\diagram_mld.svg" 420

$tables = @{}
foreach ($mig in $data.migrations) {
  if (-not $tables.ContainsKey($mig.table)) { $tables[$mig.table] = @() }
  foreach ($col in $mig.columns) { $tables[$mig.table] += $col }
}
$allTables = $tables.Keys | Sort-Object
$rows = 1
foreach ($t in $allTables) { $rows += $tables[$t].Count }
if ($rows -lt 2) { $rows = 2 }
$tbl = $doc.Tables.Add($doc.Paragraphs.Last.Range, $rows, 4)
$tbl.Range.Font.Name = 'Arial'
$tbl.Range.Font.Size = 10
$tbl.Rows.Item(1).Range.Shading.BackgroundPatternColor = $wdColorNavy
$tbl.Rows.Item(1).Range.Font.Color = 0xFFFFFF
$tbl.Cell(1,1).Range.Text = 'Table'
$tbl.Cell(1,2).Range.Text = 'Colonne'
$tbl.Cell(1,3).Range.Text = 'Type'
$tbl.Cell(1,4).Range.Text = 'Contraintes'

$r = 2
foreach ($t in $allTables) {
  foreach ($col in $tables[$t]) {
    $tbl.Cell($r,1).Range.Text = $t
    $tbl.Cell($r,2).Range.Text = $col.name
    $tbl.Cell($r,3).Range.Text = $col.type
    $tbl.Cell($r,4).Range.Text = $col.mods
    $r++
  }
}
Add-SectionBreak

# Chapter 7 Architecture
Add-Heading "CHAPITRE 7 — ARCHITECTURE SYSTÈME" 1
Add-Heading "7.1 Architecture multicouche" 2
Add-Para "Architecture MVC Laravel côté backend et SPA React côté frontend. Les échanges se font via API REST JSON." 21
Add-Heading "7.2 Endpoints API REST" 2
$routes = $data.routes
$routeRows = $routes.Count + 1
$rt = $doc.Tables.Add($doc.Paragraphs.Last.Range, $routeRows, 4)
$rt.Range.Font.Name = 'Arial'
$rt.Range.Font.Size = 9
$rt.Rows.Item(1).Range.Shading.BackgroundPatternColor = $wdColorNavy
$rt.Rows.Item(1).Range.Font.Color = 0xFFFFFF
$rt.Cell(1,1).Range.Text = 'Méthode'
$rt.Cell(1,2).Range.Text = 'URI'
$rt.Cell(1,3).Range.Text = 'Action'
$rt.Cell(1,4).Range.Text = 'Middleware'
$r = 2
foreach ($route in $routes) {
  $rt.Cell($r,1).Range.Text = $route.method
  $rt.Cell($r,2).Range.Text = $route.uri
  $rt.Cell($r,3).Range.Text = $route.action
  $rt.Cell($r,4).Range.Text = ($route.middleware -join ', ')
  $r++
}
Add-Heading "7.3 Sécurité et authentification" 2
Add-Para "Les routes API principales sont protégées par middleware auth:sanctum (voir routes/api.php)." 21
Add-SectionBreak

# Chapter 8 Tech
Add-Heading "CHAPITRE 8 — TECHNOLOGIES UTILISÉES" 1
Add-Heading "8.1 Stack technologique" 2
$techTable = $doc.Tables.Add($doc.Paragraphs.Last.Range, 6, 3)
$techTable.Range.Font.Name = 'Arial'
$techTable.Range.Font.Size = 11
$techTable.Rows.Item(1).Range.Shading.BackgroundPatternColor = $wdColorNavy
$techTable.Rows.Item(1).Range.Font.Color = 0xFFFFFF
$techTable.Cell(1,1).Range.Text = 'Technologie'
$techTable.Cell(1,2).Range.Text = 'Version'
$techTable.Cell(1,3).Range.Text = 'Rôle'
$techTable.Cell(2,1).Range.Text = 'Laravel'
$techTable.Cell(2,2).Range.Text = '10.x'
$techTable.Cell(2,3).Range.Text = 'Backend API'
$techTable.Cell(3,1).Range.Text = 'PHP'
$techTable.Cell(3,2).Range.Text = '8.1'
$techTable.Cell(3,3).Range.Text = 'Langage serveur'
$techTable.Cell(4,1).Range.Text = 'React'
$techTable.Cell(4,2).Range.Text = '18.x'
$techTable.Cell(4,3).Range.Text = 'Frontend SPA'
$techTable.Cell(5,1).Range.Text = 'Vite'
$techTable.Cell(5,2).Range.Text = '5.x'
$techTable.Cell(5,3).Range.Text = 'Build tooling'
$techTable.Cell(6,1).Range.Text = 'MySQL/PostgreSQL'
$techTable.Cell(6,2).Range.Text = '—'
$techTable.Cell(6,3).Range.Text = 'Base de données'

Add-Heading "8.2 Patterns et bonnes pratiques" 2
Add-Para "Utilisation de l'ORM Eloquent, séparation des responsabilités via contrôleurs REST, validations côté backend et composants réutilisables côté frontend." 21
Add-SectionBreak

# Chapter 9 UI
Add-Heading "CHAPITRE 9 — IMPLÉMENTATION & RÉALISATION" 1
Add-Heading "9.1 Tableau de bord" 2
Add-Image "C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\generated_assets\\mock_dashboard.svg" 420
Add-Para "Interface principale regroupant indicateurs SST et historiques." 21
Add-Heading "9.2 Formulaire de visite" 2
Add-Image "C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\generated_assets\\mock_form.svg" 420
Add-Para "Formulaire de création basé sur les champs de la table visites." 21
Add-Heading "9.3 Liste des visites" 2
Add-Image "C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\generated_assets\\mock_list.svg" 420
Add-Para "Tableau de suivi des visites et statuts." 21
Add-Heading "9.4 Détail dossier médical" 2
Add-Image "C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\generated_assets\\mock_detail.svg" 420
Add-Para "Vue consolidée des examens, restrictions et documents." 21
Add-Heading "9.5 Connexion" 2
Add-Image "C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\generated_assets\\mock_login.svg" 420
Add-Para "Authentification via API protégée (auth:sanctum)." 21
Add-SectionBreak

# Chapter 10 Code extracts
Add-Heading "CHAPITRE 10 — EXTRAITS DE CODE SIGNIFICATIFS" 1

$examenPath = "C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\GestionBE\\app\\Models\\ExamenMedical.php"
if (Test-Path $examenPath) {
  Add-Heading "10.1 Modèle ExamenMedical" 2
  $code = Get-Content -Raw -Path $examenPath
  Add-Para $code 12 $false $false $wdAlignParagraphLeft 'Courier New' 6
}

$visiteCtrl = "C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\GestionBE\\app\\Http\\Controllers\\VisiteController.php"
if (Test-Path $visiteCtrl) {
  Add-Heading "10.2 Contrôleur VisiteController" 2
  $code = Get-Content -Raw -Path $visiteCtrl
  Add-Para $code 10 $false $false $wdAlignParagraphLeft 'Courier New' 6
}

$visiteMig = "C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\GestionBE\\database\\migrations\\2026_02_07_132745_create_visites_table.php"
if (Test-Path $visiteMig) {
  Add-Heading "10.3 Migration create_visites_table" 2
  $code = Get-Content -Raw -Path $visiteMig
  Add-Para $code 10 $false $false $wdAlignParagraphLeft 'Courier New' 6
}

$compPath = "C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\ProjetFront\\src\\Zakaria\\SST\\SSTVisits.jsx"
if (Test-Path $compPath) {
  Add-Heading "10.4 Composant Frontend SSTVisits" 2
  $code = Get-Content -Raw -Path $compPath
  Add-Para $code 9 $false $false $wdAlignParagraphLeft 'Courier New' 6
}

Add-Heading "10.5 Tableau des tests" 2
$testTable = $doc.Tables.Add($doc.Paragraphs.Last.Range, 4, 4)
$testTable.Range.Font.Name = 'Arial'
$testTable.Range.Font.Size = 10
$testTable.Rows.Item(1).Range.Shading.BackgroundPatternColor = $wdColorNavy
$testTable.Rows.Item(1).Range.Font.Color = 0xFFFFFF
$testTable.Cell(1,1).Range.Text = 'ID'
$testTable.Cell(1,2).Range.Text = 'Description'
$testTable.Cell(1,3).Range.Text = 'Type'
$testTable.Cell(1,4).Range.Text = 'Fichier'
$testTable.Cell(2,1).Range.Text = 'T-01'
$testTable.Cell(2,2).Range.Text = 'ExampleTest (Feature)'
$testTable.Cell(2,3).Range.Text = 'PHPUnit Feature'
$testTable.Cell(2,4).Range.Text = 'tests/Feature/ExampleTest.php'
$testTable.Cell(3,1).Range.Text = 'T-02'
$testTable.Cell(3,2).Range.Text = 'ExampleTest (Unit)'
$testTable.Cell(3,3).Range.Text = 'PHPUnit Unit'
$testTable.Cell(3,4).Range.Text = 'tests/Unit/ExampleTest.php'
$testTable.Cell(4,1).Range.Text = 'T-03'
$testTable.Cell(4,2).Range.Text = 'Setup Tests'
$testTable.Cell(4,3).Range.Text = 'React Testing Library'
$testTable.Cell(4,4).Range.Text = 'ProjetFront/src/setupTests.js'

Add-SectionBreak

# Chapter 11 Conclusion
Add-Heading "CHAPITRE 11 — CONCLUSION & PERSPECTIVES" 1
Add-Heading "11.1 Bilan des résultats" 2
Add-Para "Le module SST couvre la gestion des dossiers médicaux, des visites, des examens, des restrictions, des documents et de la facturation SST." 21
Add-Heading "11.2 Compétences développées" 2
Add-Para "Laravel, Eloquent, conception de schémas relationnels, React SPA, intégration API REST." 21
Add-Heading "11.3 Enseignements méthodologiques" 2
Add-Para "L'alignement entre modèle de données, routes API et interfaces UI garantit la cohérence fonctionnelle." 21
Add-Heading "11.4 Roadmap d'évolution" 2
$road = $doc.Tables.Add($doc.Paragraphs.Last.Range, 4, 3)
$road.Range.Font.Name = 'Arial'
$road.Range.Font.Size = 10
$road.Rows.Item(1).Range.Shading.BackgroundPatternColor = $wdColorNavy
$road.Rows.Item(1).Range.Font.Color = 0xFFFFFF
$road.Cell(1,1).Range.Text = 'Version'
$road.Cell(1,2).Range.Text = 'Fonctionnalité'
$road.Cell(1,3).Range.Text = 'Horizon'
$road.Cell(2,1).Range.Text = 'v1.1'
$road.Cell(2,2).Range.Text = 'Tableau de bord analytique SST'
$road.Cell(2,3).Range.Text = 'Court terme'
$road.Cell(3,1).Range.Text = 'v1.2'
$road.Cell(3,2).Range.Text = 'Notifications automatiques des visites'
$road.Cell(3,3).Range.Text = 'Moyen terme'
$road.Cell(4,1).Range.Text = 'v2.0'
$road.Cell(4,2).Range.Text = 'Portail employé'
$road.Cell(4,3).Range.Text = 'Long terme'

Add-SectionBreak

# Bibliography
Add-Heading "Bibliographie" 1
Add-Para "Documentation Laravel 10" 21
Add-Para "Documentation React 18" 21
Add-Para "Code source interne $projectName" 21
Add-SectionBreak

# Annexes
Add-Heading "Annexes" 1
Add-Heading "Annexe A — Routes API" 2
$routeText = Get-Content -Raw -Path "C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\GestionBE\\routes\\api.php"
Add-Para $routeText 9 $false $false $wdAlignParagraphLeft 'Courier New' 6

Add-Heading "Annexe B — Validation (extrait contrôleur)" 2
if (Test-Path $visiteCtrl) {
  $code = Get-Content -Raw -Path $visiteCtrl
  Add-Para $code 9 $false $false $wdAlignParagraphLeft 'Courier New' 6
}

Add-Heading "Annexe C — Environnement de développement" 2
$env = $doc.Tables.Add($doc.Paragraphs.Last.Range, 5, 2)
$env.Range.Font.Name = 'Arial'
$env.Range.Font.Size = 10
$env.Rows.Item(1).Range.Shading.BackgroundPatternColor = $wdColorNavy
$env.Rows.Item(1).Range.Font.Color = 0xFFFFFF
$env.Cell(1,1).Range.Text = 'Élément'
$env.Cell(1,2).Range.Text = 'Valeur'
$env.Cell(2,1).Range.Text = 'Backend'
$env.Cell(2,2).Range.Text = 'Laravel 10, PHP 8.1'
$env.Cell(3,1).Range.Text = 'Frontend'
$env.Cell(3,2).Range.Text = 'React 18, Vite 5'
$env.Cell(4,1).Range.Text = 'BD'
$env.Cell(4,2).Range.Text = 'MySQL/PostgreSQL (migrations)'
$env.Cell(5,1).Range.Text = 'Outils'
$env.Cell(5,2).Range.Text = 'Composer, npm'

$doc.SaveAs([ref]$OutPath)
$doc.Close()
$word.Quit()

Write-Host "Saved to $OutPath"
