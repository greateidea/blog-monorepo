export interface FeturbulenceProps {
    id: string;
    baseFrequency?: string;
    children: React.ReactNode;
}

const Feturbulence = ({ id, baseFrequency = "0.015 0.1", children }: FeturbulenceProps) => {
    return (
        <>
            <svg style={{ display: 'none' }}>
                <defs>
                    <filter id={id} colorInterpolationFilters="linearRGB" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse">
                        <feTurbulence
                            type="turbulence"
                            baseFrequency={baseFrequency}
                            numOctaves="2"
                            seed="2"
                            stitchTiles="stitch"
                            x="0%"
                            y="0%"
                            width="100%"
                            height="100%"
                            result="turbulence" />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="turbulence"
                            scale="30"
                            xChannelSelector="R"
                            yChannelSelector="B"
                            x="0%"
                            y="0%"
                            width="100%"
                            height="100%"
                            result="displacementMap" />
                    </filter>
                </defs>
            </svg>
            <div style={{ filter: `url(#${id})` }}>
                {children}
            </div>
        </>
    )
}

export default Feturbulence