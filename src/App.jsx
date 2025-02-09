import { BrowserRouter, Route, Routes } from "react-router";
import RootProvider from "./providers/RootProvider";
import IndexLayout from "./layouts/IndexLayout";
import IndexPage from "./pages/IndexPage";
import { LazyLoginPage, LazyPlayBattlePage, LazyPlayPage, LazyRoomPage } from "./routes";
import AppLayout from "./layouts/AppLayout";
import { ProtectedRoute } from "./providers/AuthProvider";
import { RoomProvider } from "./providers/RoomProvider";

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
            <Route
              path="/play"
              element={
                <ProtectedRoute>
                  <LazyPlayPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room/:roomId"
              element={
                <ProtectedRoute>
                  <RoomProvider>
                    <LazyRoomPage />
                  </RoomProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="play/battle"
              element={
                <ProtectedRoute>
                  <LazyPlayBattlePage />
                </ProtectedRoute>
              }
            />
            <Route path="login" element={<LazyLoginPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RootProvider>
  );
}
