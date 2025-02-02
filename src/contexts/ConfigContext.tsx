"use client";

import * as serviceWorkerRegistration from "@/utils/serviceWorkerRegistration";
import { createContext, ReactNode, useEffect } from "react";

export const ConfigContext = createContext({});

function ConfigProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        serviceWorkerRegistration.register();
    }, []);

    return <ConfigContext value={{}}>{children}</ConfigContext>;
}

export default ConfigProvider;
