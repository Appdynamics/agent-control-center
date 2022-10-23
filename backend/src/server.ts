// ==> PRINCIPAL https://www.section.io/engineering-education/how-to-create-a-simple-rest-api-using-typescript-and-nodejs
// https://github.com/TL-Developer/API_RESTFul_NODEJS
// https://hevodata.com/learn/building-a-secure-node-js-rest-api/
// Exemplo de interceptação no AXIO: https://reflectoring.io/tutorial-guide-axios/
// Mais intercept no AXIO: https://blog.bitsrc.io/setting-up-axios-interceptors-for-all-http-calls-in-an-application-71bc2c636e4e
// Variável Global: https://javascript.plainenglish.io/typescript-and-global-variables-in-node-js-59c4bf40cb31

import http from "http";
import express, { Express } from "express";
import morgan from "morgan";
import cors from "cors";
import routes from "./helper/routes";
// import playbookServices from "./services/playbookServices";
var playbookServices = require("./services/playbookServices");

import axios from "axios";
var mongoDB = require("./config/db");

const router: Express = express();

async function main() {
  /** This package extends your Express Rest API’s logging capabilities. */
  // router.use(morgan("dev"));
  router.use(morgan("combined"));
  /** Parse the request */
  router.use(express.urlencoded({ extended: false }));
  /** Takes care of JSON data */
  router.use(express.json());
  /** Cors, will allow your API to receive requests from cross domains. */
  router.use(cors());

  /** RULES OF OUR API */
  // axios.interceptors.request.use((req) => {
  //   try {
  //     if (
  //       req.url?.indexOf("controller/api/oauth/access_token") == -1 &&
  //       req.url?.indexOf("appdynamics.com") != -1
  //     ) {
  //       req.headers = {
  //         ...req.headers,
  //         "Content-Type": "application/json;charset=UTF-8",
  //         Authorization: `Bearer ${global.ACCESS_TOKEN}`,
  //       };
  //     }
  //     return req;
  //   } catch (error) {
  //     return req;
  //   }
  // });

  router.use((req, res, next) => {
    // set the CORS policy
    res.header("Access-Control-Allow-Origin", "*");
    // set the CORS headers
    res.header(
      "Access-Control-Allow-Headers",
      "origin, X-Requested-With,Content-Type,Accept, Authorization"
    );
    // set the CORS method headers
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "GET PATCH DELETE POST");
      return res.status(200).json({});
    }
    next();
  });

  /** Routes */
  router.use("/", routes);

  /** Error handling */
  router.use((req, res, next) => {
    const error = new Error("not found");
    return res.status(404).json({
      message: error.message,
    });
  });

  // Persistence variables
  // await mongoDB.connect;
  await mongoDB.main();

  /** Server */
  const httpServer = http.createServer(router);

  const PORT: any = process.env.PORT ?? 8080;
  httpServer.listen(PORT, () =>
    console.log(`The server is running on port ${PORT}`)
  );

  playbookServices.main();
}

main();
