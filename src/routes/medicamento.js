import { Router } from "express";
import { MedicamentoController } from "../controllers/medicamentoController.js";


export const medicamentoRouter = ({MedicamentoModel}) => {
    const  router = Router();
    const controller = new MedicamentoController({MedicamentoModel});

    router.post("/", controller.createMedicamento);
    router.get("/cotizar",controller.getCotizacion);
    router.get("/lista", controller.getAll)


    return router;
}