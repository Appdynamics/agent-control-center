import { Request, Response, NextFunction, json } from "express";
var mongo = require("mongodb");

const list = async (req: Request, res: Response, next: NextFunction) => {
  let result = await global.mongoConnection
    .collection("package")
    .find({})
    .toArray();

  return res.status(200).json({ message: result });
};

const get = async (req: Request, res: Response, next: NextFunction) => {
  let result = await global.mongoConnection
    .collection("package")
    .findOne({ _id: new mongo.ObjectID(req.params.id) });

  return res.status(200).json({ message: result });
};

const add = async (req: Request, res: Response, next: NextFunction) => {
  let result = await global.mongoConnection
    .collection("package")
    .insertOne(req.body);

  return res.status(200).json({ message: result });
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  let updateJSON = req.body;
  let _id = new mongo.ObjectID(req.body._id);
  delete updateJSON._id;
  let result = await global.mongoConnection
    .collection("package")
    .updateOne({ _id: _id }, { $set: updateJSON });

  return res.status(200).json({ message: result });
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  let result = await global.mongoConnection
    .collection("package")
    .deleteOne({ _id: new mongo.ObjectID(req.params.id) });

  return res.status(200).json({ message: result });
};

export default { list, get, add, update, remove };
