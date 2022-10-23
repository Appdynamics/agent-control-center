require("express-async-errors");
import express from "express";
import { Request, Response, NextFunction, json } from "express";

import _controller from "../controllers/Controller";
import _key from "../controllers/Key";
import _task from "../controllers/Task";
import _appDynamics from "../controllers/AppDynamics";
import ResponseHandler from "./ResponseHandler";

const router = express.Router();

// Controller
router.post("/api/v1/controller/get", _controller.get);
router.post("/api/v1/controller", _controller.add);
router.put("/api/v1/controller/:id", _controller.update);

// Keys
router.get("/api/v1/keys", _key.list);
router.get("/api/v1/key/:id", _key.get);
router.post("/api/v1/key", _key.add);
router.put("/api/v1/key/:id", _key.update);
router.delete("/api/v1/key/:id", _key.remove);

// Tasks
router.get("/api/v1/tasks/:status", _task.list);
router.get("/api/v1/task/log/:id/:typeLog", _task.getLog);
router.post("/api/v1/task/createTask", _task.createTask);

// AppDynamics
router.post("/api/v1/appd/login", _appDynamics.login);
router.get("/api/v1/appd/agents", _appDynamics.listAgents);
router.get(
  "/api/v1/appd/agent/:applicationId/:applicationComponentNodeId",
  _appDynamics.getAgent
);
router.get(
  "/api/v1/appd/health/:applicationId/:nodeId/:interval",
  _appDynamics.getAgentNodeAvailability
);
router.get(
  "/api/v1/appd/download/getAgentVersions/:latest",
  _appDynamics.getAgentVersions
);

// // Packages
// router.get("/api/v1/packages", packageController.list);
// router.get("/api/v1/package/:id", packageController.get);
// router.post("/api/v1/package", packageController.add);
// router.put("/api/v1/package/:id", packageController.update);
// router.delete("/api/v1/package/:id", packageController.remove);

// ERROR MANAGER
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error("===> BEGIN ERROR <===");

  let statusCode = error.statusCode || 500;
  let message = error.message || error;

  if (error && error.response) {
    if (error.response.status) {
      statusCode = error.response.status;
    }
    if (error.response.statusText) {
      message = error.response.statusText;
    }
    if (error.response.data && error.response.data.detail) {
      message = error.response.data.detail;
    }
  }

  console.error("======xxxxx", error, message);
  //   data: {
  //   status: 400,
  //   title: 'Bad Request',
  //   detail: 'Bad Upgrade Request: Upgrade version=22.8.0.34104 for systemId=6a032333-970b-459a-9a2e-f9207566e654 should be higher than current version=22.9.0.34210 for agent type=JDK8_PLUS',
  //   trackingId: '5daa5846a1ea2232cc71e9d01dcb9d47'
  // }
  console.error("===> END ERROR <===");
  return ResponseHandler.createResponse(res, statusCode, message, true);
});

export = router;
