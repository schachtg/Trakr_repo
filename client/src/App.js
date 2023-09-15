import React, { Fragment } from 'react';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Underglow from './components/Underglow/Underglow';
import { Route, Routes } from 'react-router-dom';

// Pages
import SprintPage from './pages/SprintPage/SprintPage';
import TicketsPage from './pages/TicketsPage/TicketsPage';
import HistoryPage from './pages/HistoryPage/HistoryPage';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';

function App() {
  return (
    <Fragment>
      <Navbar />
      <Routes>
        <Route path="/" element={<SprintPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
      <Underglow />
    </Fragment>
  );
}

export default App;
