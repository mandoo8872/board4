import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminPage } from './pages/AdminPage';
import { ViewPage } from './pages/ViewPage';
import './App.css'

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/view" element={<ViewPage />} />
        <Route path="/" element={<Navigate to="/view" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
