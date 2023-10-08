import React, { Fragment } from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';

// Components
import Navbar from './components/Navbar/Navbar';
import Underglow from './components/Underglow/Underglow';

// Pages
import LoginRedirect from './pages/LoginRedirect/LoginRedirect';
import LoginPageWrapper from './pages/LoginPageWrapper/LoginPageWrapper';
import BoardPage from './pages/BoardPage/BoardPage';
import TicketsPage from './pages/TicketsPage/TicketsPage';
import HistoryPage from './pages/HistoryPage/HistoryPage';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';

export default function App() {
  const displayNav = () => {
    return window.location.pathname !== "/" && window.location.pathname !== "/login";
  }

  return (
    <Fragment>
      <Provider store={store}>
        {displayNav() && <Navbar />}
        <Routes>
          <Route path="/" element={<LoginRedirect />} />
          <Route path="/login" element={<LoginPageWrapper />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
        </Routes>
        <Underglow />
      </Provider>
    </Fragment>
  );
}
