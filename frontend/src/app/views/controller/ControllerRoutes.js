import Loadable from "app/components/Loadable";
import { lazy } from "react";

const ControllerHome = Loadable(lazy(() => import("./ControllerHome")));

const controllerRoutes = [{ path: "/controller", element: <ControllerHome /> }];

export default controllerRoutes;
