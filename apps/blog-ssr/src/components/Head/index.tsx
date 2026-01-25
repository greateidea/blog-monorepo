import { useRef, useEffect, useLayoutEffect, useOptimistic, useTransition, useState } from 'react'
import gsap from 'gsap'
import Typed from 'typed.js'
import { givemelike } from '../../remote/remoteTask'
import { syncWaite } from '../../utils'
import style from './head.module.css'
import AnimatedFeTurbulence from '../AnimatedFeTurbulence'

const awaitTimeLike = syncWaite(1000)

function flickerTitle(selector: any, options = {}) {
  const cfg = Object.assign({
    flickerDuration: 1,     // 总闪烁时长（秒）
    totalFlashes: 10,         // 随机调度的闪烁次数（越大越乱）
    flashChars: [1, 3],        // 每次闪烁选中字符数量范围（min,max）
    flashDuration: 0.1,      // 单次闪烁持续时间（秒）
    flashEase: 'none',
    finalStagger: 0.06,       // 最后亮起时每字的延迟间隔（秒）
    finalDuration: 0.3,       // 最后亮起动画持续时长（秒）
    //   finalTextShadow: '0 0 10px rgba(255,255,200,0.95), 0 0 30px rgba(255,180,50,0.75), 0 0 60px rgba(255,120,30,0.45)'
  }, options);

  const root = document.querySelector(selector);
  if (!root) return;

  // 1) 拆字：若已拆过则跳过
  if (!root.dataset.split) {
    const text = root.textContent;
    root.innerHTML = ''; // 清空
    for (const ch of text) {
      if (ch === ' ') {
        const ws = document.createElement('span');
        ws.className = 'ws';
        ws.innerHTML = '&nbsp;';
        root.appendChild(ws);
      } else {
        const sp = document.createElement('span');
        sp.textContent = ch;
        root.appendChild(sp);
      }
    }
    root.dataset.split = '1';
  }

  const letters = Array.from(root.querySelectorAll('span:not(.ws)'));

  // 基础状态（暗淡）
  gsap.set(letters, {
    opacity: 0.15,
    //   textShadow: '0px 0px 0px rgba(255,255,200,0)'
  });

  // 记录 delayedCall 用于可能的清理
  const scheduled: any[] = [];

  // 随机闪烁：创建若干次延时调用，每次选随机字符并短促闪烁
  for (let i = 0; i < cfg.totalFlashes; i++) {
    const delay = Math.random() * cfg.flickerDuration;
    const call = gsap.delayedCall(delay, () => {
      // 随机选择 k 个字符（避免全选）
      const k = Math.floor(Math.random() * (cfg.flashChars[1] - cfg.flashChars[0] + 1)) + cfg.flashChars[0];
      for (let j = 0; j < k; j++) {
        const idx = Math.floor(Math.random() * letters.length);
        const el = letters[idx];

        // 小抖动 + 瞬时亮 -> 回落
        gsap.fromTo(el as any, {
          opacity: 0.2,
          scale: 1
        }, {
          opacity: 1,
          scale: 1.03,
          duration: cfg.flashDuration,
          yoyo: true,
          repeat: 1,
          ease: cfg.flashEase,
          // light glow ephemeral:
          onStart() {
            gsap.to(el as any, { duration: cfg.flashDuration / 2 });
          },
          onComplete() {
            // 回落时渐隐文字阴影
            gsap.to(el as any, { duration: cfg.flashDuration / 2 });
          }
        });
      }
    });
    scheduled.push(call);
  }

  // 到闪烁期结束时，执行“全部点亮并固定”动画
  gsap.delayedCall(cfg.flickerDuration + 0.02, () => {
    // 先取消还没触发的调用（可选，但能避免冲突）
    scheduled.forEach(s => s.kill());

    // 最后亮起：对每个字符做 stagger 动画，最终添加 is-lit 类（以保持样式）
    gsap.to(letters, {
      opacity: 1,
      scale: 1,
      // textShadow: cfg.finalTextShadow,
      duration: cfg.finalDuration,
      stagger: cfg.finalStagger,
      ease: 'power2.out',
      onComplete() {
        // 添加类以确保最终状态固定（CSS里 .is-lit 定义了最终的阴影样式）
        root.classList.add('is-lit');
      }
    });
  });
}

const Head: React.FC<{ title: string, headerDes?: string[], code: string }> = ({ title, headerDes, code }) => {
  const el = useRef(null);
  const will_like_style = style.will_like
  const really_like_style = style.really_like
  const [, startTransition] = useTransition()

  const [likeStyle, setLikeStyle] = useState({ style: will_like_style, sending: false })
  const likeCode = `${code}:hasLike`

  useLayoutEffect(() => {
    if (localStorage.getItem(likeCode)) {
      setLikeStyle({ style: really_like_style, sending: false })
    } else {
      setLikeStyle({ style: will_like_style, sending: false })
    }
  }, [code])

  const [finalLikeStyle, updateOpLikeStyle] = useOptimistic(
    likeStyle,
    (pre, newPayload: { style: string, sending: boolean }) => {
      return { ...pre, ...newPayload }
    }
  );

  useEffect(() => {
    flickerTitle('#title', {
      flickerDuration: 2.0,
      totalFlashes: 45,
      flashChars: [1, 2],
      flashDuration: 0.05,
      finalStagger: 0.04,
      finalDuration: 0.5
    });
  }, [])

  useLayoutEffect(() => {
    const typed = new Typed(el.current, {
      strings: headerDes || ['The sky was clear.', '&amp; the sun was shining.', 'MAY 9, 2025'],
      typeSpeed: 15,
    });

    return () => {
      // Destroy Typed instance during cleanup to stop animation
      typed.destroy();
    };
  }, [headerDes]);

  return <header className={style['art_head']}>
    <AnimatedFeTurbulence id="turbulence" from={0.02} to={0.98} duration={0.25} triggerByHover={true} delay={4000}>
      <h1 id="title" className={`${style['head_text']} text_title_font flicker-title`}>{title}</h1>
    </AnimatedFeTurbulence>
    <div className={style.des_container}>
      <time ref={el} className={`${style['typed-cursor']} ${style['art_digit']} text_digit_font`} />
      <div
        className={`${style.like_container} ${finalLikeStyle.style}`}
        onClick={async () => {
          if (!awaitTimeLike()) return
          if (finalLikeStyle.sending) return

          startTransition(async () => {
            updateOpLikeStyle({ style: really_like_style, sending: true })
            // 只要点了就显示已经点赞
            await new Promise(res => setTimeout(() => {
              localStorage.setItem(likeCode, '1')
              setLikeStyle({ style: really_like_style, sending: false })
              console.log('谢谢你的点赞！')
              res(true)
            }, 300))
            await givemelike(code).then(r => {
              if (r?.data?.count) {
                console.log('点赞成功！')
                localStorage.setItem(likeCode, `${r?.data?.count}`)
              }
            })
          })
        }}
      ></div>
      {
        import.meta.env.DEV ? <button onClick={() => { localStorage.setItem(likeCode, '') }}>清理 localStorage like</button> : null
      }
      <span className={style['art_slot']}>{title}</span>
    </div>
  </header>
}

export default Head
