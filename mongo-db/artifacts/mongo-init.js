// USER PARA DATABASE AGENT
db.createUser({
  user: "appd",
  pwd: "appd",
  roles: [
    { role: "clusterMonitor", db: "admin" },
    { role: "read", db: "admin" },
  ],
});

// ==> ACCESS_KEY
db = db.getSiblingDB("ACC");
db.createCollection("access_key");
db.access_key.insertMany([
  {
    name: "AWS - Service Certificate",
    type: "ssh-key",
    userName: "centos",
    password: "",
    privateKey: "/app/.ssh/aws-services.cer",
    token: "",
    logFile: "",
  },
]);

// ==> CONTROLLER
db.createCollection("controller");

// ==> PACKAGE
db.createCollection("package");
db.package.insertMany([
  {
    name: "Ansible Test",
    type: "APM",
    applicationName: "fdumont Ansible Test",
    tiers: [
      {
        tierName: "TOMCAT",
        restartApp: true,
        tierType: "java",
        applicationServer: "tomcat",
        applicationServerConfigFile: "/opt/apache-tomcat-8.5.79/bin/setenv.sh",
        inventoryType: "static",
        inventory:
          "[linux]\nansible-1 ansible_host=174.129.98.150 ansible_user=centos\n\n[linux:vars]\nansible_ssh_private_key_file=~/.ssh/fdumont.cer\n\n",
      },
    ],
  },
]);

// ==> TASKS
db.createCollection("task");
