import React, { useState } from "react";
import { AuthService } from "../services/AuthService";
import { APIAuthService } from "../services/APIAuthService";
import { DataService } from "../services/DataService";
import AppContext,  { IAppError } from "./AppContext";

const AppContextProvider: React.FC = ({ children }: { children: React.ReactNode }) => {
    const [ authService ] = useState<AuthService>(() => new AuthService());
    const [ apiAuthService ] = useState<APIAuthService>(() => new APIAuthService());
    const [ dataService ] = useState<DataService>(() => new DataService(apiAuthService));
    const [ appError, setAppError ] = useState<IAppError>();

    const clearError = () => appError ? setAppError(null) : undefined;

    const setError = (title: string, message: string, isUncaught = false) => {
    if (!appError || (appError && (title !== appError.title || message !== appError.message))) {
      setAppError({
        title, message, isUncaught
      });
    }
  }

    const appContext = {
      authService, appError, clearError, setError, apiAuthService, dataService
    };

    return (
      <AppContext.Provider value={appContext}>
        {children}
      </AppContext.Provider>
    )
  }

  export default AppContextProvider;