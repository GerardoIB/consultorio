import Medicamento from "../utils/conifg.js";

export class MedicamentoModel {

    // 1. Crear o inicializar un medicamento
    static async createMedicamento(datos) {
        try {
            // Usamos uppercase para mantener consistencia como en tu Schema
            const nuevoMedicamento = new Medicamento(datos);
            return await nuevoMedicamento.save();
        } catch (error) {
            throw new Error(`Error al crear medicamento: ${error.message}`);
        }
    }

    // 2. Obtener todos los medicamentos para el dropdown del formulario
    static async getAll() {
        try {
            return await Medicamento.find().sort({ nombre: 1 });
        } catch (error) {
            throw new Error("Error al obtener medicamentos");
        }
    }

    // 3. Buscar uno solo por nombre (útil para la calculadora)
    static async getByName(nombre) {
        try {
            return await Medicamento.findOne({ nombre: nombre.toUpperCase() });
        } catch (error) {
            throw new Error("Medicamento no encontrado");
        }
    }

    // 4. AGREGAR UNA PRESENTACIÓN (El "Update" de MySQL)
    // En lugar de crear un registro nuevo, "empujamos" un tamaño al array
    static async addPresentacion(id, nuevaPresentacion) {
        try {
            return await Medicamento.findByIdAndUpdate(
                id,
                { $push: { presentaciones: nuevaPresentacion } },
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw new Error("Error al añadir presentación");
        }
    }


    static async calcularPresupuesto(nombreMed, tamanoPluma, dosisSolicitada, mesActual = 1) {
        try {
            const med = await this.getByName(nombreMed);
            if (!med) throw new Error("Medicamento no encontrado");

            const pres = med.presentaciones.find(p => p.tamano_mg === tamanoPluma);
            if (!pres) throw new Error("Tamaño de presentación no encontrado");

            // 1. CÁLCULO DE LA CONSULTA
            const incrementoPorMes = 125;
            const gastoOperativo = 250; // <--- LO QUE SE RESTA (Luz, agua, etc)

            // Consulta cobrada al paciente
            const consultaIngreso = med.consulta_base + ((mesActual - 1) * incrementoPorMes);

            // Ganancia real de la consulta (Ingreso - 250)
            const gananciaConsulta = consultaIngreso - gastoOperativo;

            // 2. CÁLCULO DEL MEDICAMENTO
            const costoCompra = pres.costo_compra || 0; // Cuánto te cuesta a ti la pluma completa

            // Costo real por cada mg aplicado
            const costoRealPorMg = costoCompra / pres.tamano_mg;
            const costoRealDosis = costoRealPorMg * dosisSolicitada;

            // 3. FUNCIÓN DE CÁLCULO FINAL (Simplificada)
            // Usamos el precio de lista "Unitario" como referencia estándar de cobro
            const calcularNeto = () => {
                // Precio de venta sugerido (base) por mg
                const precioVentaPorMg = pres.costo_total_1pza / pres.tamano_mg;
                const precioVentaDosis = precioVentaPorMg * dosisSolicitada;

                // Ganancia pura del medicamento (Venta - Compra)
                const gananciaMedicamento = precioVentaDosis - costoRealDosis;

                // GANANCIA TOTAL NETA
                const gananciaTotal = gananciaMedicamento + gananciaConsulta;

                return {
                    ingresoTotal: Number((precioVentaDosis + consultaIngreso).toFixed(2)), // Lo que paga el paciente
                    costoTotal: Number((costoRealDosis + gastoOperativo).toFixed(2)),      // Lo que gastas tú
                    gananciaNeta: Number(gananciaTotal.toFixed(2)),                        // Lo que te queda libre
                    desglose: {
                        porConsulta: Number(gananciaConsulta.toFixed(2)),
                        porFarmaco: Number(gananciaMedicamento.toFixed(2))
                    }
                };
            };

            return {
                medicamento: med.nombre,
                configuracion: {
                    mes: mesActual,
                    dosis: dosisSolicitada,
                    consultaCobrada: consultaIngreso
                },
                resultado: calcularNeto() // Ya no devolvemos opciones, solo el resultado neto
            };

        } catch (error) {
            throw new Error(error.message);
        }
    }
}
