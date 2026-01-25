export function retryTagRequest(
    retryDomains = [],
    options = {
        onFailed: () => { },
        yieldPaint: false,
        includeTagNames: [],
        includePaths: [],
        filter: (e) => !!e
    }
) {
    if (!retryDomains?.length) { return }

    const retryPathToIndex = {}
    const { onFailed, yieldPaint, includeTagNames, filter, includePaths } = options

    function retryNocorsRequest(e) {
        if (!e) return

        try {
            if (!includeTagNames.includes(e.target.tagName) ||
                !filter(e) ||
                !includePaths.includes(e.target.src) ||
                e instanceof ErrorEvent
            ) {
                return
            }

            const url = new URL(e.target.src)
            const path = url.pathname

            if (!retryPathToIndex[path]) {
                retryPathToIndex[path] = 0
            }

            const retryDomain = retryDomains[retryPathToIndex[path]]
            url.host = retryDomain
            if (retryDomain) {
                if (yieldPaint) {
                    const scripthtmlString = `\<script src='${url.toString()}'>\<\/script>`
                    document.write(scripthtmlString)
                } else {
                    const scriptElem = document.createElement('script')
                    scriptElem.src = url.toString()
                    document.body.insertBefore(scriptElem, e.target)
                }
                retryPathToIndex[path]++
            } else {
                window.removeEventListener('error', retryNocorsRequest)
                onFailed()
            }
        } catch (error) {
            console.error(error)
        }
    }
    window.addEventListener('error', retryNocorsRequest, true) // 重要‼️注意⚠️错误事件在不冒泡 所以必须在捕获阶段监听
}