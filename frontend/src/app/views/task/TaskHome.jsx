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
} from "@mui/material";
import Breadcrumb from "app/components/Breadcrumb";
import { useEffect, useState } from "react";
import TaskLog from "./TaskLog";
import { getAllTasks } from "./TaskService";
import { MatxLoading } from "app/components";
import MUIDataTable from "mui-datatables";
import _ from "lodash";
import Moment from "react-moment";
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

const TaskHome = () => {
  const [uid, setUid] = useState(null);
  const [taskList, setTaskList] = useState([]);
  const [shouldOpenLog, setShouldOpenLog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const { enqueueSnackbar } = useSnackbar();

  const handleDialogLogClose = () => {
    setShouldOpenLog(false);
    refresh();
  };

  const refresh = () => {
    setLoading(true);

    let filterTask = "undefined";

    if (tabIndex === 0) {
      filterTask = "running";
    } else if (tabIndex === 1) {
      filterTask = "pending";
    } else if (tabIndex === 2) {
      filterTask = "error";
    } else if (tabIndex === 3) {
      filterTask = "completed";
    } else if (tabIndex === 4) {
      filterTask = "all";
    }

    getAllTasks(filterTask).then((result) => {
      setTaskList(_.orderBy(result.data.payload, ["startedAt"],["desc"]));
    }).catch( (error) => enqueueSnackbar(error, { variant: "error" })).finally( () =>setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabIndex]);

  const columns = [
    { name: "applicationName", label: "Application", 
      options: {
        filter: false,
        customBodyRenderLite: (dataIndex) => (
          taskList[dataIndex].application.applicationName
        )
      }
    },
    { name: "startedAt", label: "Started", 
      options: {
        filter: false,
        customBodyRenderLite: (dataIndex) => (
          <Moment>
            {taskList[dataIndex].startedAt ? taskList[dataIndex].startedAt : ""}
          </Moment>
        )
      }
    },
    { name: "tierName", label: "Tier",
      options: {
        filter: false,
        customBodyRenderLite: (dataIndex) => (
          taskList[dataIndex].application.tierName
        )
      }
    },
    { name: "status", label: "Status", options: {filter: true} },
    { name: "action", label: " ", 
      options: {
        filter: false,
        customBodyRenderLite: (dataIndex) => (
          <FlexBox>
            <Box flexGrow={1} />
            <IconButton onClick={() => { 
                setUid(taskList[dataIndex]._id); 
                setShouldOpenLog(true); 
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
        <Breadcrumb routeSegments={[{ name: "AppDynamics", path: "" }, { name: "Tasks" }]} />
      </div>

      <Box display="flex" justifyContent="flex-end" marginBottom="10px">
        <StyledButton sx={{ mb: 2 }} color="primary" variant="contained" onClick={() => refresh()} >
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
            {["RUNNING", "PENDING", "ERROR", "COMPLETED", "ALL"].map((item, ind) => (
              <Tab
                key={ind}
                value={ind}
                label={item}
                sx={{ px: "35px", textTransform: "capitalize" }}
              />
            ))}
          </Tabs>

          <MUIDataTable
            title={"List of Tasks"}
            data={taskList}
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

        {shouldOpenLog && (
          <TaskLog uid={uid} open={shouldOpenLog} handleClose={handleDialogLogClose} />
        )}

        </Box>
      </Box>
    </Container>
  );
};

export default TaskHome;
