$ErrorActionPreference = 'Stop'

$root = "C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr"
$outDocx = Join-Path $root "rapport_stage_Med-HR_a.docx"
$tmp = Join-Path $root ("_docx_tmp_" + [Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $tmp "_rels") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $tmp "word") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $tmp "word\\_rels") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $tmp "word\\media") | Out-Null

# Copy SVGs
$mediaSrc = Join-Path $root "generated_assets"
Get-ChildItem -Path $mediaSrc -Filter *.svg | ForEach-Object {
  Copy-Item $_.FullName -Destination (Join-Path $tmp "word\\media\\$($_.Name)")
}

# Read analysis
$data = Get-Content -Raw -Path (Join-Path $root "analysis_clean.json") | ConvertFrom-Json

function XmlEscape([string]$s) {
  if ($null -eq $s) { return '' }
  return ($s -replace '&','&amp;') -replace '<','&lt;' -replace '>','&gt;' -replace '"','&quot;' -replace "'",'&apos;'
}

$docParts = New-Object System.Collections.Generic.List[string]

function Para($text, $style='Normal') {
  $t = XmlEscape $text
  $docParts.Add(("<w:p><w:pPr><w:pStyle w:val='{0}'/></w:pPr><w:r><w:t xml:space='preserve'>{1}</w:t></w:r></w:p>" -f $style, $t))
}
function PageBreak() {
  $docParts.Add('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')
}
function Heading($text, $level) {
  $style = "Heading$level"
  Para $text $style
}
function Table($rows) {
  $tbl = "<w:tbl>"
  foreach ($row in $rows) {
    $tbl += "<w:tr>"
    foreach ($cell in $row) {
      $c = XmlEscape $cell
      $tbl += "<w:tc><w:p><w:r><w:t xml:space='preserve'>$c</w:t></w:r></w:p></w:tc>"
    }
    $tbl += "</w:tr>"
  }
  $tbl += "</w:tbl>"
  $docParts.Add($tbl)
}

