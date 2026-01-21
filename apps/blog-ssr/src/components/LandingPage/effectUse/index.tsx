import $state from "../../../tools/$stateBridge"
import { $effect } from "../../../tools/$effect"

const EffectUse = () => {
    const count = $state({ value1: 1, value2Obj: { value: 100 }, value3: 3, value4: 4 })
    
    $effect(() => {
        console.log('[fn] count -> value3: ', count.value3)
        console.log('[fn] count -> value4: ', count.value4)
    })

    $effect(() => {
        console.log('[fn] count -> value1: ', count.value1)
    })

    return <div>
        <div> 
            Count1: { count.value1 }
            <button onClick={() => { count.value1++ }}> Count1 +1 </button>
        </div>
        <div>Count2:
            { count.value2Obj.value }
            <button onClick={() => { count.value2Obj.value++ }}> Count2 value2Obj.value +1 </button>
        </div>
        <div>
            Count3: { count.value3 }
            <button onClick={() => { count.value3++ }}> Count3 +1 </button>
        </div>
        <div>
            Count4: { count.value4 }
            <button onClick={() => { count.value4++ }}> Count4 +1 </button>
        </div>
    </div>
}

export default EffectUse
