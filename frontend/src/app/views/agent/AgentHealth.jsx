import { AppBar, Box, Button, Dialog, Grid, Slide, styled, Toolbar, Chip } from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import { H2, H6 } from "app/components/Typography";
import { forwardRef } from "react";
import { useTheme } from "@mui/system";
import { useEffect, useState } from "react";
import { getAgentHealth } from "./AgentService";
import AgentDetail from "./AgentDetail";
import AgentHealthMetric from "./AgentHealthMetric";
import { convertHexToRGB } from "app/utils/utils";
import { MatxLoading } from "app/components";
import { useSnackbar } from "notistack";

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  width: "150px"
}));

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AgentHealth = ({ uid, open, handleClose }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [listMetric, setListMetric] = useState("");
  const [interval, setInterval] = useState(60);
  const [currentAgent, setCurrentAgent] = useState({});
  const { palette } = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const refresh = () => {
    setLoading(true);
    getAgentHealth({...uid, interval: interval}).then((result) => {
      setCurrentAgent(result.data.payload.agentDetail);
      setListMetric(result.data.payload);
    }).catch( (error) => enqueueSnackbar(error, { variant: "error" })).finally( () =>setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval]);

  return (
    <Dialog open={open} onClose={()=>handleClose(false)} aria-labelledby="form-dialog-title" TransitionComponent={Transition} fullWidth maxWidth="lg">
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <H6 sx={{ flex: 1, marginLeft: theme.spacing(2) }}>Agent Health Check</H6>
            <StyledButton color="secondary" sx={{ mb: 2 }} variant="contained" onClick={()=>handleClose(false)}>
              close
            </StyledButton>
          </Toolbar>
        </AppBar>

        <Box p={1}>

        {loading && <MatxLoading />}

        {!loading && (
          <DialogContent>
            <Grid sx={{ mb: "16px" }} container spacing={4}>
              <Grid item sm={12} xs={12}>
                <AgentDetail agent={currentAgent} source="update" loading={loading}  />

                <Box display="flex" justifyContent="flex-start" sx={{mt: 2}}>
                  <H2 >Metric [ {listMetric.name} ]</H2>
                  <Chip sx={{ml: 10}} label="1 hora" color={interval === 60 ? "secondary" : "default"}
                    onClick={() => {setInterval(60);}}/>

                  <Chip sx={{ml: 2}}label="6 horas" color={interval === 360 ? "secondary" : "default"}
                    onClick={() => {setInterval(360);}}/>

                  <Chip sx={{ml: 2}}label="12 horas" color={interval === 720 ? "secondary" : "default"}
                    onClick={() => {setInterval(720);}}/>
                </Box>

                <AgentHealthMetric
                  chartData={[
                    { name: "Availability", data: listMetric.data },
                  ]}
                  colors={[
                    `rgba(${convertHexToRGB(palette.primary.main)}, 0.4)`,
                  ]}
                  height={380}
                />
              </Grid>
            </Grid>

          </DialogContent>
        )}
        </Box>
    </Dialog>
  );
};

export default AgentHealth;
