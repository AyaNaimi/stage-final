import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

// Créer un contexte pour l'état "open"
const OpenContext = createContext();

export const OpenProvider = ({ children }) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [dynamicStyles, setDynamicStyles] = useState({
    position: 'fixed',
    top: '0px',
    // left: '20%',
    width: '100%',
    left: 0,
    right: 0,

    transition: 'all 0.2s ease',
  });

  // Fonction pour basculer l'état "open" et mettre à jour les styles
  const toggleOpen = () => {
    setOpen(prevOpen => !prevOpen);
  };

  useEffect(() => {
    if (isMobile) {
      setDynamicStyles(prevStyles => ({
        ...prevStyles,
        left: '0',
        width: '100%',
      }));
    } else {
      const drawerWidth = 260; // Matching Navigation.jsx
      const miniWidth = 72;   // theme.spacing(9)
      const currentWidth = open ? drawerWidth : miniWidth;

      setDynamicStyles(prevStyles => ({
        ...prevStyles,
        left: `${currentWidth}px`,
        width: `calc(100% - ${currentWidth}px)`,
      }));
    }
  }, [open, isMobile]);

  return (
    <OpenContext.Provider value={{ dynamicStyles, open, toggleOpen, isMobile }}>
      {children}
    </OpenContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte "open"
export const useOpen = () => useContext(OpenContext);
