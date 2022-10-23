import { Request, Response, NextFunction, json } from "express";
import appdHelper from "../helper/appdHelper";
import ResponseHandler from "../helper/ResponseHandler";
import { constants } from "../helper/constants";
import Ansible from "./Ansible";
import ZFI from "./ZFI";

const ErrorHandler = require("../helper/ErrorHandler");
var mongo = require("mongodb");
var fs = require("fs");

const list = async (req: Request, res: Response, next: NextFunction) => {
  let filter =
    req.params.status == "all"
      ? {}
      : { status: req.params.status.toUpperCase() };
  let result = await global.mongoConnection
    .collection("task")
    .find(filter)
    .toArray();

  return ResponseHandler.createResponse(res, 200, result);
};

const getLog = async (req: Request, res: Response, next: NextFunction) => {
  let result = "Log File not found";

  let accessToken: any = await appdHelper.getAccessToken(req);
  let controller: any = await appdHelper.getController(req);

  let taskId = req.params.id;
  let typeLog = req.params.typeLog;
  let logFile = "";

  try {
    let task = await global.mongoConnection
      .collection("task")
      .findOne({ _id: new mongo.ObjectID(taskId) });

    if (task != undefined) {
      if (task.agent.type == "legacy") {
        let playbookFolder = await Ansible.getPlaybookFolder(
          task.application.applicationId,
          task.application.applicationName
        );

        logFile = task.ansible.logFile;
        if (typeLog == "error") {
          logFile = logFile.replace("_run.log", "_error.log");
        }

        let completePathFile = `${playbookFolder}/logs/${logFile}`;

        if (fs.existsSync(completePathFile)) {
          result = fs.readFileSync(completePathFile, "utf-8");
        } else {
          return ResponseHandler.createResponse(res, 200, result);
        }
      } else if (task.agent.type == "zfi") {
        if (typeLog == "error") {
          result = "There is no error file for this kind of Agent";
        } else {
          let maintenanceHistory = await ZFI.maintenanceHistory(
            accessToken,
            controller,
            task.zfi.upgrade.maintenanceId
          );
          let { operation, status } = maintenanceHistory;

          await updateStatus(task, {
            status:
              status == "SUCCEEDED" ? constants.TASK_STATUS_COMPLETED : status,
          });

          let systemMaintenancesHistory = await ZFI.systemMaintenancesHistory(
            accessToken,
            controller,
            task.zfi.upgrade.maintenanceId
          );

          if (
            systemMaintenancesHistory &&
            systemMaintenancesHistory.total > 0
          ) {
            let { systemMaintenanceId, logsAvailable } =
              systemMaintenancesHistory.items[0];

            if (logsAvailable) {
              let systemMaintenancesHistory = await ZFI.systemMaintenancesLog(
                accessToken,
                controller,
                systemMaintenanceId
              );
              logFile = systemMaintenancesHistory;
            }
          } else {
            result = `Wait a moment and try again to get the Log File\n\n`;
          }

          result += `Operation => ${operation}\n`;
          result += `Status => ${status}\n\n`;
          if (logFile != "") {
            result += `Log File => \n${logFile}`;
          }
        }
      } else {
        throw new ErrorHandler(200, true, "Agent Type incompatible!");
      }
    }

    return ResponseHandler.createResponse(res, 200, result);
  } catch (error) {
    next(error);
    //   let json = JSON.parse(JSON.stringify(error as any));
    //   return res
    //     .status(json.status || 500)
    //     .json({ message: json.message || error.message });
  }
};

const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let REQ_JSON = req.body;

    let controllerMongo = await global.mongoConnection
      .collection("controller")
      .findOne({ controller: REQ_JSON.controller.controller });

    if (controllerMongo == null) {
      throw new ErrorHandler(
        200,
        true,
        "Controller not found, please setup it in the left menu."
      );
    }

    if (controllerMongo.accountAccessKey == undefined) {
      throw new ErrorHandler(
        200,
        true,
        "Account Access Key not found, please setup it in the left menu."
      );
    }

    delete controllerMongo._id;
    REQ_JSON.controller = controllerMongo;

    // COMMON
    let task: any = undefined;
    let accessToken: any = await appdHelper.getAccessToken(req);
    let controller: any = await appdHelper.getController(req);

    if (REQ_JSON.agent.type == "legacy") {
      task = await Ansible.createPlaybook(REQ_JSON);
    } else if (REQ_JSON.agent.type == "zfi") {
      task = await ZFI.createTask(accessToken, controller, REQ_JSON);
    } else {
      throw new ErrorHandler(
        200,
        true,
        "Task not created, Agent Type incompatible!"
      );
    }
    createTaskMongo(task);
    return ResponseHandler.createResponse(res, 200, "Task created!");
  } catch (error) {
    next(error);
  }
};

async function createTaskMongo(task: any) {
  await global.mongoConnection.collection("task").insertOne({
    status: constants.TASK_STATUS_PENDING,
    ...task,
  });
}

async function updateStatus(task: any, fields: any) {
  await global.mongoConnection.collection("task").updateOne(
    {
      _id: task._id,
    },
    { $set: fields }
  );
}

export default { list, getLog, createTask };
