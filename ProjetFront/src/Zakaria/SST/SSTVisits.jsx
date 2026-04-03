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

    const [patientFilters, setPatientFilters] = useState({
        dept: '',
        status: '',
        urgent: 'all',
        decision: '' // New: Filter by aptitude result
    });

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

    const processedVisits = useMemo(() => {
        return visitsData.map(visit => {
            const employees = visit.employees || [];
            const total = employees.length;
            const completed = employees.filter(e => e.status === 'Complété' || e.status === 'Terminée').length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            let status = 'planifiée';
            if (progress === 100) status = 'terminée';
            else if (progress > 0) status = 'en_cours';

            return {
                ...visit,
                progress,
                status
            };
        });
    }, [visitsData]);

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
            filtered = filtered.filter(item =>
                (item.doctor?.toLowerCase().includes(query)) ||
                (item.department?.toLowerCase().includes(query)) ||
                (item.id?.toLowerCase().includes(query))
            );
        }

        if (visitFilters.startDate) {
            filtered = filtered.filter(v => v.date >= visitFilters.startDate);
        }
        if (visitFilters.endDate) {
            filtered = filtered.filter(v => v.date <= visitFilters.endDate);
        }
        if (visitFilters.doctor) {
            filtered = filtered.filter(v => v.doctor && v.doctor.toLowerCase().includes(visitFilters.doctor.toLowerCase()));
        }
        if (visitFilters.status) {
            filtered = filtered.filter(v => v.status === visitFilters.status);
        }

        setFilteredData(filtered);
    }, [searchQuery, processedVisits, visitFilters]);

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
        Swal.fire({
            title: 'Génération du rapport...',
            html: `Préparation du rapport pour le département <b>${visit.department}</b>`,
            timer: 1500,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading()
            }
        }).then(() => {
            Swal.fire("Téléchargé", `Le rapport ${visit.id}.pdf a été généré.`, "success");
        });
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
                            item.status === 'planifiée' ? '#0ea5e9' :
                                item.status === 'en_cours' ? '#f59e0b' :
                                    '#22c55e',
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

    const renderExpandedRow = (visit) => (
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
                            value={patientFilters.dept}
                            onChange={e => setPatientFilters({ ...patientFilters, dept: e.target.value })}
                        >
                            <option value="">Tous les services</option>
                            <option>Production</option>
                            <option>Logistique</option>
                            <option>RH</option>
                        </Form.Select>
                        <Form.Select
                            size="sm"
                            className="extra-small fw-bold border-0 bg-white shadow-sm"
                            style={{ width: '160px', borderRadius: '8px' }}
                            value={patientFilters.decision}
                            onChange={e => setPatientFilters({ ...patientFilters, decision: e.target.value })}
                        >
                            <option value="">Toutes décisions</option>
                            <option value="Apte">Apte</option>
                            <option value="Inapte">Inapte</option>
                            <option value="A revoir">À revoir</option>
                        </Form.Select>
                    </div>
                    <div className="sub-table-badge">
                        {(visit.employees || []).length} COLLABORATEURS
                    </div>
                </div>
            </div>

            <div className="main-sub-table">
                <Table className="mb-0">
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th className="border-0 extra-small fw-black text-muted text-uppercase">Collaborateur</th>
                            <th className="border-0 extra-small fw-black text-muted text-uppercase">Service</th>
                            <th className="border-0 extra-small fw-black text-muted text-uppercase">Résultat / Statut</th>
                            <th className="border-0 extra-small fw-black text-muted text-uppercase text-end px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            const filteredEmployees = (visit.employees || [])
                                .filter(emp => !patientFilters.dept || emp.department === patientFilters.dept)
                                .filter(emp => !patientFilters.decision || emp.status === patientFilters.decision);

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
                                            <span className="text-muted small fw-bold">{emp.department}</span>
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
