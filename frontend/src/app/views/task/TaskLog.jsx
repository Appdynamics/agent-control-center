import { AppBar, Box, Button, Dialog, Grid, Slide, styled, Toolbar, Tabs, Tab, TextField } from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import { H6 } from "app/components/Typography";
import { forwardRef } from "react";
import { useTheme } from "@mui/system";
import { useEffect, useState } from "react";
import { getTaskLog } from "./TaskService";
import { MatxLoading } from "app/components";
import { useSnackbar } from "notistack";

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  width: "150px"
}));

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TaskLog = ({ uid, open, handleClose }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [logFile, setLogFile] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  function refresh() {
    setLoading(true);

    let filterLog = "undefined";

    if (tabIndex === 0) {
      filterLog = "run";
    } else if (tabIndex === 1) {
      filterLog = "error";
    }

    getTaskLog({_id: uid, typeLog: filterLog}).then((result)=>{
      setLogFile(result.data.payload);
    }).catch( (error) => enqueueSnackbar(error, { variant: "error" })).finally( () =>setLoading(false));

  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabIndex]);

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" TransitionComponent={Transition} fullWidth fullScreen>
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <H6 sx={{ flex: 1, marginLeft: theme.spacing(2) }}>Task log</H6>
          <StyledButton color="secondary" sx={{ mb: 2 }} variant="outlined" onClick={handleClose}>
            close
          </StyledButton>
          <StyledButton color="secondary" sx={{ mb: 2 }} variant="contained" onClick={refresh} disabled={loading}>
            refresh
          </StyledButton>
        </Toolbar>
      </AppBar>

      <Box p={1}>
        {loading && <MatxLoading /> }

        <Tabs
          value={tabIndex}
          textColor="primary"
          indicatorColor="primary"
          onChange={(e, value) => setTabIndex(value)}
          sx={{ mt: 2, mb: 3 }}
        >
          {["PROCESS", "ERROR"].map((item, ind) => (
            <Tab
              key={ind}
              value={ind}
              label={item}
              sx={{ px: "35px", textTransform: "capitalize" }}
            />
          ))}
        </Tabs>

      {!loading && (
          <DialogContent>
            <Grid sx={{ mb: "16px" }} container spacing={4}>
              <Grid item sm={12} xs={12}>
                <TextField
                  minRows={10}
                  multiline
                  fullWidth
                  size="small"
                  value={logFile}
                />                
              </Grid>
            </Grid>
          </DialogContent>
      )}
      </Box>
    </Dialog>
  );
};

export default TaskLog;
