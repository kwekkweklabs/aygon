import { Spinner } from "@heroui/react";
import { lazy } from "react";
import Suspended from "./components/utils/Suspended";

const _LazyIndexLayout = lazy(() => import("./layouts/IndexLayout"));
const _LazyIndexPage = lazy(() => import("./pages/IndexPage"));
const _LazyPlayPage = lazy(() => import("./pages/PlayPage"));
const _LazyPlayBattlePage = lazy(() => import("./pages/PlayBattlePage"));
const _LazyLoginPage = lazy(() => import("./pages/LoginPage"));

const LazyRouteLoadingSpinner = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Spinner color="primary" />
    </div>
  );
};

export const LazyIndexLayout = () => (
  <Suspended loading={<LazyRouteLoadingSpinner />}>
    <_LazyIndexLayout />
  </Suspended>
);

export const LazyIndexPage = () => (
  <Suspended loading={<LazyRouteLoadingSpinner />}>
    <_LazyIndexPage />
  </Suspended>
);

export const LazyPlayPage = () => (
  <Suspended loading={<LazyRouteLoadingSpinner />}>
    <_LazyPlayPage />
  </Suspended>
);

export const LazyPlayBattlePage = () => (
  <Suspended loading={<LazyRouteLoadingSpinner />}>
    <_LazyPlayBattlePage />
  </Suspended>
);

export const LazyLoginPage = () => (
  <Suspended loading={<LazyRouteLoadingSpinner />}>
    <_LazyLoginPage />
  </Suspended>
);
