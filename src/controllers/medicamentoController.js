export class MedicamentoController {
    constructor({ MedicamentoModel }) {
        this.MedicamentoModel = MedicamentoModel;
    }

    // POST: Crear nuevo medicamento
    createMedicamento = async (req, res) => {
        try {
            const nuevoMed = await this.MedicamentoModel.createMedicamento(req.body);
            res.status(201).json(nuevoMed);
        } catch (error) {
            console.error("Error en createMedicamento:", error);
            // Validamos si es error de duplicado (Mongo error 11000)
            if (error.message.includes("E11000")) {
                return res.status(400).json({ message: "El medicamento ya existe" });
            }
            res.status(500).json({ message: "Error al crear el medicamento" });
        }
    }

    // GET: Obtener lista para el dropdown
    getAll = async (req, res) => {
        try {
            const medicamentos = await this.MedicamentoModel.getAll();
            console.log(medicamentos)
            res.json(medicamentos);
        } catch (error) {
            console.error("Error en getAll:", error);
            res.status(500).json({ message: "Error al obtener la lista de medicamentos" });
        }
    }

    // GET: Calcular presupuesto (La lógica "estrella")
    // En src/controllers/medicamentoController.js

    getCotizacion = async (req, res) => {
        try {
            // Leemos 'precio_custom' (vial) y 'precio_consulta' (cobro doctor)
            const { nombre, tamano_mg, dosis_mg, mes, precio_custom, precio_consulta } = req.query;

            if (!nombre || !tamano_mg || !dosis_mg) {
                return res.status(400).json({ message: "Faltan parámetros básicos" });
            }

            const resultado = await this.MedicamentoModel.calcularPresupuesto(
                nombre,
                parseFloat(tamano_mg),
                parseFloat(dosis_mg),
                parseInt(mes) || 1,
                precio_custom ? parseFloat(precio_custom) : null,
                precio_consulta ? parseFloat(precio_consulta) : null // <--- NUEVO PARÁMETRO
            );

            res.json(resultado);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    }
}