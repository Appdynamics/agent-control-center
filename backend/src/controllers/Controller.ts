import { Request, Response, NextFunction, json } from "express";
import ResponseHandler from "../helper/ResponseHandler";

const get = async (req: Request, res: Response, next: NextFunction) => {
  let result = await global.mongoConnection
    .collection("controller")
    .findOne({ controller: req.body.controller });

  return ResponseHandler.createResponse(
    res,
    200,
    result == null
      ? {
          accountAccessKey: "",
          globalAnalyticsAccountName: "",
        }
      : result
  );
};

const add = async (req: Request, res: Response, next: NextFunction) => {
  let result = await global.mongoConnection
    .collection("controller")
    .insertOne(req.body);

  return ResponseHandler.createResponse(res, 200, result);
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  let updateJSON = req.body;
  delete updateJSON._id;
  let result = await global.mongoConnection
    .collection("controller")
    .updateOne({ controller: req.body.controller }, { $set: updateJSON });

  return ResponseHandler.createResponse(res, 200, result);
};

export default { get, add, update };
