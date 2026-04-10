import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { Button, Card, Tab, Tabs, Table, Modal, Form, Row, Col, Badge, Dropdown } from 'react-bootstrap';
import { faEdit, faTrash, faFilePdf, faFileExcel, faPrint, faSliders, faChevronDown, faChevronUp, faSearch, faCalendarAlt, faClipboardCheck, faIdCard, faFilter, faClose, faGear, faCalendarWeek } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Trash2, Edit2, Plus, Check, X, Eye, FileText, ChevronRight, Activity, Heart, Scale, Stethoscope, AlertCircle, Download, User, Settings, Filter as FilterIcon } from 'lucide-react';
import { FaPlus, FaPlusCircle } from "react-icons/fa";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import { TextField } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from "sweetalert2";
import "../Style.css";
import ExpandRTable from "../Employe/ExpandRTable";
import { motion, AnimatePresence } from 'framer-motion';
import GenericSidePanel from '../GenericSidePanel';
import SSTVisitForm from './SSTVisitForm';
import { useOpen } from "../../Acceuil/OpenProvider";
import { useHeader } from "../../Acceuil/HeaderContext";
// import PremiumFilters from '../Components/PremiumFilters';

const SSTMedicalRecords = React.forwardRef(({
    visitId,
    visitName,
    onClose
}, ref) => {
    const { setTitle, setOnPrint, setOnExportPDF, setOnExportExcel, searchQuery, clearActions } = useHeader();
    const { dynamicStyles, isMobile } = useOpen();

    const [medicalRecords, setMedicalRecords] = useState([]);

    const [selectedRecord, setSelectedRecord] = useState(null);
    const [filteredData, setFilteredData] = useState(medicalRecords);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showForm, setShowForm] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [localFiltersVisible, setLocalFiltersVisible] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});
    const [expandedHistoryItems, setExpandedHistoryItems] = useState([]);
    const [showActions, setShowActions] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const filtersVisible = localFiltersVisible;

    // Initial column visibility
    const getInitialColumnVisibility = () => {
        const storedVisibility = localStorage.getItem('medicalRecordsColumnVisibility');
        return storedVisibility ? JSON.parse(storedVisibility) : {
            name: true,
            dept: true,
            lastVisit: true,
            status: true,
        };
    };

    const [columnVisibility, setColumnVisibility] = useState(getInitialColumnVisibility());
    const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

    const resolveFileUrl = (value) => {
        if (!value) return null;
        if (typeof value !== 'string') return value;
        if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('blob:') || value.startsWith('data:')) {
            return value;
        }
        const normalized = value.replace(/\\/g, '/').replace(/^\/+/, '');
        if (normalized.startsWith('storage/') || normalized.startsWith('api/')) {
            return `${API_BASE_URL}/${normalized}`;
        }
        return `${API_BASE_URL}/storage/${normalized}`;
    };

    const normalizeRecord = useCallback((record) => {
        const history = Array.isArray(record?.history) ? record.history : [];
        const fallbackHistory = record?.latest_visit ? [record.latest_visit] : [];
        const safeHistory = history.length > 0 ? history : fallbackHistory;

        return {
            ...record,
            id: String(record?.id ?? record?.matricule ?? record?.employe_id ?? ''),
            name: record?.name || 'Employé',
            dept: record?.dept || 'Non affecté',
            status: record?.status || 'En attente',
            lastVisit: record?.lastVisit || record?.latest_visit?.date || '-',
            history: safeHistory,
            vitals: {
                bmi: record?.vitals?.bmi ?? '-',
                bp: record?.vitals?.bp ?? '-',
                weight: record?.vitals?.weight ?? '-',
                height: record?.vitals?.height ?? '-',
                pulse: record?.vitals?.pulse ?? '-',
                temperature: record?.vitals?.temperature ?? '-',
                spo2: record?.vitals?.spo2 ?? '-',
                glycemia: record?.vitals?.glycemia ?? '-',
            },
        };
    }, []);

    useEffect(() => {
        setTitle("Dossiers Médicaux SST");
        const fetchRecords = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/dossiers-medicaux`);
                const records = Array.isArray(res.data) ? res.data : [];

                const enriched = await Promise.all(records.map(async (record) => {
                    const currentHistory = Array.isArray(record?.history) ? record.history : [];
                    if (currentHistory.length > 0 || record?.latest_visit) {
                        return normalizeRecord(record);
                    }

                    const identifier = record?.employe_id || record?.matricule || record?.id;
                    if (!identifier) {
                        return normalizeRecord(record);
                    }

                    try {
                        const detailsRes = await axios.get(`${API_BASE_URL}/api/employes/${identifier}/dossier-medical`);
                        return normalizeRecord(detailsRes.data || record);
                    } catch {
                        return normalizeRecord(record);
                    }
                }));

                setMedicalRecords(enriched);
            } catch (err) {
                console.error('Error fetching medical records:', err);
            }
        };
        fetchRecords();
        return () => {
            clearActions();
        };
    }, [setTitle, clearActions, API_BASE_URL, normalizeRecord]);

    const [mainFilters, setMainFilters] = useState({
        dept: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        let filtered = [...medicalRecords];

        // Filter by visit session if visitId is provided
        if (visitId) {
            filtered = filtered.filter(record =>
                (record.history || []).some(h => String(h.visite_id) === String(visitId) || String(h.id) === String(visitId))
            );
        }

        if (searchQuery) {
            filtered = filtered.filter(emp =>
                emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.dept.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (mainFilters.dept) {
            filtered = filtered.filter(emp => emp.dept === mainFilters.dept);
        }

        if (mainFilters.status) {
            filtered = filtered.filter(emp => emp.status === mainFilters.status);
        }

        if (mainFilters.startDate) {
            filtered = filtered.filter(emp => emp.lastVisit >= mainFilters.startDate);
        }

        if (mainFilters.endDate) {
            filtered = filtered.filter(emp => emp.lastVisit <= mainFilters.endDate);
        }

        setFilteredData(filtered);
    }, [searchQuery, medicalRecords, mainFilters, visitId]);

    const departmentOptions = useMemo(() => {
        return Array.from(new Set(medicalRecords.map(record => record.dept).filter(Boolean)))
            .map((dept) => ({ label: dept, value: dept }));
    }, [medicalRecords]);

    const handleSelectAllChange = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        if (checked) {
            setSelectedItems(filteredData.map(r => r.id));
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
        if (selectedItems.length === 0) return;
        Swal.fire({
            title: "Supprimer la sélection ?",
            text: `Vous allez supprimer ${selectedItems.length} dossiers.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Supprimer"
        }).then((result) => {
            if (result.isConfirmed) {
                setMedicalRecords(medicalRecords.filter(r => !selectedItems.includes(r.id)));
                setSelectedItems([]);
                setSelectAll(false);
                Swal.fire("Supprimé", "Les dossiers ont été supprimés.", "success");
            }
        });
    };

    const handleDeleteRecord = (id) => {
        Swal.fire({
            title: "Supprimer ce dossier ?",
            text: "Cette action est irréversible.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Supprimer"
        }).then((result) => {
            if (result.isConfirmed) {
                setMedicalRecords(prev => prev.filter(r => r.id !== id));
                Swal.fire("Supprimé", "Le dossier a été supprimé.", "success");
            }
        });
    };

    const toggleRowExpansion = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const toggleHistoryItem = (index) => {
        setExpandedHistoryItems(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    // Exports
    const exportToPDF = useCallback(() => {
        const doc = new jsPDF();
        const tableColumn = ["ID", "Collaborateur", "Département", "Dernière Visite", "Statut"];
        const tableRows = filteredData.map(r => [r.id, r.name, r.dept, r.lastVisit, r.status]);
        doc.autoTable({ head: [tableColumn], body: tableRows });
        doc.save("dossiers_medicaux.pdf");
    }, [filteredData]);

    const exportToExcel = useCallback(() => {
        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Dossiers");
        XLSX.writeFile(wb, "dossiers_medicaux.xlsx");
    }, [filteredData]);

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    // Expose methods via ref
    React.useImperativeHandle(ref, () => ({
        exportToPDF,
        exportToExcel,
        handlePrint
    }));

    // Set header actions
    useEffect(() => {
        setOnPrint(() => handlePrint);
        setOnExportPDF(() => exportToPDF);
        setOnExportExcel(() => exportToExcel);
    }, [setOnPrint, setOnExportPDF, setOnExportExcel, handlePrint, exportToPDF, exportToExcel]);

    const columns = [
        {
            key: 'name',
            label: 'Collaborateur',
            render: (item) => (
                <div className="d-flex align-items-center gap-3">
                    {item.photo ? (
                        <img
                            src={resolveFileUrl(item.photo)}
                            alt=""
                            className="rounded-circle object-fit-cover shadow-sm border"
                            style={{ width: '38px', height: '38px' }}
                        />
                    ) : (
                        <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '38px', height: '38px', fontSize: '12px' }}>
                            {item.name.split(' ').map(n => n[0]).join('')}
                        </div>
                    )}
                    <div>
                        <div className="fw-bold small">{item.name}</div>
                        <div className="extra-small text-muted font-monospace">{item.id}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'dept',
            label: 'Département',
            render: (item) => (
                <Badge bg="light" text="secondary" className="border-0 uppercase extra-small tracking-tighter fw-black">{item.dept}</Badge>
            )
        },
        {
            key: 'lastVisit',
            label: 'Dernière Visite',
            render: (item) => <span className="small text-muted">{item.lastVisit}</span>
        },
        {
            key: 'status',
            label: 'Aptitude',
            render: (item) => (
                <Badge bg={item.status === 'Apte' ? 'success' : 'warning'} className="rounded-pill px-3 py-2 uppercase extra-small">
                    {item.status}
                </Badge>
            )
        }
    ];

    const renderExpandedRow = (record) => (
        <div className="expanded-row-container">
            <div className="sub-table-header">
                <div className="sub-table-title">
                    <FontAwesomeIcon icon={faCalendarWeek} className="text-primary me-2" />
                    <span>Historique des Examens - {record.name}</span>
                </div>
                <div className="sub-table-badge">
                    {(record.history || []).length} Visites enregistrées
                </div>
            </div>

            <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <Table className="main-sub-table">
                    <thead>
                        <tr>
                            <th className="backe">Date</th>
                            <th className="backe">Type de Visite</th>
                            <th className="backe">Médecin</th>
                            <th className="backe">Observation</th>
                            <th className="backe text-end px-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(record.history || []).map((h, idx) => (
                            <tr key={idx}>
                                <td className="fw-bold">{h.date}</td>
                                <td>{h.type}</td>
                                <td>
                                    <Badge bg="info" className="bg-opacity-10 text-info border-0 extra-small">
                                        {h.doctor}
                                    </Badge>
                                </td>
                                <td style={{ maxWidth: '300px' }} className="text-truncate">
                                    <span className="small text-muted fst-italic">{h.note}</span>
                                </td>
                                <td className="text-end px-4">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="rounded-3 extra-small fw-bold px-3 py-1"
                                        onClick={() => setSelectedRecord(record)}
                                    >
                                        Détails
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );

    const iconButtonStyle = {
        backgroundColor: "#f9fafb",
        border: "1px solid #ccc",
        borderRadius: "5px",
        padding: "13px 16px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    /* Removed isAddingVisit useEffect */

    return (
        <div
            style={{
                flex: 1,
                display: isMobile ? 'block' : 'flex',
                height: isMobile ? 'auto' : 'calc(100vh - 165px)',
                overflow: 'hidden'
            }}
        >
            <div
                style={{
                    flex: 1,
                    padding: isMobile ? '15px' : '25px 35px',
                    overflowY: isMobile ? 'visible' : 'auto',
                    overflowX: 'hidden',
                    minWidth: 0
                }}
                className="scrollbar-teal"
            >
                <div className="mt-2">
                    <div className="section-header mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <span className="section-title mb-1">
                                    <span style={{
                                        display: 'inline-block',
                                        width: '12px',
                                        height: '12px',
                                        backgroundColor: '#3a8a90',
                                        borderRadius: '50%',
                                        marginRight: '12px'
                                    }}></span>
                                    Détails Dossiers Médicaux {visitName ? `- ${visitName}` : ''}
                                </span>
                                <p className="section-description text-muted mb-0">
                                    {filteredData.length} dossier{filteredData.length > 1 ? 's' : ''} actuellement enregistré{filteredData.length > 1 ? 's' : ''}
                                    {visitName && ` pour ${visitName}`}
                                </p>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                {selectedItems.length > 0 && (
                                    <Button variant="danger" size="sm" onClick={handleDeleteSelected}>
                                        <Trash2 size={16} className="me-2" />
                                        Supprimer ({selectedItems.length})
                                    </Button>
                                )}



                                <FontAwesomeIcon
                                    onClick={() => setLocalFiltersVisible(!localFiltersVisible)}
                                    icon={filtersVisible ? faClose : faFilter}
                                    color={filtersVisible ? 'green' : ''}
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
                                            value: mainFilters.startDate,
                                            type: 'date'
                                        },
                                        {
                                            key: 'endDate',
                                            label: 'Au',
                                            value: mainFilters.endDate,
                                            type: 'date'
                                        },
                                        {
                                            key: 'dept',
                                            label: 'Département',
                                            value: mainFilters.dept,
                                            type: 'select',
                                            options: departmentOptions,
                                            placeholder: 'Tous les départements'
                                        },
                                        {
                                            key: 'status',
                                            label: 'Aptitude',
                                            value: mainFilters.status,
                                            type: 'select',
                                            options: [
                                                { label: 'Apte', value: 'Apte' },
                                                { label: 'Apte avec réserves', value: 'Apte avec réserves' }
                                            ],
                                            placeholder: 'Toutes les aptitudes'
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
                                                    onChange={(e) => setMainFilters(prev => ({ ...prev, [filter.key]: e.target.value }))}
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
                                                    onChange={(e) => setMainFilters(prev => ({ ...prev, [filter.key]: e.target.value }))}
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

                    <ExpandRTable
                        columns={columns}
                        data={medicalRecords}
                        filteredData={filteredData}
                        searchTerm={searchQuery}
                        highlightText={(t) => t}
                        selectedItems={selectedItems}
                        selectAll={selectAll}
                        handleSelectAllChange={handleSelectAllChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleDelete={handleDeleteRecord}
                        rowsPerPage={rowsPerPage}
                        page={currentPage}
                        handleChangePage={(p) => setCurrentPage(p)}
                        handleChangeRowsPerPage={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                        expandedRows={expandedRows}
                        toggleRowExpansion={toggleRowExpansion}
                        renderExpandedRow={renderExpandedRow}
                        renderCustomActions={(item) => (
                            <Button variant="link" className="text-muted p-0" onClick={() => setSelectedRecord(item)}>
                                <Eye size={18} />
                            </Button>
                        )}
                    />
                </div>
            </div>

            {selectedRecord && (
                <GenericSidePanel
                    isOpen={!!selectedRecord}
                    onClose={() => setSelectedRecord(null)}
                    title={`Dossier : ${selectedRecord.name}`}
                    defaultWidth={45}
                    displayMode="inline"
                >
                    <div className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100%' }}>
                        {/* Header Profile Card */}
                        <div className="d-flex align-items-center gap-4 mb-4 bg-white p-4 rounded-4 shadow-sm border-0" style={{ outline: '1px solid #e2e8f0' }}>
                            <div className="position-relative">
                                <div className="bg-light p-1 rounded-circle overflow-hidden d-flex justify-content-center align-items-center" style={{ width: '70px', height: '70px', border: '2px solid #fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                    {selectedRecord.photo ? (
                                        <img src={resolveFileUrl(selectedRecord.photo)} alt="" className="w-100 h-100 object-fit-cover rounded-circle" />
                                    ) : (
                                        <User size={32} className="text-secondary" />
                                    )}
                                </div>
                                <div className="position-absolute bottom-0 end-0 rounded-circle" style={{ width: '16px', height: '16px', backgroundColor: selectedRecord.status === 'Apte' ? '#10b981' : '#f59e0b', border: '3px solid #fff' }}></div>
                            </div>
                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                    <h5 className="fw-black text-dark mb-0 letter-spacing-tight">{selectedRecord.name}</h5>
                                    <Badge bg="light" text="secondary" className="border px-2 py-1 uppercase extra-small tracking-wider rounded-3">
                                        ID: {selectedRecord.id}
                                    </Badge>
                                </div>
                                <div className="d-flex align-items-center gap-2 mt-2">
                                    <Badge bg={selectedRecord.status === 'Apte' ? 'success' : 'warning'} className="bg-opacity-10 text-dark border-0 px-3 py-1 rounded-pill uppercase extra-small">
                                        <span className={`fw-bold ${selectedRecord.status === 'Apte' ? 'text-success' : 'text-warning'}`}>{selectedRecord.status}</span>
                                    </Badge>
                                    <span className="small text-muted fw-medium">•</span>
                                    <span className="small text-muted fw-medium">{selectedRecord.dept}</span>
                                </div>
                            </div>
                        </div>

                        <Tabs defaultActiveKey="synthesis" className="custom-tabs-sst mb-4">
                            <Tab eventKey="synthesis" title="Synthèse Clinique" className="pt-4">
                                {/* Vitals Grid */}
                                <div className="mb-4">
                                    <h6 className="fw-black uppercase text-muted mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                        <Activity size={14} /> Constantes Vitales
                                    </h6>
                                    <Row className="g-3">
                                        <Col xs={6} md={3}>
                                            <div className="p-3 bg-white rounded-4 border-0 shadow-sm text-center h-100 transition-all hover-lift">
                                                <div className="d-flex justify-content-center mb-2">
                                                    <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-circle">
                                                        <Scale size={16} />
                                                    </div>
                                                </div>
                                                <div className="extra-small text-muted fw-bold mb-1">IMC</div>
                                                <div className="fw-black text-dark fs-5">{selectedRecord.vitals.bmi || '-'}</div>
                                            </div>
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <div className="p-3 bg-white rounded-4 border-0 shadow-sm text-center h-100 transition-all hover-lift">
                                                <div className="d-flex justify-content-center mb-2">
                                                    <div className="p-2 bg-info bg-opacity-10 text-info rounded-circle">
                                                        <User size={16} />
                                                    </div>
                                                </div>
                                                <div className="extra-small text-muted fw-bold mb-1">Poids</div>
                                                <div className="fw-black text-dark fs-5">{selectedRecord.vitals.weight || '-'} <span className="extra-small text-muted fw-normal">kg</span></div>
                                            </div>
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <div className="p-3 bg-white rounded-4 border-0 shadow-sm text-center h-100 transition-all hover-lift">
                                                <div className="d-flex justify-content-center mb-2">
                                                    <div className="p-2 bg-secondary bg-opacity-10 text-secondary rounded-circle">
                                                        <Scale size={16} />
                                                    </div>
                                                </div>
                                                <div className="extra-small text-muted fw-bold mb-1">Taille</div>
                                                <div className="fw-black text-dark fs-5">{selectedRecord.vitals.height || '-'} <span className="extra-small text-muted fw-normal">cm</span></div>
                                            </div>
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <div className="p-3 bg-white rounded-4 border-0 shadow-sm text-center h-100 transition-all hover-lift">
                                                <div className="d-flex justify-content-center mb-2">
                                                    <div className="p-2 bg-danger bg-opacity-10 text-danger rounded-circle">
                                                        <Heart size={16} />
                                                    </div>
                                                </div>
                                                <div className="extra-small text-muted fw-bold mb-1">Tension</div>
                                                <div className="fw-black text-dark fs-5">{selectedRecord.vitals.bp || '-'}</div>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className="g-3 mt-1">
                                        <Col xs={6} md={4}>
                                            <div className="p-3 bg-white rounded-4 border-0 shadow-sm d-flex align-items-center gap-3 transition-all hover-lift">
                                                <div className="p-2 bg-danger bg-opacity-10 text-danger rounded-3"><Heart size={18} /></div>
                                                <div>
                                                    <div className="extra-small text-muted fw-bold">Pouls</div>
                                                    <div className="fw-black text-dark">{selectedRecord.vitals.pulse || '-'} <span className="extra-small text-muted fw-normal">bpm</span></div>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={6} md={4}>
                                            <div className="p-3 bg-white rounded-4 border-0 shadow-sm d-flex align-items-center gap-3 transition-all hover-lift">
                                                <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3"><Activity size={18} /></div>
                                                <div>
                                                    <div className="extra-small text-muted fw-bold">SpO2</div>
                                                    <div className="fw-black text-dark">{selectedRecord.vitals.spo2 || '-'} <span className="extra-small text-muted fw-normal">%</span></div>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={6} md={4}>
                                            <div className="p-3 bg-white rounded-4 border-0 shadow-sm d-flex align-items-center gap-3 transition-all hover-lift">
                                                <div className="p-2 bg-warning bg-opacity-10 text-warning rounded-3"><AlertCircle size={18} /></div>
                                                <div>
                                                    <div className="extra-small text-muted fw-bold">Temp.</div>
                                                    <div className="fw-black text-dark">{selectedRecord.vitals.temperature || '-'} <span className="extra-small text-muted fw-normal">°C</span></div>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </Tab>
                            <Tab eventKey="history" title="Historique" className="pt-4">
                                <h6 className="fw-black uppercase text-muted mb-4 d-flex align-items-center gap-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                    <Stethoscope size={14} /> Parcours Médical
                                </h6>
                                <div className="position-relative ms-2">
                                    <div className="position-absolute top-0 bottom-0 start-0 border-start border-2 border-light ms-2" style={{ transform: 'translateX(-50%)' }}></div>
                                    {selectedRecord.history.map((h, idx) => (
                                        <div key={idx} className="position-relative mb-4 ps-4">
                                            <div className="position-absolute start-0 top-0 bg-white border border-primary rounded-circle z-1" style={{ width: '12px', height: '12px', transform: 'translateX(-50%) translateY(6px)' }}></div>
                                            
                                            <div 
                                                className="bg-white p-3 rounded-4 shadow-sm border-0 transition-all hover-lift" 
                                                style={{ cursor: 'pointer', border: '1px solid #f1f5f9' }}
                                                onClick={() => toggleHistoryItem(idx)}
                                            >
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div className="d-flex align-items-center gap-2 mb-1">
                                                            <div className="fw-bold text-dark small">{h.date}</div>
                                                            <Badge bg="light" text="primary" className="extra-small border-0 px-2 fw-medium">{h.type}</Badge>
                                                        </div>
                                                        <div className="extra-small text-muted d-flex align-items-center gap-1">
                                                            <User size={12}/> {h.doctor || 'Médecin traitant'}
                                                        </div>
                                                    </div>
                                                    <div className="p-1 rounded-circle bg-light transition-all text-muted" style={{ transform: expandedHistoryItems.includes(idx) ? 'rotate(90deg)' : 'none' }}>
                                                        <ChevronRight size={16} />
                                                    </div>
                                                </div>
                                                
                                                <AnimatePresence>
                                                    {expandedHistoryItems.includes(idx) && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, height: 0 }} 
                                                            animate={{ opacity: 1, height: 'auto' }} 
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden mt-3 pt-3 border-top border-light"
                                                        >
                                                            <div className="d-flex flex-column gap-2">
                                                                {h.diagnosis && (
                                                                    <div>
                                                                        <div className="extra-small fw-black text-muted uppercase mb-1">Diagnostic</div>
                                                                        <div className="small text-dark p-2 bg-light rounded-3">{h.diagnosis}</div>
                                                                    </div>
                                                                )}
                                                                {h.note && (
                                                                    <div>
                                                                        <div className="extra-small fw-black text-muted uppercase mb-1">Observation</div>
                                                                        <div className="small text-dark p-2 bg-light rounded-3 fst-italic text-muted">{h.note}</div>
                                                                    </div>
                                                                )}
                                                                {!h.diagnosis && !h.note && (
                                                                    <div className="extra-small text-muted fst-italic">Aucune note détaillée</div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedRecord.history || selectedRecord.history.length === 0) && (
                                        <div className="ps-4 text-center py-4">
                                            <p className="extra-small text-muted fw-bold">AUCUN HISTORIQUE DISPONIBLE</p>
                                        </div>
                                    )}
                                </div>
                            </Tab>
                            <Tab eventKey="documents" title="Documents" className="pt-4">
                                <h6 className="fw-black uppercase text-muted mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                    <FileText size={14} /> Fichiers Rattachés
                                </h6>
                                {(!selectedRecord.documents || selectedRecord.documents.length === 0) ? (
                                    <div className="text-center p-5 bg-white rounded-4 border-0 shadow-sm mt-3 d-flex flex-column align-items-center justify-content-center">
                                        <div className="p-3 bg-light rounded-circle mb-3">
                                            <FileText size={32} className="text-muted opacity-50" />
                                        </div>
                                        <p className="text-muted small fw-bold mb-0">Aucun document numérisé</p>
                                        <p className="extra-small text-muted mt-1">Les documents associés au collaborateur s'afficheront ici.</p>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-2 mt-2">
                                        {selectedRecord.documents.map((doc, idx) => (
                                            <div key={idx} className="p-3 bg-white rounded-4 shadow-sm d-flex align-items-center justify-content-between transition-all hover-lift" style={{ border: '1px solid #f8fafc' }}>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="p-2 bg-primary bg-opacity-10 rounded-3 text-primary">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold small text-dark">{doc.nom}</div>
                                                        <div className="extra-small text-muted">{doc.type || 'Document'} • {doc.date_document || '-'}</div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="rounded-circle p-2 text-primary bg-primary bg-opacity-10 border-0 hover-bg-primary hover-text-white transition-all"
                                                    onClick={() => window.open(resolveFileUrl(doc.chemin_fichier), '_blank')}
                                                >
                                                    <Download size={16} />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Tab>
                        </Tabs>
                    </div>
                </GenericSidePanel>
            )}

            <GenericSidePanel
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title="Nouvelle Visite"
                displayMode="inline"
                showHeader={false}
            >
                <SSTVisitForm
                    onSubmit={(data) => {
                        console.log("Visit created:", data);
                        Swal.fire({
                            title: 'Succès !',
                            text: 'La visite a été programmée pour le ' + data.date + ' à ' + data.time,
                            icon: 'success',
                            confirmButtonColor: '#3a8a90'
                        });
                        setShowForm(false);
                    }}
                    onCancel={() => {
                        setShowForm(false);
                    }}
                />
            </GenericSidePanel>
            <style>
                {`
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.7rem; }
                .custom-tabs-sst .nav-link { font-weight: 900; font-size: 0.7rem; color: #94a3b8; }
                .custom-tabs-sst .nav-link.active { color: #2c767c; border-bottom: 3px solid #2c767c; }
                .section-header { margin: 1%; }
                .section-title { font-size: 19px; font-weight: 600; }
                .btn-primary-custom { background-color: #00afaa; color: white; border-radius: 6px; }
                .main-sub-table th { background-color: #f5f5f5; font-size: 13px; }
                .backe { background-color: #f8f9fa !important; }
                .scrollbar-teal::-webkit-scrollbar { width: 5px; }
                .scrollbar-teal::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .scrollbar-teal::-webkit-scrollbar-thumb { background: #3a8a90; border-radius: 10px; }

                            .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important; }
                `}
                </style>
        </div >
    );
});

export default SSTMedicalRecords;
