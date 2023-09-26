import React, { Fragment } from 'react';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Underglow from './components/Underglow/Underglow';
import { Route, Routes } from 'react-router-dom';

// Pages
import LoginPage from './pages/LoginPage/LoginPage';
import BoardPage from './pages/BoardPage/BoardPage';
import TicketsPage from './pages/TicketsPage/TicketsPage';
import HistoryPage from './pages/HistoryPage/HistoryPage';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';

export default function App() {
  return (
    <Fragment>
      {window.location.pathname !== "/" && <Navbar />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
      <Underglow />
    </Fragment>
  );
}
