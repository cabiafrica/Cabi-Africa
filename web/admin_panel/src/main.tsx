import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './AuthContext'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

console.log('--- MAIN.TSX STARTING ---');

try {
    const root = document.getElementById('root');
    console.log('--- ROOT ELEMENT:', root);

    ReactDOM.createRoot(root!).render(
        <React.StrictMode>
            <BrowserRouter>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </BrowserRouter>
        </React.StrictMode>,
    );
    console.log('--- RENDER CALLED ---');
} catch (error) {
    console.error('--- RENDER ERROR:', error);
}