# Image helper
$rels = New-Object System.Collections.Generic.List[string]
$relId = 1
function AddImage($fileName, $cx=6000000) {
  $rid = "rId$relId"
  $relId++
  $rels.Add("<Relationship Id='$rid' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' Target='media/$fileName'/>")
  $docParts.Add(@"
<w:p>
  <w:r>
    <w:drawing>
      <wp:inline xmlns:wp='http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'>
        <wp:extent cx='$cx' cy='$cx'/>
        <wp:docPr id='1' name='$fileName'/>
        <a:graphic xmlns:a='http://schemas.openxmlformats.org/drawingml/2006/main'>
          <a:graphicData uri='http://schemas.openxmlformats.org/drawingml/2006/picture'>
            <pic:pic xmlns:pic='http://schemas.openxmlformats.org/drawingml/2006/picture'>
              <pic:blipFill>
                <a:blip r:embed='$rid' xmlns:r='http://schemas.openxmlformats.org/officeDocument/2006/relationships'/>
                <a:stretch><a:fillRect/></a:stretch>
              </pic:blipFill>
              <pic:spPr>
                <a:xfrm><a:off x='0' y='0'/><a:ext cx='$cx' cy='$cx'/></a:xfrm>
                <a:prstGeom prst='rect'/>
              </pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>
  </w:r>
</w:p>
"@)
}

# Content
Heading "PAGE DE COUVERTURE" 1
Para "Projet : Med-HR"
Para "Étudiant : a"
Para "Encadrant académique : b"
Para "Maître de stage : c"
Para "Période : 12 février 2026 – 12 mars 2026"
Para "Établissement : d"
Para "Entreprise : e"
Para "Session : 2026"
PageBreak

Heading "DÉDICACE" 1
Para "Je dédie ce travail à ma famille et à toutes les personnes qui ont soutenu mon parcours."
PageBreak

Heading "REMERCIEMENTS" 1
Para "Je remercie mon encadrant académique, b, pour ses conseils et sa disponibilité."
Para "Je remercie mon maître de stage, c, pour son accompagnement et son exigence professionnelle."
Para "Je remercie l'entreprise e pour l'opportunité et la confiance accordées."
PageBreak

Heading "RÉSUMÉ" 1
Para "Ce rapport présente la conception et l'implémentation du module SST au sein de la suite Med-HR. L'analyse s'appuie sur le code source réel (Laravel 10 / React 18) pour décrire les modèles, routes API, schéma de base de données et interfaces."
Para "Mots-clés : SST, Med-HR, Laravel, React, API REST, Dossier médical"
PageBreak

Heading "ABSTRACT" 1
Para "This report presents the design and implementation of the SST module within the Med-HR suite. The analysis is grounded in the actual source code (Laravel 10 / React 18) to document models, API routes, database schema, and user interfaces."
Para "Keywords: SST, Med-HR, Laravel, React, REST API, Medical record"
PageBreak

Heading "TABLE DES MATIÈRES" 1
Para "(Générée automatiquement dans Word si nécessaire)"
PageBreak

Heading "LISTE DES FIGURES" 1
Para "(Générée automatiquement dans Word si nécessaire)"
PageBreak

Heading "LISTE DES TABLEAUX" 1
Para "(Générée automatiquement dans Word si nécessaire)"
PageBreak

Heading "GLOSSAIRE" 1
Table @(
  @('Abréviation','Signification','Contexte'),
  @('SST','Santé et Sécurité au Travail','Module médical'),
  @('API','Application Programming Interface','Communication front/back'),
  @('ORM','Object Relational Mapping','Eloquent'),
  @('SPA','Single Page Application','Interface React'),
  @('MLD','Modèle Logique de Données','Schéma DB')
)
PageBreak

Heading "CHAPITRE 1 — INTRODUCTION GÉNÉRALE" 1
Heading "1.1 Contexte du stage" 2
Para "Stage de fin d'études réalisé dans le cadre de la conception et l'amélioration du module SST de Med-HR."
Heading "1.2 Présentation de l'environnement du projet" 2
Para "Backend Laravel 10 (GestionBE) et frontend React 18 (ProjetFront), base versionnée par migrations."
Heading "1.3 Problématique" 2
Para "Assurer un suivi médical structuré (visites, examens, restrictions, documents) cohérent avec les données RH et la traçabilité financière SST."
Heading "1.4 Objectifs et structure du rapport" 2
Para "Documenter l'analyse, la conception, l'architecture et l'implémentation à partir du code réel."
PageBreak

Heading "CHAPITRE 2 — PRÉSENTATION DE L'ORGANISME" 1
Heading "2.1 L'entreprise d'accueil" 2
Para "Entreprise : e."
Heading "2.2 Système existant / suite logicielle" 2
Para "Le module SST s'intègre au noyau RH via l'entité Employe et ses relations médicales."
Heading "2.3 Acteurs et parties prenantes" 2
Para "Responsable RH, Praticien SST, Employé."
PageBreak

Heading "CHAPITRE 3 — CAHIER DES CHARGES" 1
Heading "3.1 Besoins fonctionnels" 2
Para "Gestion dossiers médicaux, visites, examens, restrictions, documents, praticiens et paiements SST (routes et modèles SST)."
Heading "3.2 Exigences non-fonctionnelles" 2
Para "Sécurisation des données médicales, accessibilité REST, traçabilité et performance."
Heading "3.3 Règles métier" 2
Para "Un employé possède un dossier médical; une visite peut concerner plusieurs employés; un paiement peut couvrir plusieurs visites (sst_payment_visit)."
Heading "3.4 Contraintes système" 2
Para "Laravel 10, React 18, ORM Eloquent, migrations DB."
PageBreak

Heading "CHAPITRE 4 — ANALYSE FONCTIONNELLE" 1
Heading "4.1 Identification des acteurs" 2
Para "Responsable RH, Praticien SST, Employé."

$ucs = @(
  @{id='UC1'; title='Gérer les dossiers médicaux'; desc='Routes /dossiers-medicaux et /employes/{employe}/dossier-medical.'},
  @{id='UC2'; title='Planifier une visite médicale'; desc='Routes /visites et table employe_visite.'},
  @{id='UC3'; title='Saisir un examen médical'; desc='Routes /examens-medicaux.'},
  @{id='UC4'; title='Gérer les restrictions médicales'; desc='Routes /restrictions-medicales.'},
  @{id='UC5'; title='Gérer les documents médicaux'; desc='Routes /documents-medicaux.'},
  @{id='UC6'; title='Gérer les praticiens SST'; desc='Routes /sst-practitioners.'},
  @{id='UC7'; title='Gérer les paiements SST'; desc='Routes /sst-payments et pivot sst_payment_visit.'}
)

foreach ($uc in $ucs) {
  Heading "4.2 $($uc.id) — $($uc.title)" 2
  Para $uc.desc
  Para "Acteur principal : Responsable RH"
  Para "Préconditions : employé existant, accès API."
  Para "Postconditions : données persistées en base."
  PageBreak
}

Heading "4.3 Diagramme de cas d'utilisation" 2
AddImage "diagram_use_case.svg"
Heading "4.4 Workflow fonctionnel" 2
AddImage "diagram_activity.svg"
PageBreak

Heading "CHAPITRE 5 — MODÉLISATION UML" 1
Heading "5.1 Diagramme de classes" 2
AddImage "diagram_class.svg"
Heading "5.2 Diagramme de séquence" 2
AddImage "diagram_sequence.svg"
Heading "5.3 Diagramme d'activité" 2
AddImage "diagram_activity.svg"
PageBreak

Heading "CHAPITRE 6 — CONCEPTION BASE DE DONNÉES" 1
Heading "6.1 MCD" 2
Para "Entités principales : employes, dossier_medicals, visites, examen_medicals, medical_restrictions, medical_documents, sst_practitioners, sst_payments."
Heading "6.2 MLD" 2
AddImage "diagram_mld.svg"

$tables = @{}
foreach ($mig in $data.migrations) {
  if (-not $tables.ContainsKey($mig.table)) { $tables[$mig.table] = @() }
  foreach ($col in $mig.columns) { $tables[$mig.table] += $col }
}
$rows = @()
$rows += ,@('Table','Colonne','Type','Contraintes')
foreach ($t in ($tables.Keys | Sort-Object)) {
  foreach ($col in $tables[$t]) {
    $rows += ,@($t, $col.name, $col.type, $col.mods)
  }
}
Table $rows
PageBreak

Heading "CHAPITRE 7 — ARCHITECTURE SYSTÈME" 1
Heading "7.1 Architecture multicouche" 2
Para "Architecture MVC Laravel et SPA React, échanges via API REST JSON."
Heading "7.2 Endpoints API REST" 2
$rows = @()
$rows += ,@('Méthode','URI','Action','Middleware')
foreach ($r in $data.routes) {
  $rows += ,@($r.method, $r.uri, $r.action, ($r.middleware -join ', '))
}
Table $rows
Heading "7.3 Sécurité et authentification" 2
Para "Routes protégées par auth:sanctum selon routes/api.php."
PageBreak

Heading "CHAPITRE 8 — TECHNOLOGIES UTILISÉES" 1
Heading "8.1 Stack technologique" 2
Table @(
  @('Technologie','Version','Rôle'),
  @('Laravel','10.x','Backend API'),
  @('PHP','8.1','Langage serveur'),
  @('React','18.x','Frontend SPA'),
  @('Vite','5.x','Build tooling'),
  @('MySQL/PostgreSQL','—','Base de données')
)
Heading "8.2 Patterns et bonnes pratiques" 2
Para "ORM Eloquent, contrôleurs REST, composants UI réutilisables."
PageBreak

Heading "CHAPITRE 9 — IMPLÉMENTATION & RÉALISATION" 1
Heading "9.1 Tableau de bord" 2
AddImage "mock_dashboard.svg"
Heading "9.2 Formulaire de visite" 2
AddImage "mock_form.svg"
Heading "9.3 Liste des visites" 2
AddImage "mock_list.svg"
Heading "9.4 Détail dossier médical" 2
AddImage "mock_detail.svg"
Heading "9.5 Connexion" 2
AddImage "mock_login.svg"
PageBreak

Heading "CHAPITRE 10 — EXTRAITS DE CODE SIGNIFICATIFS" 1
$examenPath = Join-Path $root "GestionBE\\app\\Models\\ExamenMedical.php"
if (Test-Path $examenPath) {
  Heading "10.1 Modèle ExamenMedical" 2
  Para (Get-Content -Raw -Path $examenPath)
}
$visiteCtrl = Join-Path $root "GestionBE\\app\\Http\\Controllers\\VisiteController.php"
if (Test-Path $visiteCtrl) {
  Heading "10.2 Contrôleur VisiteController" 2
  Para (Get-Content -Raw -Path $visiteCtrl)
}
$visiteMig = Join-Path $root "GestionBE\\database\\migrations\\2026_02_07_132745_create_visites_table.php"
if (Test-Path $visiteMig) {
  Heading "10.3 Migration create_visites_table" 2
  Para (Get-Content -Raw -Path $visiteMig)
}
$compPath = Join-Path $root "ProjetFront\\src\\Zakaria\\SST\\SSTVisits.jsx"
if (Test-Path $compPath) {
  Heading "10.4 Composant Frontend SSTVisits" 2
  Para (Get-Content -Raw -Path $compPath)
}
Heading "10.5 Tableau des tests" 2
Table @(
  @('ID','Description','Type','Fichier'),
  @('T-01','ExampleTest (Feature)','PHPUnit Feature','tests/Feature/ExampleTest.php'),
  @('T-02','ExampleTest (Unit)','PHPUnit Unit','tests/Unit/ExampleTest.php'),
  @('T-03','Setup Tests','React Testing Library','ProjetFront/src/setupTests.js')
)
PageBreak

Heading "CHAPITRE 11 — CONCLUSION & PERSPECTIVES" 1
Heading "11.1 Bilan des résultats" 2
Para "Le module SST couvre dossiers médicaux, visites, examens, restrictions, documents et paiements SST."
Heading "11.2 Compétences développées" 2
Para "Laravel, Eloquent, React, intégration REST."
Heading "11.3 Enseignements méthodologiques" 2
Para "Alignement modèle de données – routes API – interfaces UI."
Heading "11.4 Roadmap d'évolution" 2
Table @(
  @('Version','Fonctionnalité','Horizon'),
  @('v1.1','Tableau de bord analytique SST','Court terme'),
  @('v1.2','Notifications automatiques des visites','Moyen terme'),
  @('v2.0','Portail employé','Long terme')
)
PageBreak

Heading "BIBLIOGRAPHIE" 1
Para "Documentation Laravel 10"
Para "Documentation React 18"
Para "Code source interne Med-HR"
PageBreak

Heading "ANNEXES" 1
Heading "Annexe A — Routes API" 2
Para (Get-Content -Raw -Path (Join-Path $root "GestionBE\\routes\\api.php"))
PageBreak
Heading "Annexe B — Validation (extrait contrôleur)" 2
if (Test-Path $visiteCtrl) { Para (Get-Content -Raw -Path $visiteCtrl) }
PageBreak
Heading "Annexe C — Environnement de développement" 2
Table @(
  @('Élément','Valeur'),
  @('Backend','Laravel 10, PHP 8.1'),
  @('Frontend','React 18, Vite 5'),
  @('BD','MySQL/PostgreSQL (migrations)'),
  @('Outils','Composer, npm')
)

$body = ($docParts -join "")
$documentXml = @"
<?xml version='1.0' encoding='UTF-8' standalone='yes'?>
<w:document xmlns:w='http://schemas.openxmlformats.org/wordprocessingml/2006/main' xmlns:r='http://schemas.openxmlformats.org/officeDocument/2006/relationships'>
  <w:body>
    $body
    <w:sectPr>
      <w:pgSz w:w='11906' w:h='16838'/>
      <w:pgMar w:top='1440' w:right='1094' w:bottom='1440' w:left='1700'/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$stylesXml = @"
<?xml version='1.0' encoding='UTF-8' standalone='yes'?>
<w:styles xmlns:w='http://schemas.openxmlformats.org/wordprocessingml/2006/main'>
  <w:style w:type='paragraph' w:default='1' w:styleId='Normal'>
    <w:name w:val='Normal'/>
    <w:rPr><w:rFonts w:ascii='Georgia' w:hAnsi='Georgia'/><w:sz w:val='42'/></w:rPr>
  </w:style>
  <w:style w:type='paragraph' w:styleId='Heading1'>
    <w:name w:val='Heading 1'/>
    <w:rPr><w:rFonts w:ascii='Arial' w:hAnsi='Arial'/><w:sz w:val='56'/><w:b/></w:rPr>
  </w:style>
  <w:style w:type='paragraph' w:styleId='Heading2'>
    <w:name w:val='Heading 2'/>
    <w:rPr><w:rFonts w:ascii='Arial' w:hAnsi='Arial'/><w:sz w:val='46'/><w:b/></w:rPr>
  </w:style>
</w:styles>
"@

$contentTypes = @"
<?xml version='1.0' encoding='UTF-8' standalone='yes'?>
<Types xmlns='http://schemas.openxmlformats.org/package/2006/content-types'>
  <Default Extension='rels' ContentType='application/vnd.openxmlformats-package.relationships+xml'/>
  <Default Extension='xml' ContentType='application/xml'/>
  <Default Extension='svg' ContentType='image/svg+xml'/>
  <Override PartName='/word/document.xml' ContentType='application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml'/>
  <Override PartName='/word/styles.xml' ContentType='application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml'/>
</Types>
"@

$relsXml = @"
<?xml version='1.0' encoding='UTF-8' standalone='yes'?>
<Relationships xmlns='http://schemas.openxmlformats.org/package/2006/relationships'>
  <Relationship Id='rId1' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument' Target='word/document.xml'/>
</Relationships>
"@

$docRelsXml = "<?xml version='1.0' encoding='UTF-8' standalone='yes'?>`n<Relationships xmlns='http://schemas.openxmlformats.org/package/2006/relationships'>`n" + ($rels -join "`n") + "`n</Relationships>"

Out-File -LiteralPath (Join-Path $tmp "[Content_Types].xml") -InputObject $contentTypes -Encoding UTF8
Out-File -LiteralPath (Join-Path $tmp "_rels\\.rels") -InputObject $relsXml -Encoding UTF8
Out-File -LiteralPath (Join-Path $tmp "word\\document.xml") -InputObject $documentXml -Encoding UTF8
Out-File -LiteralPath (Join-Path $tmp "word\\styles.xml") -InputObject $stylesXml -Encoding UTF8
Out-File -LiteralPath (Join-Path $tmp "word\\_rels\\document.xml.rels") -InputObject $docRelsXml -Encoding UTF8

if (Test-Path $outDocx) { Remove-Item -Force $outDocx }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tmp, $outDocx)

Write-Host "Created $outDocx"
