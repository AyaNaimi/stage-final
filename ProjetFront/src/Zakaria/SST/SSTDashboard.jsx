import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ProgressBar, Badge, Button } from 'react-bootstrap';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Clock,
  BarChart,
  HeartPulse,
  HardHat,
  FileWarning,
  Heart,
  CalendarX,
  FileText,
  Stethoscope
} from 'lucide-react';
import { useHeader } from "../../Acceuil/HeaderContext";
import { useOpen } from "../../Acceuil/OpenProvider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import ExpandRTable from "../Employe/ExpandRTable";

import axios from 'axios';

const SSTDashboard = () => {
  const { setTitle, setOnPrint, setOnExportPDF, setOnExportExcel, searchQuery, clearActions } = useHeader();
  const { dynamicStyles, isMobile } = useOpen();
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dashboard data (fetched from API)
  const [complianceData, setComplianceData] = useState({
    totalEmployees: 0,
    compliant: 0,
    pending: 0,
    overdue: 0
  });

  const [absenceStats, setAbsenceStats] = useState({
    totalAbsences: 0,
    maladie: 0,
    accident: 0,
    personnel: 0,
    evolution: 'ce mois',
  });

  const [recentAbsences, setRecentAbsences] = useState([]);
  const [activeRestrictions, setActiveRestrictions] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [departmentCompliance, setDepartmentCompliance] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/sst-dashboard-stats`);
        const data = response.data;

        setComplianceData(data.complianceData);
        setAbsenceStats(data.absenceStats);
        setRecentAbsences(data.recentAbsences);
        setActiveRestrictions(data.activeRestrictions);
        setRecentExams(data.recentExams);
        setDepartmentCompliance(data.departmentCompliance);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching SST dashboard data:", err);
        setError("Erreur lors de la récupération des données.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const complianceRate = complianceData.totalEmployees > 0
    ? Math.round((complianceData.compliant / complianceData.totalEmployees) * 100)
    : 0;

  useEffect(() => {

    setTitle("Pilotage Santé & Sécurité (SST)");
    return () => {
      clearActions();
    };
  }, [setTitle, clearActions]);

  const [pageAbsences, setPageAbsences] = useState(0);
  const [rowsPerPageAbsences, setRowsPerPageAbsences] = useState(5);

  const [pageRestrictions, setPageRestrictions] = useState(0);
  const [rowsPerPageRestrictions, setRowsPerPageRestrictions] = useState(5);

  const [pageExams, setPageExams] = useState(0);
  const [rowsPerPageExams, setRowsPerPageExams] = useState(5);

  const absenceColumns = [
    {
      key: 'name', label: 'Employé', render: (item) => (
        <div className="d-flex align-items-center gap-2">
          {item.photo ? (
            <img src={resolveFileUrl(item.photo)} alt="" className="rounded-circle object-fit-cover" style={{ width: '28px', height: '28px' }} />
          ) : (
            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center text-muted small" style={{ width: '28px', height: '28px' }}>
              <Users size={14} />
            </div>
          )}
          <span className="small fw-bold">{item.name}</span>
        </div>
      )
    },
    { key: 'dept', label: 'Département' },
    {
      key: 'type', label: 'Type', render: (item) => (
        <Badge bg={item.type === 'Maladie' ? 'success' : item.type === 'Accident' ? 'danger' : 'warning'} className="px-2 py-1">
          {item.type}
        </Badge>
      )
    },
    {
      key: 'period', label: 'Période', render: (item) => (
        <span className="text-secondary font-weight-bold">{item.from} → {item.to}</span>
      )
    },
    {
      key: 'status', label: 'Statut', render: (item) => (
        <span className={item.status === 'En cours' ? 'text-danger font-weight-bold' : 'text-muted'}>
          {item.status}
        </span>
      )
    }
  ];

  const restrictionColumns = [
    {
      key: 'name', label: 'Employé', render: (item) => (
        <div className="d-flex align-items-center gap-2">
          {item.photo ? (
            <img src={resolveFileUrl(item.photo)} alt="" className="rounded-circle object-fit-cover" style={{ width: '28px', height: '28px' }} />
          ) : (
            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center text-muted small" style={{ width: '28px', height: '28px' }}>
              <Users size={14} />
            </div>
          )}
          <span className="small fw-bold">{item.name}</span>
        </div>
      )
    },
    {
      key: 'restriction', label: 'Restriction', render: (item) => (
        <div className="bg-light p-2 rounded border border-warning" style={{ fontSize: '0.8rem' }}>
          {item.restriction}
        </div>
      )
    },
    {
      key: 'expiry', label: 'Fin', render: (item) => (
        <div className="d-flex align-items-center gap-1">
          <Clock size={12} className="text-muted" />
          <span className={item.status === 'permanent' ? 'text-primary font-weight-bold' : 'text-muted'}>
            {item.expiry}
          </span>
        </div>
      )
    }
  ];

  const examColumns = [
    {
      key: 'name', label: 'Employé', render: (item) => (
        <div className="d-flex align-items-center gap-2">
          {item.photo ? (
            <img src={resolveFileUrl(item.photo)} alt="" className="rounded-circle object-fit-cover" style={{ width: '28px', height: '28px' }} />
          ) : (
            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center text-muted small" style={{ width: '28px', height: '28px' }}>
              <Users size={14} />
            </div>
          )}
          <span className="small fw-bold">{item.name}</span>
        </div>
      )
    },
    { key: 'date', label: 'Date' },
    { key: 'examType', label: 'Type' },
    {
      key: 'status', label: 'Résultat', render: (item) => (
        <Badge bg={item.status === 'Normal' ? 'success' : item.status === 'Anormal' ? 'danger' : 'secondary'} className="px-2 py-1">
          {item.status}
        </Badge>
      )
    }
  ];

  if (loading) return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ ...dynamicStyles, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', marginTop: '100px' }}>
        <p className="fw-bold">Chargement des données du dashboard SST...</p>
      </Box>
    </ThemeProvider>
  );

  if (error) return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ ...dynamicStyles, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', marginTop: '100px' }}>
        <p className="text-danger fw-bold">{error}</p>
      </Box>
    </ThemeProvider>
  );

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ ...dynamicStyles }}>
        <Box component="main" sx={{ flexGrow: 1, p: isMobile ? 1 : 4, mt: isMobile ? 8 : 10 }}>
          <div className="sst-container">
            {/* KPI Row */}
            <Row className="mb-4 g-4 px-2">
              <Col xs={12} sm={6} md={6} lg={3}>
                <Card className="border-0 shadow-sm rounded-4 p-3 h-100">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="p-2 rounded-3 bg-success bg-opacity-10 text-success">
                      <ShieldCheck size={24} />
                    </div>
                    <Badge bg="success" className="rounded-pill px-3">{complianceRate}%</Badge>
                  </div>
                  <p className="text-muted small text-uppercase fw-bold mb-1">Taux de Conformité</p>
                  <h3 className="fw-black mb-3">{complianceData.compliant} / {complianceData.totalEmployees}</h3>
                  <ProgressBar now={complianceRate} variant="success" style={{ height: '6px' }} />
                </Card>
              </Col>

              <Col xs={12} sm={6} md={3}>
                <Card className="border-0 shadow-sm rounded-4 p-3 h-100">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="p-2 rounded-3 bg-danger bg-opacity-10 text-danger">
                      <CalendarX size={24} />
                    </div>
                    <Badge bg="danger" className="rounded-pill px-3">{absenceStats.evolution}</Badge>
                  </div>
                  <p className="text-muted small text-uppercase fw-bold mb-1">Absences & Arrêts</p>
                  <h3 className="fw-black mb-3">{absenceStats.totalAbsences} ce mois</h3>

                  <div className="d-flex gap-2">
                    <Badge bg="success" className="bg-opacity-10 text-success border-0">Maladie: {absenceStats.maladie}</Badge>
                    <Badge bg="warning" className="bg-opacity-10 text-warning border-0">Accident: {absenceStats.accident}</Badge>
                  </div>
                </Card>
              </Col>

              <Col xs={12} sm={6} md={3}>
                <Card className="border-0 shadow-sm rounded-4 p-3 h-100">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="p-2 rounded-3 bg-warning bg-opacity-10 text-warning">
                      <FileWarning size={24} />
                    </div>
                  </div>
                  <p className="text-muted small text-uppercase fw-bold mb-1">Visites en Retard</p>
                  <h3 className="fw-black mb-1">{complianceData.overdue} employés</h3>
                  <p className="text-danger small fw-bold mt-2 d-flex align-items-center gap-1">
                    <AlertTriangle size={14} /> {complianceData.pending} jamais vus
                  </p>
                </Card>
              </Col>

              <Col xs={12} sm={6} md={3}>
                <Card className="border-0 shadow-sm rounded-4 p-3 h-100 bg-primary text-white">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="p-2 rounded-3 bg-white bg-opacity-20">
                      <Clock size={24} />
                    </div>
                  </div>
                  <p className="text-white-50 small text-uppercase fw-bold mb-1">Projection (30j)</p>
                  <h3 className="fw-black mb-1">+ {complianceData.upcoming} visites</h3>
                  <p className="text-white-50 small mt-2">{complianceData.pendingPayments} paiements en attente</p>
                </Card>
              </Col>
            </Row>


            <Row className="g-4">
              {/* Tables Column */}
              <Col lg={8}>
                <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                  <div className="bg-light p-3 border-bottom d-flex align-items-center gap-2">
                    <Heart size={20} className="text-danger" />
                    <h6 className="mb-0 fw-bold uppercase">Absences & Arrêts maladie récents</h6>
                  </div>
                  <div className="p-0">
                    <ExpandRTable
                      columns={absenceColumns}
                      data={recentAbsences}
                      searchTerm={searchQuery}
                      rowsPerPage={rowsPerPageAbsences}
                      page={pageAbsences}
                      handleChangePage={setPageAbsences}
                      handleChangeRowsPerPage={(v) => setRowsPerPageAbsences(v.target.value)}
                      selectedItems={[]}
                      canBulkDelete={false}
                      canEdit={false}
                      canDelete={false}
                    />
                  </div>
                </Card>

                <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                  <div className="bg-light p-3 border-bottom d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <Stethoscope size={20} className="text-primary" />
                      <h6 className="mb-0 fw-bold uppercase">Derniers Examens Médicaux</h6>
                    </div>
                  </div>
                  <div className="p-0">
                    <ExpandRTable
                      columns={examColumns}
                      data={recentExams}
                      searchTerm={searchQuery}
                      rowsPerPage={rowsPerPageExams}
                      page={pageExams}
                      handleChangePage={setPageExams}
                      handleChangeRowsPerPage={(v) => setRowsPerPageExams(v.target.value)}
                      selectedItems={[]}
                      canBulkDelete={false}
                      canEdit={false}
                      canDelete={false}
                    />
                  </div>
                </Card>

                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                  <div className="bg-light p-3 border-bottom d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <HeartPulse size={20} className="text-danger" />
                      <h6 className="mb-0 fw-bold uppercase">Restrictions Actives & Aménagements</h6>
                    </div>
                    <Button variant="outline-secondary" size="sm" className="rounded-3 border-0 bg-light text-dark fw-bold px-3">
                      Voir Tout
                    </Button>
                  </div>
                  <div className="p-0">
                    <ExpandRTable
                      columns={restrictionColumns}
                      data={activeRestrictions}
                      searchTerm={searchQuery}
                      rowsPerPage={rowsPerPageRestrictions}
                      page={pageRestrictions}
                      handleChangePage={setPageRestrictions}
                      handleChangeRowsPerPage={(v) => setRowsPerPageRestrictions(v.target.value)}
                      selectedItems={[]}
                      canBulkDelete={false}
                      canEdit={false}
                      canDelete={false}
                    />
                  </div>
                </Card>

              </Col>

              {/* Sidebar Column */}
              <Col lg={4}>
                <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
                  <h6 className="fw-black uppercase mb-4">Concentration des Risques</h6>
                  <div className="d-flex flex-column gap-4">
                    {departmentCompliance.map((dept) => (
                      <div key={dept.name}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="small fw-bold text-dark">{dept.name}</span>
                          <Badge
                            bg={dept.risk === 'high' ? 'danger' : dept.risk === 'medium' ? 'warning' : 'success'}
                            className="bg-opacity-10 text-uppercase fw-black"
                            style={{ fontSize: '0.65rem', color: dept.risk === 'high' ? '#dc3545' : dept.risk === 'medium' ? '#ffc107' : '#198754' }}
                          >
                            {dept.risk} risk
                          </Badge>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <ProgressBar
                            now={(dept.compliant / dept.total) * 100}
                            variant={dept.risk === 'high' ? 'danger' : dept.risk === 'medium' ? 'warning' : 'success'}
                            className="flex-grow-1"
                            style={{ height: '6px' }}
                          />
                          <span className="small fw-bold text-muted">{Math.round((dept.compliant / dept.total) * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-4 bg-light">
                    <div className="d-flex gap-2">
                      <AlertTriangle size={16} className="text-warning flex-shrink-0" />
                      <p className="small text-muted mb-0">
                        Le département <span className="fw-bold text-dark">Production</span> présente une hausse de 12% des restrictions temporaires.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-4 overflow-hidden position-relative">
                  <div className="position-relative z-index-1">
                    <h5 className="fw-black mb-2 italic">Aide au Recrutement</h5>
                    <p className="text-white-50 small mb-4">Vérifiez les aptitudes de vos nouveaux arrivants pour optimiser leur intégration.</p>
                    <Button variant="light" className="w-100 rounded-3 fw-black text-uppercase small py-3">
                      Simuler un placement
                    </Button>
                  </div>
                  <Users size={150} className="position-absolute text-white opacity-5" style={{ bottom: '-30px', right: '-30px' }} />
                </Card>
              </Col>
            </Row>
          </div>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default SSTDashboard;
