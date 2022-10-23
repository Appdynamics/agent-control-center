import Loadable from "app/components/Loadable";
import { lazy } from "react";

const TaskHome = Loadable(lazy(() => import("./TaskHome")));

const taskRoutes = [{ path: "/tasks", element: <TaskHome /> }];

export default taskRoutes;
