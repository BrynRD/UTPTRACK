"use client"

import { useRef, useEffect } from 'react'

interface AnimatedIconProps {
    name: string;
    style?: string;
    token: string;
    trigger?: 'loop' | 'click';
    colors?: Record<string, string>;
    height?: string | number;
    width?: string | number;
    strokeWidth?: number;
    size?: number;
}

export function AnimatedIcon({
                                 name,
                                 style = 'minimalistic',
                                 token,
                                 trigger = 'loop',
                                 colors = { "group-1": "#5B36F2FF", "background": "#FFFFFFFF" },
                                 height,
                                 width,
                                 strokeWidth = 1,
                                 size = 32
                             }: AnimatedIconProps) {
    const iconRef = useRef<HTMLDivElement>(null);

    // Usar size como el valor predeterminado para height y width si no se proporcionan
    const finalHeight = height || size;
    const finalWidth = width || size;

    useEffect(() => {
        if (!iconRef.current) return;

        const attributes = JSON.stringify({
            "variationThumbColour": "#FFFFFF",
            "variationName": "Normal",
            "variationNumber": 1,
            "numberOfGroups": 1,
            "backgroundIsGroup": false,
            "strokeWidth": strokeWidth,
            "defaultColours": colors,
            "size": size
        });

        // Limpiar contenido anterior
        iconRef.current.innerHTML = '';

        // Crear elemento de icono animado
        const iconElement = document.createElement('animated-icons');
        iconElement.setAttribute('src', `https://animatedicons.co/get-icon?name=${name}&style=${style}&token=${token}`);
        iconElement.setAttribute('trigger', trigger);
        iconElement.setAttribute('attributes', attributes);
        iconElement.setAttribute('height', finalHeight.toString());
        iconElement.setAttribute('width', finalWidth.toString());

        // Añadir al DOM
        iconRef.current.appendChild(iconElement);

        // Asegurarse de que el script esté cargado
        if (!document.querySelector('script[src="https://animatedicons.co/scripts/embed-animated-icons.js"]')) {
            const script = document.createElement('script');
            script.src = "https://animatedicons.co/scripts/embed-animated-icons.js";
            script.async = true;
            document.head.appendChild(script);
        }
    }, [name, style, token, trigger, colors, finalHeight, finalWidth, strokeWidth, size]);

    return <div ref={iconRef} className="flex items-center justify-center"></div>;
}