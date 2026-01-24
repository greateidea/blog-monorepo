import React, {  useEffect, useLayoutEffect, useRef } from 'react'
import Prism from 'prismjs'
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-docker"
import "prismjs/components/prism-bash"
import style from './view.module.css'
import './codestyle.css'
import './editormap.css'

const grammar = (Prism.languages as any)["javascript"] || Prism.languages.javascript;
const grammarDocker = (Prism.languages as any)["docker"] || Prism.languages.javascript;
const grammarBash = (Prism.languages as any)["bash"] || Prism.languages.javascript;
const grammars: Dict = {
    javascript: grammar,
    js: grammar,
    docker: grammarDocker,
    bash: grammarBash
}

type articleLoadEventsType = (() => void)[]
export let articleLoadEventsOnce: articleLoadEventsType = [];

// const preString: string = `function handleBlur() {
//     setTimeout(() => {
//         if (!containerRef.current.contains(document.activeElement)) {
//             closeMenu();
//         }
//     }, 0);
// };

// const colorNode = Fn(([baseColor]) => {
//     const uvCoord = uv();

//     const red = uvCoord.x.add(2.3).mul(0.3);
//     const green = uvCoord.y.add(1.7).div(8.2);
//     const blue = add(uvCoord.x, uvCoord.y).mod(10.0);

//     const tint = vec4(red, green, blue, 1.0);

//     return mix(baseColor, tint, uvCoord.x);
// });

// const Scene = () => {
//   return (
//     <Canvas
//       shadows
//       gl={async (props) => {
//         const renderer = new THREE.WebGPURenderer({
//           ...props,
//           forceWebGL: true,
//         });
//         await renderer.init();
//         return renderer;
//       }}
//     >
//       {...}
//     </Canvas>
//   );
// };
// `

const hl = (container: HTMLElement) => {
    const codeBlocks = container.querySelectorAll("pre");
    codeBlocks.forEach((block: HTMLElement) => {
        try {
            if (block.hasAttribute("data-language") && !block.dataset.processed) {
                block.dataset.processed = '1'; // <pre data-processed='1'>...</pre>
                // block.classList.add("language-js")
                block.classList.add(style['bg_code'])

                const language = block.dataset.language === 'plain' ? 'docker' : (block.dataset.language || 'js');
                const highlightedHtml = Prism.highlight(block.textContent!, grammars[language], language);
                const tokenLines = highlightedHtml.split(/\r?\n/).map((lineHtml: any) => lineHtml || "&#8203;");
                const linesInContainerHtml = tokenLines.map((lineHtml: string, index: number) => {
                    return `<div class='code-line' data-lineNumber='${index + 1}'><div class='line-number'>${index + 1}</div><span class='code-text'>${lineHtml}</span></div>`
                })
                .join("\n");

                // block.innerHTML = `<code class='language-${language || 'js'}'>${linesInContainerHtml}</code>`
                block.innerHTML = linesInContainerHtml
            }
          } catch (e) {
            console.warn("highlight failed", e);
        }
    });
}

const attachContentForHeads = (container: HTMLElement) => {
    const h2Blocks = container.querySelectorAll("body h2");

    // 每个标题后面加了虚线
    h2Blocks.forEach((block: Element, index: number) => {
        block.id = `h2-${index}`

        const child = document.createElement('div')
        child.classList.add(style['dash_divider'])
        
        block.appendChild(child)
    })
}

const View: React.FC<{ html: string }> = ({ html }) => {
    const containerRef = useRef(null)

    useLayoutEffect(() => {
        // 这里（hook）是由客户端代码执行的
        // 这里如果是服务端渲染肯定是有的 但是服务端渲染是不走Hook的
        // 而客户端渲染时这里初次渲染是没有的 因为服务端渲染会从initialData传进来
        // 客户端代码开始执行的时候是没有安排initialData数据的
        // 但是服务端渲染出的html此时实际上已经有了html结构 
        // 在客户端来执行的时候 “html”值即便没有也可以执行dom操作了
        hl(containerRef.current!);
        attachContentForHeads(containerRef.current!);
    }, [html])

    useEffect(() => {
        if (html) {
            articleLoadEventsOnce?.forEach(cb => {
                cb()
            })

            articleLoadEventsOnce = []
        }
    }, [html])

    useEffect(() => {
        // Prism.highlightAll();
      }, []);

    return <div ref={containerRef}>
        <article  className={`${style.view} text_primary_font`} dangerouslySetInnerHTML={{__html: html}} />
            {/* <pre data-language="javascript">{preString}</pre> */}
        </div>
}

export default View;


