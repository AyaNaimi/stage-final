import React, { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Badge, Button, ProgressBar, Table, Form, Tabs, Tab, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
    Calendar,
    User,
    MapPin,
    Briefcase,
    Clock,
    Download,
    Trash2,
    Edit2,
    CheckCircle,
    AlertCircle,
    Filter as FilterIcon,
    Users,
    XCircle,
    Plus,
    Minus,
    Stethoscope,
    Dna,
    FileText,
    ArrowRight,
    Search as SearchIcon,
    History,
    CalendarDays,
    Activity,
    X,
    Settings
} from 'lucide-react';
import {
    faFilter,
    faClose,
    faGear,
    faCheck,
    faCalendarWeek
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useHeader } from "../../Acceuil/HeaderContext";
import { useOpen } from "../../Acceuil/OpenProvider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import GenericSidePanel from '../GenericSidePanel';
import SSTVisitForm from './SSTVisitForm';
import SSTExaminationPanel from './SSTExaminationPanel';
import SSTPatientDossierPanel from './SSTPatientDossierPanel';
import ExpandRTable from '../Employe/ExpandRTable';
import Swal from "sweetalert2";
import { FaPlusCircle } from "react-icons/fa";
import "../Style.css";
// import PremiumFilters from '../Components/PremiumFilters';

