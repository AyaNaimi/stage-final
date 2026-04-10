import React, { useState } from 'react';
import axios from 'axios';
import { Card, Form, Button, Row, Col, Tabs, Tab, Badge } from 'react-bootstrap';
import { History, Activity, FileText, CalendarDays, ArrowRight, Activity as ActivityIcon, Scale, Heart, Filter, ChevronRight, HeartPulse } from 'lucide-react';

const SSTPatientDossierPanel = ({ employee, onClose }) => {
    if (!employee) return null;

    const getBMIInterpretation = (bmiValue) => {
        const bmi = parseFloat(bmiValue);
        if (!bmi || isNaN(bmi)) return { text: '-', color: 'text-muted' };
        if (bmi < 18.5) return { text: 'Maigreur', color: 'text-warning' };
        if (bmi <= 24.9) return { text: 'Normale', color: 'text-success' };
        if (bmi <= 29.9) return { text: 'Surpoids', color: 'text-warning' };
        if (bmi <= 34.9) return { text: 'Obésité I', color: 'text-danger' };
        if (bmi <= 39.9) return { text: 'Obésité II', color: 'text-danger' };
        return { text: 'Obésité III', color: 'text-danger' };
    };

    const [visitHistory, setVisitHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

    React.useEffect(() => {
        if (!employee?.id) return;

        const fetchHistory = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/api/employes/${employee.id}/examens-medicaux`);
                const data = Array.isArray(response.data) ? response.data : [];

                // Standardize history data
                const formatted = data.map(exam => ({
                    id: exam.id,
                    date: exam.date_examen?.split(' ')[0] || '-',
                    type: exam.motif || 'Visite',
                    doctor: exam.doctor_name || 'Médecin SCP',
                    biometrics: {
                        imc: exam.imc || '-',
                        bp: (exam.ta_systolique && exam.ta_diastolique) ? `${exam.ta_systolique}/${exam.ta_diastolique}` : '-',
                        pulse: exam.pouls || '-',
                        weight: exam.poids,
                        height: exam.taille
                    },
                    tour_taille: exam.tour_taille || '-',
                    freq_cardiaque: exam.freq_cardiaque || '-',
                    saturation_o2: exam.saturation_o2 || '-',
                    freq_respiratoire: exam.freq_respiratoire || '-',
                    spirometrie: exam.spirometrie || '-',
                    capacite_vitale: exam.capacite_vitale || '-',
                    examen_fonctionnel: exam.examen_fonctionnel || 'Normal',
                    examen_cardio: exam.examen_cardio || 'Normal',
                    examen_respiratoire: exam.examen_respiratoire || 'Normal',
                    notes: {
                        subjective: exam.notes_subjectives || 'Aucune note',
                        assessment: exam.evaluation || 'Aucune évaluation'
                    },
                    aptitude: exam.aptitude || 'Inconnu'
                }));

                setVisitHistory(formatted);
            } catch (error) {
                console.error('Error fetching clinical history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [employee?.id, API_BASE_URL]);

    const latestExam = visitHistory.length > 0 ? visitHistory[0] : null;

    return (
        <Card className="sst-form-container">
            <style>
                {`
                .sst-form-container {
                    border: none;
                    border-radius: 0;
                    background-color: transparent;
                    box-shadow: none;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    overflow: visible;
                }

                .sst-form-header {
                    padding: 1.25rem 1.5rem;
                    letter-spacing: 0.5px;
                    margin: 0;
                    background: #f9fafb;
                    border-bottom: 1px solid #e9ecef;
                    flex-shrink: 0;
                }

                .sst-form-header h5 {
                    display: flex;
                    justify-content: center;
                    letter-spacing: 0.2px;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #4b5563;
                    margin: 0;
                }

                .sst-form-content {
                    padding: 0;
                    background-color: transparent;
                    flex: 1;
                    overflow-y: auto;
                    min-height: 0;
                }

                .scrollbar-teal::-webkit-scrollbar { width: 4px; }
                .scrollbar-teal::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .scrollbar-teal::-webkit-scrollbar-thumb { background: #3a8a90; border-radius: 10px; }

                .sst-form-footer {
                    padding: 1.25rem 1.5rem;
                    background: #ffffff;
                    border-top: 1px solid #e5e7eb;
                    flex-shrink: 0;
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                }

                .form-section-title {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #94a3b8;
                    margin: 1.5rem 0 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .btn-secondary-custom {
                    background-color: #f3f4f6;
                    border: 1px solid #d1d5db;
                    color: #4b5563;
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    min-width: 120px;
                    transition: all 0.2s ease;
                }

                .custom-tabs-sst .nav-link {
                    border: none;
                    color: #94a3b8;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    padding: 1rem 1.5rem;
                }

                .custom-tabs-sst .nav-link.active {
                    color: #00afaa;
                    background: transparent;
                    border-bottom: 2px solid #00afaa;
                }
                `}
            </style>

            <div className="sst-form-header">
                <h5>Dossier Médical : {employee.name}</h5>
            </div>

            <div className="sst-form-content scrollbar-teal">
                <Tabs defaultActiveKey="history" className="custom-tabs-sst">
                    <Tab eventKey="history" title="Historique & Synthèse" className="p-4">
                        <div className="d-flex align-items-center justify-content-between mb-4 bg-light p-3 rounded-4">
                            <div className="d-flex align-items-center gap-2">
                                <Filter size={14} className="text-muted" />
                                <span className="extra-small fw-black text-muted uppercase">Période</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <Form.Control type="date" size="sm" className="extra-small fw-bold border-0 bg-white shadow-sm" style={{ width: '120px' }} />
                                <ArrowRight size={12} className="text-muted" />
                                <Form.Control type="date" size="sm" className="extra-small fw-bold border-0 bg-white shadow-sm" style={{ width: '120px' }} />
                            </div>
                        </div>

                        <Row className="g-3 mb-4">
                            <Col md={12}>
                                <Card className="border-0 bg-light p-3 rounded-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="extra-small fw-black text-muted uppercase">Dernières constantes</span>
                                        <ActivityIcon size={14} className="text-primary" />
                                    </div>
                                    <div className="d-flex justify-content-around">
                                        <div className="text-center">
                                            <div className="extra-small text-muted mb-1">IMC</div>
                                            <div className={`fw-black h6 mb-0 ${getBMIInterpretation(latestExam?.biometrics?.imc || '-').color}`}>{latestExam?.biometrics?.imc || '-'}</div>
                                            <div className={`extra-small fw-bold ${getBMIInterpretation(latestExam?.biometrics?.imc || '-').color}`} style={{ fontSize: '0.6rem' }}>{getBMIInterpretation(latestExam?.biometrics?.imc || '-').text}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="extra-small text-muted mb-1">Tension</div>
                                            <div className="fw-black h6 mb-0">{latestExam?.biometrics?.bp || '-'}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="extra-small text-muted mb-1">Pouls</div>
                                            <div className="fw-black h6 mb-0">{latestExam?.biometrics?.pulse || '-'}</div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        <div className="form-section-title">
                            <CalendarDays size={14} /> Historique des Visites
                        </div>
                        <div className="timeline-sst">
                            {loading ? (
                                <div className="text-center p-4 extra-small fw-bold text-muted">CHARGEMENT DE L'HISTORIQUE...</div>
                            ) : visitHistory.length === 0 ? (
                                <div className="text-center p-4 extra-small fw-bold text-muted">AUCUN EXAMEN ENREGISTRÉ</div>
                            ) : (
                                <div className="d-flex flex-column">
                                    {visitHistory.map((visit, index) => (
                                        <div key={visit.id} className="border-bottom p-3">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div className="d-flex flex-column">
                                                    <span className="fw-bold text-dark small d-flex align-items-center gap-2">
                                                        {visit.date}
                                                        <Badge bg="light" text="dark" className="border fw-normal extra-small m-0">{visit.doctor}</Badge>
                                                    </span>
                                                    <span className="extra-small text-muted uppercase tracking-wider">{visit.type}</span>
                                                </div>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="rounded-circle p-0 d-flex align-items-center justify-content-center"
                                                    style={{ width: '28px', height: '28px' }}
                                                    onClick={() => {
                                                        const details = document.getElementById(`panel-visit-details-${visit.id}`);
                                                        if (details) {
                                                            details.style.display = details.style.display === 'none' ? 'block' : 'none';
                                                        }
                                                    }}
                                                >
                                                    <ChevronRight size={16} className="text-muted" />
                                                </Button>
                                            </div>

                                            {/* Hidden Details Section */}
                                            <div id={`panel-visit-details-${visit.id}`} style={{ display: 'none' }} className="mt-3 animate-in fade-in slide-in-from-top-2">
                                                <div className="p-3 bg-light rounded-3 border-start border-4 border-primary shadow-sm">
                                                    <div className="extra-small text-muted fw-bold uppercase mb-2 d-flex justify-content-between align-items-center">
                                                        <span>Dossier Médical (Résumé)</span>
                                                        <FileText size={12} className="text-primary" />
                                                    </div>
                                                    <Row className="g-2 text-center mb-3">
                                                        <Col>
                                                            <div className="p-2 bg-white rounded-3 border border-light d-flex flex-column align-items-center justify-content-center">
                                                                <div className="extra-small text-muted" style={{ fontSize: '0.6rem' }}>IMC</div>
                                                                <div className={`fw-black ${getBMIInterpretation(visit.biometrics.imc).color}`} style={{ lineHeight: '1.1' }}>{visit.biometrics.imc}</div>
                                                                <div className={`extra-small ${getBMIInterpretation(visit.biometrics.imc).color}`} style={{ fontSize: '0.55rem', lineHeight: '1' }}>{getBMIInterpretation(visit.biometrics.imc).text}</div>
                                                            </div>
                                                        </Col>
                                                        <Col>
                                                            <div className="p-2 bg-white rounded-3 border border-light">
                                                                <div className="extra-small text-muted">TA</div>
                                                                <div className="fw-black text-primary">{visit.biometrics.bp}</div>
                                                            </div>
                                                        </Col>
                                                        <Col>
                                                            <div className="p-2 bg-white rounded-3 border border-light">
                                                                <div className="extra-small text-muted">Pouls</div>
                                                                <div className="fw-black text-primary">{visit.biometrics.pulse}</div>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <div className="extra-small text-muted mb-1 pb-1 border-bottom border-light">
                                                        <span className="fw-black text-dark">Notes:</span> {visit.notes.subjective}
                                                    </div>
                                                    <div className="extra-small text-muted pt-1">
                                                        <span className="fw-black text-dark">Avis:</span> {visit.notes.assessment}
                                                    </div>
                                                    <div className="text-end mt-2 pt-2 border-top border-light">
                                                        <span className={`badge bg-${visit.aptitude === 'Apte' ? 'success' : 'warning'} bg-opacity-10 text-${visit.aptitude === 'Apte' ? 'success' : 'warning'} border-0 extra-small`}>
                                                            {visit.aptitude === 'Apte' ? 'APTE' : 'APTE SOUS RÉSERVE'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Tab>
                    <Tab eventKey="biometrics" title="Biométrie" className="p-4">
                        <div className="form-section-title">
                            <Scale size={14} /> Données Anthropométriques
                        </div>
                        <div className="table-responsive">
                            <table className="table table-borderless table-sm extra-small mb-4 align-middle">
                                <thead>
                                    <tr className="border-bottom text-muted uppercase fw-bold" style={{ fontSize: '0.6rem' }}>
                                        <th>Date</th>
                                        <th>Poids (kg)</th>
                                        <th>Taille (cm)</th>
                                        <th>Tour de taille (cm)</th>
                                        <th>IMC</th>
                                        <th>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visitHistory.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center p-3 text-muted">Aucune donnée</td></tr>
                                    ) : (
                                        visitHistory.map(visit => (
                                            <tr key={visit.id} className="border-bottom">
                                                <td className="fw-bold">{visit.date}</td>
                                                <td>{visit.biometrics.weight || '-'}</td>
                                                <td>{visit.biometrics.height || '-'}</td>
                                                <td>{visit.tour_taille || '-'}</td>
                                                <td className="fw-black">{visit.biometrics.imc}</td>
                                                <td className={`fw-black ${getBMIInterpretation(visit.biometrics.imc).color}`} style={{ fontSize: '0.55rem' }}>{getBMIInterpretation(visit.biometrics.imc).text}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="form-section-title">
                            <HeartPulse size={14} /> Paramètres Cardiaques & Vasculaires
                        </div>
                        <table className="table table-borderless table-sm extra-small align-middle mb-4">
                            <thead>
                                <tr className="border-bottom text-muted uppercase fw-bold" style={{ fontSize: '0.6rem' }}>
                                    <th>Date</th>
                                    <th>Tension (TA) mmHg</th>
                                    <th>Pouls (bpm)</th>
                                    <th>Fréquence cardiaqe</th>
                                    <th>Saturation O2 (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visitHistory.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center p-3 text-muted">Aucune donnée</td></tr>
                                ) : (
                                    visitHistory.map(visit => (
                                        <tr key={visit.id} className="border-bottom">
                                            <td className="fw-bold">{visit.date}</td>
                                            <td className="fw-black text-primary">{visit.biometrics.bp}</td>
                                            <td className="fw-black text-primary">{visit.biometrics.pulse}</td>
                                            <td>{visit.freq_cardiaque || '-'}</td>
                                            <td>{visit.saturation_o2 || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        <div className="form-section-title">
                            <Activity size={14} /> Constantes Respiratoires
                        </div>
                        <table className="table table-borderless table-sm extra-small align-middle">
                            <thead>
                                <tr className="border-bottom text-muted uppercase fw-bold" style={{ fontSize: '0.6rem' }}>
                                    <th>Date</th>
                                    <th>Fréquence respiratoire</th>
                                    <th>Spirométrie</th>
                                    <th>Capacité vitale</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visitHistory.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center p-3 text-muted">Aucune donnée</td></tr>
                                ) : (
                                    visitHistory.map(visit => (
                                        <tr key={visit.id} className="border-bottom">
                                            <td className="fw-bold">{visit.date}</td>
                                            <td>{visit.freq_respiratoire || '-'}</td>
                                            <td>{visit.spirometrie || '-'}</td>
                                            <td>{visit.capacite_vitale || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </Tab>
                    
                    <Tab eventKey="clinical" title="Clinique" className="p-4">
                        <div className="form-section-title">
                            <FileText size={14} /> Examen Clinique
                        </div>
                        {visitHistory.length === 0 ? (
                            <div className="text-center p-4 extra-small fw-bold text-muted">AUCUN EXAMEN ENREGISTRÉ</div>
                        ) : (
                            visitHistory.map(visit => (
                                <div key={visit.id} className="mb-4 p-3 bg-light rounded-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="fw-black text-primary">{visit.date}</span>
                                        <Badge bg="info" className="extra-small">{visit.type}</Badge>
                                    </div>
                                    <Row className="g-2 mb-3">
                                        <Col md={6}>
                                            <div className="p-2 bg-white rounded-3 border">
                                                <div className="extra-small text-muted fw-bold">Observations générales</div>
                                                <div className="extra-small">{visit.notes?.subjective || 'Aucune observation'}</div>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="p-2 bg-white rounded-3 border">
                                                <div className="extra-small text-muted fw-bold">Examen fonctionnel</div>
                                                <div className="extra-small">{visit.examen_fonctionnel || 'Normal'}</div>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className="g-2">
                                        <Col md={6}>
                                            <div className="p-2 bg-white rounded-3 border">
                                                <div className="extra-small text-muted fw-bold">Examen cardio-vasculaire</div>
                                                <div className="extra-small">{visit.examen_cardio || 'Normal'}</div>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="p-2 bg-white rounded-3 border">
                                                <div className="extra-small text-muted fw-bold">Examen respiratoire</div>
                                                <div className="extra-small">{visit.examen_respiratoire || 'Normal'}</div>
                                            </div>
                                        </Col>
                                    </Row>
                                    <div className="mt-3 p-2 bg-white rounded-3 border">
                                        <div className="extra-small text-muted fw-bold">Conclusion / Recommandations</div>
                                        <div className="extra-small">{visit.notes?.assessment || 'Aucune'}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </Tab>
                </Tabs>
            </div>

            <div className="sst-form-footer">
                <Button type="button" onClick={onClose} className="btn-secondary-custom">
                    Fermer
                </Button>
            </div>
        </Card>
    );
};

export default SSTPatientDossierPanel;
