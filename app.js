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
app.use('/api/medicamentos',medicamentoRouter({MedicamentoModel}))

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(path.join(__dirname,'/src/dist')))

app.get(/.*/, ( req, res) =>{
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    res.sendFile(indexPath)
})


app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`)
})