import { CountHook } from "../../../tools/$stateBridge"

const Test2 = () => {
    const count = CountHook()

    return <div>count2: {count.value.value}</div>
}

export default Test2
