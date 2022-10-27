# AppDynamics Agent Control Center [ ACC ]

[![published](https://static.production.devnetcloud.com/codeexchange/assets/images/devnet-published.svg)](https://developer.cisco.com/codeexchange/github/repo/Appdynamics/agent-control-center)

The purpose of this utility is a web interface extension of AppDynamics for viewing agents status in Appdynamics, with the ability to check their health history and perform the agent version upgrade.

## Requirements

- Virtual Machine (4 vCPU and 8GB memory)
- Docker
- Docker-compose

## Execution the utility

The first step is to build the container images locally by running the command **./build-docker.sh all**

The second step is to start the containers by running the command **./start.sh**

To stop ACC run the command **./stop.sh**

## How to use

After starting the Agent Control Center, go to **http://localhost** address in your Web Browser.

To log into the ACC it is necessary to create an access token in the AppDynamics interface, if you already have the token, skip to the next topic.

In the AppDynamics admin interface click on "API Clients" and then on "Create".

![01](https://github.com/Appdynamics/agent-control-center/blob/main/docimages/Create-API-Token-01.png?raw=true)

Enter the following fields:

- Client Name: will be used on the Login screen
- Client Secret: Click on the "Generate Secret" button and copy the value informed, it will be used on the Login screen. Save in a safe place as this value will no longer be visible.
- Default Token Expiration: change it to 24 hours
- Roles: click on the "Add" button and add the available roles

Click on the Save button.

![02](https://github.com/Appdynamics/agent-control-center/blob/main/docimages/Create-API-Token-02.png?raw=true)

Now the login can be performed, fill in the fields as requested, including the Token data created in the previous step.

![03](https://github.com/Appdynamics/agent-control-center/blob/main/docimages/Login-01.png?raw=true)

After logging in, it is necessary to configure the Access Key and the Global Account Name. Click on the Controller item on the side menu and fill in the values that can be found in the AppDynamics license interface.

![04](https://github.com/Appdynamics/agent-control-center/blob/main/docimages/Controller-01.png?raw=true)

Some agents will be updated using ansible playbook and other agents through their own APIs.

For agents updated with ansible it is necessary to configure access to the server where the agent is running. This access is safe and performed within the client's environment, no external access is necessary and only the customer will have access to the ACC server where the access key will be configured.

To configure access (certificate), follow these steps:

- Place a certificate of access to the server where the agent is running on the server where the ACC is running, for example in the path: /home/user_services/.ssh/user_services.cer
- Click on KEYS menu item
- Click on "Add" new key

Now agents can be updated!

![05](https://github.com/Appdynamics/agent-control-center/blob/main/docimages/Keys-01.png?raw=true)

To list the agents, click on the Agents item in the side menu.

![06](https://github.com/Appdynamics/agent-control-center/blob/main/docimages/AgentsfromAppD-01.png?raw=true)

To update the agent version, click on the "play" corresponding to the agent.

The interface will automatically identify the agent type and ask for the information needed to update the agent. Enter the requested data and click on "Create Task"

![07](https://github.com/Appdynamics/agent-control-center/blob/main/docimages/UpdateAgent-02.png?raw=true)

An Ansilbe or API task will be created, depending on the type of the recognition agent automatically.

To see the result of the update, click on the Task item in the menu and then on the task to be viewed.

![08](https://github.com/Appdynamics/agent-control-center/blob/main/docimages/Task-01.png?raw=true)

![09](https://github.com/Appdynamics/agent-control-center/blob/main/docimages/Task-02.png?raw=true)

IMPORTANT: the application needs to be restarted to recognize the new agent version.
