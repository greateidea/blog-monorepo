import React, { createContext, useContext, useReducer } from "react";
import { appReducerHandler } from "../reducer/appReducer";
type articleInfoType = {
    title?: string;
    html?: string;
    delta?: Dict;
    code: string;
}

export type AppContextType = {
    articleInfos: { [index: string]: articleInfoType },
}

type AppContextDispatch = {
    dispatch?: Function
}

const defaultInitialState = {
    articleInfos: {},
} as AppContextType;

export type ObActionType = { type: string, payload: any };
export type DispatchContainerType = (action: ObActionType | FuncActionType) => void;
export type FuncActionType = (state: AppContextType, dispatch: DispatchContainerType) => void;

export const AppContext = createContext<AppContextType & AppContextDispatch>(defaultInitialState);
export const useAppContext = () => useContext(AppContext);

export const AppContextProvider: React.FC<any> = ({ children, initialState = defaultInitialState }) => {
    const [state, dispatchBase] = useReducer(appReducerHandler, initialState);

    const dispatch: DispatchContainerType = (action) => {
        if (typeof action === "function") {
            action(state, dispatch); // thunk
        } else {
            dispatchBase(action);
        }
    };

    return <AppContext value={{ ...state, dispatch }}>
        {children}
    </AppContext>;
}


