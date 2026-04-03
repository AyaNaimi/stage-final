import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css'
import { Routes, Route } from 'react-router-dom';
import Navigation from './Acceuil/Navigation';

import Dashboard from './Acceuil/Dashboard';
import DepartementManager from './Zakaria/Employe/DepartementManager';


import EmpHistorique from './Zakaria/EmpHistorique.jsx';


import { OpenProvider } from './Acceuil/OpenProvider.jsx';





// HeaderProvider import for global header state
import { HeaderProvider } from './Acceuil/HeaderContext';
import Societe from './Zakaria/Societe/Societe.jsx';
import SSTDashboard from './Zakaria/SST/SSTDashboard.jsx';
import SSTVisits from './Zakaria/SST/SSTVisits.jsx';
import SSTMedicalRecordsManager from './Zakaria/SST/SSTMedicalRecordsManager.jsx';
import SSTFinancialManagement from './Zakaria/SST/SSTFinancialManagement.jsx';
import SSTCosts from './Zakaria/SST/SSTCosts.jsx';
import SSTConsultation from './Zakaria/SST/SSTConsultation.jsx';
import SSTPractitioners from './Zakaria/SST/SSTPractitioners.jsx';
import SSTEmployees from './Zakaria/SST/SSTEmployees.jsx';
import SSTSociete from './Zakaria/SST/SSTSociete.jsx';


import Calendrie from './Zakaria/Calendrie.jsx';

const App = () => {
    return (
        <OpenProvider>
            <HeaderProvider>
                <Navigation />
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/employes" element={<DepartementManager />} />
                    <Route path="/emphistorique" element={<EmpHistorique />} />
                    <Route path="/societes" element={<Societe />} />
                    <Route path="/sst" element={<SSTDashboard />} />
                    <Route path="/sst-visites" element={<SSTVisits />} />
                    <Route path="/sst-dossiers" element={<SSTMedicalRecordsManager />} />
                    <Route path="/sst-paiements" element={<SSTFinancialManagement />} />
                    <Route path="/sst-couts" element={<SSTCosts />} />
                    <Route path="/sst-consultation" element={<SSTConsultation />} />
                    <Route path="/sst-praticiens" element={<SSTPractitioners />} />
                    <Route path="/sst-collaborateurs" element={<SSTEmployees />} />
                    <Route path="/sst-societes" element={<SSTSociete />} />
                    <Route path="/calendrier" element={<Calendrie />} />
                </Routes>
            </HeaderProvider>
        </OpenProvider>
    );
};

export default App;
