import { useState } from "react"

// 这一套可以加山生命周期的东西
// 进一步可以插件
function useRequest(fn, options = { manual: true }) {

    let resultP = null

    const run = () => {
        resultP = Promise.resolve(fn())
        resultP.then(v => {
            setResult({ data: v, loading: false, error: null, run })
        }).catch(reason => {
            setResult({ data: null, loading: false, error: reason, run })
        })
    }

    if (!options.manual) {
        run()
    }

    // 可能需要
    // useEffect(() => {
    //     resultP = null
    // }, [])
    
    const [result, setResult] = useState({ data: null, loading: true, error: null, run })

    return result
}
export default useRequest

//   const {data, loading, error, run} = useRequest(
//     () => new Promise((resolve) => {
//       const timeout = (--count) * 1000
//       setTimeout(() => { resolve(count) }, timeout) 
//     })
//   )
