import ansibleController from "../controllers/Ansible";
import { constants } from "../helper/constants";
var moment = require("moment");
const fs = require("fs");
import axios from "axios";
const util = require("util");
const stream = require("stream");
const pipeline = util.promisify(stream.pipeline);

async function preSetup() {
  console.log(`\n=> Loading setup`);
  run();
}

async function run() {
  try {
    console.log(`\n=> RUN`);

    let result = await global.mongoConnection
      .collection("task")
      .find({
        status: constants.TASK_STATUS_PENDING,
      })
      .toArray();

    result.forEach((task: any) => {
      runTask(task);
    });
  } catch (error) {
  } finally {
    setTimeout(function () {
      run();
    }, 5000);
  }
}

async function runTask(task: any) {
  await updateFields(task, { status: constants.TASK_STATUS_RUNNING });
  if (task.agent.type == "legacy") {
    await runLegacyTask(task);
  } else if (task.agent.type == "zfi") {
    await runZFITask(task);
  } else {
    await updateFields(task, {
      status: constants.TASK_STATUS_AGENT_TYPE_NOT_FOUND,
    });
  }
}

async function runZFITask(task: any) {
  await updateFields(task, {
    status: constants.TASK_STATUS_RUNNING,
  });
}

async function runLegacyTask(task: any) {
  let playbookFolder = await ansibleController.getPlaybookFolder(
    task.application.applicationId,
    task.application.applicationName
  );

  let tierFolder = await ansibleController.getTierFolder(
    playbookFolder,
    task.application.tierId,
    task.application.tierName
  );

  // Verifying if thereis the agent file
  await downloadAgent(task.agent.s3Path);

  let logFileName = `${task.application.tierName.trim()}_${moment().format(
    "YYYY-MM-DD-HH-mm-ss"
  )}_run.log`;

  runCmd(
    task,
    `${constants.ANSIBLE_APPD_HOME}/run-playbook.sh ${task._id} ${task.ansible.playbookMain} ${playbookFolder} ${tierFolder} ${logFileName} ${constants.ANSIBLE_APPD_HOME}`,
    `${playbookFolder}/logs/${logFileName}`
  );

  updateFields(task, { ansible: { ...task.ansible, logFile: logFileName } });
}

async function downloadAgent(s3Path: String) {
  try {
    let fileNameAux = s3Path.split("/");
    let fileName = fileNameAux[fileNameAux.length - 1];

    if (!fs.existsSync(`${constants.FOLDER_AGENT_FILES}`)) {
      fs.mkdirSync(constants.FOLDER_AGENT_FILES);
    }

    if (!fs.existsSync(`${constants.FOLDER_AGENT_FILES}/${fileName}`)) {
      const request = await axios.get(
        `https://download-files.appdynamics.com/${s3Path}`,
        {
          responseType: "stream",
        }
      );
      await pipeline(
        request.data,
        await fs.createWriteStream(
          `${constants.FOLDER_AGENT_FILES}/${fileName}`
        )
      );
      console.log(`=> Download pdf pipeline successful [${fileName}]`);
    }

    let folderTarget = `${constants.ANSIBLE_APPD_HOME}/playbooks/roles/java/files`;
    if (!fs.existsSync(folderTarget)) {
      fs.mkdirSync(folderTarget);
    }
    if (!fs.existsSync(`${folderTarget}/${fileName}`)) {
      fs.copyFileSync(
        `${constants.FOLDER_AGENT_FILES}/${fileName}`,
        `${folderTarget}/${fileName}`
      );
    }
  } catch (error) {
    console.error("download pdf pipeline failed", error);
  }
}

function runCmd(task: any, cmd: any, logFileName: string) {
  // https://stackabuse.com/executing-shell-commands-with-node-js/
  // https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js

  const { exec } = require("child_process");
  exec(cmd, (error: any, stdout: any, stderr: any) => {
    if (error) {
      updateFields(task, { status: constants.TASK_STATUS_ERROR });
      saveFile(logFileName.replace("_run.log", "_error.log"), error);
      return;
    }
    if (stderr) {
      updateFields(task, { status: constants.TASK_STATUS_ERROR });
      saveFile(logFileName.replace("_run.log", "_error.log"), stderr);
      return;
    }
    updateFields(task, { status: constants.TASK_STATUS_COMPLETED });
    saveFile(logFileName.replace("_run.log", "_done.log"), stdout);
  });
}

async function updateFields(task: any, fields: any) {
  await global.mongoConnection.collection("task").updateOne(
    {
      _id: task._id,
    },
    { $set: fields }
  );
}

async function saveFile(fileName: string, content: any) {
  fs.writeFileSync(fileName, content.toString());
}

exports.main = async function () {
  await preSetup();
};
