export const constants = {
  TASK_STATUS_AGENT_TYPE_NOT_FOUND: "AGENT_TYPE_NOT_FOUND",
  TASK_STATUS_COMPLETED: "COMPLETED",
  TASK_STATUS_PENDING: "PENDING",
  TASK_STATUS_ERROR: "ERROR",
  TASK_STATUS_RUNNING: "RUNNING",

  ANSIBLE_PROJECT:
    process.env.ANSIBLE_PROJECT ||
    "/Users/fdumont/Developer/GitHub/appdynamics-ansible",
  ANSIBLE_ACC_HOME:
    process.env.ANSIBLE_ACC_HOME ||
    "/Users/fdumont/Developer/GitHub/agent-control-center/ansible/acc",
  ANSIBLE_APPD_HOME:
    process.env.ANSIBLE_APPD_HOME ||
    "/Users/fdumont/Developer/GitHub/agent-control-center/ansible/appd",
  TEMPLATES_FOLDER:
    process.env.TEMPLATES_FOLDER ||
    "/Users/fdumont/Developer/GitHub/agent-control-center/backend/src/templates",
  FOLDER_AGENT_FILES:
    process.env.FOLDER_AGENT_FILES ||
    "/Users/fdumont/Developer/GitHub/agent-control-center/ansible/agent-files",
};
