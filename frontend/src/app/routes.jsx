import { Navigate } from 'react-router-dom';
import AuthGuard from 'app/auth/AuthGuard';
import NotFound from 'app/views/sessions/NotFound';
import MatxLayout from './components/MatxLayout/MatxLayout';

import sessionRoutes from 'app/views/sessions/SessionRoutes';
import keyRoutes from "app/views/key/KeyRoutes";
import controllerRoutes from "app/views/controller/ControllerRoutes";
import agentRoutes from "app/views/agent/AgentRoutes";
import taskRoutes from "app/views/task/TaskRoutes";

const routes = [
  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [...keyRoutes, ...controllerRoutes, ...agentRoutes, ...taskRoutes],
  },
  ...sessionRoutes,
  { path: '/', element: <Navigate to="agents" /> },
  { path: '*', element: <NotFound /> },
];

export default routes;
