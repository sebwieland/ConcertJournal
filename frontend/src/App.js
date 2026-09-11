import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { AuthProvider } from "./contexts/AuthContext";
import LoadingIndicator from "./components/utilities/LoadingIndicator";
const LandingPage = lazy(() => import("./components/LandingPage"));
const NewDataEntryFormPage = lazy(() => import("./components/entryForms/NewDataEntryPage"));
const Journal = lazy(() => import("./components/journal/Journal"));
const EditEntryFormPage = lazy(() => import("./components/entryForms/EditEntryFormPage"));
const SignUpSide = lazy(() => import("./components/signIn/SignUpSide"));
const SignInSide = lazy(() => import("./components/signIn/SignInSide"));
const AuthenticatedPage = lazy(() => import("./components/AuthenticatedPage"));
class App extends React.Component {
    render() {
        return (_jsx(AuthProvider, { children: _jsx(LocalizationProvider, { dateAdapter: AdapterDayjs, children: _jsx(BrowserRouter, { children: _jsx(Suspense, { fallback: _jsx(LoadingIndicator, {}), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(AuthenticatedPage, { element: _jsx(LandingPage, {}) }) }), _jsx(Route, { path: "/new-entry", element: _jsx(AuthenticatedPage, { element: _jsx(NewDataEntryFormPage, {}) }) }), _jsx(Route, { path: "/your-journal", element: _jsx(AuthenticatedPage, { element: _jsx(Journal, {}) }) }), _jsx(Route, { path: "/edit-entry/:id", element: _jsx(AuthenticatedPage, { element: _jsx(EditEntryFormPage, {}) }) }), _jsx(Route, { path: "/sign-up", element: _jsx(SignUpSide, {}) }), _jsx(Route, { path: "/sign-in", element: _jsx(SignInSide, {}) })] }) }) }) }) }));
    }
}
export default App;
//# sourceMappingURL=App.js.map