import { getSafeHtmlFromDelta } from "../../utils"

const deltaString = {
    "ops":[
        {"insert":"Podman! Hello kitiok this"},{"attributes":{"header":2},"insert":"\n"},
        {"insert":"This is a powered App, open and read this article, you'll get unlimited force.\ncommon go get it! let's up! you will be the best one!\nOSome "},
        {"insert":"initial","attributes":{"bold":true}},
        {"insert":" "},
        {"insert":"content","attributes":{"underline":true}},
        {"insert":"\n"},
        {"insert":"Bigo bigo!!"},{"attributes":{"header":2},"insert":"\n"},
        {"insert":"This is a powered App, open and read this article, you'll get unlimited force.\ncommon go get it! let's up! you will be the best one!\nOSome "},
        {"insert":"This is a powered App, open and read this article, you'll get unlimited force.\ncommon go get it! let's up! you will be the best one!\nOSome "},
    ]}
const safeHtml = getSafeHtmlFromDelta(deltaString)
const result = {
    content: safeHtml,
}
export default result