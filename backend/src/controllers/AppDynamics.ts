import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { LocalStorage } from "node-localstorage";
import appdHelper from "../helper/appdHelper";
import ResponseHandler from "../helper/ResponseHandler";
var moment = require("moment");

var localStorage = new LocalStorage("./scratch");

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let signIn = req.body;
    let controller: any = await appdHelper.getController(req);

    let responseRequest = await axios({
      method: "post",
      url: `${controller}/auth/v1/oauth/token`,
      data: `grant_type=client_credentials&client_id=${signIn.clientName}@${signIn.customerId}&client_secret=${signIn.clientSecret}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return ResponseHandler.createResponse(
      res,
      200,
      responseRequest.data.access_token
    );
  } catch (error: any) {
    if (error.response.status) {
      return ResponseHandler.createResponse(res, 200, "Unauthorized", true);
    } else {
      next(error);
    }
  }
};

const listAgents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let accessToken: any = await appdHelper.getAccessToken(req);
    let controller: any = await appdHelper.getController(req);

    let typeAgent: any = req.query.typeAgent;

    let lastExecute = localStorage.getItem(
      `listAgent.lastExecute.${typeAgent}.${controller}`
    );
    let resultIds = localStorage.getItem(
      `listAgent.data.${typeAgent}.${controller}`
    );

    if (
      lastExecute == undefined ||
      (Date.now() - lastExecute) / 1000 / 60 >
        (process.env.TIMEOUT_REFRESH || 1440) ||
      req.query.force == "true" ||
      !resultIds ||
      resultIds == "{}"
    ) {
      let listIds = await appdHelper.findIds(
        typeAgent,
        controller,
        accessToken
      );
      if (typeAgent == "analytics") {
        resultIds = listIds;
      } else {
        resultIds = await appdHelper.listByIds(
          listIds,
          typeAgent,
          controller,
          accessToken
        );
        // resultIds = await appdHelper.listHelathByNodeIds(
        //   resultIds.data,
        //   typeAgent,
        //   accessToken
        // );
      }
      localStorage.setItem(
        `listAgent.lastExecute.${typeAgent}.${controller}`,
        Date.now()
      );
      localStorage.setItem(
        `listAgent.data.${typeAgent}.${controller}`,
        JSON.stringify(resultIds)
      );
    } else {
      resultIds = JSON.parse(resultIds);
    }

    // Filtring justUpgraded
    if (
      req.query.justUpgraded &&
      req.query.justUpgraded == "true" &&
      resultIds.data != undefined
    ) {
      resultIds.data = resultIds.data.filter(
        (item: any) => item.type != "NODEJS_APP_AGENT"
      );
    }

    return ResponseHandler.createResponse(res, 200, resultIds);
  } catch (error: any) {
    next(error);
  }
};

const getAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let accessToken: any = await appdHelper.getAccessToken(req);
    let controller: any = await appdHelper.getController(req);

    let applicationComponentNodeId = req.params.applicationComponentNodeId;
    let applicationId = req.params.applicationId;
    let URL = `${controller}/controller/restui/components/getNodeViewData/${applicationId}/${applicationComponentNodeId}`;

    let resultAppServer = await axios({
      method: "get",
      url: URL,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return ResponseHandler.createResponse(res, 200, resultAppServer.data);
  } catch (error) {
    next(error);
  }
};

const getAgentNodeAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let accessToken: any = await appdHelper.getAccessToken(req);
    let controller: any = await appdHelper.getController(req);

    let applicationId = req.params.applicationId;
    let tierId = 0;
    let nodeId = req.params.nodeId;
    let interval: any = req.params.interval || 60;

    let applicationName = "";
    let tierName = "";
    let nodeName = "";

    let responseRequest;
    let resultAPI;
    let agentDetail;

    // BUSCANDO ID'S NECESSÁRIOS PARA PESQUISA
    responseRequest = await axios({
      method: "get",
      url: `${controller}/controller/restui/components/getNodeViewData/${applicationId}/${nodeId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    agentDetail = await responseRequest.data;

    applicationName = agentDetail.application.name;
    tierId = agentDetail.applicationComponent.id;
    tierName = agentDetail.applicationComponent.name;
    nodeName = agentDetail.applicationComponentNode.name;

    responseRequest = await axios({
      method: "get",
      url: `${controller}/controller/rest/applications/${applicationName}/metric-data?metric-path=Application Infrastructure Performance|${tierName}|Individual Nodes|${nodeName}|Agent|App|Availability&time-range-type=BEFORE_NOW&rollup=false&duration-in-mins=${interval}&output=JSON`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    resultAPI = await responseRequest.data;

    let firstHistory: any = [];
    if (resultAPI != undefined && resultAPI.length > 0) {
      for (let index = 0; index < resultAPI[0].metricValues.length; index++) {
        const element = resultAPI[0].metricValues[index];
        const newElement = {
          x: moment(element.startTimeInMillis).format("YYYY/MM/DD HH:mm"),
          y: element.value * 100,
        };
        firstHistory.push(newElement);
      }
    }

    let before = undefined;
    let finalHistory: any = [];
    firstHistory.forEach((item: any) => {
      let current = moment(item.x);
      if (before == undefined) {
        before = current;
      }

      let diffMinutes = current.diff(before, "minutes");

      if (diffMinutes > 1) {
        for (let index = 1; index < diffMinutes; index++) {
          finalHistory.push({
            x: moment(before).add(index, "minutes").format("YYYY/MM/DD HH:mm"),
            y: 0,
          });
        }
      }
      finalHistory.push({ x: current.format("YYYY/MM/DD HH:mm"), y: item.y });
      before = current;
    });

    // ADICIONANDO MÉTRICAS DA ÚLTIMA PARADA ATÉ O MOMENTO ATUAL
    if (finalHistory.length > 0) {
      let lastItem = finalHistory[finalHistory.length - 1];
      let diffMinutesFromNow = moment().diff(lastItem.x, "minutes");
      for (let index = 1; index <= diffMinutesFromNow - 2; index++) {
        finalHistory.push({
          x: moment(lastItem.x)
            .add(index, "minutes")
            .format("YYYY/MM/DD HH:mm"),
          y: 0,
        });
      }
    }

    return ResponseHandler.createResponse(res, 200, {
      name: "Availability",
      applicationName: applicationName,
      tierName: tierName,
      nodeName: nodeName,
      agentDetail: agentDetail,
      data: finalHistory,
    });
  } catch (error) {
    next(error);
    // throw new ErrorHandler(400, true, "", error);
    // let json = JSON.parse(JSON.stringify(error as any));
    // return res
    //   .status(json.status || 500)
    //   .json({ message: json.message || error.message });
  }
};

const getAgentVersions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let accessToken: any = await appdHelper.getAccessToken(req);
    let controller: any = await appdHelper.getController(req);
    let latest = req.params.latest || "false";

    let URL = `${controller}/zero/v1beta/install/agentVersions?latest=${latest}&osType=linux`;

    let result = await axios({
      method: "get",
      url: URL,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return ResponseHandler.createResponse(res, 200, result.data.items);
  } catch (error) {
    next(error);
    // throw new ErrorHandler(400, true, "", error);
    // let json = JSON.parse(JSON.stringify(error as any));
    // return res
    //   .status(json.status || 500)
    //   .json({ message: json.message || json });
  }
};

export default {
  login,
  listAgents,
  getAgent,
  getAgentNodeAvailability,
  getAgentVersions,
};