const SSTVisits = () => {
    const { setTitle, setOnPrint, setOnExportPDF, setOnExportExcel, searchQuery, clearActions } = useHeader();
    const { dynamicStyles, isMobile } = useOpen();

    const [visitsData, setVisitsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

    const [expandedRows, setExpandedRows] = useState({});

    const toggleRowExpansion = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [innerSearch, setInnerSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingVisit, setEditingVisit] = useState(null);
    const [filtersVisible, setFiltersVisible] = useState(false);

    const handleFiltersToggle = (isVisible) => {
        setFiltersVisible(isVisible);
    };

    // Employees for selection (should be fetched from API)
    const employees = [];

    const [patientFilters, setPatientFilters] = useState({});

    const [visitFilters, setVisitFilters] = useState({
        startDate: '',
        endDate: '',
        doctor: '',
        status: ''
    });

    const [showExaminePanel, setShowExaminePanel] = useState(false);
    const [selectedEmployeeForExam, setSelectedEmployeeForExam] = useState(null);
    const [showDossierPanel, setShowDossierPanel] = useState(false);
    const [selectedEmployeeForDossier, setSelectedEmployeeForDossier] = useState(null);

    const [biometrics, setBiometrics] = useState({
        weight: '', height: '', pulse: '', bp_systolic: '', bp_diastolic: '',
        temperature: '', glycemia: '', vision_right: '', vision_left: '',
        spo2: '', waist: '', hearing_right: 'Normal', hearing_left: 'Normal'
    });

    const [clinicalNotes, setClinicalNotes] = useState({
        subjective: '', objective: '', assessment: '', plan: ''
    });

    const [aptitude, setAptitude] = useState(null);

    const doctorFilterOptions = useMemo(() => {
        return Array.from(new Set(
            (visitsData || [])
                .map(v => v.doctor)
                .filter(Boolean)
        )).map((doctor) => ({ label: doctor, value: doctor }));
    }, [visitsData]);

    const getUniqueEmployees = (employees = []) => {
        const seen = new Set();

        return employees.filter((employee) => {
            const key = String(employee?.id ?? '');
            if (!key || seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    };

    const processedVisits = useMemo(() => {
        return visitsData.map(visit => {
            const employees = getUniqueEmployees(visit.employees || []);
            const total = employees.length;
            const completed = employees.filter(e =>
                ['Complété', 'Terminée', 'Apte', 'Inapte', 'Apte (Rés)', 'Expertise'].includes(e.status)
            ).length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            let status = 'planifiée';
            if (progress === 100) status = 'terminée';
            else if (progress > 0) status = 'en_cours';

            return {
                ...visit,
                employees,
                employes: employees,
                progress,
                status
            };
        });
    }, [visitsData]);

    const getVisitDepartmentOptions = (visit) => {
        return Array.from(
            new Set(
                getUniqueEmployees(visit?.employees || [])
                    .map(emp => emp.department)
                    .filter(Boolean)
            )
        );
    };

    const [filteredData, setFilteredData] = useState(processedVisits);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const handleSelectAllChange = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        if (checked) {
            setSelectedItems(filteredData.map(v => v.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDeleteSelected = () => {
        Swal.fire({
            title: "Supprimer la sélection ?",
            text: `Vous allez supprimer ${selectedItems.length} visites.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Supprimer"
        }).then((result) => {
            if (result.isConfirmed) {
                setVisitsData(visitsData.filter(v => !selectedItems.includes(v.id)));
                setSelectedItems([]);
                setSelectAll(false);
                Swal.fire("Supprimé", "Les visites ont été supprimées.", "success");
            }
        });
    };


    useEffect(() => {
        setTitle("Visites Médicales SST");
        const fetchVisits = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_BASE_URL}/api/visites`);
                setVisitsData(res.data);
            } catch (err) {
                console.error('Error fetching visits:', err);
                Swal.fire('Erreur', 'Impossible de charger les visites', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchVisits();
        return () => {
            clearActions();
        };
    }, [setTitle, clearActions, API_BASE_URL]);


    useEffect(() => {
        let filtered = [...processedVisits];

        // Header Filters
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item => {
                const matchDoctor = item.doctor && String(item.doctor).toLowerCase().includes(query);
                const matchId = item.id && String(item.id).toLowerCase().includes(query);
                const matchDepartment = item.department && String(item.department).toLowerCase().includes(query);
                const matchEmployees = item.employees && item.employees.some(emp => 
                    (emp.name && String(emp.name).toLowerCase().includes(query)) ||
                    (emp.department && String(emp.department).toLowerCase().includes(query))
                );
                return matchDoctor || matchId || matchDepartment || matchEmployees;
            });
        }

        if (visitFilters.startDate) {
            filtered = filtered.filter(v => v.date >= visitFilters.startDate);
        }
        if (visitFilters.endDate) {
            filtered = filtered.filter(v => v.date <= visitFilters.endDate);
        }
        if (visitFilters.doctor) {
            filtered = filtered.filter(v => v.doctor && String(v.doctor).toLowerCase().includes(visitFilters.doctor.toLowerCase()));
        }
        if (visitFilters.status) {
            filtered = filtered.filter(v => v.status === visitFilters.status);
        }

        setFilteredData(filtered);
    }, [searchQuery, processedVisits, visitFilters]);

    const escapeHtml = (value) => String(value ?? '-')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const handleCreateVisit = async (formData) => {
        try {
            setLoading(true);
            const payload = {
                ...formData,
                selectedEmployees: formData.selectedEmployees // backend handles this
            };

            if (editingVisit) {
                const res = await axios.put(`${API_BASE_URL}/api/visites/${editingVisit.id}`, payload);
                setVisitsData(visitsData.map(v => v.id === editingVisit.id ? res.data : v));
                Swal.fire("Mis à jour", "La visite a été mise à jour avec succès.", "success");
            } else {
                const res = await axios.post(`${API_BASE_URL}/api/visites`, payload);
                setVisitsData([res.data, ...visitsData]);
                Swal.fire("Succès", "La visite a été programmée avec succès.", "success");
            }
            setShowForm(false);
            setEditingVisit(null);
        } catch (err) {
            console.error('Save visit failed', err);
            const backendMessage = err.response?.data?.message;
            const validationErrors = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join('\n')
                : null;

            Swal.fire(
                'Erreur',
                validationErrors || backendMessage || 'Échec de l\'enregistrement de la visite',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Êtes-vous sûr ?",
            text: "Cette action est irréversible !",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Oui, supprimer",
            cancelButtonText: "Annuler"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    setLoading(true);
                    await axios.delete(`${API_BASE_URL}/api/visites/${id}`);
                    setVisitsData(visitsData.filter(v => v.id !== id));
                    Swal.fire("Supprimé !", "La visite a été supprimée.", "success");
                } catch (err) {
                    console.error('Delete visit failed', err);
                    Swal.fire('Erreur', 'Échec de la suppression', 'error');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleDownload = (visit) => {
        const employees = getUniqueEmployees(visit.employees || []);
        const reportWindow = window.open('', '_blank', 'width=1200,height=900');

        if (!reportWindow) {
            Swal.fire('Erreur', 'Le navigateur a bloqué l’ouverture du rapport.', 'error');
            return;
        }

        const generatedAt = new Date().toLocaleString('sv-SE').replace(' ', ' ');
        const participantRows = employees.length > 0
            ? employees.map((emp, index) => `
                <tr>
                    <td class="participant-index">${index + 1}</td>
                    <td>
                        <div class="participant-name">${escapeHtml(emp.name)}</div>
                        <div class="participant-id">ID ${escapeHtml(emp.id)}</div>
                    </td>
                    <td>
                        <div class="participant-main">${escapeHtml(emp.department || 'N/A')}</div>
                    </td>
                    <td><span class="participant-status">${escapeHtml(emp.status || 'Inscrit')}</span></td>
                </tr>
            `).join('')
            : `
                <tr>
                    <td colspan="4" style="text-align:center;">Aucun participant</td>
                </tr>
            `;

        const employeeSections = employees.length > 0
            ? employees.map((emp) => {
                const exam = emp.exam || {};
                const bloodPressure = exam.ta_systolique || exam.ta_diastolique
                    ? `${exam.ta_systolique || '-'} / ${exam.ta_diastolique || '-'}`
                    : '-';
                const statusValue = String(emp.status || 'En attente');
                const statusClass =
                    statusValue.toLowerCase().includes('inapte') ? 'danger' :
                    statusValue.toLowerCase().includes('rés') || statusValue.toLowerCase().includes('restricted') ? 'warning' :
                    statusValue.toLowerCase().includes('apte') ? 'success' :
                    'pending';

                return `
                    <section class="employee-card">
                        <div class="employee-header">
                            <div>
                                <h3>${escapeHtml(emp.name)}</h3>
                                <p>Département ${escapeHtml(emp.department || 'N/A')}</p>
                            </div>
                            <span class="badge ${statusClass}">${escapeHtml(statusValue)}</span>
                        </div>
                        <table class="exam-table">
                            <tbody>
                                <tr>
                                    <td><strong>Employé:</strong> ${escapeHtml(emp.name)}</td>
                                    <td><strong>Département:</strong> ${escapeHtml(emp.department || 'N/A')}</td>
                                </tr>
                                <tr>
                                    <td><strong>Date:</strong> ${escapeHtml(exam.date_examen || visit.date || '-')}</td>
                                    <td><strong>Motif:</strong> ${escapeHtml(visit.type || 'Suivi')}</td>
                                </tr>
                                <tr>
                                    <td><strong>Poids:</strong> ${escapeHtml(exam.poids || 'N/A')} kg</td>
                                    <td><strong>Taille:</strong> ${escapeHtml(exam.taille || 'N/A')} cm</td>
                                </tr>
                                <tr>
                                    <td><strong>IMC:</strong> ${escapeHtml(exam.imc || 'N/A')}</td>
                                    <td><strong>Tension:</strong> ${escapeHtml(bloodPressure)} mmHg</td>
                                </tr>
                                <tr>
                                    <td><strong>Pouls:</strong> ${escapeHtml(exam.pouls || 'N/A')} bpm</td>
                                    <td><strong>Température:</strong> ${escapeHtml(exam.temperature || 'N/A')} °C</td>
                                </tr>
                                <tr>
                                    <td><strong>Glycémie:</strong> ${escapeHtml(exam.glycemie || 'N/A')} g/L</td>
                                    <td><strong>SpO2:</strong> ${escapeHtml(exam.spo2 || 'N/A')} %</td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="metrics-row">
                            <div><span>Vision D</span><strong>${escapeHtml(exam.vision_droite || 'N/A')}</strong></div>
                            <div><span>Vision G</span><strong>${escapeHtml(exam.vision_gauche || 'N/A')}</strong></div>
                            <div><span>Audition D</span><strong>${escapeHtml(exam.audition_droite || 'Normal')}</strong></div>
                            <div><span>Audition G</span><strong>${escapeHtml(exam.audition_gauche || 'Normal')}</strong></div>
                        </div>
                        <div class="notes">
                            <p><strong>Notes subjectives:</strong> ${escapeHtml(exam.notes_subjectives || visit.notes || '-')}</p>
                            <p><strong>Notes objectives:</strong> ${escapeHtml(exam.notes_objectives || '-')}</p>
                            <p><strong>Évaluation:</strong> ${escapeHtml(emp.result || exam.evaluation || visit.notes || '-')}</p>
                            <p><strong>Plan:</strong> ${escapeHtml(exam.plan || '-')}</p>
                        </div>
                    </section>
                `;
            }).join('')
            : '<p>Aucun collaborateur pour cette visite.</p>';

        reportWindow.document.write(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8" />
                <title>Rapport de Visite Médicale - ${escapeHtml(visit.id)}</title>
                <style>
                    @page { margin: 20px 28px 32px; }
                    body { font-family: Arial, sans-serif; color: #4b5563; margin: 0; font-size: 14px; }
                    .page { min-height: calc(100vh - 40px); }
                    .page-break { page-break-before: always; }
                    .title-wrap { text-align: center; margin-top: 18px; }
                    .title-wrap h1 { margin: 0; color: #2d8a96; font-size: 28px; font-weight: 800; }
                    .subtitle { color: #7a8793; font-size: 16px; margin-top: 8px; }
                    .generated { color: #7a8793; font-size: 15px; margin-top: 10px; }
                    .separator { border-top: 3px solid #2d8a96; margin: 28px 0 34px; }
                    .section-title { color: #2d8a96; font-size: 18px; font-weight: 800; margin: 0 0 18px; }
                    .info-grid { display: grid; grid-template-columns: 180px 1fr; row-gap: 10px; column-gap: 12px; margin-bottom: 30px; }
                    .label { font-weight: 700; }
                    .value { text-align: right; }
                    .participants-title { font-size: 16px; font-weight: 800; margin: 20px 0 12px; color: #364152; }
                    .participants-wrap { border: 1px solid #dfe4e8; border-radius: 12px; overflow: hidden; background: #fff; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04); }
                    .participants-table { margin: 0; table-layout: fixed;border:collapse }
                    .participants-table col.index-col { width: 52px; }
                    .participants-table col.employee-col { width: 34%; }
                    .participants-table col.department-col { width: 42%; }
                    .participants-table col.status-col { width: 24%; }
                    .participants-table th, .participants-table td { border: 1px solid #e6eaee; padding: 14px 12px; text-align: left; font-size: 13px; vertical-align: middle; }
                    .participants-table th { color: #97a3ad; font-weight: 800; background: linear-gradient(180deg, #fbfcfc 0%, #f4f8f8 100%); text-transform: uppercase; letter-spacing: 0.4px; font-size: 11px; }
                    .participants-table tbody tr:nth-child(even) { background: #fcfdfd; }
                    .participant-index { width: 44px; color: #64748b; font-weight: 800; text-align: center; font-size: 14px; }
                    .participant-name { font-weight: 800; color: #334155; font-size: 14px; line-height: 1.25; }
                    .participant-id { color: #94a3b8; font-size: 11px; margin-top: 4px; }
                    .participant-main { font-weight: 700; color: #475569; font-size: 13px; line-height: 1.25; }
                    .participant-sub { color: #2d8a96; font-size: 11px; margin-top: 4px; font-weight: 700; line-height: 1.2; }
                    .participant-status { display: inline-block; padding: 7px 12px; border-radius: 999px; background: rgba(45, 138, 150, 0.10); color: #2d8a96; font-size: 11px; font-weight: 800; min-width: 88px; text-align: center; }
                    .employee-card { border: 1px solid #dfe4e8; border-radius: 10px; padding: 16px; margin-bottom: 18px; page-break-inside: avoid; }
                    .employee-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
                    .employee-header h3 { margin: 0; color: #2d8a96; font-size: 16px; font-weight: 800; }
                    .employee-header p { margin: 2px 0 0; color: #7a8793; font-size: 11px; }
                    .badge { font-size: 12px; font-weight: 800; }
                    .badge.pending { color: #b8860b; }
                    .badge.success { color: #2d8a96; }
                    .badge.warning { color: #b8860b; }
                    .badge.danger { color: #c2410c; }
                    .exam-table { width: 100%; border-collapse: collapse; margin: 8px 0 14px; }
                    .exam-table td { border: 1px solid #d9dee3; padding: 8px 10px; font-size: 13px; width: 50%; }
                    .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; margin: 18px 0 10px; }
                    .metrics-row span { display: block; color: #8a94a0; font-size: 11px; margin-bottom: 4px; }
                    .metrics-row strong { color: #2d8a96; font-size: 16px; }
                    .notes p { margin: 10px 0; font-size: 13px; color: #374151; }
                    .footer { text-align: center; color: #7a8793; font-size: 12px; margin-top: 24px; padding: 24px 0 10px; }
                    .footer p { margin: 8px 0; }
                </style>
            </head>
            <body>
                <div class="page">
                    <div class="title-wrap">
                        <h1>RAPPORT DE VISITE MÉDICALE SST</h1>
                        <div class="subtitle">Santé et Sécurité au Travail</div>
                        <div class="generated">Date de génération: ${escapeHtml(generatedAt)}</div>
                    </div>
                    <div class="separator"></div>

                    <h2 class="section-title">Informations de la Visite</h2>
                    <div class="info-grid">
                        <div class="label">ID Visite:</div><div class="value">${escapeHtml(visit.id)}</div>
                        <div class="label">Date:</div><div class="value">${escapeHtml(visit.date)} ${escapeHtml(visit.time || '')}</div>
                        <div class="label">Type:</div><div class="value">${escapeHtml(visit.type || 'Suivi')}</div>
                        <div class="label">Statut:</div><div class="value">${escapeHtml(visit.status || visit.statut || 'Planifiée')}</div>
                        <div class="label">Lieu:</div><div class="value">${escapeHtml(visit.lieu || visit.location || '-')}</div>
                        <div class="label">Médecin:</div><div class="value">${escapeHtml(visit.doctor || '-')}</div>
                        <div class="label">Notes:</div><div class="value">${escapeHtml(visit.notes || '-')}</div>
                    </div>

                    <div class="participants-title">Participants (${escapeHtml(employees.length)} employé${employees.length > 1 ? 's' : ''})</div>
                    <div class="participants-wrap">
                        <table class="participants-table">
                            <colgroup>
                                <col class="index-col" />
                                <col class="employee-col" />
                                <col class="department-col" />
                                <col class="status-col" />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Employé</th>
                                    <th>Département</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${participantRows}
                            </tbody>
                        </table>
                    </div>
                    <div class="footer">
                        <p>Document généré par Med-HR - Gestion SST</p>
                        <p>Rapport confidentiel - Usage interne uniquement</p>
                    </div>
                </div>

                <div class="page page-break">
                    <h2 class="section-title">Résultats des Examens Médicaux</h2>
                    ${employeeSections}
                    <div class="footer">
                        <p>Document généré par Med-HR - Gestion SST</p>
                        <p>Rapport confidentiel - Usage interne uniquement</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        reportWindow.document.close();
        reportWindow.focus();
        reportWindow.print();
    };

    const openEdit = (visit) => {
        setEditingVisit(visit);
        setShowForm(true);
    };

    const handleExamine = (employee, visitId) => {
        setSelectedEmployeeForExam({ ...employee, visitId });
        setShowExaminePanel(true);
    };

    const handleOpenDossier = (employee) => {
        setSelectedEmployeeForDossier(employee);
        setShowDossierPanel(true);
    };

    const columns = [
        {
            key: 'expand',
            label: '',
            render: (item) => (
                <div
                    onClick={(e) => { e.stopPropagation(); toggleRowExpansion(item.id); }}
                    style={{ cursor: 'pointer' }}
                    className="text-primary d-flex align-items-center justify-content-center"
                >
                    {expandedRows[item.id] ? <Minus size={18} /> : <Plus size={18} />}
                </div>
            )
        },
        {
            key: 'id',
            label: 'ID Visite',
            render: (item) => (
                <Badge bg="light" text="dark" className="border rounded-2 fw-black font-mono extra-small">{item.id}</Badge>
            )
        },
        {
            key: 'date',
            label: 'Date & Heure',
            render: (item) => (
                <div>
                    <div className="fw-bold small text-dark">{item.date}</div>
                    <div className="extra-small text-muted">{item.time || '09:00'}</div>
                </div>
            )
        },
        {
            key: 'doctor',
            label: 'Médecin(s)',
            render: (item) => {
                const doctors = typeof item.doctor === 'string' ? item.doctor.split(', ') : (item.doctors || []);
                const renderTooltip = (props) => (
                    <Tooltip id="button-tooltip" {...props} className="extra-small fw-bold">
                        {doctors.join(', ')}
                    </Tooltip>
                );

                return (
                    <OverlayTrigger
                        placement="top"
                        delay={{ show: 250, hide: 400 }}
                        overlay={renderTooltip}
                    >
                        <div className="d-flex align-items-center gap-2 cursor-help" style={{ cursor: 'help' }}>
                            <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px' }}>
                                <Stethoscope size={14} />
                            </div>
                            <div className="d-flex flex-column">
                                <span className="fw-bold small text-dark">{doctors[0]}</span>
                                {doctors.length > 1 && (
                                    <span className="extra-small text-muted fw-bold">+{doctors.length - 1} autre(s)</span>
                                )}
                            </div>
                        </div>
                    </OverlayTrigger>
                );
            }
        },

        {
            key: 'type',
            label: 'Type',
            render: (item) => (
                <Badge
                    bg={
                        item.type === 'Embauche' ? 'info' :
                            item.type === 'Reprise' ? 'warning' : 'primary'
                    }
                    className="rounded-pill px-3 py-2 text-uppercase extra-small"
                >
                    {item.type || 'Périodique'}
                </Badge>
            )
        },
        {
            key: 'location',
            label: 'Lieu',
            render: (item) => (
                <div className="small text-muted d-flex align-items-center gap-2">
                    <MapPin size={14} /> {item.lieu || item.location}
                </div>
            )
        },
        {
            key: 'progress',
            label: 'Progression',
            render: (item) => (
                <div style={{ minWidth: '120px' }}>
                    <div className="d-flex justify-content-between extra-small fw-bold mb-1 text-muted">
                        <span>{item.progress}%</span>
                    </div>
                    <ProgressBar
                        now={item.progress}
                        variant={item.progress === 100 ? 'success' : 'primary'}
                        style={{ height: '6px' }}
                        className="rounded-pill bg-light"
                    />
                </div>
            )
        },
        {
            key: 'status',
            label: 'Statut',
            render: (item) => (
                <Badge
                    style={{
                        backgroundColor:
                            item.status === 'planifiée' ? 'rgba(14, 165, 233, 0.08)' :
                                item.status === 'en_cours' ? 'rgba(245, 158, 11, 0.08)' :
                                    'rgba(34, 197, 94, 0.08)',
                        color:
                            item.status === 'planifiée' ? '#ffffffff' :
                                item.status === 'en_cours' ? '#ffffffff' :
                                    '#ffffffff',
                        fontSize: '0.65rem',
                        padding: '6px 12px',
                        fontWeight: 800,
                        border: 'none'
                    }}
                    className="rounded-pill text-uppercase"
                >
                    {item.status.replace('_', ' ')}
                </Badge>
            )
        }
    ];

    const renderExpandedRow = (visit) => {
        const currentFilters = patientFilters[visit.id] || { dept: '', decision: '' };
        return (
        <div className="expanded-row-container">
            <div className="sub-table-header">
                <div className="sub-table-title">
                    <FontAwesomeIcon icon={faCalendarWeek} style={{ color: '#3a8a90' }} />
                    <span>Détails de la visite - {visit.id}</span>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className="d-flex gap-2">
                        <Form.Select
                            size="sm"
                            className="extra-small fw-bold border-0 bg-white shadow-sm"
                            style={{ width: '160px', borderRadius: '8px' }}
                            value={currentFilters.dept}
                            onChange={e => setPatientFilters({ ...patientFilters, [visit.id]: { ...currentFilters, dept: e.target.value } })}
                        >
                            <option value="">Tous les départements</option>
                            {getVisitDepartmentOptions(visit).map((departmentName) => (
                                <option key={departmentName} value={departmentName}>{departmentName}</option>
                            ))}
                        </Form.Select>
                        <Form.Select
                            size="sm"
                            className="extra-small fw-bold border-0 bg-white shadow-sm"
                            style={{ width: '160px', borderRadius: '8px' }}
                            value={currentFilters.decision}
                            onChange={e => setPatientFilters({ ...patientFilters, [visit.id]: { ...currentFilters, decision: e.target.value } })}
                        >
                            <option value="">Toutes décisions</option>
                            <option value="Apte">Apte</option>
                            <option value="Inapte">Inapte</option>
                            <option value="A revoir">À revoir</option>
                        </Form.Select>
                    </div>
                    <div className="sub-table-badge">
                        {getUniqueEmployees(visit.employees || []).length} COLLABORATEURS
                    </div>
                </div>
            </div>

            <div className="main-sub-table">
                <Table className="mb-0">
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th className="border-0 extra-small fw-black text-muted text-uppercase">Collaborateur</th>
                            <th className="border-0 extra-small fw-black text-muted text-uppercase">Département</th>
                            <th className="border-0 extra-small fw-black text-muted text-uppercase">Résultat / Statut</th>
                            <th className="border-0 extra-small fw-black text-muted text-uppercase text-end px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            const filteredEmployees = getUniqueEmployees(visit.employees || [])
                                .filter(emp => !currentFilters.dept || emp.department === currentFilters.dept)
                                .filter(emp => !currentFilters.decision || emp.status === currentFilters.decision);

                            if (filteredEmployees.length > 0) {
                                return filteredEmployees.map(emp => (
                                    <tr key={emp.id} style={{ borderBottom: '1px solid #eef2f1' }}>
                                        <td className="border-0 py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                                    style={{ width: '36px', height: '36px', fontSize: '12px', background: 'rgba(100, 116, 139, 0.08)', color: '#475569' }}>
                                                    {emp.name?.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark small">{emp.name}</div>
                                                    <div className="extra-small text-muted">{emp.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border-0 py-3 align-middle">
                                            <span className="text-muted small fw-bold">{emp.department || '-'}</span>
                                        </td>
                                        <td className="border-0 py-3 align-middle">
                                            <Badge style={{
                                                backgroundColor:
                                                    emp.status === 'Apte' ? 'rgba(34, 197, 94, 0.08)' :
                                                        emp.status === 'Inapte' ? 'rgba(239, 68, 68, 0.08)' :
                                                            emp.status === 'A revoir' ? 'rgba(249, 115, 22, 0.08)' :
                                                                'rgba(100, 116, 139, 0.08)',
                                                color:
                                                    emp.status === 'Apte' ? '#16a34a' :
                                                        emp.status === 'Inapte' ? '#dc2626' :
                                                            emp.status === 'A revoir' ? '#ea580c' :
                                                                '#475569',
                                                border: 'none',
                                                padding: '6px 14px',
                                                color:'white',
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                letterSpacing: '0.3px'
                                            }} className="rounded-pill text-uppercase">
                                                {emp.status}
                                            </Badge>
                                        </td>
                                        <td className="border-0 py-3 align-middle text-end px-4">
                                            <div className="d-flex gap-2 justify-content-end">
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="rounded-3 border-0 extra-small fw-bold d-flex align-items-center gap-2"
                                                    style={{ background: '#f8f9fa', color: '#3a8a90' }}
                                                    onClick={() => handleOpenDossier(emp)}
                                                >
                                                    <FileText size={14} /> Dossier
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="btn-primary-teal border-0 rounded-3 extra-small fw-bold d-flex align-items-center gap-2 px-3"
                                                    onClick={() => handleExamine(emp, visit.id)}
                                                >
                                                    <Stethoscope size={14} /> Examen
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ));
                            }
                            return (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 border-0">
                                        <div className="text-muted extra-small fw-bold uppercase">Aucun collaborateur trouvé</div>
                                    </td>
                                </tr>
                            );
                        })()}
                    </tbody>
                </Table>
            </div>
        </div>
    );
    };

    return (
        <ThemeProvider theme={createTheme()}>
            <Box className="postionPage" sx={{ ...dynamicStyles }}>
                <Box component="main" sx={{ flexGrow: 1, p: isMobile ? 1 : 0, mt: isMobile ? 8 : 10 }}>
                    <style>{`
                        .container3 {
                            padding: ${isMobile ? '12px' : '24px'} !important;
                            border: none !important;
                            border-radius: 12px !important;
                            background-color: #fff !important;
                            box-shadow: 0 6px 20px rgba(8, 179, 173, 0.08) !important;
                            transition: all 0.3s ease-in-out !important;
                            min-height: ${isMobile ? 'auto' : 'calc(100vh - 180px)'} !important;
                            height: ${isMobile ? 'auto' : 'calc(100vh - 180px)'} !important;
                            flex: 1 !important;
                            position: relative !important;
                            overflow: ${isMobile ? 'visible' : 'hidden'} !important;
                        }

                        .fw-black { font-weight: 900; }
                        .extra-small { font-size: 0.7rem; }
                        
                        .btn-primary-teal {
                            background-color: #3a8a90 !important;
                            border-color: #3a8a90 !important;
                            color: white !important;
                            transition: all 0.2s ease !important;
                            font-weight: 900 !important;
                            letter-spacing: 0.5px !important;
                        }

                        .btn-primary-teal:hover {
                            background-color: #2c767c !important;
                            border-color: #2c767c !important;
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(58, 138, 144, 0.2);
                        }

                        .text-primary-teal {
                            color: #3a8a90 !important;
                        }

                        .filter-icon-btn {
                            width: 35px;
                            height: 35px;
                            border-radius: 8px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            transition: all 0.2s;
                            background: #f8f9fa;
                            color: #3a8a90;
                            border: 1px solid #eee;
                        }

                        .filter-icon-btn:hover {
                            background: #3a8a90;
                            color: white;
                        }

                        .expanded-row-container {
                            padding: 24px;
                            background-color: #ffffff;
                            border-bottom: 2px solid #f1f5f9;
                        }

                        .sub-table-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 15px;
                        }

                        .sub-table-title {
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            font-weight: 800;
                            color: #2c767c;
                            font-size: 0.95rem;
                        }

                        .sub-table-badge {
                            background-color: rgba(100, 116, 139, 0.08);
                            color: #64748b;
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 11px;
                            font-weight: 800;
                            text-transform: uppercase;
                        }

                        .main-sub-table {
                            background: white !important;
                            border: 1px solid #eef2f1 !important;
                            border-radius: 8px !important;
                            overflow: hidden !important;
                        }
                    `}</style>
                    <div className="d-flex" style={{ width: '100%', padding: '0 20px', height: isMobile ? 'auto' : 'calc(100vh - 180px)' }}>
                        <div className="container3 d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3a8a90' }}></div>
                                        <h4 className="fw-black text-dark mb-0" style={{ fontSize: '1.1rem' }}>Planning des Visites Médicales</h4>
                                    </div>
                                    <p className="text-muted extra-small mb-0 ms-3">
                                        {visitsData.length} visite{visitsData.length > 1 ? 's' : ''} programmée{visitsData.length > 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <FontAwesomeIcon
                                        onClick={() => setFiltersVisible(!filtersVisible)}
                                        icon={filtersVisible ? faClose : faFilter}
                                        color={filtersVisible ? 'green' : ''}
                                        style={{
                                            cursor: "pointer",
                                            fontSize: "1.9rem",
                                            color: "#2c767c",
                                            marginTop: "1.3%",
                                            marginRight: "8px",
                                        }}
                                        title="Filtres visites"
                                    />
                                    <Button
                                        onClick={() => { setEditingVisit(null); setShowForm(true); }}
                                        className="btn-primary-teal d-flex align-items-center rounded-3 border-0 py-2 px-4 shadow-sm"
                                        style={{ height: '42px' }}
                                    >
                                        <FaPlusCircle size={20} className="me-2" />
                                        <span className="extra-small fw-black text-uppercase">Programmer</span>
                                    </Button>
                                    {selectedItems.length > 0 && (
                                        <Button
                                            variant="danger"
                                            className="rounded-3 border-0 py-2 px-4 shadow-sm"
                                            onClick={handleDeleteSelected}
                                            style={{ height: '42px' }}
                                        >
                                            <Trash2 size={16} className="me-2" />
                                            <span className="extra-small fw-black text-uppercase">Supprimer</span>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <AnimatePresence>
                                {filtersVisible && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="filters-container"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            padding: '16px 20px',
                                            minHeight: 0
                                        }}
                                    >
                                        {/* Ligne 1: Icône et titre */}
                                        <div className="filters-icon-section" style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            justifyContent: 'center',
                                            marginLeft: '-8px',
                                            marginRight: '14%',
                                        }}>
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="#4a90a4"
                                                strokeWidth="2"
                                                className="filters-icon"
                                            >
                                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                            </svg>
                                            <span className="filters-title">Filtres</span>
                                        </div>

                                        {/* Ligne 2: Tous les filtres */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1px',
                                            flexWrap: 'wrap',
                                            justifyContent: 'center',
                                            marginLeft: '10.2%'
                                        }}>
                                            {[
                                                {
                                                    key: 'startDate',
                                                    label: 'Du',
                                                    value: visitFilters.startDate,
                                                    type: 'date'
                                                },
                                                {
                                                    key: 'endDate',
                                                    label: 'Au',
                                                    value: visitFilters.endDate,
                                                    type: 'date'
                                                },
                                                {
                                                    key: 'doctor',
                                                    label: 'Médecin',
                                                    value: visitFilters.doctor,
                                                    type: 'select',
                                                    options: doctorFilterOptions,
                                                    placeholder: 'Tous les médecins'
                                                },
                                                {
                                                    key: 'status',
                                                    label: 'Statut',
                                                    value: visitFilters.status,
                                                    type: 'select',
                                                    options: [
                                                        { label: 'Planifiée', value: 'planifiée' },
                                                        { label: 'En cours', value: 'en_cours' },
                                                        { label: 'Terminée', value: 'terminée' }
                                                    ],
                                                    placeholder: 'Tous les statuts'
                                                }
                                            ].map((filter, index) => (
                                                <div key={index} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    margin: 0,
                                                    marginRight: '46px'
                                                }}>
                                                    <label className="filter-label" style={{
                                                        fontSize: '0.9rem',
                                                        margin: 0,
                                                        marginRight: '-44px',
                                                        whiteSpace: 'nowrap',
                                                        minWidth: 'auto',
                                                        fontWeight: 600,
                                                        color: '#2c3e50'
                                                    }}>
                                                        {filter.label}
                                                    </label>

                                                    {filter.type === 'select' ? (
                                                        <select
                                                            value={filter.value}
                                                            onChange={(e) => setVisitFilters(prev => ({ ...prev, [filter.key]: e.target.value }))}
                                                            className="filter-input"
                                                            style={{
                                                                minWidth: 80,
                                                                maxWidth: 110,
                                                                height: 30,
                                                                fontSize: '0.9rem',
                                                                padding: '2px 6px',
                                                                borderRadius: 6
                                                            }}
                                                        >
                                                            <option value="">{filter.placeholder}</option>
                                                            {filter.options?.map((option, optIndex) => (
                                                                <option key={optIndex} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type="date"
                                                            value={filter.value}
                                                            onChange={(e) => setVisitFilters(prev => ({ ...prev, [filter.key]: e.target.value }))}
                                                            className="filter-input"
                                                            style={{
                                                                minWidth: 120,
                                                                height: 30,
                                                                fontSize: '0.9rem',
                                                                padding: '2px 6px',
                                                                borderRadius: 6
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="mt-2" style={{ flex: 1, overflow: 'auto' }}>
                                <ExpandRTable
                                    columns={columns}
                                    data={visitsData}
                                    filteredData={filteredData}
                                    searchTerm={searchQuery}
                                    highlightText={(text) => text}
                                    selectedItems={selectedItems}
                                    handleSelectAllChange={handleSelectAllChange}
                                    handleCheckboxChange={handleCheckboxChange}
                                    handleEdit={openEdit}
                                    handleDelete={handleDelete}
                                    handleDeleteSelected={handleDeleteSelected}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    handleChangePage={(p) => setPage(p)}
                                    handleChangeRowsPerPage={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                                    expandedRows={expandedRows}
                                    renderExpandedRow={renderExpandedRow}
                                    renderCustomActions={(item) => (
                                        <div className="d-flex gap-2">
                                            <Button variant="light" size="sm" className="rounded-circle" onClick={() => handleDownload(item)}>
                                                <Download size={14} className="text-primary-teal" />
                                            </Button>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <GenericSidePanel
                            isOpen={showForm}
                            onClose={() => setShowForm(false)}
                            title="Programmation de Visite"
                            displayMode="inline"
                            showHeader={false}
                        >
                            <SSTVisitForm
                                initialData={editingVisit}
                                onSubmit={handleCreateVisit}
                                onCancel={() => { setShowForm(false); setEditingVisit(null); }}
                            />
                        </GenericSidePanel>

                        {/* Side Panel EXAMEN MEDICAL */}
                        {showExaminePanel && (
                            <GenericSidePanel
                                isOpen={showExaminePanel}
                                onClose={() => setShowExaminePanel(false)}
                                displayMode="inline"
                                showHeader={false}
                                defaultWidth={60}
                            >
                                <SSTExaminationPanel
                                    employee={selectedEmployeeForExam}
                                    onValidate={(data) => {
                                        // Update employee status in visitsData
                                        setVisitsData(prev => prev.map(v => {
                                            if (v.id === selectedEmployeeForExam.visitId) {
                                                return {
                                                    ...v,
                                                    employees: v.employees.map(e =>
                                                        e.id === selectedEmployeeForExam.id ? { ...e, status: 'Complété' } : e
                                                    )
                                                };
                                            }
                                            return v;
                                        }));

                                        setShowExaminePanel(false);
                                        Swal.fire({
                                            title: "Examen validé",
                                            text: "Les informations ont été enregistrées avec succès.",
                                            icon: "success",
                                            confirmButtonColor: "#3a8a90"
                                        });
                                    }}
                                    onCancel={() => setShowExaminePanel(false)}
                                />
                            </GenericSidePanel>
                        )}

                        {/* Side Panel DOSSIER MEDICAL */}
                        {showDossierPanel && (
                            <GenericSidePanel
                                isOpen={showDossierPanel}
                                onClose={() => setShowDossierPanel(false)}
                                displayMode="inline"
                                showHeader={false}
                                defaultWidth={40}
                            >
                                <SSTPatientDossierPanel
                                    employee={selectedEmployeeForDossier}
                                    onClose={() => setShowDossierPanel(false)}
                                />
                            </GenericSidePanel>
                        )}
                    </div>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default SSTVisits;
