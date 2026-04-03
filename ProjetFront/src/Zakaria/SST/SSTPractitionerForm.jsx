import React, { useEffect, useState } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { User, Stethoscope, Briefcase, Phone, Mail, Upload, FileText, Camera, ZoomIn } from 'lucide-react';
import Swal from 'sweetalert2';

const SSTPractitionerForm = ({ onSubmit, onCancel, initialData, resolveFileUrl }) => {
    const buildInitialFormData = (data) => ({
        name: data?.name || data?.nom || '',
        firstName: data?.firstName || data?.first_name || data?.prenom || '',
        specialty: data?.specialty || data?.specialite || '',
        type: data?.type || '',
        phone: data?.phone || data?.telephone || '',
        email: data?.email || '',
        photo: data?.photo || null,
        diplome: data?.diplome || null,
        otherDocs: data?.otherDocs || data?.other_docs || null
    });

    const [formData, setFormData] = useState(buildInitialFormData(initialData));

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        setFormData(buildInitialFormData(initialData));
        setValidationErrors({});
        setError('');
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'otherDocs' ? Array.from(files) : files[0]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name) errors.name = 'Le nom est requis';
        if (!formData.firstName) errors.firstName = 'Le prénom est requis';
        if (!formData.specialty) errors.specialty = 'La spécialité est requise';
        if (!formData.type) errors.type = 'Le type est requis';

        // Validation for mandatory Diploma
        if (!initialData && !formData.diplome) {
            errors.diplome = "Le diplôme d'état est obligatoire";
        }

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

            <Card className="sst-form-container">
                <div className="sst-form-header">
                    <h5>{initialData ? 'Modifier Praticien' : 'Ajouter un praticien'}</h5>
                </div>

                <div className="sst-form-body scrollbar-teal">
                    <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
                        <div className="flex-grow-1">
                            {/* Photo Upload at Top */}
                            <div className="d-flex flex-column align-items-center mb-4 mt-2">
                                <div
                                    className="position-relative mb-3"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        const url = resolveFileUrl(formData.photo || initialData?.photo);

                                        if (url) {
                                            Swal.fire({
                                                title: `${formData.firstName} ${formData.name}`,
                                                imageUrl: url,
                                                imageAlt: 'Photo du praticien',
                                                showConfirmButton: false,
                                                showCloseButton: true,
                                                imageWidth: 400,
                                                imageHeight: 400,
                                                imageClass: 'rounded-4 object-fit-cover shadow-sm',
                                                customClass: {
                                                    popup: 'rounded-4',
                                                    closeButton: 'zoom-close-btn'
                                                },
                                                width: 'auto',
                                                padding: '2rem'
                                            });
                                        }
                                    }}
                                >
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center border shadow-sm"
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            backgroundColor: '#f8fafc',
                                            overflow: 'hidden',
                                            border: '2px dashed #cbd5e1'
                                        }}
                                    >
                                        {(formData.photo || initialData?.photo) ? (
                                            <img
                                                src={resolveFileUrl(formData.photo || initialData?.photo)}
                                                alt="Preview"
                                                className="w-100 h-100 object-fit-cover"
                                            />
                                        ) : (
                                            <Camera size={40} className="text-muted opacity-50" />
                                        )}
                                    </div>
                                    <label
                                        htmlFor="photo-upload"
                                        className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                        style={{ width: '32px', height: '32px', cursor: 'pointer', border: '2px solid white' }}
                                    >
                                        <Camera size={16} />
                                    </label>
                                    <input
                                        id="photo-upload"
                                        type="file"
                                        name="photo"
                                        onChange={handleChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                <span className="extra-small fw-bold text-muted">Photo du praticien</span>
                            </div>

                            <div className="form-group-wrapper">
                                <Form.Label className="form-label-enhanced">
                                    <User size={16} className="icon-accent" />
                                    Nom
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`form-control-enhanced ${validationErrors.name ? 'is-invalid' : ''}`}
                                    placeholder={initialData?.name || initialData?.nom || 'Nom du praticien'}
                                />
                                {validationErrors.name && <span className="error-message">{validationErrors.name}</span>}
                            </div>

                            <div className="form-group-wrapper">
                                <Form.Label className="form-label-enhanced">
                                    <User size={16} className="icon-accent" />
                                    Prénom
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={`form-control-enhanced ${validationErrors.firstName ? 'is-invalid' : ''}`}
                                    placeholder={initialData?.firstName || initialData?.first_name || initialData?.prenom || 'Prénom du praticien'}
                                />
                                {validationErrors.firstName && <span className="error-message">{validationErrors.firstName}</span>}
                            </div>

                            <div className="form-group-wrapper">
                                <Form.Label className="form-label-enhanced">
                                    <Stethoscope size={16} className="icon-accent" />
                                    Spécialité
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="specialty"
                                    value={formData.specialty}
                                    onChange={handleChange}
                                    className={`form-control-enhanced ${validationErrors.specialty ? 'is-invalid' : ''}`}
                                    placeholder={initialData?.specialty || initialData?.specialite || 'Ex: Généraliste, Travail...'}
                                />
                                {validationErrors.specialty && <span className="error-message">{validationErrors.specialty}</span>}
                            </div>

                            <div className="form-group-wrapper">
                                <Form.Label className="form-label-enhanced">
                                    <Briefcase size={16} className="icon-accent" />
                                    Type
                                </Form.Label>
                                <Form.Select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className={`form-control-enhanced ${validationErrors.type ? 'is-invalid' : ''}`}
                                >
                                    <option value="">Sélectionner un type</option>
                                    <option value="Employé">Employé</option>
                                    <option value="Externe">Externe</option>
                                </Form.Select>
                                {validationErrors.type && <span className="error-message">{validationErrors.type}</span>}
                            </div>

                            <div className="form-group-wrapper">
                                <Form.Label className="form-label-enhanced">
                                    <Phone size={16} className="icon-accent" />
                                    Téléphone
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="form-control-enhanced"
                                    placeholder={initialData?.phone || initialData?.telephone || '06...'}
                                />
                            </div>

                            <div className="form-group-wrapper">
                                <Form.Label className="form-label-enhanced">
                                    <Mail size={16} className="icon-accent" />
                                    Email
                                </Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-control-enhanced"
                                    placeholder={initialData?.email || 'exemple@med.com'}
                                />
                            </div>

                            <div className="form-group-wrapper">
                                <Form.Label className="form-label-enhanced">
                                    <FileText size={16} className="icon-accent" />
                                    Diplôme d'état <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="file"
                                    name="diplome"
                                    onChange={handleChange}
                                    className={`form-control-enhanced ${validationErrors.diplome ? 'is-invalid' : ''}`}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                                {validationErrors.diplome && <span className="error-message">{validationErrors.diplome}</span>}
                            </div>

                            <div className="form-group-wrapper">
                                <Form.Label className="form-label-enhanced">
                                    <Upload size={16} className="icon-accent" />
                                    Autres documents
                                </Form.Label>
                                <Form.Control
                                    type="file"
                                    name="otherDocs"
                                    onChange={handleChange}
                                    multiple
                                    className="form-control-enhanced"
                                />
                            </div>

                            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

                        </div>

                        <div className="form-actions">
                            <Button type="submit" disabled={loading} className="btn-primary-custom">
                                {loading ? <Spinner animation="border" size="sm" /> : (initialData ? 'Modifier' : 'Enregistrer')}
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

export default SSTPractitionerForm;
