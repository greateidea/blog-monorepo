import { useState } from 'react'
const Counter = () => {
    const [count, setCount] = useState(0)

    return <div>
        <button onClick={() => setCount(1)}>add</button>
        <div>Count: {count}</div>
    </div>
}

export default Counter
