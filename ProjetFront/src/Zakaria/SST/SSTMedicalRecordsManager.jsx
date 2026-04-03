import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "../Employe/DepartementManager.css";
import { MdOutlinePostAdd } from "react-icons/md";
import "bootstrap/dist/css/bootstrap.min.css";
import SSTMedicalRecords from "./SSTMedicalRecords";
import { IoFolderOpenOutline } from "react-icons/io5";
import { FaMinus } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import Swal from 'sweetalert2';
import { useHeader } from "../../Acceuil/HeaderContext";
import { useOpen } from "../../Acceuil/OpenProvider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";

function SSTMedicalRecordsManager() {
    const [visits, setVisits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVisitId, setSelectedVisitId] = useState(null);
    const [selectedVisitName, setSelectedVisitName] = useState("Tous les Dossiers");

    const { setTitle, setOnPrint, setOnExportPDF, setOnExportExcel, clearActions } = useHeader();
    const { dynamicStyles } = useOpen();

    const medicalRecordsRef = useRef(null);

    useEffect(() => {
        setTitle("Dossiers Médicaux");
        return () => clearActions();
    }, [setTitle, clearActions]);

    const fetchVisits = useCallback(async () => {
        setIsLoading(true);
        try {
            const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
            const response = await axios.get(`${API_BASE_URL}/api/visites`);
            const mappedVisits = (response.data || []).map(v => ({
                id: v.id,
                label: `Session ${v.date || ''} (${v.type || 'Périodique'})`,
                date: v.date,
                type: v.type
            }));
            setVisits(mappedVisits);
        } catch (error) {
            console.error("Error fetching visits:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVisits();
    }, [fetchVisits]);

    return (
        <ThemeProvider theme={createTheme()}>
            <Box sx={{ ...dynamicStyles, mt: 10 }}>
                {/* Conteneur principal avec espacement par rapport au menu gauche */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        height: 'calc(100vh - 100px)',
                        display: 'flex',
                        gap: 3,
                        backgroundColor: '#f8fafc' // Fond légèrement grisé pour faire ressortir les cartes blanches
                    }}
                >
                    <div className="sst-sidebar-container" style={{
                        width: '300px',
                        minWidth: '300px',
                        height: '100%',
                        backgroundColor: '#fff',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
                            <h6 style={{ margin: 0, fontWeight: 800, color: '#1e293b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Navigation Dossiers
                            </h6>
                        </div>

                        <ul className="departement_list" style={{
                            padding: '15px',
                            margin: 0,
                            listStyle: 'none',
                            flex: 1,
                            overflowY: 'auto',
                            width: '100%',
                            boxShadow: 'none',
                            border: 'none'
                        }}>
                            <li style={{ marginBottom: '15px' }}>
                                <div
                                    className={`department-item ${!selectedVisitId ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedVisitId(null);
                                        setSelectedVisitName("Tous les Dossiers");
                                    }}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        transition: 'all 0.2s',
                                        backgroundColor: !selectedVisitId ? 'rgba(58, 138, 144, 0.1)' : 'transparent',
                                        border: !selectedVisitId ? '1px solid rgba(58, 138, 144, 0.2)' : '1px solid transparent'
                                    }}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            backgroundColor: !selectedVisitId ? '#3a8a90' : '#f1f5f9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: !selectedVisitId ? '#fff' : '#64748b'
                                        }}>
                                            <IoFolderOpenOutline size={20} />
                                        </div>
                                        <span className="fw-bold" style={{ color: !selectedVisitId ? '#1e293b' : '#64748b', fontSize: '0.9rem' }}>
                                            Tous les Dossiers
                                        </span>
                                    </div>
                                </div>
                            </li>

                            <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '15px 10px' }}></div>

                            <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, padding: '0 15px 10px', textTransform: 'uppercase' }}>
                                Sessions de Visite
                            </div>

                            {visits.map((visit) => (
                                <li key={visit.id} style={{ marginBottom: '8px' }}>
                                    <div
                                        className={`department-item ${visit.id === selectedVisitId ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedVisitId(visit.id);
                                            setSelectedVisitName(visit.label);
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '10px 14px',
                                            borderRadius: '10px',
                                            transition: 'all 0.2s',
                                            backgroundColor: visit.id === selectedVisitId ? 'rgba(58, 138, 144, 0.08)' : 'transparent',
                                        }}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '8px',
                                                backgroundColor: visit.id === selectedVisitId ? '#3a8a90' : '#f8fafc',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: visit.id === selectedVisitId ? '#fff' : '#94a3b8',
                                                border: visit.id === selectedVisitId ? 'none' : '1px solid #e2e8f0'
                                            }}>
                                                <IoFolderOpenOutline size={16} />
                                            </div>
                                            <div className="d-flex flex-column">
                                                <span className="fw-bold" style={{ color: visit.id === selectedVisitId ? '#1e293b' : '#334155', fontSize: '0.85rem' }}>
                                                    {visit.type}
                                                </span>
                                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                                    {visit.date}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <SSTMedicalRecords
                            visitId={selectedVisitId}
                            visitName={selectedVisitName}
                            onClose={() => setSelectedVisitId(null)}
                            ref={medicalRecordsRef}
                        />
                    </div>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default SSTMedicalRecordsManager;
