import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/login/Login';
import HomeAdmin from '../pages/admin/HomeAdmin';
import GestorDocentes from '../pages/admin/GestorDocentes';
import HomeDecano from '../pages/decano/HomeDecano'; 
import HomeDocente from '../pages/docente/HomeDocente';
import MainLayout from '../components/layout/MainLayout';
import LoginLayout from '../components/layout/LoginLayout';

export const AppRouter = () => {
    return (
        <Routes>
            {/* 1. Redirección inicial */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* 2. Rutas de Login */}
            <Route element={<LoginLayout />}>
                <Route path="/login" element={<Login />} />
            </Route>

            {/* 3. RUTAS DE ADMINISTRADOR */}
            <Route path="/admin" element={<MainLayout />}>
                
                {/* /admin -> Dashboard */}
                <Route index element={<HomeAdmin />} /> 
                
                {/* /admin/docentes */}
                <Route path="docentes" element={<GestorDocentes />} />
                
                {/* /admin/horarios  */}
                <Route path="horarios" element={<div>Próximamente: Horarios</div>} />

            </Route>

            {/*Otros Roles */}
            <Route path="/decano" element={<MainLayout />}>
                 <Route index element={<h1>Panel Decano</h1>} />
            </Route>

            <Route path="/docente" element={<MainLayout />}>
                 <Route index element={<h1>Panel Docente</h1>} />
            </Route>

            <Route path="*" element={
                <div style={{textAlign: 'center', marginTop: '50px'}}>
                    <h2>404 - Página no encontrada</h2>
                </div>
            } />
        </Routes>
    );
};