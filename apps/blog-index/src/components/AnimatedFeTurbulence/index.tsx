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

const AnimatedFeTurbulence: React.FC<AnimatedFeTurbulenceProps> = ({ id = 'animated-turbulence', scale = 20, from = 0, to = 0.1, duration = 0.1, children, triggerByHover = true, delay = 0 }) => {
    const controller = useRef();
    const baseFrequencyY = useRef({
        y: from
    });
    const [baseFrequency, setBaseFrequency] = useState(`0 ${from}`);
    const [activeHover, setActiveHover] = useState(false);
    const [scaleEffect, setScaleEffect] = useState(0);

    useEffect(() => {
        setTimeout(() => {
            setActiveHover(true);
        }, 300);
    }, [triggerByHover]);

    useEffect(() => {
        if (!controller.current) controller.current = gsap.timeline();
        setTimeout(() => {
            controller.current.to(baseFrequencyY.current, {
                duration: duration / 2,
                y: to,
                onStart: () => {
                    setScaleEffect(scale);
                },
                onUpdate: () => {
                    setBaseFrequency(`0 ${baseFrequencyY.current.y}`);
                },
            });
            controller.current.to(baseFrequencyY.current, {
                duration: duration / 2,
                y: from,
                onUpdate: () => {
                    setBaseFrequency(`0 ${baseFrequencyY.current.y}`);
                },
                onComplete: () => {
                    setScaleEffect(0);
                }
            });
        }, delay)

        return () => {
            controller.current?.kill();
            controller.current = null;
        }
    }, [from, to, duration, delay, scale]);

    const handleMouseEnter = () => {
        if (triggerByHover && activeHover) { controller.current?.restart(); }
    };

    return <div onMouseEnter={handleMouseEnter} onTouchStart={handleMouseEnter}>
        <Feturbulence id={id} scale={scaleEffect} baseFrequency={baseFrequency}>
            {children}
        </Feturbulence>
    </div>
};

export default AnimatedFeTurbulence;