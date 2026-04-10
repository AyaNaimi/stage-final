import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Form, Table, ProgressBar } from 'react-bootstrap';
import {
    DollarSign,
    Plus,
    Download,
    TrendingUp,
    CreditCard,
    FileText,
    Building2,
    PieChart,
    Search,
    Clock,
    User,
    Stethoscope,
    Filter as FilterIcon
} from 'lucide-react';
import GenericSidePanel from '../GenericSidePanel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faClose, faFilter } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
// import PremiumFilters from '../Components/PremiumFilters';
import SSTCostForm from './SSTCostForm';
import ExpandRTable from '../Employe/ExpandRTable';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useHeader } from "../../Acceuil/HeaderContext";
import { useOpen } from "../../Acceuil/OpenProvider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { FaPlusCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import "../Style.css";

const SSTCosts = () => {
    const { setTitle, setOnPrint, setOnExportPDF, setOnExportExcel, searchQuery, clearActions } = useHeader();
    const { dynamicStyles, isMobile } = useOpen();

    const [sstCostsData, setSstCostsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

    const budgetData = [];

    const [filteredData, setFilteredData] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [filters, setFilters] = useState({
        department: '',
        status: ''
    });

    useEffect(() => {
        const fetchCosts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/api/sst-costs`);
                const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);

                const normalized = data.map(c => ({
                    id: c.id,
                    employee: c.employee_name || c.employee || 'Collaborateur',
                    department: c.department || 'Non spécifié',
                    type: c.type || 'Acte médical',
                    amount: parseFloat(c.amount || 0),
                    status: c.status || 'pending'
                }));

                setSstCostsData(normalized);
                setFilteredData(normalized);
            } catch (error) {
                console.error("Error fetching SST costs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCosts();
    }, [API_BASE_URL]);

    useEffect(() => {
        setTitle("Gestion des Coûts SST");
        return () => {
            clearActions();
        };
    }, [setTitle, clearActions]);

    useEffect(() => {
        let filtered = sstCostsData;

        if (searchQuery) {
            filtered = filtered.filter(item =>
                item.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.department.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filters.department) {
            filtered = filtered.filter(item => item.department === filters.department);
        }

        if (filters.status) {
            filtered = filtered.filter(item => item.status === filters.status);
        }

        setFilteredData(filtered);
    }, [searchQuery, sstCostsData, filters]);

    const handleSelectAllChange = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        if (checked) {
            setSelectedItems(filteredData.map(c => c.id));
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
            text: `Vous allez supprimer ${selectedItems.length} factures.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Supprimer"
        }).then((result) => {
            if (result.isConfirmed) {
                setSstCostsData(sstCostsData.filter(c => !selectedItems.includes(c.id)));
                setSelectedItems([]);
                setSelectAll(false);
                Swal.fire("Supprimé", "Les factures ont été supprimées.", "success");
            }
        });
    };

    const totalBudget = sstCostsData.reduce((sum, inv) => sum + inv.amount, 0);
    const paidInvoices = sstCostsData.filter(inv => inv.status === 'paid').length;
    const pendingAmount = sstCostsData.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);

    const columns = [
        {
            key: 'id',
            label: 'N° Facture',
            render: (item) => (
                <Badge bg="light" text="dark" className="border rounded-2 fw-black font-mono extra-small">{item.id}</Badge>
            )
        },
        {
            key: 'employee',
            label: 'Collaborateur',
            render: (item) => (
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
                        {item.employee.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="fw-black small">{item.employee}</span>
                </div>
            )
        },
        {
            key: 'department',
            label: 'Département',
            render: (item) => (
                <Badge bg="light" text="muted" className="border-0 uppercase extra-small tracking-tighter fw-black">{item.department}</Badge>
            )
        },
        { key: 'type', label: "Type d'acte", align: 'center' },
        {
            key: 'amount',
            label: 'Coût (€)',
            render: (item) => (
                <div className="text-end fw-black h5 mb-0 text-dark">{item.amount}€</div>
            )
        },
        {
            key: 'status',
            label: 'Statut',
            render: (item) => (
                <div className="text-center">
                    <Badge bg={item.status === 'paid' ? 'success' : 'warning'} className="rounded-pill uppercase px-3 py-2" style={{ fontSize: '0.65rem' }}>
                        {item.status === 'paid' ? 'RÉGLÉ' : 'À PAYER'}
                    </Badge>
                </div>
            )
        }
    ];

    return (
        <ThemeProvider theme={createTheme()}>
            <Box className="postionPage" sx={{ ...dynamicStyles }}>
                <Box component="main" sx={{ flexGrow: 1, p: isMobile ? 1 : 0, mt: isMobile ? 8 : 10 }}>
                    <div className={isMobile ? "d-block" : "d-flex"} style={{ position: 'relative', height: isMobile ? 'auto' : 'calc(100vh - 180px)', width: '100%', padding: isMobile ? '0 10px' : '0 20px' }}>
                        <div style={{ flex: 1, padding: isMobile ? '12px' : '2rem' }}>
                            <div className="mt-4">
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
                                                Détails Gestion des Coûts SST
                                            </span>
                                            <p className="section-description text-muted mb-0">
                                                Suivi du budget et des prestations santé
                                            </p>
                                        </div>
                                        <div className="d-flex gap-2">
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
                                                title="Filtres coûts"
                                            />
                                            <Button
                                                onClick={() => setShowForm(true)}
                                                className="btn-primary-custom d-flex align-items-center"
                                                style={{ height: '45px' }}
                                            >
                                                <FaPlusCircle size={20} className="me-2" />
                                                <span>Déclarer un Coût / Facture</span>
                                            </Button>
                                        </div>
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
                                                    key: 'department',
                                                    label: 'Département',
                                                    value: filters.department,
                                                    type: 'select',
                                                    options: Array.from(new Set(sstCostsData.map(d => d.department))).map(s => ({ label: s, value: s })),
                                                    placeholder: 'Tous les départements'
                                                },
                                                {
                                                    key: 'status',
                                                    label: 'Statut',
                                                    value: filters.status,
                                                    type: 'select',
                                                    options: [
                                                        { label: 'Réglé', value: 'paid' },
                                                        { label: 'À payer', value: 'pending' }
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

                                                    <select
                                                        value={filter.value}
                                                        onChange={(e) => setFilters(prev => ({ ...prev, [filter.key]: e.target.value }))}
                                                        className="filter-input"
                                                        style={{
                                                            minWidth: 80,
                                                            maxWidth: 150,
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
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Row className="mb-4 g-4 text-dark">
                                <Col md={3}>
                                    <Card className="border-0 shadow-sm rounded-4 p-4 h-100">
                                        <div className="d-flex justify-content-between mb-3 align-items-center">
                                            <p className="extra-small fw-black text-muted uppercase tracking-widest mb-0">Budget Consommé</p>
                                            <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary"><PieChart size={20} /></div>
                                        </div>
                                        <h3 className="fw-black mb-1">{totalBudget}€</h3>
                                        <p className="extra-small text-success fw-bold">Enveloppe à 65%</p>
                                    </Card>
                                </Col>
                                <Col md={3}>
                                    <Card className="border-0 shadow-sm rounded-4 p-4 h-100">
                                        <div className="d-flex justify-content-between mb-3 align-items-center">
                                            <p className="extra-small fw-black text-muted uppercase tracking-widest mb-0">Factures Prestataires</p>
                                            <div className="p-2 rounded-3 bg-info bg-opacity-10 text-info"><Building2 size={20} /></div>
                                        </div>
                                        <h3 className="fw-black mb-1">{paidInvoices}</h3>
                                        <p className="extra-small text-muted fw-bold">Dernière maj: Aujourd'hui</p>
                                    </Card>
                                </Col>
                                <Col md={3}>
                                    <Card className="border-0 shadow-sm rounded-4 p-4 h-100">
                                        <div className="d-flex justify-content-between mb-3 align-items-center">
                                            <p className="extra-small fw-black text-muted uppercase tracking-widest mb-0">Engagements</p>
                                            <div className="p-2 rounded-3 bg-warning bg-opacity-10 text-warning"><Clock size={20} /></div>
                                        </div>
                                        <h3 className="fw-black mb-1 text-warning">{pendingAmount}€</h3>
                                        <p className="extra-small text-muted fw-bold">Attente validation RH</p>
                                    </Card>
                                </Col>
                                <Col md={3}>
                                    <Card className="border-0 shadow-none rounded-4 p-4 bg-primary text-white shadow-lg h-100">
                                        <div className="d-flex justify-content-between mb-3 align-items-center">
                                            <p className="extra-small fw-black text-white-50 uppercase tracking-widest mb-0">Coût Moyen / Salarié</p>
                                            <div className="p-2 rounded-3 bg-white bg-opacity-20"><TrendingUp size={20} /></div>
                                        </div>
                                        <h3 className="fw-black mb-1 text-white">74€</h3>
                                        <p className="extra-small text-white-50 fw-bold">-4€ vs 2025</p>
                                    </Card>
                                </Col>
                            </Row>

                            <Card className="border-0 shadow-sm rounded-5 p-5 mb-4 text-dark">
                                <h6 className="fw-black uppercase small tracking-widest mb-4">Évolution du Budget Santé</h6>
                                <div style={{ width: '100%', height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={budgetData}>
                                            <defs>
                                                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2c767c" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#2c767c" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                                            <Tooltip />
                                            <Area
                                                type="monotone"
                                                dataKey="cost"
                                                stroke="#2c767c"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#costGradient)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <ExpandRTable
                                columns={columns}
                                data={sstCostsData}
                                filteredData={filteredData}
                                searchTerm={searchQuery}
                                highlightText={(text) => text}
                                selectedItems={selectedItems}
                                selectAll={selectAll}
                                handleSelectAllChange={handleSelectAllChange}
                                handleCheckboxChange={handleCheckboxChange}
                                handleEdit={() => { }}
                                handleDelete={() => { }}
                                handleDeleteSelected={handleDeleteSelected}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                handleChangePage={(p) => setPage(p)}
                                handleChangeRowsPerPage={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                                renderCustomActions={(item) => (
                                    <Button variant="link" className="text-muted p-0 group-hover-scale"><Download size={18} /></Button>
                                )}
                            />
                        </div>

                        <GenericSidePanel
                            isOpen={showForm}
                            onClose={() => setShowForm(false)}
                            title="Déclaration de Coût / Facture"
                            displayMode="inline"
                            showHeader={false}
                        >
                            <SSTCostForm
                                onSubmit={(data) => {
                                    console.log("Coût ajouté:", data);
                                    setShowForm(false);
                                    Swal.fire("Succès", "La facture a été enregistrée.", "success");
                                }}
                                onCancel={() => setShowForm(false)}
                            />
                        </GenericSidePanel>
                    </div>
                </Box>
            </Box>
            <style>
                {`
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.7rem; }
                .badge { font-weight: 700; letter-spacing: 0.05em; }

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
                
                /* Override DynamicForm button styles if needed */
                .btn-submit-dynamic {
                    background-color: #00afaa !important;
                    border: none !important;
                }
                `}
            </style>
        </ThemeProvider>
    );
};

export default SSTCosts;
