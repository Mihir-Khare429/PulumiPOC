import { Router } from "express";
import { createApiGateway } from "../controllers/createResource";

const router = Router();

router.post('/createapigateway', createApiGateway)

export default router;
