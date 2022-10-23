import Loadable from "app/components/Loadable";
import { lazy } from "react";

const AgentHome = Loadable(lazy(() => import("./AgentHome")));

const agentRoutes = [{ path: "/agents", element: <AgentHome /> }];

export default agentRoutes;
