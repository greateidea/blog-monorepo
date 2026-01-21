// import $state from "../../tools/$stateBrige";
import $state, { CountHook } from "../../../tools/$stateBridge"
import Test2 from "./Test2"

export default function App() {
    // const count = $state({ value: 1})
    const count = CountHook()

    return (
        <div>
            <p>count: {count.value.value}</p>
            <button
                onClick={() => {
                    count.value.value++;
                }}
            >
                +1
            </button>
            <Test2 />
        </div>
    );
}
