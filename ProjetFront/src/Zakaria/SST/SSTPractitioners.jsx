import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Badge, Form, Row, Col } from 'react-bootstrap';
import { User, Mail, Phone, Stethoscope, Briefcase, PlusCircle, UserPlus, FileText, Filter as FilterIcon, X, Settings } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faClose, faFilter } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { useHeader } from "../../Acceuil/HeaderContext";
import { useOpen } from "../../Acceuil/OpenProvider";
import ExpandRTable from "../Employe/ExpandRTable";
import GenericSidePanel from '../GenericSidePanel';
import SSTPractitionerForm from './SSTPractitionerForm';
import Swal from "sweetalert2";
import { FaPlusCircle } from "react-icons/fa";
import "../Style.css";
// import PremiumFilters from '../Components/PremiumFilters';

const SSTPractitioners = () => {
    const { setTitle, setOnPrint, setOnExportPDF, setOnExportExcel, searchQuery, clearActions } = useHeader();
    const { dynamicStyles, isMobile } = useOpen();

    const [practitioners, setPractitioners] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filteredData, setFilteredData] = useState(practitioners);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showForm, setShowForm] = useState(false);
    const [editingPractitioner, setEditingPractitioner] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [practitionerFilters, setPractitionerFilters] = useState({
        type: '',
        specialty: '',
        status: ''
    });

    const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

    const resolveFileUrl = (value) => {
        if (!value) return null;
        if (typeof value !== 'string') return URL.createObjectURL(value);
        if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('blob:') || value.startsWith('data:')) {
            return value;
        }

        const normalized = value.replace(/\\/g, '/').replace(/^\/+/, '');
        if (normalized.startsWith('storage/') || normalized.startsWith('api/')) {
            return `${API_BASE_URL}/${normalized}`;
        }
        return `${API_BASE_URL}/storage/${normalized}`;
    };

    // Dynamic configuration of form fields

    useEffect(() => {
        setTitle("Corps Médical & Praticiens");
        return () => {
            clearActions();
        };
    }, [setTitle, clearActions]);

    useEffect(() => {
        const loadPractitioners = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_BASE_URL}/api/sst-practitioners`, {
                    headers: { Accept: 'application/json' },
                });

                const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
                const normalized = data.map(p => ({
                    ...p,
                    firstName: p.firstName || p.first_name || p.prenom || '',
                    name: p.name || p.nom || '',
                    otherDocs: p.otherDocs || p.other_docs || [],
                }));
                setPractitioners(normalized);
                setFilteredData(normalized);
            } catch (err) {
                console.error('Load practitioners failed', err);
                Swal.fire('Erreur', "Impossible de charger les praticiens (API)", 'error');
            } finally {
                setLoading(false);
            }
        };

        loadPractitioners();
    }, []);

    useEffect(() => {
        let filtered = [...practitioners];

        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (practitionerFilters.type) {
            filtered = filtered.filter(p => p.type === practitionerFilters.type);
        }
        if (practitionerFilters.specialty) {
            filtered = filtered.filter(p => p.specialty === practitionerFilters.specialty);
        }
        if (practitionerFilters.status) {
            filtered = filtered.filter(p => p.status === practitionerFilters.status);
        }

        setFilteredData(filtered);
    }, [searchQuery, practitioners, practitionerFilters]);

    const handleSelectAllChange = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        if (checked) {
            setSelectedItems(filteredData.map(p => p.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleEdit = (practitioner) => {
        setEditingPractitioner(practitioner);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Supprimer ce praticien ?",
            text: "Cette action est irréversible.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Oui, supprimer",
            cancelButtonText: "Annuler"
        }).then((result) => {
            if (result.isConfirmed) {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
                const token = localStorage.getItem('API_TOKEN');

                axios.delete(`${API_BASE_URL}/api/sst-practitioners/${id}`, {
                    headers: {
                        Accept: 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    withCredentials: true,
                }).catch(err => console.error('Delete practitioner failed', err));

                setPractitioners(practitioners.filter(p => p.id !== id));
                Swal.fire("Supprimé !", "Le praticien a été supprimé en base.", "success");
            }
        });
    };

    const handleDeleteSelected = () => {
        Swal.fire({
            title: "Supprimer la sélection ?",
            text: `Vous allez supprimer ${selectedItems.length} praticiens.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Supprimer"
        }).then((result) => {
            if (result.isConfirmed) {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
                const token = localStorage.getItem('API_TOKEN');

                // Fire-and-forget API deletes; main goal is not leaving ghosts in DB
                selectedItems.forEach(id => {
                    axios.delete(`${API_BASE_URL}/api/sst-practitioners/${id}`, {
                        headers: {
                            Accept: 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        withCredentials: true,
                    }).catch(err => console.error('Bulk delete practitioner failed', err));
                });

                setPractitioners(practitioners.filter(p => !selectedItems.includes(p.id)));
                setSelectedItems([]);
                setSelectAll(false);
                Swal.fire("Supprimé", "Les praticiens ont été supprimés en base.", "success");
            }
        });
    };

    const handleSubmit = async (formData) => {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
        const token = localStorage.getItem('API_TOKEN');

        const fd = new FormData();
        fd.append('name', formData.name);
        fd.append('firstName', formData.firstName);
        fd.append('specialty', formData.specialty);
        fd.append('type', formData.type);
        if (formData.phone) fd.append('phone', formData.phone);
        if (formData.email) fd.append('email', formData.email);
        if (formData.photo && typeof formData.photo !== 'string') {
            fd.append('photo', formData.photo);
        }
        if (formData.diplome && typeof formData.diplome !== 'string') {
            fd.append('diplome', formData.diplome);
        }
        if (formData.otherDocs) {
            const docs = Array.isArray(formData.otherDocs) ? formData.otherDocs : [formData.otherDocs];
            docs.forEach(file => {
                if (file && typeof file !== 'string') {
                    fd.append('otherDocs[]', file);
                }
            });
        }

        try {
            setLoading(true);
            let res;
            if (editingPractitioner) {
                res = await axios.post(`${API_BASE_URL}/api/sst-practitioners/${editingPractitioner.id}`, fd, {
                    headers: {
                        Accept: 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    withCredentials: true,
                });
            } else {
                res = await axios.post(`${API_BASE_URL}/api/sst-practitioners`, fd, {
                    headers: {
                        Accept: 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    withCredentials: true,
                });
            }

            const saved = res.data;
            const normalized = {
                ...saved,
                firstName: saved.firstName || saved.first_name || saved.prenom || '',
                name: saved.name || saved.nom || '',
                otherDocs: saved.otherDocs || saved.other_docs || [],
            };

            if (editingPractitioner) {
                setPractitioners(prev => prev.map(p => p.id === editingPractitioner.id ? normalized : p));
            } else {
                setPractitioners(prev => [...prev, normalized]);
            }

            setShowForm(false);
            setEditingPractitioner(null);
            Swal.fire('Succès !', 'Praticien enregistré en base.', 'success');
        } catch (err) {
            console.error('Save practitioner failed', err);
            const serverErrors = err.response?.data?.errors;
            if (serverErrors) {
                const messages = Object.values(serverErrors).flat().join('\n');
                Swal.fire('Erreur de validation', messages, 'error');
            } else {
                Swal.fire('Erreur', err.response?.data?.message || "Échec d'enregistrement", 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleZoomImage = (imageUrl, title) => {
        Swal.fire({
            title: title,
            imageUrl: imageUrl,
            imageAlt: title,
            showCloseButton: true,
            showConfirmButton: false,
            imageWidth: 400,
            imageHeight: 400,
            imageClass: 'rounded-4 object-fit-cover shadow-sm',
            customClass: {
                container: 'zoom-swal-container',
                popup: 'rounded-4',
                closeButton: 'zoom-close-btn'
            },
            width: 'auto',
            padding: '2rem',
        });
    };

    const columns = [
        {
            key: 'practitioner',
            label: 'Praticien',
            render: (item) => {
                const imageUrl = resolveFileUrl(item.photo);
                const fullName = `Dr. ${item.firstName} ${item.name}`;
                return (
                    <div className="d-flex align-items-center gap-3">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={fullName}
                                className="rounded-circle object-fit-cover practitioner-photo-zoom"
                                style={{ width: '38px', height: '38px', cursor: 'pointer' }}
                                onClick={() => handleZoomImage(imageUrl, fullName)}
                            />
                        ) : (
                            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '38px', height: '38px', backgroundColor: '#e6f4f4', color: '#2c767c' }}>
                                {item.firstName[0]}{item.name[0]}
                            </div>
                        )}
                        <div>
                            <div className="fw-bold mb-0" style={{ fontSize: '0.9rem' }}>{fullName}</div>
                            <div className="text-muted extra-small">{item.email}</div>
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'type',
            label: 'Type',
            render: (item) => (
                <Badge bg={item.type === 'Employé' ? 'info' : 'warning'} className="rounded-pill px-3 py-2 text-uppercase extra-small">
                    {item.type}
                </Badge>
            )
        },
        { key: 'specialty', label: 'Spécialité' },
        { key: 'phone', label: 'Contact' },
        {
            key: 'documents',
            label: 'Documents',
            render: (item) => {
                const otherDocs = Array.isArray(item.otherDocs) ? item.otherDocs : (item.otherDocs ? [item.otherDocs] : []);
                return (
                    <div className="d-flex flex-wrap gap-2">
                        {item.diplome && (
                            <Button
                                variant="outline-info"
                                size="sm"
                                className="px-2 py-1 d-flex align-items-center gap-1"
                                title="Voir le diplôme"
                                onClick={() => {
                                    const url = resolveFileUrl(item.diplome);
                                    if (url) window.open(url, '_blank');
                                }}
                            >
                                <FileText size={14} /> <span className="extra-small fw-bold">DIPLÔME</span>
                            </Button>
                        )}
                        {otherDocs.map((doc, index) => (
                            <Button
                                key={index}
                                variant="outline-secondary"
                                size="sm"
                                className="px-2 py-1 d-flex align-items-center gap-1"
                                title={`Document ${index + 1}`}
                                onClick={() => {
                                    const url = resolveFileUrl(doc);
                                    if (url) window.open(url, '_blank');
                                }}
                            >
                                <Briefcase size={14} /> <span className="extra-small fw-bold">DOC {index + 1}</span>
                            </Button>
                        ))}
                        {!item.diplome && otherDocs.length === 0 && <span className="text-muted extra-small">Aucun document</span>}
                    </div>
                );
            }
        },
        {
            key: 'status',
            label: 'Statut',
            render: (item) => (
                <Badge bg={item.status === 'Actif' ? 'success' : 'secondary'} className="rounded-pill px-3 py-2 text-uppercase extra-small">
                    {item.status}
                </Badge>
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
                                                Détails Corps Médical
                                            </span>
                                            <p className="section-description text-muted mb-0">
                                                {practitioners.length} praticien{practitioners.length > 1 ? 's' : ''} actuellement référencé{practitioners.length > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <div className="d-flex align-items-center">
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
                                                title="Filtres praticiens"
                                            />
                                            <Button
                                                onClick={() => { setEditingPractitioner(null); setShowForm(true); }}
                                                className="btn-primary-custom d-flex align-items-center"
                                                style={{ height: '45px' }}
                                            >
                                                <FaPlusCircle size={20} className="me-2" />
                                                <span>Ajouter un praticien</span>
                                            </Button>
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
                                                        key: 'type',
                                                        label: 'Type',
                                                        value: practitionerFilters.type,
                                                        type: 'select',
                                                        options: [
                                                            { label: 'Employé', value: 'Employé' },
                                                            { label: 'Externe', value: 'Externe' }
                                                        ],
                                                        placeholder: 'Tous les types'
                                                    },
                                                    {
                                                        key: 'specialty',
                                                        label: 'Spécialité',
                                                        value: practitionerFilters.specialty,
                                                        type: 'select',
                                                        options: [
                                                            { label: 'Généraliste', value: 'Généraliste' },
                                                            { label: 'Travail', value: 'Travail' },
                                                            { label: 'Cardiologue', value: 'Cardiologue' }
                                                        ],
                                                        placeholder: 'Toutes les spécialités'
                                                    },
                                                    {
                                                        key: 'status',
                                                        label: 'Statut',
                                                        value: practitionerFilters.status,
                                                        type: 'select',
                                                        options: [
                                                            { label: 'Actif', value: 'Actif' },
                                                            { label: 'Inactif', value: 'Inactif' },
                                                            { label: 'En attente', value: 'En attente' }
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
                                                            onChange={(e) => setPractitionerFilters(prev => ({ ...prev, [filter.key]: e.target.value }))}
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
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <ExpandRTable
                                columns={columns}
                                data={practitioners}
                                filteredData={filteredData}
                                searchTerm={searchQuery}
                                highlightText={(text) => text}
                                selectedItems={selectedItems}
                                selectAll={selectAll}
                                handleSelectAllChange={handleSelectAllChange}
                                handleCheckboxChange={handleCheckboxChange}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                handleDeleteSelected={handleDeleteSelected}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                handleChangePage={(p) => setPage(p)}
                                handleChangeRowsPerPage={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                            />
                        </div>

                        <GenericSidePanel
                            isOpen={showForm}
                            onClose={() => setShowForm(false)}
                            title={editingPractitioner ? "Modifier Praticien" : "Nouveau Praticien"}
                            displayMode="inline"
                            showHeader={false}
                        >
                            <SSTPractitionerForm
                                initialData={editingPractitioner}
                                onSubmit={handleSubmit}
                                onCancel={() => setShowForm(false)}
                                resolveFileUrl={resolveFileUrl}
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

                .practitioner-photo-zoom {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .practitioner-photo-zoom:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .zoom-close-btn {
                    color: #ff4757 !important;
                    background: #fff !important;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
                    border-radius: 50% !important;
                    transition: all 0.2s ease !important;
                }

                .zoom-close-btn:hover {
                    background: #ff4757 !important;
                    color: #fff !important;
                }
                `}
            </style>
        </ThemeProvider>
    );
};

export default SSTPractitioners;
