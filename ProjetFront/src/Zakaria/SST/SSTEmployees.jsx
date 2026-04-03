import React from 'react';
import DepartementManager from '../Employe/DepartementManager';

const SSTEmployees = () => {
    // We can wrap it or just return it. 
    // DepartementManager already uses the HeaderContext and OpenProvider.
    return <DepartementManager />;
};

export default SSTEmployees;
