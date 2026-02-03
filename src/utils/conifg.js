import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

console.log("Connected to MongoDB");
const PresentacionSchema = new mongoose.Schema({
    tamano_mg: { type: Number, required: true }, // Ej: 20, 40, 60
    costo_compra: { type: Number, required: true, default: 0 },
    costo_total_1pza: { type: Number, required: true }, // Ej: 2650
    costo_total_3pzas: { type: Number, required: true }, // Ej: 2400
    costo_total_mayoreo: { type: Number, required: true } // Ej: 2000
});

const MedicamentoSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: true, 
        unique: true,
        uppercase: true // Para evitar duplicados por minúsculas
    },
    presentaciones: [PresentacionSchema], // Array de tamaños (20, 40, 60...)
    consulta_base: { 
        type: Number, 
        default: 1000 
    }
}, { timestamps: true }); // Añade fecha de creación y actualización automáticamente

const Medicamento = mongoose.model("Medicamento", MedicamentoSchema);

export default Medicamento;