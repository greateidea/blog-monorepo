
import type { AppContextType } from '../context/appContext';

export const appReducerHandler = (state: AppContextType, action: Dict) => {
    if (!action.type) return state;
    const payload = action.payload;

    try {
        switch(action.type) {
            case "setArticleInfos": {
                const newArticleInfos = Object.assign(state.articleInfos, {[payload.code]: payload });
                state.articleInfos = newArticleInfos

                return { ...state }
            }
            default: {
                throw Error('未知 action：' + action.type);
            }
        }
    } catch (error) {
        console.log(error)
        return state
    }
}