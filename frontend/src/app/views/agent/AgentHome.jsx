import {
  Box,
  Button,
  Icon,
  IconButton,
  Grow,
  styled,
  TextField,
  Tabs,
  Tab,
  FormControlLabel,
  Switch
} from "@mui/material";
import Breadcrumb from "app/components/Breadcrumb";
import { useEffect, useState } from "react";
import AgentUpdate from "./AgentUpdate";
import { getAllAgents } from "./AgentService";
import { MatxLoading } from "app/components";
import MUIDataTable from "mui-datatables";
import _ from "lodash";
import AgentHealth from "./AgentHealth";
import { useSnackbar } from "notistack";

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  width: "150px"
}));

const FlexBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
}));

const AgentHome = () => {
  const [uid, setUid] = useState(null);
  const [agentList, setAgentList] = useState([]);
  const [shouldOpenUpdate, setShouldOpenUpdate] = useState(false);
  const [shouldOpenHealth, setShouldOpenHealth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [state, setState] = useState({ justUpgraded: true });
  const { enqueueSnackbar } = useSnackbar();

  const handleDialogUpdateClose = (forceRefresh = true) => {
    setShouldOpenUpdate(false);
    if ( forceRefresh ) {
      refresh(false);
    }
  };

  const handleDialogHealthClose = (forceRefresh = true) => {
    setShouldOpenHealth(false);
    if ( forceRefresh ) {
      refresh(false);
    }
  };

  const refresh = (_force, _justUpgraded) => {
    setLoading(true);

    let typeAgent = "app";
    if (tabIndex === 1) {
      typeAgent = "machine";
    } else if (tabIndex === 2) {
      typeAgent = "database";
    } else if (tabIndex === 3) {
      typeAgent = "analytics";
    }

    if (_force === undefined) {
      _force = true;
    }

    if (_justUpgraded === undefined) {
      _justUpgraded = state.justUpgraded;
    }

    let params = `?typeAgent=${typeAgent}&force=${_force}&justUpgraded=${_justUpgraded}`;

    getAllAgents(params).then((result) => {
      const data =
        params?.indexOf("?typeAgent=analytics&") !== -1
          ? result.data.payload
          : result.data.payload.data;
      setAgentList(_.orderBy(data,["applicationName", "componentName", "nodeName", "hostName"],["asc"]));
    }).catch( (error) => enqueueSnackbar(error, { variant: "error" })).finally( () =>setLoading(false));
  };

  useEffect(() => {
    refresh(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabIndex]);

  function convertVersion(fullVersion) {
    // Examples
    // 4.5.0.0 compatible with 4.4.1.0
    // Server Agent #22.8.0.34104 v22.8.0 GA
    // Machine Agent v22.6.0-3386 GA compatible with 4.4.1.0 Build Date 2022-06-28 16:18:53

    if (fullVersion === undefined) return "";

    let shortVersion = fullVersion;
    let index = fullVersion.indexOf("compatible");
    if (index !== -1) {
      shortVersion = fullVersion.substring(0, index - 1);
    }

    if (fullVersion.indexOf("Server Agent #") !== -1) {
      shortVersion = fullVersion.substring(
        fullVersion.indexOf(" v") + 1,
        fullVersion.indexOf(" GA")
      );
    }

    if (fullVersion.indexOf("Machine Agent v") !== -1) {
      shortVersion = fullVersion.substring(
        "Machine Agent v".length,
        fullVersion.indexOf(" GA")
      );
    }
    return shortVersion;
  }

  function shortName(fullName, size) {
    if (fullName !== undefined && fullName.length > size) {
      return fullName.substring(0, size) + "...";
    } else {
      return fullName;
    }
  }

  const handleChange = (name) => (event) => {
    setState({ ...state, [name]: event.target.checked });
    refresh(false, event.target.checked);
  };

  const columns = [
    { name: "hostName", label: "Unique Host ID", 
      options: {
        filter: true,
        customBodyRenderLite: (dataIndex) => (
          shortName(agentList[dataIndex].hostName, 30)
        )
      }
    },
    { name: "agentVersion", label: "Version", 
      options: {
        filter: true,
        customBodyRenderLite: (dataIndex) => (
          convertVersion(agentList[dataIndex].agentVersion)
        )
      }
    },
    { name: "applicationName", label: "Application", options: {filter: true} },
    { name: "componentName", label: "Tier", options: {filter: true} },
    { name: "nodeName", label: "Node", options: {filter: true} },
    { name: "disabled", label: "Disabled",
      options: {
        filter: true,
        customBodyRenderLite: (dataIndex) => (
          agentList[dataIndex].disabled ? "TRUE" : "FALSE"
        )
      }
    },
    { name: "action", label: " ", 
      options: {
        filter: false,
        customBodyRenderLite: (dataIndex) => (
          <FlexBox>
            <Box flexGrow={1} />
            <IconButton onClick={() => { 
              setUid({ applicationId: agentList[dataIndex].applicationId, applicationComponentNodeId: agentList[dataIndex].applicationComponentNodeId }); 
              setShouldOpenUpdate(true); 
              }}>
              <Icon color="primary">edit</Icon>
            </IconButton>
            <IconButton onClick={() => { 
              setUid({ applicationId: agentList[dataIndex].applicationId, nodeId: agentList[dataIndex].applicationComponentNodeId }); 
              setShouldOpenHealth(true); 
              }}>
              <Icon color="primary">history</Icon>
            </IconButton>
          </FlexBox>
        ),
      }
    },
  ]

  if (loading) {
    return <MatxLoading />;
  }

  return (
    <Container>
      <div className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "AppDynamics", path: "" }, { name: "Agents" }]} />
      </div>

      <Box display="flex" justifyContent="flex-end" marginBottom="10px">
        <FormControlLabel
          label="Show only the agent can be upgraded"
          control={
            <Switch checked={state.justUpgraded} onChange={handleChange("justUpgraded")} value="justUpgraded" />
          }
        />

        <StyledButton sx={{ mb: 2 }} color="primary" variant="contained" onClick={() => refresh(true)} >
          Refresh
        </StyledButton>
      </Box>

      <Box overflow="auto">
        <Box minWidth={750}>
          <Tabs
            value={tabIndex}
            textColor="primary"
            indicatorColor="primary"
            onChange={(e, value) => setTabIndex(value)}
            sx={{ mt: 2, mb: 3 }}
          >
            {["App Server Agent", "Machine Agents", "Database Agents", "Analytics Agents"].map((item, ind) => (
              <Tab
                key={ind}
                value={ind}
                label={item}
                sx={{ px: "35px", textTransform: "capitalize" }}
              />
            ))}
          </Tabs>

          <MUIDataTable
            title={"List of Agents"}
            data={agentList}
            columns={columns}
            options={{
              filterType: "textField",
              responsive: "simple",
              selectableRows: "none",
              elevation: 0,
              rowsPerPage: 25,
              rowsPerPageOptions: [25, 50, 100 ],
              customSearchRender: (searchText, handleSearch, hideSearch, options) => {
                return (
                  <Grow appear in={true} timeout={300}>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      onChange={({ target: { value } }) => handleSearch(value)}
                      InputProps={{
                        style: { paddingRight: 0 },
                        startAdornment: (
                          <Icon fontSize="small" sx={{ mr: 1 }}>
                            search
                          </Icon>
                        ),
                        endAdornment: (
                          <IconButton onClick={hideSearch}>
                            <Icon fontSize="small">clear</Icon>
                          </IconButton>
                        ),
                      }}
                    />
                  </Grow>
                );
              },
            }}
          />

        {shouldOpenUpdate && (
          <AgentUpdate uid={uid} open={shouldOpenUpdate} handleClose={handleDialogUpdateClose} />
        )}

        {shouldOpenHealth && (
          <AgentHealth uid={uid} open={shouldOpenHealth} handleClose={handleDialogHealthClose} />
        )}

        </Box>
      </Box>
    </Container>
  );
};

export default AgentHome;
