import axios from "axios";

const ErrorHandler = require("../helper/ErrorHandler");
var moment = require("moment");

async function findSystemId(
  accessToken: string,
  controller: string,
  applicationName: string,
  hostName: string
) {
  // try {
  let request = await axios({
    method: "get",
    url: `${controller}/zero/v1beta/maintenance/systemInfos`,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  let result = await request.data;

  console.log("====result", result);

  result = result.items.filter(
    (item: any) =>
      item.hostname == hostName && item.applicationName == applicationName
  );

  if (!result || result.length == 0) {
    throw new ErrorHandler(
      200,
      true,
      "The agent was not identified as a ZFI [ System ID not found ]"
    );
  }
  return result[0];
  // } catch (error) {
  //   console.log("bbbbb", error);
  //   throw new ErrorHandler(400, true, "", error);
  //   // throw new ErrorHandler(
  //   //   400,
  //   //   true,
  //   //   error.response ? error.response.data.detail : error
  //   // );
  // }
}

async function upgradeAgent(
  accessToken: string,
  controller: string,
  data: string
) {
  // console.log("====3");
  // try {
  // try {
  let request = await axios({
    method: "post",
    url: `${controller}/zero/v1beta/maintenance/upgrade/systems`,
    data: data,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  let result = await request.data;
  // } catch (error) {
  //   console.log("====5", error);
  // }

  return result;

  // } catch (error) {
  //   console.log("aaaaa", error);
  //   // throw new ErrorHandler(400, true, error.response.data.detail);
  //   throw new ErrorHandler(400, true, "", error);
  // }
}

async function maintenanceHistory(
  accessToken: string,
  controller: string,
  maintenanceId: string
) {
  // try {
  let request = await axios({
    method: "get",
    url: `${controller}/zero/v1beta/maintenance/history/${maintenanceId}`,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  let result = await request.data;

  return result;
  // } catch (error: any) {
  //   // throw new ErrorHandler(400, true, error.response.data.detail);
  //   throw new ErrorHandler(400, true, "", error);
  // }
}

async function systemMaintenancesHistory(
  accessToken: string,
  controller: string,
  maintenanceId: string
) {
  // try {
  let request = await axios({
    method: "get",
    url: `${controller}/zero/v1beta/maintenance/history/${maintenanceId}/systemMaintenances`,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  let result = await request.data;

  return result;
  // } catch (error: any) {
  //   // throw new ErrorHandler(400, true, error.response.data.detail);
  //   throw new ErrorHandler(400, true, "", error);
  // }
}

async function systemMaintenancesLog(
  accessToken: string,
  controller: string,
  systemMaintenanceId: string
) {
  try {
    let request = await axios({
      method: "get",
      url: `${controller}/zero/v1beta/maintenance/systemMaintenances/${systemMaintenanceId}/log`,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    let result = await request.data;

    return result;
  } catch (error: any) {
    // throw new ErrorHandler(400, true, error.response.data.detail);
    throw new ErrorHandler(400, true, "", error);
  }
}

async function createTask(
  accessToken: string,
  controller: string,
  REQ_JSON: any
) {
  let systemInfo: any;
  let currentVersion: any;
  let upgrade: any;

  // try {
  // BUSCANDO OS AGENTES ZFI E SUAS VERSÕES
  systemInfo = await findSystemId(
    accessToken,
    controller,
    REQ_JSON.application.applicationName,
    REQ_JSON.environment.hostName
  );
  // VERIFICANDO SE A VERSÃO DO AGENTE É A MESMA JÁ INSTALADA
  currentVersion = systemInfo.curVersions.filter((item: any) => {
    item.type.toLowerCase() == REQ_JSON.agent.subType.toLowerCase() &&
      item.version == REQ_JSON.agent.version;
  });
  if (!currentVersion || currentVersion.length > 0) {
    throw new ErrorHandler(
      200,
      true,
      "It's not possible to upgrade to the same version."
    );
  }
  if (!currentVersion || currentVersion.length > 0) {
    throw new ErrorHandler(
      200,
      true,
      "It's not possible to upgrade to the same version."
    );
  }

  upgrade = {
    systemDetails: [
      {
        systemId: systemInfo.systemId,
        hostname: systemInfo.hostname,
      },
    ],
    versions: [
      {
        type: "JDK8_PLUS",
        version: REQ_JSON.agent.version,
      },
    ],
  };

  upgrade = await upgradeAgent(accessToken, controller, upgrade);

  return {
    ...REQ_JSON,
    startedAt: moment(upgrade.startedAt).valueOf(),
    zfi: { systemInfo: systemInfo, upgrade: upgrade },
  };
  // } catch (error: any) {
  //   // throw new ErrorHandler(
  //   //   400,
  //   //   true,
  //   //   error.response ? error.response.data.detail : error
  //   // );
  //   console.log("yyyyy", error);
  //   throw new ErrorHandler(400, true, "", error);
  // }
}

export default {
  createTask,
  maintenanceHistory,
  systemMaintenancesHistory,
  systemMaintenancesLog,
};
