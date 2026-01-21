import remote from ".";
import { proxyUrl, proxyWUrl } from "../utils";

export const saveAccessInfo = () => {
    return remote.post(proxyUrl('/access/save'), { url: window.location.pathname })
        .catch((reason: any) => {
            if (import.meta.env.DEV) {
                console.log('[remote /access/save blog error]: ', reason);
            }
        });
}

export const saveWAccessInfo = (pageId: string) => {
    return remote.get(proxyWUrl(`/w/access/save/${pageId}`))
        .catch((reason: any) => {
            if (import.meta.env.DEV) {
                console.log('[remote /access/save blog error]: ', reason);
            }
        });
}

export const likesHowMuch = (pageId: string) => {
    return remote.get(proxyWUrl(`/w/likes/howmuch/${pageId}`))
        .catch((reason: any) => {
            if (import.meta.env.DEV) {
                console.log('[remote /w/likes/howmuch blog error]: ', reason);
            }
        });
}

export const givemelike = (pageId: string) => {
    return remote.post(proxyWUrl(`/w/likes/givemelike`), { id: pageId})
        .catch((reason: any) => {
            if (import.meta.env.DEV) {
                console.log('[remote /w/likes/givemelike blog error]: ', reason);
            }
        });
}

// export const getBlog = (code: string) => {
//     return remote.get(proxyUrl('/blog/info'), { params: { code } })
//         .catch((reason: any) => {
//             console.log('[remote get blog error]: ', reason);
//         });
// }
