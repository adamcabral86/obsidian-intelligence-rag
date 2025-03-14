import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createAppTheme } from './theme';
import Layout from './components/Layout';
import Home from './pages/Home';
import Documents from './pages/Documents';
import Search from './pages/Search';
import Entities from './pages/Entities';
import Settings from './pages/Settings';

/**
 * Main App component that sets up routing and theming
 */
const App: React.FC = () => {
  // State for dark mode toggle, default to true for dark mode
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Create theme based on dark mode state using our theme utility
  const theme = createAppTheme(darkMode);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/search" element={<Search />} />
          <Route path="/entities" element={<Entities />} />
          <Route path="/settings" element={<Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
};

export default App; 