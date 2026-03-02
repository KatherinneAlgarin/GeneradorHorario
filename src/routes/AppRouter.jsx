import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/login/Login';
import HomeAdmin from '../pages/admin/HomeAdmin';
import GestorUsuarios from '../pages/admin/GestorUsuarios';
import OpcionTabs from '../pages/admin/OpcionTabs';
import MainLayout from '../components/layout/MainLayout';
import LoginLayout from '../components/layout/LoginLayout';
import GestorInfraestructura from '../pages/admin/GestorInfraestructura';
import RoleRoute from './RoleRoute';
import HomeDocente from '../pages/docente/HomeDocente';
import HomeDecano from '../pages/decano/HomeDecano';
import RegistroDisponibilidad from '../pages/docente/RegistroDisponibilidad';
import GestorDocentesDecano from '../pages/decano/GestionDocentesDecano';
import GestorAcademicoDecano from '../pages/decano/GestorAcademicoDecano';

export const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />

            <Route element={<LoginLayout />}>
                <Route path="/login" element={<Login />} />
            </Route>

            {/* RUTA PROTEGIDA ADMIN */}
            <Route
                path="/admin"
                element={
                    <RoleRoute allowedRoles={["admin_general"]}>
                        <MainLayout />
                    </RoleRoute>
                }
            >
                <Route index element={<HomeAdmin />} /> 
                <Route path="docentes" element={<GestorUsuarios />} />
                <Route path="infraestructura" element={<GestorInfraestructura />} />
                <Route path="academico" element={<OpcionTabs />} />
                <Route path="horarios" element={<div>Horarios</div>} />
            </Route>

            {/* RUTA PROTEGIDA DOCENTE */}
            <Route
                path="/docente"
                element={
                    <RoleRoute allowedRoles={["docente"]}>
                        <MainLayout />
                    </RoleRoute>
                }
            >
                <Route index element={<HomeDocente />} /> 
                <Route path="disponibilidad" element={<RegistroDisponibilidad />} />
            </Route>
                
            {/* RUTA PROTEGIDA DECANO */}
            <Route
                path="/decano"
                element={
                    <RoleRoute allowedRoles={["decano"]}>
                        <MainLayout />
                    </RoleRoute>
                }
            >
                <Route index element={<HomeDecano />} />
                <Route path="docentes" element={<GestorDocentesDecano />} /> 
                <Route path="academico" element={<GestorAcademicoDecano />} />
            </Route>

            <Route path="*" element={<h1>404 - No encontrado</h1>} />
        </Routes>
    );
};