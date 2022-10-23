import Loadable from "app/components/Loadable";
import { lazy } from "react";

const KeyHome = Loadable(lazy(() => import("./KeyHome")));

const keyRoutes = [{ path: "/keys", element: <KeyHome /> }];

export default keyRoutes;
