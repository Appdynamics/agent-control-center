import {
  Button,
  Icon,
  styled,
  Grid,
} from "@mui/material";
import Breadcrumb from "app/components/Breadcrumb";
import { useEffect, useState } from "react";
import { getControllerByURL, addNewController, updateController } from "./ControllerService";
import { MatxLoading, SimpleCard } from "app/components";
import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
import { Span } from "app/components/Typography";
import { useSnackbar } from "notistack";

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));

const TextField = styled(TextValidator)(() => ({
  width: "100%",
  marginBottom: "16px",
}));

const ControllerHome = () => {
  const [state, setState] = useState({ accountAccessKey: "", globalAnalyticsAccountName: "" });
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (event, source) => {
    event.persist();
    setState({ ...state, [event.target.name]: event.target.value });
  };

  const handleFormSubmit = () => {
    setLoading(true);

    let controllerHostName = localStorage.getItem("controllerUrl");
    let indexSlash = controllerHostName.indexOf("//");
    if (indexSlash !== -1) {
      controllerHostName = controllerHostName.substring(indexSlash + 2);
    }

    let item = {
      ...state,
      controller: localStorage.getItem("controller"),
      hostName: controllerHostName,
      port: localStorage.getItem("controllerPort"),
      enableSSL: localStorage.getItem("controllerSsl"),
      customerId: localStorage.getItem("customerId"),
    };

    if ( item._id === undefined ) {
      addNewController(item).then((result)=> {
        setState({ accountAccessKey: "", globalAnalyticsAccountName: "" });
        refresh(true);
        enqueueSnackbar("Controller added!", { variant: "success" });
      }).catch( (error) => enqueueSnackbar(error, { variant: "error" })).finally( () =>setLoading(false));
    } else {
      updateController(item).then((result)=> {
        setState({ accountAccessKey: "", globalAnalyticsAccountName: "" });
        refresh(true);
        enqueueSnackbar("Controller updated!", { variant: "success" });
      }).catch( (error) => enqueueSnackbar(error, { variant: "error" })).finally( () =>setLoading(false));
    }
  };

  const refresh = (force) => {
    if ( state.accountAccessKey === "" || force ) {
      setLoading(true);
      getControllerByURL({controller: localStorage.getItem("controller")}).then((result) => {
        setState(result.data.payload);
      }).catch( (error) => enqueueSnackbar(error, { variant: "error" })).finally( () =>setLoading(false));
    }
  };

  useEffect(() => {
    refresh(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <MatxLoading />;
  }

  return (
    <Container>
      <div className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "Setup", path: "/controller" }, { name: "Controller" }]} />
      </div>

      <SimpleCard title="Controller Update">
        <ValidatorForm onSubmit={handleFormSubmit}>
            <Grid sx={{ mb: "16px" }} container spacing={4}>
              <Grid item sm={6} xs={6}>
                <TextField
                  type="text"
                  name="accountAccessKey"
                  label="Account Access Key"
                  value={state?.accountAccessKey}
                  onChange={handleChange}
                  validators={["required"]}
                  errorMessages={["this field is required"]}
                />

                <TextField
                  type="text"
                  name="globalAnalyticsAccountName"
                  label="Global Analytics Account Name"
                  value={state?.globalAnalyticsAccountName}
                  onChange={handleChange}
                />

                <Button color="primary" variant="contained" type="submit">
                  <Icon>send</Icon>
                  <Span sx={{ pl: 1, textTransform: "capitalize" }}>Save</Span>
                </Button>
                                
              </Grid>
            </Grid>
        </ValidatorForm>
      </SimpleCard>
    </Container>
  );
};

export default ControllerHome;
