const fs = require('fs');
const { marked } = require('marked');

const mdContent = fs.readFileSync('Rapport_Stage_Med_HR.md', 'utf-8');

// Strip out the first 9 lines (the old plain text cover page)
const lines = mdContent.split('\n');
const contentMd = lines.slice(9).join('\n');

const htmlBody = marked.parse(contentMd);

const htmlTemplate = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport de Stage - Aya Naimi</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-dark: #1F3855;
            --primary-light: #2A798C;
            --accent: #E8833A;
            --text-dark: #333333;
            --text-gray: #666666;
            --bg-light: #F8F9FA;
        }
        
        body {
            font-family: 'Open Sans', sans-serif;
            color: var(--text-dark);
            margin: 0;
            padding: 0;
            background: #fff;
        }

        h1, h2, h3, h4 {
            font-family: 'Montserrat', sans-serif;
            color: var(--primary-dark);
        }

        /* Cover Page Styling */
        .cover-page {
            position: relative;
            width: 210mm; /* A4 width */
            height: 297mm; /* A4 height */
            margin: 0 auto;
            background: #ffffff;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            page-break-after: always;
        }

        .cover-header {
            display: flex;
            justify-content: space-between;
            padding: 40px 50px;
        }

        .logo-placeholder {
            display: flex;
            gap: 15px;
        }

        .logo-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 2px solid #E0E0E0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            color: var(--primary-light);
            background: #F5F7F8;
        }
        
        .logo-sps {
            font-size: 32px;
            font-weight: 800;
            color: var(--primary-dark);
            display: flex;
            align-items: center;
        }
        .logo-sps span { color: var(--primary-light); font-size: 16px; font-weight: 600; padding-left: 10px;}

        .cover-title-section {
            padding: 60px 50px 0 50px;
            z-index: 2;
        }

        .pre-title {
            font-family: 'Montserrat', sans-serif;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 3px;
            color: var(--text-gray);
            text-transform: uppercase;
            border-bottom: 1px solid #E0E0E0;
            padding-bottom: 15px;
            margin-bottom: 30px;
        }

        .main-title {
            font-size: 42px;
            font-weight: 700;
            line-height: 1.2;
            color: var(--primary-dark);
            margin: 0 0 10px 0;
        }

        .sub-title {
            font-size: 48px;
            font-weight: 800;
            color: var(--primary-light);
            margin: 0 0 20px 0;
        }

        .title-desc {
            font-size: 16px;
            color: var(--text-gray);
            font-weight: 600;
        }

        .wavy-bg {
            position: absolute;
            top: 400px;
            left: 0;
            width: 100%;
            height: 200px;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23f3f6f8' fill-opacity='1' d='M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,170.7C672,160,768,160,864,176C960,192,1056,224,1152,229.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3Cpath fill='%236bb1c1' fill-opacity='0.2' d='M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,229.3C960,213,1056,171,1152,144C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3Cpath fill='%231F3855' fill-opacity='0.1' d='M0,128L48,149.3C96,171,192,213,288,224C384,235,480,213,576,192C672,171,768,149,864,154.7C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E");
            background-size: cover;
            background-position: center;
        }

        .cover-details {
            position: absolute;
            bottom: 120px;
            left: 50px;
            right: 50px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            z-index: 2;
        }

        .detail-block {
            margin-bottom: 25px;
        }

        .detail-label {
            font-family: 'Montserrat', sans-serif;
            font-size: 13px;
            font-weight: 700;
            color: var(--primary-light);
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
        }

        .detail-label.accent::before {
            content: '';
            display: inline-block;
            width: 8px;
            height: 8px;
            background-color: var(--accent);
            border-radius: 50%;
            margin-right: 10px;
        }

        .detail-value {
            font-size: 16px;
            font-weight: 700;
            color: var(--primary-dark);
            margin: 0 0 5px 0;
        }

        .detail-sub {
            font-size: 14px;
            color: var(--text-gray);
            margin: 0;
        }

        .cover-footer {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            background: linear-gradient(90deg, #1A4B6B 0%, #2A798C 100%);
            color: white;
            padding: 15px 0;
            text-align: center;
            font-size: 11px;
            letter-spacing: 2px;
            font-weight: 600;
        }

        /* Content Pages Styling */
        .content-page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 40px 60px;
            box-sizing: border-box;
            background: #fff;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .content-page h2 {
            color: var(--primary-dark);
            border-bottom: 2px solid var(--primary-light);
            padding-bottom: 10px;
            margin-top: 40px;
        }

        .content-page h3 {
            color: var(--primary-light);
            margin-top: 30px;
        }

        .content-page p {
            line-height: 1.6;
            margin-bottom: 15px;
            text-align: justify;
        }

        .content-page ul, .content-page ol {
            margin-bottom: 20px;
            padding-left: 20px;
        }

        .content-page li {
            margin-bottom: 8px;
            line-height: 1.5;
        }

        .content-page table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
        }

        .content-page th, .content-page td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }

        .content-page th {
            background-color: #F8F9FA;
            color: var(--primary-dark);
            font-weight: 600;
        }

        .content-page code {
            background-color: #f4f4f4;
            padding: 2px 5px;
            border-radius: 4px;
            font-family: monospace;
            color: #d63384;
        }

        .content-page pre {
            background-color: #f8f9fa;
            border-left: 4px solid var(--primary-light);
            padding: 15px;
            overflow-x: auto;
            border-radius: 4px;
        }

        .content-page pre code {
            background-color: transparent;
            color: #333;
            padding: 0;
        }

        @media print {
            body { background: white; }
            .cover-page, .content-page {
                box-shadow: none;
                margin: 0;
                width: 100%;
                height: 100vh;
                page-break-after: always;
            }
            .content-page {
                height: auto;
                min-height: auto;
            }
            .wavy-bg {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .cover-footer {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .logo-circle {
                 -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>

    <!-- COVER PAGE -->
    <div class="cover-page">
        <div class="cover-header">
            <div class="logo-placeholder">
                <div class="logo-circle">OFPPT</div>
                <div class="logo-circle">OFPPT</div>
            </div>
            <div class="logo-sps">
                sps <span>Technologie</span>
            </div>
        </div>

        <div class="cover-title-section">
            <div class="pre-title">RAPPORT DE STAGE</div>
            <h1 class="main-title">Conception & Amélioration<br>d'un Module</h1>
            <h2 class="sub-title">SST</h2>
            <div class="title-desc">Santé & Sécurité au Travail · Suite ERP HR</div>
        </div>

        <div class="wavy-bg"></div>

        <div class="cover-details">
            <div class="details-left">
                <div class="detail-block">
                    <div class="detail-label">ÉTUDIANTE</div>
                    <div class="detail-value">Aya Naimi</div>
                </div>
                
                <div class="detail-block">
                    <div class="detail-label">ENCADRANT ACADÉMIQUE</div>
                    <div class="detail-value">Pr. Rabia Sabour El Idrissi</div>
                </div>

                <div class="detail-block">
                    <div class="detail-label">MAÎTRE DE STAGE</div>
                    <div class="detail-value">M./Mme Prénom NOM</div>
                    <div class="detail-sub">Responsable Departement IT</div>
                </div>
            </div>

            <div class="details-right">
                <div class="detail-block">
                    <div class="detail-label">PÉRIODE</div>
                    <div class="detail-value">Du 26 Janvier au 2 Mars 2026</div>
                </div>

                <div class="detail-block">
                    <div class="detail-label accent">ÉTABLISSEMENT D'ACCUEIL</div>
                    <div class="detail-value">SPS Technologie</div>
                </div>

                <div class="detail-block">
                    <div class="detail-label">CENTRE DE FORMATION</div>
                    <div class="detail-value">ISGI</div>
                    <div class="detail-sub">Session 2025 – 2026</div>
                </div>
            </div>
        </div>

        <div class="cover-footer">
            CONFIDENTIEL - USAGE STRICTEMENT INTERNE - OFPPT - SPS - TECHNOOP
        </div>
    </div>

    <!-- CONTENT PAGES -->
    <div class="content-page">
        \${htmlBody}
    </div>

</body>
</html>
`;

fs.writeFileSync('Rapport_Stage_Moderne.html', htmlTemplate);
console.log('Generated Rapport_Stage_Moderne.html');
