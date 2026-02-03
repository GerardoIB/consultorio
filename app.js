import express from "express";
import dotenv from "dotenv";
import { corsMiddleware } from "./src/utils/cors.js";
import { medicamentoRouter } from "./src/routes/medicamento.js";
import { MedicamentoModel } from "./src/models/medicamentoModel.js";
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(corsMiddleware);

// Rutas de API
app.use('/api/medicamentos', medicamentoRouter({MedicamentoModel}))

// Configuración de __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// RUTA ABSOLUTA a la carpeta dist (dentro de src)
const distPath = path.join(__dirname, 'src', 'dist');

// 1. Servir archivos estáticos
app.use(express.static(distPath));

// 2. EVITAR ERROR 500: Si piden un asset y no estaba en el static anterior, es 404.
// Esto evita que Express intente enviar index.html como si fuera un JS.
app.get('/assets/*', (req, res) => {
    res.status(404).send("Archivo no encontrado");
});

// 3. Ruta catch-all para React (SPA)
app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err && !res.headersSent) {
            console.error("Error enviando index.html:", err);
            res.status(500).send("Error cargando la aplicación");
        }
    });
})

app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`)
})