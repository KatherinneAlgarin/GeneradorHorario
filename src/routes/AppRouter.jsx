import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/login/Login';
import HomeAdmin from '../pages/admin/HomeAdmin';
import GestorDocentes from '../pages/admin/GestorDocentes';
import OpcionTabs from '../pages/admin/OpcionTabs';
import MainLayout from '../components/layout/MainLayout';
import LoginLayout from '../components/layout/LoginLayout';
import GestorInfraestructura from '../pages/admin/GestorInfraestructura';

export const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />

            <Route element={<LoginLayout />}>
                <Route path="/login" element={<Login />} />
            </Route>

            <Route path="/admin" element={<MainLayout />}>
                <Route index element={<HomeAdmin />} /> 
                <Route path="docentes" element={<GestorDocentes />} />
                <Route path="infraestructura" element={<GestorInfraestructura />} />
                <Route path="academico" element={<OpcionTabs />} />
                <Route path="horarios" element={<div>Próximamente: Horarios</div>} />
            </Route>

            <Route path="*" element={<h1>404 - No encontrado</h1>} />
        </Routes>
    );
};