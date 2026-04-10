import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { Activity, Stethoscope, FileText, CheckCircle, AlertCircle, Clock, Scale, Eye, Heart, Thermometer, Droplets, Ear, AlertTriangle, XCircle, Pill, ClipboardList, Hospital } from 'lucide-react';

const SSTExaminationPanel = ({ employee, onValidate, onCancel }) => {
    const [examData, setExamData] = useState({
        biometrics: {
            weight: '',
            height: '',
            bmi: '',
            bp_systolic: '',
            bp_diastolic: '',
            pulse: '',
            temp: '',
            spo2: '',
            glycemia: '',
            vision_right: '',
            vision_left: '',
            hearing_right: 'Normal',
            hearing_left: 'Normal'
        },
        soap: {
            subjective: '',
            objective: '',
            assessment: '',
            plan: ''
        },
        aptitude: 'fit', // fit, restricted, unfit, referral
        decisionDetails: {
            restrictions: '',
            treatment: '',
            sickLeave: { duration: '', unit: 'Jours' },
            referral: { specialist: '', reason: '' }
        }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!employee) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');

            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const payload = {
                visite_id: employee.visitId || null,
                employe_id: employee.id,
                date_examen: new Date().toISOString().replace('T', ' ').slice(0, 19),
                biometrics: examData.biometrics,
                soap: examData.soap,
                aptitude: examData.aptitude,
                decisionDetails: examData.decisionDetails,
                doctor_name: employee.doctor || employee.doctor_name || null,
                motif: employee.type || 'Périodique',
            };

            const response = await axios.post(`${API_BASE_URL}/api/examens-medicaux`, payload, {
                headers: { Accept: 'application/json' },
                withCredentials: true,
            });

            onValidate(response.data);
        } catch (err) {
            const validationErrors = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join('\n')
                : null;
            setError(validationErrors || err.response?.data?.message || "Échec de l'enregistrement de l'examen.");
        } finally {
            setLoading(false);
        }
    };

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

    let bmiValue = 'NaN';
    const parsedWeight = parseFloat(examData.biometrics.weight);
    const parsedHeight = parseFloat(examData.biometrics.height);
    if (!isNaN(parsedWeight) && !isNaN(parsedHeight) && parsedHeight > 0) {
        bmiValue = (parsedWeight / ((parsedHeight / 100) ** 2)).toFixed(1);
    }
    const bmiInterp = getBMIInterpretation(bmiValue);

    useEffect(() => {
        if (bmiValue !== 'NaN' && examData.biometrics.bmi !== bmiValue) {
            setExamData(prev => ({
                ...prev,
                biometrics: { ...prev.biometrics, bmi: bmiValue }
            }));
        } else if (bmiValue === 'NaN' && examData.biometrics.bmi !== '') {
             setExamData(prev => ({
                ...prev,
                biometrics: { ...prev.biometrics, bmi: '' }
            }));
        }
    }, [bmiValue, examData.biometrics.bmi]);

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
                    overflow: hidden;
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
                    padding: 1.5rem;
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

                .form-group-wrapper {
                    margin-bottom: 1.25rem;
                    position: relative;
                }

                .form-label-enhanced {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #4b5563;
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                }

                .form-control-enhanced {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    color: #111827;
                    background-color: #ffffff;
                    transition: all 0.2s ease;
                }

                .btn-primary-custom {
                    background-color: #00afaa;
                    border: 1px solid #00afaa;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    min-width: 120px;
                    transition: all 0.2s ease;
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
                `}
            </style>

            <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
                <div className="sst-form-header">
                    <h5>Examen Médical : {employee.name}</h5>
                </div>

                <div className="sst-form-content scrollbar-teal">
                    <div className="form-section-title">
                        <Activity size={14} /> Biométrie & Constantes
                    </div>

                    <Row className="g-3">
                        <Col xs={4}>
                            <div className="form-group-wrapper mb-2">
                                <Form.Label className="form-label-enhanced fs-xs text-muted">Poids (kg)</Form.Label>
                                <Form.Control
                                    type="number"
                                    className="form-control-enhanced"
                                    value={examData.biometrics.weight}
                                    onChange={e => setExamData({ ...examData, biometrics: { ...examData.biometrics, weight: e.target.value } })}
                                />
                            </div>
                        </Col>
                        <Col xs={4}>
                            <div className="form-group-wrapper mb-2">
                                <Form.Label className="form-label-enhanced fs-xs text-muted">Taille (cm)</Form.Label>
                                <Form.Control
                                    type="number"
                                    className="form-control-enhanced"
                                    value={examData.biometrics.height}
                                    onChange={e => setExamData({ ...examData, biometrics: { ...examData.biometrics, height: e.target.value } })}
                                />
                            </div>
                        </Col>
                        <Col xs={4}>
                            <div className="form-group-wrapper mb-2">
                                <Form.Label className="form-label-enhanced fs-xs text-muted">IMC</Form.Label>
                                <div className={`form-control-enhanced bg-light text-center fw-bold ${bmiInterp.color}`} style={{ fontSize: '0.8rem', minHeight: '42px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div>{bmiValue !== 'NaN' ? bmiValue : '---'}</div>
                                    {bmiValue !== 'NaN' && (
                                        <div style={{ fontSize: '0.6rem', lineHeight: '1' }}>{bmiInterp.text}</div>
                                    )}
                                </div>
                            </div>
                        </Col>

                        <Col xs={6}>
                            <div className="form-group-wrapper mb-2">
                                <Form.Label className="form-label-enhanced fs-xs text-muted">Tension (mmHg)</Form.Label>
                                <div className="d-flex gap-2">
                                    <Form.Control
                                        placeholder="Sys"
                                        className="form-control-enhanced text-center"
                                        value={examData.biometrics.bp_systolic}
                                        onChange={e => setExamData({ ...examData, biometrics: { ...examData.biometrics, bp_systolic: e.target.value } })}
                                    />
                                    <Form.Control
                                        placeholder="Dia"
                                        className="form-control-enhanced text-center"
                                        value={examData.biometrics.bp_diastolic}
                                        onChange={e => setExamData({ ...examData, biometrics: { ...examData.biometrics, bp_diastolic: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </Col>

                        <Col xs={6}>
                            <div className="form-group-wrapper mb-2">
                                <Form.Label className="form-label-enhanced fs-xs text-muted">Pouls & SpO2</Form.Label>
                                <div className="d-flex gap-2">
                                    <div className="position-relative w-100">
                                        <Form.Control
                                            placeholder="BPM"
                                            className="form-control-enhanced ps-4"
                                            value={examData.biometrics.pulse}
                                            onChange={e => setExamData({ ...examData, biometrics: { ...examData.biometrics, pulse: e.target.value } })}
                                        />
                                        <Heart size={10} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-danger opacity-50" />
                                    </div>
                                    <div className="position-relative w-100">
                                        <Form.Control
                                            placeholder="%"
                                            className="form-control-enhanced ps-4"
                                            value={examData.biometrics.spo2}
                                            onChange={e => setExamData({ ...examData, biometrics: { ...examData.biometrics, spo2: e.target.value } })}
                                        />
                                        <Activity size={10} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-primary opacity-50" />
                                    </div>
                                </div>
                            </div>
                        </Col>

                        <Col xs={6}>
                            <div className="form-group-wrapper mb-2">
                                <Form.Label className="form-label-enhanced fs-xs text-muted">Glycémie & Temp.</Form.Label>
                                <div className="d-flex gap-2">
                                    <div className="position-relative w-100">
                                        <Form.Control
                                            placeholder="g/L"
                                            className="form-control-enhanced ps-4"
                                            value={examData.biometrics.glycemia}
                                            onChange={e => setExamData({ ...examData, biometrics: { ...examData.biometrics, glycemia: e.target.value } })}
                                        />
                                        <Droplets size={10} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-info opacity-50" />
                                    </div>
                                    <div className="position-relative w-100">
                                        <Form.Control
                                            placeholder="°C"
                                            className="form-control-enhanced ps-4"
                                            value={examData.biometrics.temp}
                                            onChange={e => setExamData({ ...examData, biometrics: { ...examData.biometrics, temp: e.target.value } })}
                                        />
                                        <Thermometer size={10} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-warning opacity-50" />
                                    </div>
                                </div>
                            </div>
                        </Col>

                        <Col xs={6}>
                            <div className="form-group-wrapper mb-2">
                                <Form.Label className="form-label-enhanced fs-xs text-muted">Vision (OD/OG)</Form.Label>
                                <div className="d-flex gap-2">
                                    <Form.Control
                                        placeholder="OD"
                                        className="form-control-enhanced text-center"
                                        value={examData.biometrics.vision_right}
                                        onChange={e => setExamData({ ...examData, biometrics: { ...examData.biometrics, vision_right: e.target.value } })}
                                    />
                                    <Form.Control
                                        placeholder="OG"
                                        className="form-control-enhanced text-center"
                                        value={examData.biometrics.vision_left}
                                        onChange={e => setExamData({ ...examData, biometrics: { ...examData.biometrics, vision_left: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <div className="form-section-title mt-4">
                        <FileText size={14} /> Examen Clinique (SOAP)
                    </div>

                    <div className="form-group-wrapper mb-3">
                        <Form.Control
                            as="textarea"
                            rows={2}
                            className="form-control-enhanced"
                            placeholder="S (Subjectif): Plaintes, symptômes décrits..."
                            value={examData.soap.subjective}
                            onChange={e => setExamData({ ...examData, soap: { ...examData.soap, subjective: e.target.value } })}
                        />
                    </div>

                    <div className="form-group-wrapper mb-3">
                        <Form.Control
                            as="textarea"
                            rows={2}
                            className="form-control-enhanced"
                            placeholder="O (Objectif): Observations examen physique..."
                            value={examData.soap.objective}
                            onChange={e => setExamData({ ...examData, soap: { ...examData.soap, objective: e.target.value } })}
                        />
                    </div>

                    <div className="form-section-title mt-4">
                        <Scale size={14} /> Décision d'Aptitude
                    </div>

                    <div className="d-flex flex-wrap gap-2 mb-3">
                        {[
                            { id: 'fit', label: 'Apte', color: 'success', icon: CheckCircle },
                            { id: 'restricted', label: 'Apte (Rés)', color: 'warning', icon: AlertTriangle },
                            { id: 'unfit', label: 'Inapte', color: 'danger', icon: XCircle },
                            { id: 'referral', label: 'Expertise', color: 'info', icon: Stethoscope }
                        ].map(opt => (
                            <Button
                                key={opt.id}
                                variant={examData.aptitude === opt.id ? opt.color : 'outline-light'}
                                className={`flex-grow-1 extra-small fw-bold d-flex align-items-center justify-content-center gap-2 ${examData.aptitude === opt.id ? 'text-white shadow-sm' : 'text-muted border-secondary-subtle'}`}
                                style={{ padding: '0.6rem 0.5rem', fontSize: '0.75rem' }}
                                onClick={() => setExamData({ ...examData, aptitude: opt.id })}
                            >
                                <opt.icon size={14} />
                                {opt.label}
                            </Button>
                        ))}
                    </div>

                    {examData.aptitude === 'restricted' && (
                        <div className="form-group-wrapper animate-in fade-in p-2 bg-warning bg-opacity-10 rounded-2 border border-warning border-opacity-25 mb-3">
                            <Form.Label className="form-label-enhanced text-warning mb-1 extra-small uppercase">Restrictions</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                className="form-control-enhanced shadow-none border-0 bg-transparent text-dark"
                                placeholder="Détail des aménagements..."
                                value={examData.decisionDetails.restrictions}
                                onChange={e => setExamData({ ...examData, decisionDetails: { ...examData.decisionDetails, restrictions: e.target.value } })}
                            />
                        </div>
                    )}

                    {examData.aptitude === 'unfit' && (
                        <div className="form-group-wrapper animate-in fade-in p-2 bg-danger bg-opacity-10 rounded-2 border border-danger border-opacity-25 mb-3">
                            <Form.Label className="form-label-enhanced text-danger mb-1 extra-small uppercase">Arrêt de Travail</Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    type="number"
                                    placeholder="Nb"
                                    className="form-control-enhanced border-danger text-danger fw-bold"
                                    style={{ width: '80px' }}
                                    value={examData.decisionDetails.sickLeave.duration}
                                    onChange={e => setExamData({ ...examData, decisionDetails: { ...examData.decisionDetails, sickLeave: { ...examData.decisionDetails.sickLeave, duration: e.target.value } } })}
                                />
                                <Form.Select
                                    className="form-control-enhanced border-danger text-danger fw-bold"
                                    value={examData.decisionDetails.sickLeave.unit}
                                    onChange={e => setExamData({ ...examData, decisionDetails: { ...examData.decisionDetails, sickLeave: { ...examData.decisionDetails.sickLeave, unit: e.target.value } } })}
                                >
                                    <option>Jours</option>
                                    <option>Semaines</option>
                                </Form.Select>
                            </div>
                        </div>
                    )}

                    <div className="form-group-wrapper bg-light p-3 rounded-3 mt-2">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <Form.Label className="form-label-enhanced mb-0">Ordonnance & Conclusion</Form.Label>
                            <Pill size={12} className="text-muted" />
                        </div>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            className="form-control-enhanced bg-white"
                            placeholder="Prescriptions et note finale..."
                            value={examData.soap.assessment}
                            onChange={e => setExamData({ ...examData, soap: { ...examData.soap, assessment: e.target.value } })}
                        />
                    </div>

                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                </div>

                <div className="sst-form-footer">
                    <Button type="submit" disabled={loading} className="btn-primary-custom">
                        {loading ? <Spinner animation="border" size="sm" /> : 'Valider'}
                    </Button>
                    <Button type="button" onClick={onCancel} className="btn-secondary-custom">
                        Annuler
                    </Button>
                </div>
            </Form>
        </Card>
    );
};

export default SSTExaminationPanel;
