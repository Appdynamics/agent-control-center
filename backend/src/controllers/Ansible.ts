import { constants } from "../helper/constants";
var moment = require("moment");
const fs = require("fs");
const fsExtra = require("fs-extra");
const ErrorHandler = require("../helper/ErrorHandler");

// https://www.npmjs.com/package/replace-in-file
const replace = require("replace-in-file");

async function createPlaybook(REQ_JSON: any) {
  // ANSIBLE
  let varsFolder = "";
  let playbookFolder = "";
  let tierFolder = "";
  let playbookMain = "";

  // Senão existir o diretório com os playbooks então copiar do repositório padrão
  if (!fs.existsSync(constants.ANSIBLE_ACC_HOME)) {
    fs.mkdirSync(constants.ANSIBLE_ACC_HOME);
  }

  if (!fs.existsSync(`${constants.ANSIBLE_APPD_HOME}/playbooks`)) {
    await createAnsibleStructure();
  }

  // Playbook Folder
  playbookFolder = await getPlaybookFolder(
    REQ_JSON.application.applicationId,
    REQ_JSON.application.applicationName
  );

  // Tier Folder
  tierFolder = await getTierFolder(
    playbookFolder,
    REQ_JSON.application.tierId,
    REQ_JSON.application.tierName
  );

  fs.rmSync(`${playbookFolder}/${tierFolder}`, {
    recursive: true,
    force: true,
  });
  fs.rmSync(`${playbookFolder}/vars`, { recursive: true, force: true });
  fs.rmSync(`${playbookFolder}/hosts`, { recursive: true, force: true });
  if (!fs.existsSync(playbookFolder)) {
    fs.mkdirSync(playbookFolder);
  }
  if (!fs.existsSync(tierFolder)) {
    fs.mkdirSync(tierFolder);
  }
  if (!fs.existsSync(`${playbookFolder}/logs`)) {
    fs.mkdirSync(`${playbookFolder}/logs`);
  }

  // Creating vars/controller
  varsFolder = `${playbookFolder}/vars`;
  fs.mkdirSync(varsFolder);
  copyFile(
    `${constants.TEMPLATES_FOLDER}/controller.yaml`,
    `${varsFolder}/controller.yaml`
  );
  let options = {
    files: `${varsFolder}/controller.yaml`,
    from: [
      /"{controller_host_name}"/g,
      /"{controller_port}"/g,
      /"{controller_account_name}"/g,
      /"{controller_account_access_key}"/g,
      /"{enable_ssl}"/g,
      /"{controller_global_analytics_account_name}"/g,
    ],
    to: [
      REQ_JSON.controller.hostName,
      REQ_JSON.controller.port,
      REQ_JSON.controller.customerId,
      REQ_JSON.controller.accountAccessKey,
      REQ_JSON.controller.enableSSL,
      REQ_JSON.controller.globalAnalyticsAccountName,
    ],
  };

  await replace(options);

  // Hosts
  let contentHosts = "";
  contentHosts += `[${REQ_JSON.environment.machineOSType}]\n`;
  contentHosts += `${REQ_JSON.environment.hostName} ansible_host=${REQ_JSON.environment.ipAddress} `;
  if (REQ_JSON.key.userName != undefined && REQ_JSON.key.userName != "") {
    contentHosts += ` ansible_user=${REQ_JSON.key.userName}\n\n`;
  }

  if (REQ_JSON.key.privateKey != undefined && REQ_JSON.key.privateKey != "") {
    contentHosts += `[${REQ_JSON.environment.machineOSType}:vars]\n`;
    contentHosts += `ansible_ssh_private_key_file=${REQ_JSON.key.privateKey}\n`;
  }

  fs.writeFileSync(`${playbookFolder}/hosts`, contentHosts);

  // Particularidades de cada tipo de agente
  if (REQ_JSON.agent.subType.indexOf("jdk8_plus") != -1) {
    playbookMain = "java.yaml";
    copyFile(
      `${constants.TEMPLATES_FOLDER}/java.yaml`,
      `${tierFolder}/java.yaml`
    );
    let options = {
      files: `${tierFolder}/java.yaml`,
      from: [
        /"{agent_version}"/g,
        /"{agent_type}"/g,
        /"{application_name}"/g,
        /"{tier_name}"/g,
      ],
      to: [
        REQ_JSON.agent.version,
        REQ_JSON.agent.subType == "jdk8_plus"
          ? "java8"
          : REQ_JSON.agent.subType,
        REQ_JSON.application.applicationName,
        REQ_JSON.application.tierName,
      ],
    };

    await replace(options);

    return {
      ...REQ_JSON,
      startedAt: moment().valueOf(),
      ansible: { playbookMain: playbookMain },
    };
  }
}

async function copyFile(source: String, target: String) {
  fs.copyFileSync(source, target);
}

async function getPlaybookFolder(id: String, name: String) {
  return `${constants.ANSIBLE_ACC_HOME}/${name}.${id}`;
}

async function getTierFolder(playbookFolder: String, id: String, name: String) {
  return `${playbookFolder}/${name}.${id}`;
}

async function createAnsibleStructure() {
  let listFolders = ["/meta", "/molecule", "/playbooks"];
  listFolders.forEach((folder) => {
    fs.rmSync(`${constants.ANSIBLE_APPD_HOME}${folder}`, {
      recursive: true,
      force: true,
    });
    fsExtra.copySync(
      `${constants.ANSIBLE_PROJECT}${folder}`,
      `${constants.ANSIBLE_APPD_HOME}${folder}`
    );
  });
}

export default {
  createPlaybook,
  getPlaybookFolder,
  getTierFolder,
  copyFile,
};
