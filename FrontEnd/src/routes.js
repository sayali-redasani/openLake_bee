import { useRoutes } from "react-router-dom";
import Home from "./pages/Home/Home";

const Router = () => {
  const routes = useRoutes([
    {
      path: "",
      children: [
        {
          path: "/",
          element: <Home />,
        },
      ],
    },
  ]);
  return routes;
};

export default function AppRouter() {
  return (
    <>
      <Router />
    </>
  );
}
