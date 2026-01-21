import { Outlet } from "react-router"
import { AppContextProvider, AppContextType } from "./context/appContext"
import './th.css'

const AppContainer: React.FC<{initialState: AppContextType}> = ({ initialState }) => {

    return <AppContextProvider initialState={initialState}>
        <Outlet />
    </AppContextProvider>
}

export default AppContainer;


