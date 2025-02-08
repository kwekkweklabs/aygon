import { BrowserRouter, Route, Routes } from "react-router";
import RootProvider from "./providers/RootProvider";
import IndexLayout from "./layouts/IndexLayout";
import IndexPage from "./pages/IndexPage";
import { LazyLoginPage, LazyPlayPage } from "./routes";
import AppLayout from "./layouts/AppLayout";

export default function App() {
  return (
    <RootProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexLayout />}>
            <Route index element={<IndexPage />} />
            {/* Define another route or layout here */}
          </Route>
          <Route element={<AppLayout />}>
            <Route path="play" element={<LazyPlayPage />} />
            <Route path="login" element={<LazyLoginPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RootProvider>
  );
}
