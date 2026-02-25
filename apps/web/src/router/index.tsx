import { createBrowserRouter } from "react-router-dom";
import ClientRequestForm from "../deer-ticket";
import { AppRoutes } from "./routes";

const router = createBrowserRouter([
  {
    path: AppRoutes.BASE.key,
    // element: <App/>,
    children: [
      {
        path: AppRoutes.BASE.DEER.pageA,
        element: <ClientRequestForm />,
      },
    ],
  },
]);

export { router };
