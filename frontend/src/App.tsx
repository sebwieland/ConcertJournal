import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthProvider } from "./contexts/AuthContext";
import { ConfigProvider } from "./contexts/ConfigContext";
import LoadingIndicator from "./components/utilities/LoadingIndicator";
import DefaultLayout from "./theme/DefaultLayout";
import { Alert } from "@mui/material";

const LandingPage = lazy(() => import("./components/LandingPage"));
const NewDataEntryFormPage = lazy(() => import("./components/entryForms/NewDataEntryPage"));
const Journal = lazy(() => import("./components/journal/Journal"));
const EditEntryFormPage = lazy(() => import("./components/entryForms/EditEntryFormPage"));
const SignUpSide = lazy(() => import("./components/signIn/SignUpSide"));
const SignInSide = lazy(() => import("./components/signIn/SignInSide"));
const AuthenticatedPage = lazy(() => import("./components/AuthenticatedPage"));

class App extends React.Component<{}, {}> {
    componentDidMount() {
        // Development logging removed
    }

    componentWillUnmount() {
        // Development logging removed
    }

    render() {
        return (
            <ConfigProvider>
                <AuthProvider>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <BrowserRouter>
                            <Suspense fallback={<LoadingIndicator />}>
                                <Routes>
                                    <Route path="/" element={<AuthenticatedPage element={<LandingPage />} />} />
                                    <Route path="/new-entry" element={<AuthenticatedPage element={<NewDataEntryFormPage />} />} />
                                    <Route path="/your-journal" element={<AuthenticatedPage element={<Journal />} />} />
                                    <Route path="/edit-entry/:id" element={<AuthenticatedPage element={<EditEntryFormPage />} />} />
                                    <Route path="/sign-up" element={<SignUpSide />} />
                                    <Route path="/sign-in" element={<SignInSide />} />
                                </Routes>
                            </Suspense>
                        </BrowserRouter>
                    </LocalizationProvider>
                </AuthProvider>
            </ConfigProvider>
        );
    }
}

export default App;