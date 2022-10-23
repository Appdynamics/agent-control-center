import {  Box, Divider, Grid } from "@mui/material";
import _ from "lodash";
import { H4, H5,  Paragraph } from "app/components/Typography";
import Moment from "react-moment";

const AgentDetail = ({ agent, source }) => {

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

  function canUpgrade() {
    return true;
  }

  function getSource() {
    let detail = {};
    if (source === "health") {
      detail = agent.agentDetail;
    } else if (source === "update") {
      detail = agent;
    }
    return detail;
  }

  function checkValue(key) {
    try {
      let detail = getSource();

      if (key === "applicationName") {
        return detail.application.name;
      } else if (key === "nodeName") {
        return detail.applicationComponent.name;
      } else if (key === "tierName") {
        return detail.applicationComponentNode.name;
      } else if (key === "machineName") {
        return detail.applicationComponentNode.machineName;
      } else if (key === "machineOSType") {
        return detail.applicationComponentNode.machineOSType.name;
      } else if (key === "ipAddress") {
        return detail.applicationComponentNode.metaInfo;
      } else if (key === "agentVersion") {
        return detail.applicationComponentNode.appAgent.agentVersion;
      } else if (key === "latestAgentRuntime") {
        return detail.applicationComponentNode.appAgent.latestAgentRuntime;
      } else if (key === "installDir") {
        return detail.applicationComponentNode.appAgent.installDir;
      } else if (key === "lastStartTime") {
        return detail.applicationComponentNode.appAgent.lastStartTime;
      }
    } catch (error) {
    return "N/A";
    }
  }

  return (
    <Grid item md={12} xs={12}>
      <H4 sx={{ mt: 0, mb: 1 }}>AGENT DETAIL</H4>
      <Divider />
      <Box display="flex" justifyContent="flex-start">
        <H5 sx={{ mt: 2, mb: 1, width: 200 }}>Application</H5>
        <Box p={1}/>
        <Paragraph sx={{ mt: 2, mb: 1 }}>{checkValue("applicationName")}</Paragraph>
      </Box>
      <Box display="flex" justifyContent="flex-start">
        <H5 sx={{mb: 1, width: 200}}>Tier</H5>
        <Box p={1}/>
        <Paragraph sx={{ mb: 1 }}>{checkValue("tierName")}</Paragraph>
      </Box>
      <Box display="flex" justifyContent="flex-start">
        <H5 sx={{mb: 1, width: 200}}>Node</H5>
        <Box p={1}/>
        <Paragraph sx={{ mb: 1 }}>{checkValue("nodeName")}</Paragraph>
      </Box>
      <Box display="flex" justifyContent="flex-start">
        <H5 sx={{mb: 1, width: 200}}>Machine Name</H5>
        <Box p={1}/>
        <Paragraph sx={{ mb: 1 }}>{checkValue("applicationName")} [ {checkValue("machineOSType")} ]</Paragraph>
      </Box>
      { canUpgrade() && [
        <Box key="1" display="flex" justifyContent="flex-start">
          <H5 sx={{mb: 1, width: 200}}>AppDynamics IP Address</H5>
          <Box p={1}/>
          <Paragraph sx={{ mb: 1 }}>{findIp(checkValue("ipAddress"))}</Paragraph>
        </Box>,
        <Box key="2" display="flex" justifyContent="flex-start">
          <H5 sx={{mb: 1, width: 200}}>Current Version</H5>
          <Box p={1}/>
          <Paragraph sx={{ mb: 1 }}>{checkValue("agentVersion")}</Paragraph>
        </Box>,
        <Box key="3" display="flex" justifyContent="flex-start">
          <H5 sx={{mb: 1, width: 200}}>Latest Agent Runtime</H5>
          <Box p={1}/>
          <Paragraph sx={{ mb: 1 }}>{checkValue("latestAgentRuntime")}</Paragraph>
        </Box>,
        <Box key="4" display="flex" justifyContent="flex-start">
          <H5 sx={{mb: 1, width: 200}}>Install Directory</H5>
          <Box p={1}/>
          <Paragraph sx={{ mb: 1 }}>{checkValue("installDir")}</Paragraph>
        </Box>,
        <Box key="5" display="flex" justifyContent="flex-start">
          <H5 sx={{mb: 1, width: 200}}>Last Start Time</H5>
          <Box p={1}/>
          <Paragraph sx={{ mb: 1 }}>
            <Moment>
              {checkValue("lastStartTime")}
            </Moment>
          </Paragraph>          
        </Box>
      ]}

    </Grid>
  );
};


export default AgentDetail;
