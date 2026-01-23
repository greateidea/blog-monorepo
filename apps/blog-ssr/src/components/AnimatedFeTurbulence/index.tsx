import { gsap } from "gsap";
import { Feturbulence } from "@blog/ui-lib";
import { useEffect, useRef, useState } from "react";

type AnimatedFeTurbulenceProps = {
    id: string;
    from?: number;
    to?: number;
    duration?: number;
    children: React.ReactNode;
    triggerByHover?: boolean;
    delay?: number;
    scale?: number;
}

const AnimatedFeTurbulence: React.FC<AnimatedFeTurbulenceProps> = ({ id = 'animated-turbulence', from = 0, to = 0.4, scale = 20, duration = 0.1, children, triggerByHover = true, delay = 0 }) => {
    const controller = useRef(null);
    const scaleEffectRef = useRef({
        v: 0
    });
    const [scaleEffect, setscaleEffect] = useState(0);
    const [activeHover, setActiveHover] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setActiveHover(true);
        }, 300);
    }, [triggerByHover]);

    useEffect(() => {
        if (!controller.current) (controller.current as any) = gsap.timeline();
        setTimeout(() => {
            (controller.current as any).to(scaleEffectRef.current, {
                duration: duration / 2,
                v: scale,
                onUpdate: () => {
                    setscaleEffect(scaleEffectRef.current.v);
                },
            });
            (controller.current as any).to(scaleEffectRef.current, {
                duration: duration / 2,
                v: 0,
                onUpdate: () => {
                    setscaleEffect(scaleEffectRef.current.v);
                },
            });
        }, delay)

        return () => {
            (controller.current as any)?.kill();
            controller.current = null;
        }
    }, [from, to, duration, delay]);

    const handleMouseEnter = () => {
        if (triggerByHover && activeHover) { (controller.current as any)?.restart(); }
    };

    return <div onMouseEnter={handleMouseEnter} onTouchStart={handleMouseEnter}>
        <Feturbulence id={id} scale={scaleEffect} baseFrequency={`${from} ${to}`} children={children} />
    </div>
};

export default AnimatedFeTurbulence;