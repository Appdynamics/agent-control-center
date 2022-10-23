import { environment } from "app/utils/environment";
import axios from "axios";

// const axiosInstance = axios.create();

axios.defaults.baseURL = environment.ACC_API_SERVER;
axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
axios.defaults.headers.common["Content-Type"] =
  "application/json; charset=UTF-8";

axios.interceptors.request.use((req) => {
  try {
    let accessToken = localStorage.getItem("accessToken") || "";
    let controller = localStorage.getItem("controller") || "";
    req.headers = {
      ...req.headers,
      at: accessToken,
      ct: controller,
    };
    return req;
  } catch (error) {
    return req;
  }
});

axios.interceptors.response.use(
  function (response) {
    // console.log("==== response", response);
    if (response.data) {
      // return success
      if (
        (response.status === 200 || response.status === 201) &&
        response.data.isError !== undefined &&
        !response.data.isError
      ) {
        return response;
      }

      //   if (response.data.payload != "Unauthorized") {
      //     showMessage(response.data.payload);
      //   }

      // console.log("==== response [REJECT]");
      // reject errors & warnings
      return Promise.reject(response.data.payload);
    }

    // default fallback
    return Promise.reject(response);
  },
  function (error) {
    // if the server throws an error (404, 500 etc.)
    // console.log("=====first error [", error, "]");
    let message =
      error.message || error.detail || error || "Something wrong happened";
    let statusCode = 500;

    // console.log("=====debug", error.data.isError, error.data.payload);

    // erro técnico
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      message =
        "Are you connected to the Internet? Please check and try again!";
    } else if (error.code === "ERR_BAD_REQUEST") {
      if (error.response && error.response.data) {
        message = error.response.data.detail;
      } else {
        if (error.message === "Request failed with status code 401") {
          message = "Your token is expired.";
          statusCode = 401;
        } else {
          console.log("CHECK ERROR 1===", error);
        }
      }
    } else if (error.code === "ERR_BAD_RESPONSE") {
      if (error.response && error.response.data) {
        message = error.response.data.detail;
      } else {
        console.log("CHECK ERROR 2===", error);
      }
    } else if (error.isError) {
      message = error.detail;
    } else {
      console.log("CHECK ERROR F===", error);
    }

    try {
      if (message.indexOf("should be higher than current") !== -1) {
        message = "You should select a new version higher than current version";
      }
    } catch (error) {}

    // console.log("====error message [", message, "]");

    if (
      statusCode === 401 ||
      message === "Request failed with status code 401"
    ) {
      window.location.href = "/session/signin";
    }

    // showMessage(message);

    // Swal.fire({
    //   position: "top-end",
    //   icon: "error",
    //   text: message,
    //   timer: 2000,
    //   timerProgressBar: true,
    //   confirmButtonColor: "secondary",
    // });

    // style={{ color: theme.palette.primary.main, marginLeft: 5 }}

    return Promise.reject(message);
  }
);
export default axios;
