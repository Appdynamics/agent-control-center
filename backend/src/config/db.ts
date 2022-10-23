import { MongoClient } from "mongodb";

// https://www.w3schools.com/nodejs/nodejs_mongodb_query.asp
// https://www.luiztools.com.br/post/tutorial-crud-em-node-js-com-driver-nativo-do-mongodb/
// https://www.npmjs.com/package/mongodb

const MONGODB_CONNECTION: any =
  process.env.MONGODB_CONNECTION || "mongodb://localhost:27017";

const connect = async () => {
  const client = new MongoClient(MONGODB_CONNECTION);
  await client.connect();
  console.log("==> MongoDB Connected <==");
  global.mongoConnection = client.db("ACC");
};

exports.main = async function () {
  await connect();
};
