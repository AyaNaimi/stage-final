import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FileText, User, DollarSign, Clock, CreditCard } from 'lucide-react';

const SSTPaymentForm = ({ onSubmit, onCancel, initialData }) => {
    const [formData, setFormData] = useState({
        id: initialData?.id || '',
        doctor: initialData?.doctor || '',
        amount: initialData?.amount || '',
        date: initialData?.date || '',
        status: initialData?.status || '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.id) errors.id = 'Le numéro de facture est requis';
        if (!formData.doctor) errors.doctor = 'Le médecin est requis';
        if (!formData.amount) errors.amount = 'Le montant est requis';
        if (!formData.date) errors.date = 'La date est requise';
        if (!formData.status) errors.status = 'Le statut est requis';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        if (!validateForm()) return;
        try {
            setLoading(true);
            await onSubmit(formData);
        } catch (err) {
            setError(err.response?.data?.message || "Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
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

        .sst-form-body {
            padding: 1.5rem;
            background-color: transparent;
            flex: 1;
            overflow-y: auto;
            min-height: 0;
            display: flex;
            flex-direction: column;
        }

        .scrollbar-teal::-webkit-scrollbar { width: 4px; }
        .scrollbar-teal::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .scrollbar-teal::-webkit-scrollbar-thumb { background: #3a8a90; border-radius: 10px; }

        .form-group-wrapper {
            margin-bottom: 1.25rem;
            position: relative;
        }

        .form-group-wrapper:not(:last-child)::after {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            bottom: -0.625rem;
            height: 1px;
            background-color: #f3f4f6;
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

        .form-control-enhanced:focus {
            outline: none;
            border-color: #00afaa;
            box-shadow: 0 0 0 2px rgba(0, 175, 170, 0.1);
        }

        .icon-accent {
            color: #4b5563;
            margin-right: 0.5rem;
        }

        .error-message {
            color: #ef4444;
            font-size: 0.75rem;
            margin-top: 0.25rem;
            display: block;
        }

        .form-actions {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 1rem;
            justify-content: center;
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

        .btn-primary-custom:hover:not(:disabled) {
            background-color: #009691;
            border-color: #009691;
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

            <Card className="sst-form-container">
                <div className="sst-form-header">
                    <h5>{initialData ? 'Modifier Honoraires' : 'Déclarer des Honoraires'}</h5>
                </div>

                <div className="sst-form-body scrollbar-teal">
                    <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
                        <div className="flex-grow-1">
                            <div className="form-group-wrapper">
                                <Form.Label className="form-label-enhanced">
                                    <FileText size={16} className="icon-accent" />
                                    N° Facture
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="id"
                                    value={formData.id}
                                    onChange={handleChange}
                                    className={`form-control-enhanced ${validationErrors.id ? 'is-invalid' : ''}`}
                                    placeholder="Ex: F-2026-001"
                                />
                                {validationErrors.id && <span className="error-message">{validationErrors.id}</span>}
                            </div>

                            <div className="form-group-wrapper">
                                <Form.Label className="form-label-enhanced">
                                    <User size={16} className="icon-accent" />
                                    Médecin concerné
                                </Form.Label>
                                <Form.Select
                                    name="doctor"
                                    value={formData.doctor}
                                    onChange={handleChange}
                                    className={`form-control-enhanced ${validationErrors.doctor ? 'is-invalid' : ''}`}
                                >
                                    <option value="">Sélectionner un médecin</option>
                                    <option value="Dr. Martin">Dr. Martin</option>
                                    <option value="Dr. Dupont">Dr. Dupont</option>
                                </Form.Select>
                                {validationErrors.doctor && <span className="error-message">{validationErrors.doctor}</span>}
                            </div>

                            <div className="form-group-wrapper">
                                <Form.Label className="form-label-enhanced">
                                    <DollarSign size={16} className="icon-accent" />
                                    Montant (€)
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    className={`form-control-enhanced ${validationErrors.amount ? 'is-invalid' : ''}`}
                                    placeholder="0.00"
                                />
                                {validationErrors.amount && <span className="error-message">{validationErrors.amount}</span>}
                            </div>

                            <div className="form-group-wrapper">
                                <Form.Label className="form-label-enhanced">
                                    <Clock size={16} className="icon-accent" />
                                    Date de facturation
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className={`form-control-enhanced ${validationErrors.date ? 'is-invalid' : ''}`}
                                />
                                {validationErrors.date && <span className="error-message">{validationErrors.date}</span>}
                            </div>

                            <div className="form-group-wrapper">
                                <Form.Label className="form-label-enhanced">
                                    <CreditCard size={16} className="icon-accent" />
                                    Statut du paiement
                                </Form.Label>
                                <Form.Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className={`form-control-enhanced ${validationErrors.status ? 'is-invalid' : ''}`}
                                >
                                    <option value="">Sélectionner un statut</option>
                                    <option value="Payé">Payé</option>
                                    <option value="En attente">En attente</option>
                                </Form.Select>
                                {validationErrors.status && <span className="error-message">{validationErrors.status}</span>}
                            </div>

                            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

                        </div>

                        <div className="form-actions">
                            <Button type="submit" disabled={loading} className="btn-primary-custom">
                                {loading ? <Spinner animation="border" size="sm" /> : (initialData ? 'Modifier' : 'Déclarer')}
                            </Button>
                            <Button type="button" onClick={onCancel} className="btn-secondary-custom">
                                Annuler
                            </Button>
                        </div>
                    </Form>
                </div>
            </Card>
        </>
    );
};

export default SSTPaymentForm;
