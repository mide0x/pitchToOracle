import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export const ParticleLayer = () => {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    if (!init) return null;

    const options: ISourceOptions = {
        fullScreen: { enable: false },
        fpsLimit: 120,
        particles: {
            number: {
                value: 30,
                density: {
                    enable: true,
                    width: 800,
                    height: 800
                }
            },
            color: {
                value: ["#FDB931", "#F5F0E6", "#D4AF37"] // Gold, Cream, Metallic Gold
            },
            shape: {
                type: "circle",
            },
            opacity: {
                value: { min: 0.1, max: 0.6 },
                animation: {
                    enable: true,
                    speed: 0.5,
                    startValue: "random",
                    sync: false
                }
            },
            size: {
                value: { min: 1, max: 3 },
                animation: {
                    enable: true,
                    speed: 1,
                    startValue: "random",
                    sync: false
                }
            },
            move: {
                enable: true,
                speed: { min: 0.2, max: 1 },
                direction: "top",
                random: false,
                straight: false,
                outModes: {
                    default: "out",
                },
                attract: {
                    enable: false,
                    rotate: {
                        x: 600,
                        y: 1200,
                    },
                },
            },
        },
        detectRetina: true,
    };

    return (
        <div className="absolute inset-0 z-10 pointer-events-none">
            <Particles 
                id="tsparticles" 
                className="w-full h-full"
                options={options} 
            />
        </div>
    );
};
