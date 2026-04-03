import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Card, Row, Col, Badge, Button, Form, Tabs, Tab, ProgressBar, Accordion, Table } from 'react-bootstrap';
import '../Employe/DepartementManager.css';
import '../GroupsManager.css';
import {
    Activity,
    Weight,
    Heart,
    Eye,
    Save,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    FileText,
    Stethoscope,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    User,
    Clock,
    Briefcase,
    Search,
    Filter,
    Thermometer,
    Droplets,
    Zap,
    Scale,
    ClipboardList,
    Pill,
    Plus,
    X,
    Hospital,
    ExternalLink,
    Trash2,
    Calendar,
    Users,
    Settings,
    Filter as FilterIcon
} from 'lucide-react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faClose, faFilter, faCalendarWeek } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from 'framer-motion';
import { FaRegCircle } from "react-icons/fa";
import { IoFolderOpenOutline } from "react-icons/io5";
import Swal from 'sweetalert2';
import { useHeader } from "../../Acceuil/HeaderContext";
import { useOpen } from "../../Acceuil/OpenProvider";
import "../Style.css";
// import PremiumFilters from '../Components/PremiumFilters';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import ExpandRTable from '../Employe/ExpandRTable';

const SSTConsultation = () => {
    const { setTitle, clearActions, searchQuery } = useHeader();
    const { dynamicStyles, isMobile } = useOpen();

    const [step, setStep] = useState(0);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Filters for Step 0
    const [filterDept, setFilterDept] = useState('');
    const [selectedVisitId, setSelectedVisitId] = useState('');
    const [sidebarFiltersVisible, setSidebarFiltersVisible] = useState(false);
    const [tableFiltersVisible, setTableFiltersVisible] = useState(false);

    // Sidebar Filters State
    const [sidebarFilterDept, setSidebarFilterDept] = useState('');
    const [sidebarFilterStatus, setSidebarFilterStatus] = useState('');
    const [sidebarFilterDateStart, setSidebarFilterDateStart] = useState('');
    const [sidebarFilterDateEnd, setSidebarFilterDateEnd] = useState('');


    const [biometrics, setBiometrics] = useState({
        weight: '',
        height: '',
        pulse: '',
        bp_systolic: '',
        bp_diastolic: '',
        temperature: '',
        glycemia: '',
        vision_right: '',
        vision_left: '',
        spo2: '',
        waist: '',
        hearing_right: 'Normal',
        hearing_left: 'Normal'
    });

    const [clinicalNotes, setClinicalNotes] = useState({
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        recent_history: '',
        special_tests: ''
    });

    const [aptitude, setAptitude] = useState(null);
    const [selectedDiseases, setSelectedDiseases] = useState([]);
    const [diseaseSearch, setDiseaseSearch] = useState('');

    const [referral, setReferral] = useState({
        isExternal: false,
        specialist: '',
        doctorName: '',
        reason: '',
        priority: 'Normale'
    });

    const [expandedVisitId, setExpandedVisitId] = useState(null);

    const toggleVisit = (id) => {
        setExpandedVisitId(expandedVisitId === id ? null : id);
    };

    const commonDiseases = [
        "Hypertension Artérielle",
        "Diabète Type 2",
        "Asthme Professionnel",
        "Lombalgie Chronique",
        "Syndrome du Canal Carpien",
        "Burn-out / Stress",
        "Dyslipidémie",
        "Surpoids / Obésité",
        "Trouble Musculo-Squelettique (TMS)",
        "Dermatose Professionnelle"
    ];

    const addDisease = (disease) => {
        if (disease && !selectedDiseases.includes(disease)) {
            setSelectedDiseases([...selectedDiseases, disease]);
            setDiseaseSearch('');
        }
    };

    const removeDisease = (disease) => {
        setSelectedDiseases(selectedDiseases.filter(d => d !== disease));
    };

    const [departments, setDepartments] = useState([]);
    const [visits, setVisits] = useState([]);
    const [patients, setPatients] = useState([]);
    const [visitHistory, setVisitHistory] = useState([]);

    const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

    const filteredVisits = useMemo(() => {
        return visits.filter(v => {
            if (v.id === 'all') return false;

            if (sidebarFilterDept && v.dept !== sidebarFilterDept) return false;
            if (sidebarFilterStatus && v.status !== sidebarFilterStatus) return false;
            if (sidebarFilterDateStart && v.date < sidebarFilterDateStart) return false;
            if (sidebarFilterDateEnd && v.date > sidebarFilterDateEnd) return false;

            return true;
        });
    }, [visits, sidebarFilterDept, sidebarFilterStatus, sidebarFilterDateStart, sidebarFilterDateEnd]);

    const canCreate = true; // Placeholder for permissions

    useEffect(() => {
        setTitle("Consultation Médicale");
        return () => clearActions();
    }, [setTitle, clearActions]);

    useEffect(() => {
        const fetchConsultationData = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/visites`);
                const visitRows = Array.isArray(res.data) ? res.data : [];

                const mappedVisits = visitRows.map((visit) => ({
                    id: visit.id,
                    label: `VIS-${String(visit.id).padStart(3, '0')}`,
                    date: visit.date,
                    status: visit.status === 'completed' || visit.status === 'Complété' ? 'Completed' : 'Planned',
                    dept: visit.department || 'Non affecté',
                    type: visit.type || 'Périodique',
                    doctor: visit.doctor || visit.medecin_nom || 'Non renseigné',
                }));

                const mappedPatients = visitRows.flatMap((visit) =>
                    (visit.employees || []).map((employee) => ({
                        id: String(employee.id),
                        employeeId: employee.id,
                        name: employee.name || 'Employé',
                        dept: employee.department || 'Non affecté',
                        status: employee.status || 'En attente',
                        visitId: visit.id,
                        visitType: visit.type || 'Périodique',
                        doctor: visit.doctor || visit.medecin_nom || 'Non renseigné',
                    }))
                );

                setVisits(mappedVisits);
                setPatients(mappedPatients);
                setDepartments([...new Set(mappedPatients.map((patient) => patient.dept).filter(Boolean))]);
            } catch (error) {
                console.error('Erreur chargement consultation backend:', error);
            }
        };

        fetchConsultationData();
    }, [API_BASE_URL]);

    const getBMIInterpretation = (bmiValue) => {
        const bmi = parseFloat(bmiValue);
        if (!bmi || isNaN(bmi)) return { text: '-', color: 'text-muted' };
        if (bmi < 18.5) return { text: 'Maigreur (risque de carences, fatigue)', color: 'text-warning' };
        if (bmi <= 24.9) return { text: 'Corpulence normale (poids santé)', color: 'text-success' };
        if (bmi <= 29.9) return { text: 'Surpoids (risque accru)', color: 'text-warning' };
        if (bmi <= 34.9) return { text: 'Obésité modérée (classe I)', color: 'text-danger' };
        if (bmi <= 39.9) return { text: 'Obésité sévère (classe II)', color: 'text-danger' };
        return { text: 'Obésité massive (classe III)', color: 'text-danger' };
    };

    const calculateBMI = useCallback(() => {
        const w = parseFloat(biometrics.weight);
        const h = parseFloat(biometrics.height) / 100;
        if (w && h) return (w / (h * h)).toFixed(1);
        return '---';
    }, [biometrics.weight, biometrics.height]);

    const bmiValue = calculateBMI();
    const bmiInterp = getBMIInterpretation(bmiValue);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filteredData, setFilteredData] = useState(patients);

    useEffect(() => {
        let filtered = [...patients];

        // Filter by the selected visit
        if (selectedVisitId && selectedVisitId !== 'all') {
            filtered = filtered.filter(p => p.visitId === selectedVisitId);
        } else if (selectedVisitId === 'all') {
            // Apply global sidebar filters to the "All Visits" view
            // Only show patients that belong to one of the filtered visits
            const validVisitIds = filteredVisits.map(v => v.id);
            filtered = filtered.filter(p => validVisitIds.includes(p.visitId));
        }

        if (filterDept || sidebarFilterDept) {
            const dept = filterDept || sidebarFilterDept;
            filtered = filtered.filter(p => p.dept === dept);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
            (p.name?.toLowerCase().includes(query) ||
                p.id?.toLowerCase().includes(query) ||
                p.dept?.toLowerCase().includes(query))
            );
        }

        setFilteredData(filtered);
        setPage(0);
    }, [selectedVisitId, filterDept, sidebarFilterDept, searchQuery, filteredVisits]);

    const mapExamToTimeline = (exam) => ({
        id: exam.id,
        date: exam.date_examen ? new Date(exam.date_examen).toISOString().slice(0, 10) : '-',
        type: exam.motif || 'Périodique',
        doctor: exam.doctor_name || exam.doctor || 'Non renseigné',
        aptitude: exam.aptitude || 'En attente',
        biometrics: {
            imc: exam.biometrics?.bmi ?? exam.imc ?? '-',
            bp: (exam.biometrics?.bp_systolic || exam.biometrics?.bp_diastolic)
                ? `${exam.biometrics?.bp_systolic ?? '-'} / ${exam.biometrics?.bp_diastolic ?? '-'}`
                : ((exam.ta_systolique || exam.ta_diastolique) ? `${exam.ta_systolique ?? '-'} / ${exam.ta_diastolique ?? '-'}` : '-'),
            pulse: exam.biometrics?.pulse ?? exam.pouls ?? '-',
        },
        notes: {
            subjective: exam.soap?.subjective ?? exam.notes_subjectives ?? '-',
            assessment: exam.soap?.assessment ?? exam.evaluation ?? '-',
        },
        raw: exam,
    });

    const handleSelectPatient = async (patient) => {
        setSelectedPatient(patient);
        setStep(1);

        try {
            const examsRes = await axios.get(`${API_BASE_URL}/api/employes/${patient.employeeId}/examens-medicaux`);
            const exams = Array.isArray(examsRes.data) ? examsRes.data : [];
            const timeline = exams.map(mapExamToTimeline);
            setVisitHistory(timeline);

            const latestExam = timeline[0]?.raw;
            if (latestExam) {
                setBiometrics({
                    weight: latestExam.biometrics?.weight ?? latestExam.poids ?? '',
                    height: latestExam.biometrics?.height ?? latestExam.taille ?? '',
                    pulse: latestExam.biometrics?.pulse ?? latestExam.pouls ?? '',
                    bp_systolic: latestExam.biometrics?.bp_systolic ?? latestExam.ta_systolique ?? '',
                    bp_diastolic: latestExam.biometrics?.bp_diastolic ?? latestExam.ta_diastolique ?? '',
                    temperature: latestExam.biometrics?.temp ?? latestExam.temperature ?? '',
                    glycemia: latestExam.biometrics?.glycemia ?? latestExam.glycemie ?? '',
                    vision_right: latestExam.biometrics?.vision_right ?? latestExam.vision_droite ?? '',
                    vision_left: latestExam.biometrics?.vision_left ?? latestExam.vision_gauche ?? '',
                    spo2: latestExam.biometrics?.spo2 ?? latestExam.spo2 ?? '',
                    waist: latestExam.biometrics?.waist ?? latestExam.tour_taille ?? '',
                    hearing_right: latestExam.biometrics?.hearing_right ?? latestExam.audition_droite ?? 'Normal',
                    hearing_left: latestExam.biometrics?.hearing_left ?? latestExam.audition_gauche ?? 'Normal'
                });

                setClinicalNotes({
                    subjective: latestExam.soap?.subjective ?? latestExam.notes_subjectives ?? '',
                    objective: latestExam.soap?.objective ?? latestExam.notes_objectives ?? '',
                    assessment: latestExam.soap?.assessment ?? latestExam.evaluation ?? '',
                    plan: latestExam.soap?.plan ?? latestExam.plan ?? '',
                    recent_history: '',
                    special_tests: ''
                });
                setAptitude(latestExam.aptitude ?? null);
            } else {
                setBiometrics({
                    weight: '',
                    height: '',
                    pulse: '',
                    bp_systolic: '',
                    bp_diastolic: '',
                    temperature: '',
                    glycemia: '',
                    vision_right: '',
                    vision_left: '',
                    spo2: '',
                    waist: '',
                    hearing_right: 'Normal',
                    hearing_left: 'Normal'
                });
                setClinicalNotes({
                    subjective: '',
                    objective: '',
                    assessment: '',
                    plan: '',
                    recent_history: '',
                    special_tests: ''
                });
                setAptitude(null);
            }
        } catch (error) {
            console.error('Erreur chargement historique examens:', error);
            setVisitHistory([]);
        }
    };

    const saveCurrentExam = async () => {
        if (!selectedPatient) return;

        setIsSaving(true);
        try {
            const payload = {
                visite_id: selectedPatient.visitId,
                employe_id: selectedPatient.employeeId,
                date_examen: new Date().toISOString().replace('T', ' ').slice(0, 19),
                motif: selectedPatient.visitType || 'Périodique',
                doctor_name: selectedPatient.doctor || null,
                biometrics: {
                    weight: biometrics.weight || null,
                    height: biometrics.height || null,
                    bmi: bmiValue !== '---' ? Number(bmiValue) : null,
                    bp_systolic: biometrics.bp_systolic || null,
                    bp_diastolic: biometrics.bp_diastolic || null,
                    pulse: biometrics.pulse || null,
                    temp: biometrics.temperature || null,
                    glycemia: biometrics.glycemia || null,
                    spo2: biometrics.spo2 || null,
                    vision_right: biometrics.vision_right || null,
                    vision_left: biometrics.vision_left || null,
                    hearing_right: biometrics.hearing_right || null,
                    hearing_left: biometrics.hearing_left || null,
                    waist: biometrics.waist || null,
                },
                soap: {
                    subjective: clinicalNotes.subjective || null,
                    objective: clinicalNotes.objective || null,
                    assessment: clinicalNotes.assessment || null,
                    plan: clinicalNotes.plan || null,
                },
                aptitude: aptitude || null,
            };

            await axios.post(`${API_BASE_URL}/api/examens-medicaux`, payload, {
                headers: { Accept: 'application/json' },
                withCredentials: true,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const columns = [
        {
            key: 'id',
            label: 'ID Collab.',
            render: (item) => (
                <Badge bg="light" text="dark" className="border rounded-2 fw-black font-mono extra-small">{item.id}</Badge>
            )
        },
        {
            key: 'name',
            label: 'Collaborateur',
            render: (item) => (
                <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle bg-secondary bg-opacity-10 text-secondary d-flex align-items-center justify-content-center fw-black" style={{ width: '30px', height: '30px', fontSize: '10px' }}>
                        {(item.name?.split(' ') || []).map(n => n[0]).join('')}
                    </div>
                    <div>
                        <div className="fw-bold small text-dark">{item.name}</div>
                        <div className="extra-small text-muted">{item.dept}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Statut',
            render: (item) => (
                <Badge
                    bg={item.status === 'Complété' ? 'success' : 'warning'}
                    className="rounded-pill px-3 py-2 extra-small text-uppercase"
                >
                    {item.status}
                </Badge>
            )
        }
    ];

    return (
        <ThemeProvider theme={createTheme()}>
            <Box className="postionPage" sx={{ ...dynamicStyles }}>
                <Box component="main" sx={{ flexGrow: 1, p: 0, mt: 10 }}>
                    <style>{`
                        .groups-section {
                            display: flex;
                            flex-direction: column;
                            height: ${isMobile ? 'auto' : 'calc(100vh - 180px)'};
                            overflow-y: ${isMobile ? 'visible' : 'hidden'};
                            overflow-x: hidden;
                            background-color: #fff;
                            border-radius: 10px;
                            padding: 0 !important;
                            transition: all 0.3s ease;
                            border: none !important;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
                            width: ${isMobile ? '100%' : '20%'} !important;
                            min-width: ${isMobile ? '100%' : '250px'} !important;
                            flex-shrink: 0;
                            margin-right: ${isMobile ? '0' : '20px'};
                            margin-bottom: ${isMobile ? '20px' : '0'};
                        }

                        .groups-header-custom {
                            padding: 15px;
                            background: rgba(58, 138, 144, 0.03);
                            border-bottom: 1px solid #f1f1f1;
                            margin-bottom: 10px;
                        }

                        .groups-header-custom h6 {
                            color: #3a8a90;
                            font-size: 0.8rem;
                            font-weight: 900;
                            margin: 0;
                            letter-spacing: 0.5px;
                            text-transform: uppercase;
                        }

                        .container3 {
                            padding: ${isMobile ? '15px' : '20px 25px'} !important;
                            border: none !important;
                            border-radius: 12px !important;
                            background-color: #fff !important;
                            box-shadow: 0 6px 20px rgba(8, 179, 173, 0.08) !important;
                            transition: all 0.3s ease-in-out !important;
                            min-height: ${isMobile ? 'auto' : 'calc(100vh - 180px)'} !important;
                            height: ${isMobile ? 'auto' : 'calc(100vh - 180px)'} !important;
                            flex: 1 !important;
                            position: relative !important;
                            overflow: hidden !important;
                            display: flex !important;
                            flex-direction: column !important;
                        }

                        .department-item {
                            border-radius: 8px;
                            margin: 0 8px 4px 8px;
                            transition: all 0.2s ease;
                            border-left: 3px solid transparent;
                            background: transparent;
                            cursor: pointer;
                        }

                        .department-item:hover {
                            background: rgba(8, 179, 173, 0.05);
                        }

                        .department-item.selected {
                            background: rgba(8, 179, 173, 0.1);
                            border-left: 3px solid #3a8a90;
                        }

                        .department-item-content {
                            display: flex;
                            align-items: center;
                            padding: 10px 12px;
                            font-size: 14px;
                            font-weight: 500;
                            color: #2c767c;
                        }

                        .common-text {
                            display: flex;
                            align-items: center;
                            flex-grow: 1;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            font-size: 14px;
                            font-weight: 500;
                            color: #2c767c;
                            transition: color 0.2s;
                        }

                        .department-item.selected .common-text,
                        .department-item:hover .common-text {
                            color: #3a8a90;
                            font-weight: 600;
                        }

                        .common-text svg {
                            margin-right: 10px;
                            color: #3a8a90;
                            font-size: 18px;
                            opacity: 0.8;
                        }

                        .btn-primary-teal {
                            background-color: #3a8a90 !important;
                            border-color: #3a8a90 !important;
                            color: white !important;
                            transition: all 0.2s !important;
                            font-weight: 900 !important;
                            letter-spacing: 0.5px !important;
                        }

                        .btn-primary-teal:hover {
                            background-color: #2c767c !important;
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(58, 138, 144, 0.2);
                        }

                        .text-primary-teal { color: #3a8a90 !important; }

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

                        .scrollbar-teal::-webkit-scrollbar { width: 4px; }
                        .scrollbar-teal::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                        .scrollbar-teal::-webkit-scrollbar-thumb { background: #3a8a90; border-radius: 10px; }

                        .separator-custom {
                            height: 1px;
                            background-color: #e5e7eb;
                            margin: 10px 0;
                            width: 100%;
                        }
                    `}</style>
                    <div className={isMobile ? "d-block" : "d-flex"} style={{ width: '100%', padding: isMobile ? '0 10px' : '0 20px', height: isMobile ? 'auto' : 'calc(100vh - 180px)', overflow: 'hidden' }}>
                        {step === 0 ? (
                            <>
                                {/* Left Side: Visits Selection */}
                                <div className="groups-section" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <div className="groups-header-custom d-flex justify-content-between align-items-center">
                                        <h6>
                                            <FontAwesomeIcon icon={faCalendarWeek} className="me-2 text-primary" />
                                            Sessions de Visite
                                        </h6>
                                        <div className="d-flex align-items-center">
                                            <FontAwesomeIcon
                                                onClick={() => setSidebarFiltersVisible(!sidebarFiltersVisible)}
                                                icon={sidebarFiltersVisible ? faClose : faFilter}
                                                style={{
                                                    cursor: "pointer",
                                                    fontSize: "1.2rem",
                                                    color: sidebarFiltersVisible ? "#22c55e" : "#3a8a90",
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {sidebarFiltersVisible && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="bg-white border rounded-3 p-2 mb-3 shadow-sm mx-2"
                                            >
                                                <div className="d-flex flex-column gap-2">
                                                    {[
                                                        { label: 'Dépt', value: sidebarFilterDept, key: 'dept', type: 'select', options: departments.map(d => ({ label: d, value: d })) },
                                                        { label: 'Début', value: sidebarFilterDateStart, key: 'start', type: 'date' },
                                                        { label: 'Fin', value: sidebarFilterDateEnd, key: 'end', type: 'date' },
                                                        { label: 'Statut', value: sidebarFilterStatus, key: 'status', type: 'select', options: [{ label: 'Planifiée', value: 'Planned' }, { label: 'En cours', value: 'InProgress' }, { label: 'Terminée', value: 'Completed' }] }
                                                    ].map((f, i) => (
                                                        <div key={i} className="d-flex align-items-center gap-2">
                                                            <label className="extra-small fw-black text-muted mb-0" style={{ width: '40px' }}>{f.label}</label>
                                                            {f.type === 'select' ? (
                                                                <select
                                                                    className="form-select form-select-sm extra-small"
                                                                    value={f.value}
                                                                    onChange={e => {
                                                                        if (f.key === 'dept') setSidebarFilterDept(e.target.value);
                                                                        if (f.key === 'status') setSidebarFilterStatus(e.target.value);
                                                                    }}
                                                                >
                                                                    <option value="">Tous</option>
                                                                    {f.options.map((o, j) => <option key={j} value={o.value}>{o.label}</option>)}
                                                                </select>
                                                            ) : (
                                                                <input
                                                                    type="date"
                                                                    className="form-control form-control-sm extra-small"
                                                                    value={f.value}
                                                                    onChange={e => {
                                                                        if (f.key === 'start') setSidebarFilterDateStart(e.target.value);
                                                                        if (f.key === 'end') setSidebarFilterDateEnd(e.target.value);
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="flex-grow-1 overflow-auto scrollbar-teal pe-2">
                                        <div
                                            className={`department-item ${selectedVisitId === 'all' ? 'selected' : ''}`}
                                            onClick={() => setSelectedVisitId('all')}
                                        >
                                            <div className="department-item-content">
                                                <span className="common-text">
                                                    <Users size={18} />
                                                    Toutes les visites
                                                </span>
                                            </div>
                                        </div>

                                        {filteredVisits.map(visit => (
                                            <div
                                                key={visit.id}
                                                className={`department-item ${selectedVisitId === visit.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedVisitId(visit.id)}
                                            >
                                                <div className="department-item-content">
                                                    <span className="common-text">
                                                        <IoFolderOpenOutline size={18} />
                                                        <div className="d-flex flex-column">
                                                            <div className="title-text fw-bold">{visit.label}</div>
                                                            <div className="extra-small opacity-50" style={{ fontSize: '10px' }}>
                                                                {visit.date} • {visit.status === 'Completed' ? 'Terminée' : visit.status === 'Planned' ? 'Planifiée' : 'En cours'}
                                                            </div>
                                                        </div>
                                                    </span>
                                                    {selectedVisitId === visit.id && (
                                                        <ChevronRight size={14} className="ms-2 opacity-50" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Side: Patient Table */}
                                <div className="container3 d-flex flex-column" style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div>
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3a8a90' }}></div>
                                                <h4 className="fw-black text-dark mb-0" style={{ fontSize: '1.1rem' }}>Détails de l'Examen</h4>
                                            </div>
                                            <p className="text-muted extra-small mb-0 ms-3">
                                                {filteredData.length} collaborateur(s) {selectedVisitId === 'all' ? 'chargés' : 'trouvés pour cet examen'}.
                                            </p>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <FontAwesomeIcon
                                                onClick={() => setTableFiltersVisible(!tableFiltersVisible)}
                                                icon={tableFiltersVisible ? faClose : faFilter}
                                                color={tableFiltersVisible ? 'green' : ''}
                                                style={{
                                                    cursor: "pointer",
                                                    fontSize: "1.9rem",
                                                    color: "#2c767c",
                                                    marginTop: "1.3%",
                                                    marginRight: "8px",
                                                }}
                                            />

                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {tableFiltersVisible && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="filters-container mb-4"
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
                                                    <span className="filters-title">Filtres Table</span>
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
                                                    <div style={{
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
                                                            Service
                                                        </label>

                                                        <select
                                                            value={filterDept}
                                                            onChange={(e) => setFilterDept(e.target.value)}
                                                            className="filter-input"
                                                            style={{
                                                                minWidth: 150,
                                                                height: 30,
                                                                fontSize: '0.9rem',
                                                                padding: '2px 6px',
                                                                borderRadius: 6
                                                            }}
                                                        >
                                                            <option value="">Tous les services</option>
                                                            {departments.map((d, i) => (
                                                                <option key={i} value={d}>{d}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="mt-2" style={{ flex: 1, overflow: 'auto' }}>
                                        <ExpandRTable
                                            columns={columns}
                                            data={patients}
                                            filteredData={filteredData}
                                            searchTerm={searchQuery}
                                            highlightText={(text) => text}
                                            selectedItems={[]}
                                            handleSelectAllChange={() => { }}
                                            handleCheckboxChange={() => { }}
                                            handleEdit={(item) => item.status !== 'Complété' && handleSelectPatient(item)}
                                            handleDelete={() => { }}
                                            handleDeleteSelected={() => { }}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            handleChangePage={(p) => setPage(p)}
                                            handleChangeRowsPerPage={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                                            renderCustomActions={(item) => (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    className="btn-primary-teal border-0 rounded-pill px-4 extra-small fw-black"
                                                    disabled={item.status === 'Complété'}
                                                    onClick={() => handleSelectPatient(item)}
                                                >
                                                    DÉMARRER <ChevronRight size={12} className="ms-1" />
                                                </Button>
                                            )}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div
                                className="animate-in slide-in-from-right duration-500 w-100 scrollbar-teal"
                                style={{
                                    height: '100%',
                                    overflowY: isMobile ? 'visible' : 'auto',
                                    overflowX: 'hidden',
                                    paddingRight: isMobile ? '0' : '10px',
                                    paddingBottom: '20px'
                                }}
                            >
                                {/* Header Patient Info */}
                                <div className="d-flex justify-content-between align-items-center mb-3 bg-white p-3 rounded-4 shadow-sm" style={{ borderLeft: '6px solid #3a8a90' }}>
                                    <div className="d-flex align-items-center gap-4">
                                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-black shadow-sm" style={{ width: '56px', height: '56px', fontSize: '18px', background: 'linear-gradient(135deg, #3a8a90 0%, #2c767c 100%)' }}>
                                            {(selectedPatient?.name?.split(' ') || []).map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h4 className="fw-black mb-0 text-dark">{selectedPatient?.name}</h4>
                                            <div className="extra-small text-muted fw-bold uppercase tracking-widest d-flex align-items-center gap-2">
                                                <span>{selectedPatient?.id}</span>
                                                <span className="opacity-25">|</span>
                                                <span className="text-primary">{selectedPatient?.dept}</span>
                                                <span className="opacity-25">|</span>
                                                <span>Opérateur de Production</span>
                                                <Badge bg="info" className="bg-opacity-10 text-info border-0 rounded-pill ms-2">
                                                    {visits.find(v => v.id === selectedPatient?.visitId)?.label || 'CONSULTATION'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="outline-secondary"
                                            className="rounded-pill px-4 extra-small fw-black shadow-sm"
                                            onClick={() => { setSelectedPatient(null); setStep(0); }}
                                        >
                                            ANNULER
                                        </Button>
                                        <Button
                                            className="btn-primary-teal rounded-pill px-4 extra-small fw-black shadow-sm border-0"
                                            disabled={isSaving}
                                            onClick={() => {
                                                Swal.fire({
                                                    title: "Valider l'examen ?",
                                                    text: "Le rapport final sera généré.",
                                                    icon: "question",
                                                    showCancelButton: true,
                                                    confirmButtonText: "Oui, valider"
                                                }).then(async (r) => {
                                                    if (!r.isConfirmed) return;

                                                    try {
                                                        await saveCurrentExam();
                                                        setPatients(prev => prev.map((patient) =>
                                                            patient.employeeId === selectedPatient?.employeeId && patient.visitId === selectedPatient?.visitId
                                                                ? { ...patient, status: 'Complété' }
                                                                : patient
                                                        ));
                                                        Swal.fire('Succès', 'Examen enregistré avec succès.', 'success');
                                                        setStep(0);
                                                        setSelectedPatient(null);
                                                    } catch (error) {
                                                        const validationErrors = error.response?.data?.errors
                                                            ? Object.values(error.response.data.errors).flat().join('\n')
                                                            : null;
                                                        Swal.fire(
                                                            'Erreur',
                                                            validationErrors || error.response?.data?.message || "Échec de l'enregistrement de l'examen.",
                                                            'error'
                                                        );
                                                    }
                                                });
                                            }}
                                        >
                                            TERMINER & CLOTURER
                                        </Button>
                                    </div>
                                </div>

                                <Row className="g-4">
                                    {/* Colonne GAUCHE - Constantes et Paramètres */}
                                    <Col lg={3}>
                                        <div className="d-flex flex-column gap-3">

                                            {/* Card Constantes (Styled like Dossier Synthesis) */}
                                            <Card className="border-0 bg-light p-4 rounded-4 shadow-sm">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <span className="extra-small fw-black uppercase tracking-widest text-muted">Constantes</span>
                                                    <Stethoscope size={16} className="text-primary" />
                                                </div>

                                                <div className="d-flex flex-column gap-3">
                                                    <div>
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <span className="small text-muted fw-bold">Poids</span>
                                                            <span className="small fw-black text-primary">{biometrics.weight} kg</span>
                                                        </div>
                                                        <Form.Range min={40} max={150} step={0.5} value={biometrics.weight} onChange={e => setBiometrics({ ...biometrics, weight: e.target.value })} />
                                                    </div>

                                                    <div>
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <span className="small text-muted fw-bold">Taille</span>
                                                            <span className="small fw-black text-primary">{biometrics.height} cm</span>
                                                        </div>
                                                        <Form.Range min={140} max={220} value={biometrics.height} onChange={e => setBiometrics({ ...biometrics, height: e.target.value })} />
                                                    </div>

                                                    <div className="p-3 rounded-4 bg-white border text-center mt-1">
                                                        <div className="extra-small fw-black text-muted text-uppercase mb-1" style={{ fontSize: '0.6rem' }}>IMC Calculé</div>
                                                        <div className={`h4 fw-black mb-0 ${bmiInterp.color}`}>{bmiValue}</div>
                                                        {bmiValue !== '---' && (
                                                            <div className={`extra-small fw-bold ${bmiInterp.color}`} style={{ fontSize: '0.65rem' }}>{bmiInterp.text}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>

                                            {/* Card Signes Vitaux (Styled like Dossier Synthesis) */}
                                            <Card className="border-0 bg-white p-4 rounded-4 shadow-sm border">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <span className="extra-small fw-black uppercase tracking-widest text-muted">Signes Vitaux</span>
                                                    <Heart size={16} className="text-danger" />
                                                </div>

                                                <div className="d-flex flex-column gap-3">
                                                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                                        <span className="small text-muted fw-bold">Tension</span>
                                                        <div className="d-flex align-items-center gap-1">
                                                            <Form.Control size="sm" className="bg-light border-0 fw-black text-center p-0" style={{ width: '35px' }} value={biometrics.bp_systolic} onChange={e => setBiometrics({ ...biometrics, bp_systolic: e.target.value })} />
                                                            <span className="text-muted">/</span>
                                                            <Form.Control size="sm" className="bg-light border-0 fw-black text-center p-0" style={{ width: '35px' }} value={biometrics.bp_diastolic} onChange={e => setBiometrics({ ...biometrics, bp_diastolic: e.target.value })} />
                                                        </div>
                                                    </div>

                                                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                                        <span className="small text-muted fw-bold">Pouls</span>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <Form.Control size="sm" className="bg-light border-0 fw-black text-end p-0" style={{ width: '40px' }} value={biometrics.pulse} onChange={e => setBiometrics({ ...biometrics, pulse: e.target.value })} />
                                                            <span className="extra-small text-muted">bpm</span>
                                                        </div>
                                                    </div>

                                                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                                        <span className="small text-muted fw-bold">Temp.</span>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <Form.Control size="sm" className="bg-light border-0 fw-black text-end p-0" style={{ width: '40px' }} value={biometrics.temperature} onChange={e => setBiometrics({ ...biometrics, temperature: e.target.value })} />
                                                            <span className="extra-small text-muted">°C</span>
                                                        </div>
                                                    </div>

                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="small text-muted fw-bold">SpO2</span>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <Form.Control size="sm" className="bg-light border-0 fw-black text-end p-0" style={{ width: '40px' }} value={biometrics.spo2} onChange={e => setBiometrics({ ...biometrics, spo2: e.target.value })} />
                                                            <span className="extra-small text-muted">%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    </Col>

                                    {/* Colonne CENTRALE - Examen Clinique SOAP */}
                                    <Col lg={6}>
                                        <div className="d-flex flex-column gap-4">
                                            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                                                <div className="bg-white p-3 border-bottom d-flex align-items-center justify-content-between">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <ClipboardList size={20} className="text-secondary" />
                                                        <span className="fw-black text-dark text-uppercase extra-small tracking-widest">Observations Cliniques S.O.A.P</span>
                                                    </div>
                                                    <Badge bg="light" text="dark" className="rounded-pill extra-small">HISTORIQUE DISPONIBLE</Badge>
                                                </div>
                                                <div className="p-4">
                                                    <Row className="g-4">
                                                        <Col md={12}>
                                                            <Form.Group>
                                                                <Form.Label className="extra-small fw-black text-muted text-uppercase mb-2 d-flex align-items-center gap-2">
                                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1' }}></div>
                                                                    1. Subjectif (Plaintes, Antécédents récents)
                                                                </Form.Label>
                                                                <Form.Control as="textarea" rows={3} className="bg-light border-0 rounded-4 small p-3" placeholder="État général, plaintes fonctionnelles, sommeil, fatigue..." value={clinicalNotes.subjective} onChange={e => setClinicalNotes({ ...clinicalNotes, subjective: e.target.value })} />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={12}>
                                                            <Form.Group>
                                                                <Form.Label className="extra-small fw-black text-muted text-uppercase mb-2 d-flex align-items-center gap-2">
                                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                                                                    2. Objectif (Examen Physique)
                                                                </Form.Label>
                                                                <Form.Control as="textarea" rows={4} className="bg-light border-0 rounded-4 small p-3 shadow-none focus-primary" placeholder="ORL, Cardio-vasculaire, Pulmonaire, Abdominal, Ostéo-articulaire, Neuro-psychique..." value={clinicalNotes.objective} onChange={e => setClinicalNotes({ ...clinicalNotes, objective: e.target.value })} />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Form.Group>
                                                                <Form.Label className="extra-small fw-black text-muted text-uppercase mb-2">3. Appréciation</Form.Label>
                                                                <Form.Control as="textarea" rows={2} className="bg-light border-0 rounded-4 small p-3" placeholder="Synthèse médicale..." value={clinicalNotes.assessment} onChange={e => setClinicalNotes({ ...clinicalNotes, assessment: e.target.value })} />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Form.Group>
                                                                <Form.Label className="extra-small fw-black text-muted text-uppercase mb-2">4. Plan / Mesures</Form.Label>
                                                                <Form.Control as="textarea" rows={2} className="bg-light border-0 rounded-4 small p-3" placeholder="Prescriptions, orientation, ÉPI..." value={clinicalNotes.plan} onChange={e => setClinicalNotes({ ...clinicalNotes, plan: e.target.value })} />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </Card>

                                            {/* Card Examens Sensoriels */}
                                            <Row className="g-4">
                                                <Col md={6}>
                                                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                                                        <div className="bg-light p-3 border-bottom d-flex align-items-center gap-2">
                                                            <Eye size={16} className="text-info" />
                                                            <span className="extra-small fw-black text-muted text-uppercase tracking-widest">Vision</span>
                                                        </div>
                                                        <div className="p-3">
                                                            <div className="d-flex justify-content-between extra-small fw-bold mb-2">
                                                                <span>OG: {biometrics.vision_left}/10</span>
                                                                <span>OD: {biometrics.vision_right}/10</span>
                                                            </div>
                                                            <Form.Range min={0} max={10} step={0.5} value={biometrics.vision_left} onChange={e => setBiometrics({ ...biometrics, vision_left: e.target.value })} />
                                                            <Form.Range min={0} max={10} step={0.5} value={biometrics.vision_right} onChange={e => setBiometrics({ ...biometrics, vision_right: e.target.value })} className="mt-2" />
                                                        </div>
                                                    </Card>
                                                </Col>
                                                <Col md={6}>
                                                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                                                        <div className="bg-light p-3 border-bottom d-flex align-items-center gap-2">
                                                            <Zap size={16} className="text-warning" />
                                                            <span className="extra-small fw-black text-muted text-uppercase tracking-widest">Audition</span>
                                                        </div>
                                                        <div className="p-3">
                                                            <div className="d-flex gap-2">
                                                                <Form.Select size="sm" className="bg-light border-0 extra-small fw-black" value={biometrics.hearing_left} onChange={e => setBiometrics({ ...biometrics, hearing_left: e.target.value })}>
                                                                    <option>VG (OG)</option><option>V. Normale</option><option>Diminution</option>
                                                                </Form.Select>
                                                                <Form.Select size="sm" className="bg-light border-0 extra-small fw-black" value={biometrics.hearing_right} onChange={e => setBiometrics({ ...biometrics, hearing_right: e.target.value })}>
                                                                    <option>VG (OD)</option><option>V. Normale</option><option>Diminution</option>
                                                                </Form.Select>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </Col>
                                            </Row>

                                            {/* Card Gestion des Pathologies / Maladies */}
                                            <Card className="border-0 shadow-sm rounded-4 overflow-hidden mt-4">
                                                <div className="bg-white p-3 border-bottom d-flex align-items-center justify-content-between">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Activity size={18} className="text-danger" />
                                                        <span className="fw-black text-dark text-uppercase extra-small tracking-widest">Diagnostics & Pathologies</span>
                                                    </div>
                                                    <Badge bg="danger" className="bg-opacity-10 text-danger border-0 rounded-pill extra-small">
                                                        {selectedDiseases.length} DÉTECTÉE(S)
                                                    </Badge>
                                                </div>
                                                <div className="p-4">
                                                    <div className="position-relative mb-3">
                                                        <Form.Control
                                                            placeholder="Rechercher ou ajouter une maladie..."
                                                            className="bg-light border-0 rounded-pill ps-4 extra-small fw-bold py-2"
                                                            value={diseaseSearch}
                                                            onChange={e => setDiseaseSearch(e.target.value)}
                                                            onKeyPress={e => e.key === 'Enter' && (addDisease(diseaseSearch), e.preventDefault())}
                                                        />
                                                        <Plus
                                                            size={16}
                                                            className="position-absolute text-primary cursor-pointer"
                                                            style={{ right: '15px', top: '50%', transform: 'translateY(-50%)' }}
                                                            onClick={() => addDisease(diseaseSearch)}
                                                        />
                                                    </div>

                                                    {diseaseSearch && (
                                                        <div className="bg-white border rounded-3 shadow-sm mb-3 overflow-hidden animate-in fade-in zoom-in duration-200">
                                                            {commonDiseases
                                                                .filter(d => d.toLowerCase().includes(diseaseSearch.toLowerCase()))
                                                                .slice(0, 5)
                                                                .map(d => (
                                                                    <div
                                                                        key={d}
                                                                        className="p-2 border-bottom hover-bg-light cursor-pointer extra-small fw-bold"
                                                                        onClick={() => addDisease(d)}
                                                                    >
                                                                        {d}
                                                                    </div>
                                                                ))
                                                            }
                                                            <div
                                                                className="p-2 bg-primary bg-opacity-10 text-primary cursor-pointer extra-small fw-black"
                                                                onClick={() => addDisease(diseaseSearch)}
                                                            >
                                                                + AJOUTER PERSONNALISÉ: "{diseaseSearch}"
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="d-flex flex-wrap gap-2">
                                                        {selectedDiseases.length === 0 ? (
                                                            <div className="w-100 text-center py-3 border border-dashed rounded-4">
                                                                <span className="extra-small text-muted fw-bold">Aucune pathologie sélectionnée</span>
                                                            </div>
                                                        ) : (
                                                            selectedDiseases.map(d => (
                                                                <Badge
                                                                    key={d}
                                                                    bg="light"
                                                                    className="d-flex align-items-center gap-2 text-dark border p-2 rounded-3 hover-shadow-sm transition-all"
                                                                >
                                                                    <span className="extra-small fw-black">{d}</span>
                                                                    <X
                                                                        size={12}
                                                                        className="text-muted cursor-pointer hover-text-danger"
                                                                        onClick={() => removeDisease(d)}
                                                                    />
                                                                </Badge>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>

                                            {/* Card Historique des Visites - Timeline */}
                                            <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                                                <div className="bg-white p-3 border-bottom d-flex align-items-center justify-content-between sticky-top" style={{ zIndex: 5 }}>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Clock size={18} className="text-secondary" />
                                                        <span className="fw-black text-dark text-uppercase extra-small tracking-widest">Historique Médical</span>
                                                    </div>
                                                    <Badge bg="light" text="dark" className="border fw-bold extra-small">
                                                        {visitHistory.length} Dossiers
                                                    </Badge>
                                                </div>

                                                <div className="p-0 bg-light bg-opacity-10 position-relative" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                                    {visitHistory.length === 0 ? (
                                                        <div className="text-center p-4 text-muted extra-small">Aucun historique disponible</div>
                                                    ) : (
                                                        <div className="d-flex flex-column">
                                                            {visitHistory.map((visit, index) => (
                                                                <div key={visit.id} className="position-relative border-bottom border-light">
                                                                    {/* Vertical connector line handled by border-start of child or absolute div? doing simpler relative layout */}
                                                                    <div
                                                                        className={`p-3 cursor-pointer transition-all hover-bg-light ${expandedVisitId === visit.id ? 'bg-light bg-opacity-50' : ''}`}
                                                                        onClick={() => toggleVisit(visit.id)}
                                                                    >
                                                                        <div className="d-flex gap-3">
                                                                            {/* Timeline Marker */}
                                                                            <div className="d-flex flex-column align-items-center mt-1" style={{ width: '24px' }}>
                                                                                <div className={`rounded-circle border border-2 d-flex align-items-center justify-content-center bg-white ${visit.aptitude === 'Apte' ? 'border-success text-success' :
                                                                                    visit.aptitude === 'Restricted' ? 'border-warning text-warning' : 'border-danger text-danger'
                                                                                    }`} style={{ width: '18px', height: '18px' }}>
                                                                                    {visit.aptitude === 'Apte' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                                                                                </div>
                                                                                {index !== visitHistory.length - 1 && <div className="h-100 border-start border-2 border-light my-1"></div>}
                                                                            </div>

                                                                            <div className="flex-grow-1">
                                                                                <div className="d-flex justify-content-between align-items-start">
                                                                                    <div>
                                                                                        <div className="d-flex align-items-center gap-2 mb-1">
                                                                                            <span className="fw-black text-dark extra-small">{visit.date}</span>
                                                                                            <Badge bg="light" text="dark" className="border extra-small fw-bold">{visit.type}</Badge>
                                                                                        </div>
                                                                                        <div className="extra-small text-muted d-flex align-items-center gap-1">
                                                                                            <User size={10} /> {visit.doctor}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="d-flex align-items-center gap-2">
                                                                                        {!expandedVisitId && (
                                                                                            <Badge bg={visit.aptitude === 'Apte' ? 'success' : 'warning'} className="bg-opacity-10 text-dark border-0 extra-small">
                                                                                                {visit.aptitude === 'Apte' ? 'APTE' : 'RÉSERVES'}
                                                                                            </Badge>
                                                                                        )}
                                                                                        {expandedVisitId === visit.id ? <ChevronDown size={14} className="text-muted" /> : <ChevronRight size={14} className="text-muted" />}
                                                                                    </div>
                                                                                </div>

                                                                                <AnimatePresence>
                                                                                    {expandedVisitId === visit.id && (
                                                                                        <motion.div
                                                                                            initial={{ height: 0, opacity: 0 }}
                                                                                            animate={{ height: 'auto', opacity: 1 }}
                                                                                            exit={{ height: 0, opacity: 0 }}
                                                                                            className="overflow-hidden mt-3"
                                                                                        >
                                                                                            <div className="p-3 bg-white rounded-3 border shadow-sm">
                                                                                                <div className="d-flex gap-2 mb-3 border-bottom pb-2">
                                                                                                    <div className="badge bg-light text-dark border extra-small">IMC: {visit.biometrics.imc}</div>
                                                                                                    <div className="badge bg-light text-dark border extra-small">TA: {visit.biometrics.bp}</div>
                                                                                                    <div className="badge bg-light text-dark border extra-small">Pouls: {visit.biometrics.pulse}</div>
                                                                                                </div>

                                                                                                <div className="mb-2">
                                                                                                    <div className="extra-small fw-black text-muted uppercase">Motif / Notes</div>
                                                                                                    <p className="extra-small text-dark mb-0">{visit.notes.subjective}</p>
                                                                                                </div>

                                                                                                <div className="p-2 bg-light rounded-2 border-start border-4 border-info">
                                                                                                    <div className="extra-small fw-black text-info uppercase">Conclusion</div>
                                                                                                    <p className="extra-small text-dark mb-0 fw-bold">{visit.notes.assessment}</p>
                                                                                                </div>
                                                                                            </div>
                                                                                        </motion.div>
                                                                                    )}
                                                                                </AnimatePresence>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        </div>
                                    </Col>

                                    {/* Colonne DROITE - Aptitude et Clôture */}
                                    <Col lg={3}>
                                        <div className="sticky-top" style={{ top: '1rem', zIndex: 100 }}>
                                            <Card className="border-0 shadow-lg rounded-4 overflow-hidden bg-white mb-4">
                                                <div className="bg-dark text-white p-3 text-center extra-small fw-black tracking-widest d-flex align-items-center justify-content-center gap-2">
                                                    <Scale size={16} /> DÉCISION MÉDICALE
                                                </div>
                                                <div className="p-4 d-flex flex-column gap-2 bg-light bg-opacity-25">
                                                    {[
                                                        { id: 'fit', label: 'Apte', color: 'success', icon: CheckCircle2, desc: 'Aucune restriction' },
                                                        { id: 'restricted', label: 'Apte / Réserves', color: 'warning', icon: AlertTriangle, desc: 'Aménagements requis' },
                                                        { id: 'unfit', label: 'Inapte', color: 'danger', icon: XCircle, desc: 'Arrêt temporaire ou définitif' },
                                                        { id: 'referral', label: 'Expertise', color: 'info', icon: Stethoscope, desc: 'Avis spécialisé requis' }
                                                    ].map(opt => (
                                                        <Button
                                                            key={opt.id}
                                                            variant={aptitude === opt.id ? opt.color : "outline-secondary"}
                                                            className={`w-100 text-start d-flex align-items-center justify-content-between px-3 py-3 rounded-3 border transition-all ${aptitude === opt.id ? 'shadow fw-bold text-white border-transparent' : 'bg-white border-light text-muted'}`}
                                                            style={{ transform: aptitude === opt.id ? 'scale(1.02)' : 'none' }}
                                                            onClick={() => setAptitude(opt.id)}
                                                        >
                                                            <div className="d-flex align-items-center gap-3">
                                                                <opt.icon size={20} />
                                                                <div className="d-flex flex-column lh-1">
                                                                    <span className="extra-small bg-transparent uppercase tracking-wide">{opt.label}</span>
                                                                    {aptitude === opt.id && <span className="extra-small opacity-75 fw-normal mt-1" style={{ fontSize: '0.6rem' }}>{opt.desc}</span>}
                                                                </div>
                                                            </div>
                                                            {aptitude === opt.id && <CheckCircle2 size={16} className="opacity-50" />}
                                                        </Button>
                                                    ))}

                                                    <div className="mt-4 pt-3 border-top border-2">
                                                        {/* Dynamic Content based on Aptitude */}
                                                        {aptitude === 'restricted' && (
                                                            <div className="mb-3 animate-in fade-in slide-in-from-top-2 p-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded-3">
                                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                                    <AlertTriangle size={14} className="text-warning" />
                                                                    <span className="extra-small fw-black text-warning uppercase">Détails des Réserves / Restrictions</span>
                                                                </div>
                                                                <Form.Control
                                                                    as="textarea"
                                                                    rows={3}
                                                                    className="bg-white border-warning border-opacity-25 text-dark extra-small fw-bold"
                                                                    placeholder="Précisez les aménagements (ex: pas de port de charge > 10kg)..."
                                                                />
                                                            </div>
                                                        )}

                                                        {aptitude === 'unfit' && (
                                                            <div className="mb-3 animate-in fade-in slide-in-from-top-2 p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3">
                                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                                    <XCircle size={14} className="text-danger" />
                                                                    <span className="extra-small fw-black text-danger uppercase">Arrêt de Travail Requis</span>
                                                                </div>
                                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                                    <Form.Control type="number" size="sm" placeholder="Nb" className="bg-white border-danger border-opacity-25 text-danger fw-black text-center" style={{ width: '60px' }} />
                                                                    <Form.Select size="sm" className="bg-white border-danger border-opacity-25 text-danger fw-bold flex-grow-1">
                                                                        <option>Jours</option>
                                                                        <option>Semaines</option>
                                                                        <option>Mois</option>
                                                                    </Form.Select>
                                                                </div>
                                                                <Form.Control
                                                                    size="sm"
                                                                    type="date"
                                                                    className="bg-white border-danger border-opacity-25 text-danger fw-bold"
                                                                    placeholder="Date de début"
                                                                />
                                                            </div>
                                                        )}

                                                        {aptitude === 'referral' && (
                                                            <div className="mb-3 animate-in fade-in slide-in-from-top-2 p-3 bg-info bg-opacity-10 border border-info border-opacity-25 rounded-3">
                                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                                    <Stethoscope size={14} className="text-info" />
                                                                    <span className="extra-small fw-black text-info uppercase">Orientation Spécialiste</span>
                                                                </div>
                                                                <Form.Select
                                                                    size="sm"
                                                                    className="extra-small fw-bold border-info border-opacity-25 bg-white mb-2"
                                                                    value={referral.specialist}
                                                                    onChange={e => setReferral({ ...referral, specialist: e.target.value })}
                                                                >
                                                                    <option value="">-- Choisir la Spécialité --</option>
                                                                    <option>Cardiologie</option>
                                                                    <option>Ophtalmologie</option>
                                                                    <option>Psychiatrie</option>
                                                                    <option>Pneumologie</option>
                                                                    <option>ORL</option>
                                                                    <option>Traumatologie</option>
                                                                </Form.Select>
                                                                <Form.Control
                                                                    as="textarea"
                                                                    rows={2}
                                                                    placeholder="Motif de l'orientation..."
                                                                    className="extra-small fw-bold border-info border-opacity-25 bg-white"
                                                                    value={referral.reason}
                                                                    onChange={e => setReferral({ ...referral, reason: e.target.value })}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Common Fields */}
                                                        <div className="bg-light bg-opacity-50 p-3 rounded-3 mb-3">
                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                <Form.Label className="extra-small fw-black text-muted text-uppercase mb-0">Traitement & Ordonnance</Form.Label>
                                                                <Pill size={12} className="text-muted" />
                                                            </div>
                                                            <Form.Control
                                                                as="textarea"
                                                                rows={2}
                                                                className="bg-white border-0 shadow-sm rounded-3 extra-small"
                                                                placeholder="Rédiger l'ordonnance ici..."
                                                            />
                                                        </div>

                                                        <div className="bg-light bg-opacity-50 p-3 rounded-3">
                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                <Form.Label className="extra-small fw-black text-muted text-uppercase mb-0">Conclusion & Suivi</Form.Label>
                                                                <ClipboardList size={12} className="text-muted" />
                                                            </div>
                                                            <Form.Control
                                                                as="textarea"
                                                                rows={2}
                                                                className="bg-white border-0 shadow-sm rounded-3 extra-small mb-2"
                                                                placeholder="Note de synthèse..."
                                                            />
                                                            <div className="d-flex align-items-center gap-2 mt-2 pt-2 border-top border-light">
                                                                <span className="extra-small text-muted text-nowrap">Prochain RDV:</span>
                                                                <Form.Control type="date" size="sm" className="border-0 shadow-none bg-transparent fw-bold text-end p-0" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>

                                            {/* Audit Trail / Metadata */}
                                            <div className="p-3 rounded-4 bg-light text-muted">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <Clock size={14} />
                                                    <span className="extra-small fw-bold">Session ouverte le 04/02/2026</span>
                                                </div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <User size={14} />
                                                    <span className="extra-small fw-bold">Praticien: Dr. Martin</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </div>
                </Box>
            </Box>
            <style>
                {`
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.7rem; }
                .badge { font-weight: 700; letter-spacing: 0.05em; }
                .scale-102 { transform: scale(1.02); }

                .section-header {
                    border-bottom: none;
                    padding-bottom: 15px;
                    margin: 0.5% 1% 1%;
                }

                .section-title {
                    color: #2c3e50;
                    font-weight: 600;
                    margin-bottom: 5px;
                    display: flex;
                    align-items: center;
                    font-size: 19px;
                }

                .section-title i {
                    color: rgba(8, 179, 173, 0.02) !important;
                    background: #3a8a90 !important;
                    padding: 6px !important;
                    border-radius: 60% !important;
                    margin-right: 10px !important;
                }

                .section-description {
                    color: #6c757d;
                    font-size: 16px;
                    margin-bottom: 0;
                }

                .custom-tabs-sst .nav-link { 
                    border: none; 
                    font-weight: 900; 
                    text-transform: uppercase; 
                    font-size: 0.7rem; 
                    letter-spacing: 1px;
                    color: #94a3b8;
                    padding: 1rem 1.5rem;
                }
                .custom-tabs-sst .nav-link.active { 
                    background: transparent; 
                    color: #2c767c; 
                    border-bottom: 3px solid #2c767c; 
                }
                .custom-range::-webkit-slider-thumb {
                    background: #2c767c;
                    border: 4px solid #fff;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    width: 24px;
                    height: 24px;
                }

                .dep-list-header {
                    background: #f8f9fa;
                    border-bottom: 1px solid #e9ecef;
                    border-radius: 8px 8px 0 0;
                }

                /* Custom Button Styles */
                .btn-primary-custom {
                    background-color: #00afaa !important;
                    border: 1px solid #00afaa !important;
                    color: white !important;
                    padding: 0.75rem 1.5rem !important;
                    border-radius: 6px !important;
                    font-size: 0.875rem !important;
                    font-weight: 500 !important;
                    transition: all 0.2s ease !important;
                }
                .btn-primary-custom:hover {
                    background-color: #009691 !important;
                }
                .btn-secondary-custom {
                    background-color: #f3f4f6 !important;
                    border: 1px solid #d1d5db !important;
                    color: #4b5563 !important;
                    padding: 0.75rem 1.5rem !important;
                    border-radius: 6px !important;
                    font-size: 0.875rem !important;
                    font-weight: 500 !important;
                    transition: all 0.2s ease !important;
                }
                .btn-secondary-custom:hover {
                    background-color: #e5e7eb !important;
                }
                `}
            </style>
        </ThemeProvider>
    );
};

export default SSTConsultation;
