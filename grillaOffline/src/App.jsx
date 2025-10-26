import React from 'react';
import { HashRouter, BrowserRouter, Routes, Route } from 'react-router-dom';
import { Tables } from './pages/Tables.jsx';
import { TableDetails } from './pages/TableDetails.jsx';
import { Base } from './pages/Base.jsx';
import { Prensa } from './pages/Prensa.jsx';
import { AdminTableDetails } from './pages/AdminTableDetails.jsx';
import { Login } from '../src/components/login/Login.jsx';
import { DBProvider } from './context/dbContext.jsx';
import { AuthProvider } from './context/simpleAuthContext.jsx';
import { ProtectedRoute } from './components/protectedRoute/ProtectedRoute.jsx';
import { PRIVACY, URL } from './config.js';
import { Home } from './pages/Home.jsx';
import { Logout } from './pages/Logout.jsx';
import { AdminTables } from './pages/AdminTables.jsx';
import { AdminFactions } from './pages/AdminFactions.jsx';
import { AdminUsers } from './pages/AdminUsers.jsx';
import { Export } from './pages/Export.jsx';
import { Estado } from './pages/Estado.jsx';
import { Escrutinio } from './pages/Escrutinio.jsx';
import { AdminLogs } from './pages/AdminLogs.jsx';
import Navbar from './components/navbar/Navbar.jsx';
import { useAuth } from './context/simpleAuthContext.jsx';

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {import.meta.env.VITE_HASH_BROWSER === true ? (
        <HashRouter>
          {isAuthenticated && <Navbar />}
          <Routes>
            <Route path={`${URL}/login`} element={<Login />} />
            <Route
              path={URL + '/'}
              element={
                <ProtectedRoute privacy={PRIVACY.all}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/logout`}
              element={
                <ProtectedRoute privacy={PRIVACY.everyone}>
                  <Logout />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/mesas`}
              element={
                <ProtectedRoute privacy={PRIVACY.mesas}>
                  <Tables />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/mesas/:id`}
              element={
                <ProtectedRoute privacy={PRIVACY.mesas}>
                  <TableDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/base`}
              element={
                <ProtectedRoute privacy={PRIVACY.base}>
                  <Base />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/estado`}
              element={
                <ProtectedRoute privacy={PRIVACY.base + PRIVACY.prensa}>
                  <Estado />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/escrutinio`}
              element={
                <ProtectedRoute privacy={PRIVACY.base + PRIVACY.prensa}>
                  <Escrutinio />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/prensa`}
              element={
                <ProtectedRoute privacy={PRIVACY.prensa}>
                  <Prensa />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/admin/tables/`}
              element={
                <ProtectedRoute privacy={PRIVACY.admin}>
                  <AdminTables />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/admin/tables/:id`}
              element={
                <ProtectedRoute privacy={PRIVACY.admin}>
                  <AdminTableDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/admin/partidos/`}
              element={
                <ProtectedRoute privacy={PRIVACY.admin}>
                  <AdminFactions />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/admin/usuarios/`}
              element={
                <ProtectedRoute privacy={PRIVACY.admin}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/admin/exportar/`}
              element={
                <ProtectedRoute privacy={PRIVACY.admin}>
                  <Export />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/admin/logs/`}
              element={
                <ProtectedRoute privacy={PRIVACY.admin}>
                  <AdminLogs />
                </ProtectedRoute>
              }
            />
          </Routes>
        </HashRouter>
      ) : (
        <BrowserRouter>
          {isAuthenticated && <Navbar />}
          <Routes>
            <Route path={`${URL}/login`} element={<Login />} />
            <Route
              path={URL + '/'}
              element={
                <ProtectedRoute privacy={PRIVACY.all}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/logout`}
              element={
                <ProtectedRoute privacy={PRIVACY.everyone}>
                  <Logout />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/mesas`}
              element={
                <ProtectedRoute privacy={PRIVACY.mesas}>
                  <Tables />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/mesas/:id`}
              element={
                <ProtectedRoute privacy={PRIVACY.mesas}>
                  <TableDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/base`}
              element={
                <ProtectedRoute privacy={PRIVACY.base}>
                  <Base />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/estado`}
              element={
                <ProtectedRoute privacy={PRIVACY.base + PRIVACY.prensa}>
                  <Estado />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/escrutinio`}
              element={
                <ProtectedRoute privacy={PRIVACY.base + PRIVACY.prensa}>
                  <Escrutinio />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/prensa`}
              element={
                <ProtectedRoute privacy={PRIVACY.prensa}>
                  <Prensa />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/admin/tables/`}
              element={
                <ProtectedRoute privacy={PRIVACY.admin}>
                  <AdminTables />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/admin/tables/:id`}
              element={
                <ProtectedRoute privacy={PRIVACY.admin}>
                  <AdminTableDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/admin/partidos/`}
              element={
                <ProtectedRoute privacy={PRIVACY.admin}>
                  <AdminFactions />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/admin/usuarios/`}
              element={
                <ProtectedRoute privacy={PRIVACY.admin}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/admin/exportar/`}
              element={
                <ProtectedRoute privacy={PRIVACY.admin}>
                  <Export />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${URL}/admin/logs/`}
              element={
                <ProtectedRoute privacy={PRIVACY.admin}>
                  <AdminLogs />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
};

export const App = () => {
  return (
    <DBProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </DBProvider>
  );
};