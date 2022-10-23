import { Alert, AlertTitle, AppBar, Box, Button, Dialog, Grid, Slide, styled, Toolbar, MenuItem } from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import { H6 } from "app/components/Typography";
import { forwardRef } from "react";
import { useTheme } from "@mui/system";
import { useEffect, useState } from "react";
import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
import { createTask, getAgentById, getAgentVersions } from "./AgentService";
import { getAllKeys } from "../key/KeyService";
import _ from "lodash";
import AgentDetail from "./AgentDetail";
import { MatxLoading } from "app/components";
import { useSnackbar } from "notistack";

const TextField = styled(TextValidator)(() => ({
  width: "100%",
  marginBottom: "16px",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  width: "150px"
}));

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AgentUpdate = ({ uid, open, handleClose }) => {
  const theme = useTheme();
  const [keyList, setKeyList] = useState([]);
  const [agentList, setAgentList] = useState([]);
  const [state, setState] = useState({ agentVersion: "", keyId: ""});
  const [loading, setLoading] = useState(false);
  const [componentType, setComponentType] = useState("");
  const [currentAgent, setCurrentAgent] = useState({});
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (event, source) => {
    if ( event.persist ) {
      event.persist();
    }
    setState({ ...state, [event.target.name]: event.target.value });
  };

  function findIp(values) {
    if ( values === "N/A") return values;

    let ip = _.filter(values, (item) =>
      item.name.toLowerCase().includes("appdynamics.ip.addresses")
    );

    if (ip !== undefined && ip.length > 0) {
      ip = ip[0];

      if (ip.value.indexOf(",") !== -1) {
        return ip.value.substring(ip.value.indexOf(",") + 1, ip.value.length);
      } else {
        return ip.value;
      }
    } else {
      return "not found";
    }
  }
    
  const handleFormSubmit = () => {

    let key = _.filter(keyList, (item) => item._id === state.keyId)[0];
    if (!key) {
      key = { type: "", userName: "", password: "", privateKey: "" };
    }

    let serverAddress = findIp(currentAgent.applicationComponentNode.metaInfo);
    let newAgent = _.filter(
      agentList.descriptions,
      (item) => item.version === state.agentVersion
    )[0];

    let task = {
      application: {
        applicationId: currentAgent.application.id,
        tierId: currentAgent.applicationComponent.id,
        nodeId: currentAgent.applicationComponentNode.id,
        agentId: currentAgent.applicationComponentNode.appAgent.id,
        applicationName: currentAgent.application.name,
        tierName: currentAgent.applicationComponent.name,
        nodeName: currentAgent.applicationComponentNode.name,
      },
      environment: {
        hostName: currentAgent.applicationComponentNode.machineName,
        ipAddress: serverAddress,
        machineOSType: currentAgent.applicationComponentNode.machineOSType.name,
      },
      controller: {
        controller: localStorage.getItem("controller"),
      },
      agent: {
        type: isAgentIntalller() ? "zfi" : "legacy",
        subType: "jdk8_plus",
        version: newAgent.version,
        s3Path: newAgent.s3Path,
      },
      key: {
        type: key.type,
        userName: key.userName,
        password: key.password,
        privateKey: key.privateKey,
      },
    };

    setLoading(true);
    createTask(task).then((result)=>{
      enqueueSnackbar("Task created!", { variant: "success" });
      handleClose(false);
    }).catch((error) => {
      enqueueSnackbar(error, { variant: "error" })
    }).finally( () =>setLoading(false));

  };

  useEffect(() => {
    setLoading(true);
    setAgentList([]);

    getAllKeys().then((result) => {

      setKeyList(result.data.payload);
      
      getAgentVersions({latest: false}).then((resultVersion)=>{
      
        getAgentById(uid).then((resultAgent)=>{
          let _agent = resultAgent.data.payload;
          let componentType =_agent.applicationComponentNode.componentType.productType;
          let agentType = _agent.applicationComponentNode.appAgent.type;
          let agentRuntime = _agent.applicationComponentNode.appAgent.latestAgentRuntime;

          setComponentType(componentType);

          if (agentType === "APP_AGENT") {
            if (
              agentRuntime.toUpperCase().indexOf("JDK") !== -1 ||
              agentRuntime.toUpperCase().indexOf("JRE") !== -1 ||
              agentRuntime.toUpperCase().indexOf("JAVA") !== -1
            ) {
              setAgentList(
                _.filter(resultVersion.data.payload[0].agents, (item) =>
                  item.agentType.toLowerCase().includes("jdk8_plus")
                )[0]
              );
            }
          } else {
            setAgentList([]);
          }
        
          setCurrentAgent(_agent);
          setLoading(false);
        }).catch( (error) => {enqueueSnackbar(error, { variant: "error" }); setLoading(false)});

      }).catch( (error) => {enqueueSnackbar(error, { variant: "error" }); setLoading(false)});      

    }).catch( (error) => {enqueueSnackbar(error, { variant: "error" }); setLoading(false)});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  function canUpgrade() {
    if (componentType && componentType !== "open-telemetry" && componentType !== "DOT_NET_APP_AGENT") {
      return true;
    } else {
      return false;
    }
  }

  function isAgentIntalller() {
    try {
      return (
        currentAgent.applicationComponentNode.appAgent.installDir.indexOf("zeroagent") !== -1
      );
    } catch (error) {
      return false;
    }
  }
  return (
    <Dialog open={open} onClose={()=>handleClose(false)} aria-labelledby="form-dialog-title" TransitionComponent={Transition} fullWidth maxWidth="lg">
      <ValidatorForm onSubmit={handleFormSubmit}>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <H6 sx={{ flex: 1, marginLeft: theme.spacing(2) }}>Update the agent version</H6>
            <StyledButton color="secondary" sx={{ mb: 2 }} variant="outlined" onClick={()=>handleClose(false)} disabled={loading}>
              cancel
            </StyledButton>
            <StyledButton color="secondary" sx={{ mb: 2 }} variant="contained" type="submit" disabled={loading || !canUpgrade()}>
              create task
            </StyledButton>
          </Toolbar>
        </AppBar>

        <Box p={1}>

          {loading && <MatxLoading />}

          {!loading && !canUpgrade() && (
            <Alert severity="info" className="mt-24">
              <AlertTitle>INFO</AlertTitle>
              That kind of agent cannot be updated remotely.
            </Alert>
          )}
        
        {!loading && (
            <DialogContent>
              <Grid sx={{ mb: "16px" }} container spacing={4}>
                <Grid item sm={12} xs={12}>

                  <AgentDetail agent={currentAgent} source="update" />

                  { canUpgrade() && 
                    <TextField
                      sx={{ mt: 2}}
                      select
                      name="agentVersion"
                      label="New Agent Version"
                      value={state.agentVersion}
                      onChange={handleChange}
                      validators={["required"]}
                      autoFocus
                      errorMessages={["this field is required"]}
                    >
                      { agentList !== undefined && agentList?.descriptions?.map((item)=>(
                        <MenuItem value={item.version} key={item.version}>
                          {item.version}
                        </MenuItem>
                      ))}
                    </TextField>
                  }
                  
                  { canUpgrade() && !isAgentIntalller() &&
                    <TextField
                      sx={{ mt: 2}}
                      select
                      name="keyId"
                      label="SSH Connect"
                      value={state.keyId}
                      onChange={handleChange}
                      validators={["required"]}
                      errorMessages={["this field is required"]}
                    >
                      { keyList !== undefined && keyList?.map((item)=>(
                        <MenuItem value={item._id} key={item._id}>
                          {item.name} [ {item.type} ]
                        </MenuItem>
                      ))}
                    </TextField>
                  }

                </Grid>
              </Grid>

            </DialogContent>
        )}
        </Box>
      </ValidatorForm>
    </Dialog>
  );
};

export default AgentUpdate;
