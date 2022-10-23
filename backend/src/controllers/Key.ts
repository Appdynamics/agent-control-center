import { Request, Response, NextFunction, json } from "express";
import ResponseHandler from "../helper/ResponseHandler";
var mongo = require("mongodb");

const list = async (req: Request, res: Response, next: NextFunction) => {
  let result = await global.mongoConnection
    .collection("access_key")
    .find({})
    .toArray();

  return ResponseHandler.createResponse(res, 200, result);
};

const get = async (req: Request, res: Response, next: NextFunction) => {
  let result = await global.mongoConnection
    .collection("access_key")
    .findOne({ _id: new mongo.ObjectID(req.params.id) });

  return ResponseHandler.createResponse(res, 200, result);
};

const add = async (req: Request, res: Response, next: NextFunction) => {
  let result = await global.mongoConnection
    .collection("access_key")
    .insertOne(req.body);

  return ResponseHandler.createResponse(res, 200, result);
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  let updateJSON = req.body;
  let _id = new mongo.ObjectID(req.body._id);
  delete updateJSON._id;
  let result = await global.mongoConnection
    .collection("access_key")
    .updateOne({ _id: _id }, { $set: updateJSON });

  return ResponseHandler.createResponse(res, 200, result);
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  let result = await global.mongoConnection
    .collection("access_key")
    .deleteOne({ _id: new mongo.ObjectID(req.params.id) });

  return ResponseHandler.createResponse(res, 200, result);
};

export default { list, get, add, update, remove };
