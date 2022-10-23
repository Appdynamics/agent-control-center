import { AppBar, Box, Button, Dialog, Grid, styled, Toolbar } from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import { MatxLoading } from "app/components";
import { H6 } from "app/components/Typography";
import { useTheme } from "@mui/system";
import { useSnackbar } from "notistack";

import { useEffect, useState } from "react";
import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
import { addNewKey, getKeyById, updateKey } from "./KeyService";

const TextField = styled(TextValidator)(() => ({
  width: "100%",
  marginBottom: "16px",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  width: "150px"
}));

const KeyForm = ({ uid, open, handleClose }) => {
  const theme = useTheme();
  const [state, setState] = useState({
    name: "",
    type: "",
    userName: "",
    privateKey: "",
  });
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (event, source) => {
    event.persist();
    setState({ ...state, [event.target.name]: event.target.value });
  };

  const handleFormSubmit = () => {
    setLoading(true);
    if ( uid !== "add"){
      updateKey({ ...state }).then(()=>{
        handleClose();
        enqueueSnackbar("Key updated!", { variant: "success" });
      }).catch( (error) => enqueueSnackbar(error, { variant: "error" })).finally( () =>setLoading(false));
    } else {
      addNewKey({ ...state, type: "ssh-key" }).then(()=>{
        handleClose();
        enqueueSnackbar("Key added!", { variant: "success" });
      }).catch( (error) => enqueueSnackbar(error, { variant: "error" })).finally( () =>setLoading(false));
    }
  };

  useEffect(() => {
    if ( uid !== "add"){
      getKeyById(uid).then((result) => {
        setState({ ...result.data.payload })
      }).catch( (error) => enqueueSnackbar(error, { variant: "error" })).finally( () =>setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  return (
    <Dialog open={open} onClose={()=>handleClose(false)} aria-labelledby="form-dialog-title" fullWidth maxWidth="sm">
      <ValidatorForm onSubmit={handleFormSubmit}>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <H6 sx={{ flex: 1, marginLeft: theme.spacing(2) }}>{uid !== "add" ? "Update" : "Add"} the Key</H6>
            <StyledButton color="secondary" sx={{ mb: 2 }} variant="outlined" onClick={()=>handleClose(false)} disabled={loading}>
              cancel
            </StyledButton>
            <StyledButton color="secondary" sx={{ mb: 2 }} variant="contained" type="submit" disabled={loading}>
              save
            </StyledButton>
          </Toolbar>
        </AppBar>

        <Box p={2}>

          {loading && <MatxLoading /> }

          {!loading && 
          <DialogContent>
            <Grid container>
              <Grid item sm={12} xs={12}>
                <TextField
                  type="text"
                  name="name"
                  label="Name"
                  value={state?.name}
                  onChange={handleChange}
                  validators={["required"]}
                  errorMessages={["this field is required"]}
                  autoFocus
                />

                <TextField
                  type="text"
                  name="userName"
                  label="User Name (optional)"
                  value={state?.userName}
                  onChange={handleChange}
                  validators={["required"]}
                  errorMessages={["this field is required"]}
                />

                <TextField
                  type="text"
                  name="privateKey"
                  label="Private Key path"
                  value={state?.privateKey}
                  onChange={handleChange}
                  validators={["required"]}
                  errorMessages={["this field is required"]}
                />

              </Grid>
            </Grid>
          </DialogContent> }

        </Box>
      </ValidatorForm> 
    </Dialog>
  );
};

export default KeyForm;
