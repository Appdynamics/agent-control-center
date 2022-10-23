import { LoadingButton } from '@mui/lab';
import { Card,  Grid, TextField } from '@mui/material';
import { Box, styled } from '@mui/system';
import { MatxLoading } from 'app/components';
import useAuth from 'app/hooks/useAuth';
import { Formik } from 'formik';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useSnackbar } from "notistack";

const FlexBox = styled(Box)(() => ({ display: 'flex', alignItems: 'center' }));

const JustifyBox = styled(FlexBox)(() => ({ justifyContent: 'center' }));

const ContentBox = styled(Box)(() => ({
  height: '100%',
  padding: '32px',
  position: 'relative',
  background: 'rgba(0, 0, 0, 0.01)',
}));

const JWTRoot = styled(JustifyBox)(() => ({
  background: '#1A2038',
  minHeight: '100% !important',
  '& .card': {
    maxWidth: 800,
    minHeight: 500,
    margin: '1rem',
    display: 'flex',
    borderRadius: 12,
    alignItems: 'center',
  },
}));

// inital login credentials
let initialValues = {
  controllerUrl: localStorage.getItem("controllerUrl")|| "xxx-controller.saas.appdynamics.com",
  controllerPort: localStorage.getItem("controllerPort")|| "443",
  customerId: localStorage.getItem("customerId")|| "",
  clientName: localStorage.getItem("clientName")|| "",
  clientSecret: localStorage.getItem("clientSecret")|| "",
  // remember: true,
};

// form field validation schema
const validationSchema = Yup.object().shape({
  controllerUrl: Yup.string().required("Please enter your Controller."),
  controllerPort: Yup.string().required("Please enter your Controller Port."),
  customerId: Yup.string().required("Please enter your Customer ID."),
  clientName: Yup.string().required("You must enter a Client Name"),
  clientSecret: Yup.string().required("Please enter your Client Secret."),
});

const JwtLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const { login } = useAuth();

  const handleFormSubmit = async (values) => {
    setLoading(true);
    try {
      let sslEnable = values.controllerPort === "443" ? true: false;

      let indexSlash = values.controllerUrl.indexOf("//");
      if (indexSlash === -1) {
        values.controllerUrl = (sslEnable ? "https://" : "http://") + values.controllerUrl;
      }

      localStorage.setItem("controllerUrl", values.controllerUrl);
      localStorage.setItem("controllerPort", values.controllerPort);
      localStorage.setItem("controllerSsl", sslEnable);
      localStorage.setItem("customerId", values.customerId);
      localStorage.setItem("clientName", values.clientName);
      localStorage.setItem("controller", values.controllerUrl + ":" + values.controllerPort);

      // if ( values.remember) {
      localStorage.setItem("clientSecret", values.clientSecret);
      // }

      await login(values.customerId, values.clientName, values.clientSecret);
      setLoading(false);
      navigate('/');
    } catch (e) {
      enqueueSnackbar(e.data.payload, { variant: "error" });
      initialValues = {
        controllerUrl: localStorage.getItem("controllerUrl")|| "xxx-controller.saas.appdynamics.com",
        controllerPort: localStorage.getItem("controllerPort")|| "443",
        customerId: localStorage.getItem("customerId")|| "",
        clientName: localStorage.getItem("clientName")|| "",
        clientSecret: localStorage.getItem("clientSecret")|| "",
        // remember: true,
      }      
      setLoading(false);
    }
  };

  if (loading) {
    return <MatxLoading />;
  }

  return (
    <JWTRoot>
      <Card className="card">
        <Grid container>
          <Grid item sm={6} xs={12}>
            <JustifyBox p={10} height="100%" sx={{ minWidth: 320 }}>
              <img src="/assets/images/logo/appd-logo-transp.png" width="100%" alt="" />
            </JustifyBox>
          </Grid>
          <Grid item sm={6} xs={12}>
            <ContentBox>
              <Formik
                onSubmit={handleFormSubmit}
                initialValues={initialValues}
                validationSchema={validationSchema}
                enableReinitialize
              >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                  <form onSubmit={handleSubmit}>
                   <TextField
                      fullWidth
                      size="small"
                      name="controllerUrl"
                      label="Controller"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.controllerUrl}
                      onChange={handleChange}
                      helperText={touched.controllerUrl && errors.controllerUrl}
                      error={Boolean(errors.controllerUrl && touched.controllerUrl)}
                      sx={{ mb: 3 }}
                    />
                    
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      name="controllerPort"
                      label="Port"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.controllerPort}
                      onChange={handleChange}
                      helperText={touched.controllerPort && errors.controllerPort}
                      error={Boolean(errors.controllerPort && touched.controllerPort)}
                      sx={{ mb: 3 }}
                    />

                    {/* <FormControlLabel
                      label="Enable SSL"
                      labelPlacement="start"
                      control={<Switch
                        value="controllerSsl"
                        checked={values.controllerSsl}
                        onChange={handleChange("controllerSsl")}
                      />}
                    /> */}

                    <TextField
                      fullWidth
                      size="small"
                      name="customerId"
                      label="Customer ID"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.customerId}
                      onChange={handleChange}
                      helperText={touched.customerId && errors.customerId}
                      error={Boolean(errors.customerId && touched.customerId)}
                      sx={{ mb: 3 }}
                    />

                    <TextField
                      fullWidth
                      size="small"
                      name="clientName"
                      label="Client Name"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.clientName}
                      onChange={handleChange}
                      helperText={touched.clientName && errors.clientName}
                      error={Boolean(errors.clientName && touched.clientName)}
                      sx={{ mb: 3 }}
                    />

                    <TextField
                      fullWidth
                      size="small"
                      type="password"
                      name="clientSecret"
                      label="Client Secret"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.clientSecret}
                      onChange={handleChange}
                      helperText={touched.clientSecret && errors.clientSecret}
                      error={Boolean(errors.clientSecret && touched.clientSecret)}
                      sx={{ mb: 3 }}
                    />

                    <LoadingButton
                      type="submit"
                      color="primary"
                      loading={loading}
                      variant="contained"
                      sx={{ my: 2 }}
                    >
                      Login
                    </LoadingButton>

                  </form>
                )}
              </Formik>
            </ContentBox>
          </Grid>
        </Grid>
      </Card>

    </JWTRoot>
  );
};

export default JwtLogin;
