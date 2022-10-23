import {
  Box,
  Button,
  Icon,
  IconButton,
  Grow,
  styled,
  TextField
} from "@mui/material";
import Breadcrumb from "app/components/Breadcrumb";
import ConfirmationDialog from "app/components/ConfirmationDialog";
import { useEffect, useState } from "react";
import KeyForm from "./KeyForm";
import { deleteKey, getAllKeys } from "./KeyService";
import { MatxLoading } from "app/components";
import MUIDataTable from "mui-datatables";
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

const KeyHome = () => {
  const [uid, setUid] = useState(null);
  const [key, setKey] = useState(null);
  const [keyList, setKeyList] = useState([]);
  const [shouldOpenEditorDialog, setShouldOpenEditorDialog] = useState(false);
  const [shouldOpenConfirmationDialog, setShouldOpenConfirmationDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleDialogClose = (forceRefresh = true) => {
    setShouldOpenEditorDialog(false);
    setShouldOpenConfirmationDialog(false);
    if ( forceRefresh ) {
      refresh();
    }
  };

  const handleDeleteKey = (key) => {
    setKey(key);
    setShouldOpenConfirmationDialog(true);
  };

  const handleConfirmationResponse = () => {
    setLoading(true);
    deleteKey(key).then(()=>{
      handleDialogClose()
      enqueueSnackbar("Key deleted!", { variant: "success" });
    }).catch( (error) => enqueueSnackbar(error, { variant: "error" })).finally( () =>setLoading(false));
  };

  const refresh = () => {
    setLoading(true);
    getAllKeys().then((result) => {
      setKeyList(result.data.payload);
    }).catch( (error) => enqueueSnackbar(error, { variant: "error" })).finally( () =>setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    { name: "name", label: "Name", options: {filter: true} },
    { name: "type", label: "Type", options: {filter: true} },
    { name: "userName", label: "User Name", options: {filter: true} },
    { name: "action", label: " ", 
      options: {
        filter: false,
        customBodyRenderLite: (dataIndex) => (
          <FlexBox>
            <Box flexGrow={1} />
            <IconButton onClick={() => { setUid(keyList[dataIndex]._id); setShouldOpenEditorDialog(true); }}>
              <Icon color="primary">edit</Icon>
            </IconButton>
            <IconButton onClick={() => handleDeleteKey(keyList[dataIndex])}>
              <Icon color="error">delete</Icon>
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
        <Breadcrumb routeSegments={[{ name: "Setup", path: "/keys" }, { name: "Keys" }]} />
      </div>

      <Box display="flex" justifyContent="flex-end" marginBottom="10px">
        <StyledButton  sx={{ mb: 2 }} color="primary" variant="contained"
          onClick={() => {
            setUid("add");
            setShouldOpenEditorDialog(true);
          }} >
          Add New Key
        </StyledButton>

        <StyledButton sx={{ mb: 2 }} color="primary" variant="contained" onClick={() => refresh()} >
          Refresh
        </StyledButton>
      </Box>

      <Box overflow="auto">
        <Box minWidth={750}>
          <MUIDataTable
            title={"All Keys"}
            data={keyList}
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

        {shouldOpenEditorDialog && (
          <KeyForm uid={uid} open={shouldOpenEditorDialog} handleClose={handleDialogClose} />
        )}

        {shouldOpenConfirmationDialog && (
          <ConfirmationDialog text="Are you sure to delete?"
            open={shouldOpenConfirmationDialog}
            onConfirmDialogClose={handleDialogClose}
            onYesClick={handleConfirmationResponse}
          />
        )}
        
        </Box>
      </Box>
    </Container>
  );
};

export default KeyHome;
