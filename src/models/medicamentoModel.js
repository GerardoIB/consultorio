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


    // Actualizamos la firma del método para aceptar el precioConsultaManual
static async calcularPresupuesto(nombreMed, tamanoPluma, dosisSolicitada, mesActual = 1, precioVialManual = null, precioConsultaManual = null) {
    try {
        const med = await this.getByName(nombreMed);
        if (!med) throw new Error("Medicamento no encontrado");

        let pres;
        
        // --- LOGICA DEL MEDICAMENTO (VIAL) ---
        if (precioVialManual) {
            // Modo Manual: Usamos el precio del vial que mandó el usuario
            pres = {
                tamano_mg: tamanoPluma,
                costo_compra: precioVialManual,
                costo_total_1pza: precioVialManual * 1.5 // (Opcional: margen simulado)
            };
        } else {
            // Modo Automático: Base de datos
            pres = med.presentaciones.find(p => p.tamano_mg === tamanoPluma);
            if (!pres) throw new Error("Tamaño no encontrado");
        }

        // --- LOGICA DE LA CONSULTA (NUEVO) ---
        let consultaIngreso;

        if (precioConsultaManual) {
            // Opción A: El doctor puso el precio manualmente
            consultaIngreso = precioConsultaManual;
        } else {
            // Opción B: Cálculo automático (Base + incrementos por mes)
            const incrementoPorMes = 125;
            consultaIngreso = med.consulta_base ;
        }

        // --- CÁLCULOS RESTANTES (Igual que antes) ---
        
        // Costo real por dosis (Gasto)
        const costoCompra = pres.costo_compra || 0; 
        const costoRealPorMg = costoCompra / pres.tamano_mg;
        const costoRealDosis = costoRealPorMg * dosisSolicitada;
        
        const gananciaConsulta = consultaIngreso - costoRealDosis;

        const calcularNeto = () => {
            // Usamos el precio del vial (manual o auto) como base para "lo que dejas de ganar" si vendes
            const precioBaseCalculo = precioVialManual ? precioVialManual : pres.costo_total_1pza;

            const precioVentaPorMg = precioBaseCalculo / pres.tamano_mg;
            const precioVentaDosis = precioVentaPorMg * dosisSolicitada;

            const gananciaMedicamento = precioVentaDosis ;
            
            // Fórmula final
            const gananciaTotal = gananciaConsulta - precioVentaDosis;

            return {
                ingresoTotal: Number((consultaIngreso).toFixed(2)),
                costoTotal: Number((precioVentaDosis).toFixed(2)),
                gananciaNeta: Number(gananciaTotal.toFixed(2)),
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
                modo: (precioVialManual || precioConsultaManual) ? 'Manual' : 'Automático'
            },
            resultado: calcularNeto()
        };

    } catch (error) {
        throw new Error(error.message);
    }
}
}
