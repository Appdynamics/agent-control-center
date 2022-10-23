import '../fake-db';
import { Provider } from 'react-redux';
import { useRoutes } from 'react-router-dom';
import { MatxTheme } from './components';
import { AuthProvider } from './contexts/JWTAuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Store } from './redux/Store';
import routes from './routes';
import axios from "axios";
import { environment } from './utils/environment';

/**
 * Axios HTTP Request defaults
 */
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

const App = () => {
  const content = useRoutes(routes);
  return (
    <Provider store={Store}>
      <SettingsProvider>
        <MatxTheme>
          <AuthProvider>{content}</AuthProvider>
        </MatxTheme>
      </SettingsProvider>
    </Provider>
  );
};

export default App;
