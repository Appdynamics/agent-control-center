import { Request, Response, NextFunction } from "express";
import axios, { Axios, AxiosResponse } from "axios";
var moment = require("moment");
const ErrorHandler = require("../helper/ErrorHandler");

const findIds = async (
  typeAgent: string,
  controller: string,
  accessToken: string
) => {
  try {
    let URL = `${controller}/controller/restui/agents/list/appserver`;
    let filter = {};
    if (typeAgent == "app") {
      filter = {
        requestFilter: {
          queryParams: {
            applicationAssociationType: "ASSOCIATED_WITH_APPLICATION",
          },
          filters: [],
        },
        resultColumns: [],
        offset: 0,
        limit: -1,
        searchFilters: [],
        columnSorts: [{ column: "HOST_NAME", direction: "ASC" }],
        timeRangeStart: moment().subtract(24, "hours").valueOf(),
        timeRangeEnd: moment().valueOf(),
      };
    } else if (typeAgent == "machine") {
      URL = `${controller}/controller/restui/agents/list/machine`;
      filter = {
        requestFilter: {
          queryParams: { applicationAssociationType: "ALL" },
          filters: [],
        },
        resultColumns: [],
        offset: 0,
        limit: -1,
        searchFilters: [],
        columnSorts: [{ column: "HOST_NAME", direction: "ASC" }],
        timeRangeStart: moment().subtract(24, "hours").valueOf(),
        timeRangeEnd: moment().valueOf(),
      };
    } else if (typeAgent == "database") {
      URL = `${controller}/controller/restui/agent/setting/getDBAgents`;
    } else if (typeAgent == "analytics") {
      URL = `${controller}/controller/restui/analytics/agents/agentsStatus`;
    }
    let resultAppServer: any = {};
    if (typeAgent == "database" || typeAgent == "analytics") {
      resultAppServer = await axios({
        method: "get",
        url: URL,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } else {
      resultAppServer = await axios({
        method: "post",
        url: URL,
        data: filter,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }

    if (typeAgent == "analytics") {
      return resultAppServer.data;
    } else {
      return resultAppServer.data.data;
    }
  } catch (error: any) {
    throw new ErrorHandler(400, true, "", error);
  }
};

const listByIds = async (
  json: any,
  typeAgent: string,
  controller: string,
  accessToken: string
) => {
  try {
    if (json == undefined) {
      return {};
    }
    let ids: any = [];
    let URL = `${controller}/controller/restui/agents/list/appserver/ids`;
    json &&
      json.forEach(function (value) {
        if (typeAgent == "app") {
          ids.push(value.applicationComponentNodeId);
        } else if (typeAgent == "machine") {
          ids.push(value.machineId);
          URL = `${controller}/controller/restui/agents/list/machine/ids`;
        }
      });

    if (ids.length == 0) {
      return {};
    }

    let filter = {};
    if (typeAgent == "app") {
      filter = {
        requestFilter: ids,
        resultColumns: [
          "HOST_NAME",
          "AGENT_VERSION",
          "NODE_NAME",
          "COMPONENT_NAME",
          "APPLICATION_NAME",
          "DISABLED",
          "ALL_MONITORING_DISABLED",
        ],
        offset: 0,
        limit: -1,
        searchFilters: [],
        columnSorts: [{ column: "HOST_NAME", direction: "ASC" }],
        timeRangeStart: moment().subtract(24, "hours").valueOf(),
        timeRangeEnd: moment().valueOf(),
      };
    } else if (typeAgent == "machine") {
      filter = {
        requestFilter: ids,
        resultColumns: ["AGENT_VERSION", "APPLICATION_NAMES", "ENABLED"],
        offset: 0,
        limit: -1,
        searchFilters: [],
        columnSorts: [{ column: "HOST_NAME", direction: "ASC" }],
        timeRangeStart: moment().subtract(24, "hours").valueOf(),
        timeRangeEnd: moment().valueOf(),
      };
    }
    let resultIds = await axios({
      method: "post",
      url: URL,
      data: filter,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return resultIds.data;
  } catch (error) {
    throw new ErrorHandler(400, true, "", error);
  }
};

const listHelathByNodeIds = async (
  json: any,
  typeAgent: string,
  controller: string,
  accessToken: string
) => {
  if (json == undefined) {
    return {};
  }

  let ids: any = [];
  let URL = `${controller}/controller/restui/v1/nodes/list/health/ids`;
  json.forEach(function (value) {
    if (typeAgent == "app") {
      ids.push(value.applicationComponentNodeId);
    } else if (typeAgent == "machine") {
      ids.push(value.machineId);
      URL = `${controller}/controller/restui/agents/list/machine/ids`;
    }
  });

  let filter = {};
  if (typeAgent == "app") {
    filter = {
      requestFilter: ids,
      resultColumns: [
        "HEALTH",
        "APP_AGENT_STATUS",
        "APP_AGENT_VERSION",
        "VM_RUNTIME_VERSION",
        "MACHINE_AGENT_STATUS",
        "LAST_APP_SERVER_RESTART_TIME",
      ],
      offset: 0,
      limit: -1,
      searchFilters: [],
      columnSorts: [{ column: "VM_RUNTIME_VERSION", direction: "ASC" }],
      timeRangeStart: moment().subtract(24, "hours").valueOf(),
      timeRangeEnd: moment().valueOf(),
    };
  } else if (typeAgent == "machine") {
    filter = {
      requestFilter: ids,
      resultColumns: ["AGENT_VERSION", "APPLICATION_NAMES", "ENABLED"],
      offset: 0,
      limit: -1,
      searchFilters: [],
      columnSorts: [{ column: "HOST_NAME", direction: "ASC" }],
      timeRangeStart: moment().subtract(24, "hours").valueOf(),
      timeRangeEnd: moment().valueOf(),
    };
  }

  let resultIds = await axios({
    method: "post",
    url: URL,
    data: filter,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return resultIds.data;
};

const getController = async (req: Request) => {
  let controller = req.headers.ct;

  if (controller == undefined) {
    throw new ErrorHandler(200, true, "Controller not found in Header!");
  }

  return controller;
};

const getAccessToken = async (req: Request) => {
  let accessToken = req.headers.at;

  if (accessToken == undefined) {
    throw new ErrorHandler(200, true, "Access Token not found in Header!");
  }

  return accessToken;
};

export default {
  findIds,
  listByIds,
  listHelathByNodeIds,
  getController,
  getAccessToken,
};
