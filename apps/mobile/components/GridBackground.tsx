import React, { useMemo } from "react";
import { StyleSheet, Dimensions, ViewStyle } from "react-native";
import { Canvas, Line, vec } from "@shopify/react-native-skia";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface GridBackgroundProps {
    gridSize?: number;
    lineColor?: string; // Fallback or base color
    backgroundColor?: string;
    strokeWidth?: number;
    style?: ViewStyle;
}

export default function GridBackground({
    gridSize = 40,
    lineColor = "rgba(0, 0, 0, 0.03)",
    backgroundColor = "#F8F5EA",
    strokeWidth = 0.4,
    style,
}: GridBackgroundProps) {

    // Generate lines with random colors
    const lines = useMemo(() => {
        const gridLines: { p1: any; p2: any; color: string }[] = [];

        // Draw vertical lines
        for (let x = 0; x <= SCREEN_WIDTH; x += gridSize) {
            // Generate a random color
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            const color = `rgba(${r}, ${g}, ${b}, 0.3)`; // Keep some transparency

            gridLines.push({
                p1: vec(x, 0),
                p2: vec(x, SCREEN_HEIGHT),
                color: color,
            });
        }

        // Draw horizontal lines
        for (let y = 0; y <= SCREEN_HEIGHT; y += gridSize) {
            // Generate a random color
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            const color = `rgba(${r}, ${g}, ${b}, 0.3)`;

            gridLines.push({
                p1: vec(0, y),
                p2: vec(SCREEN_WIDTH, y),
                color: color,
            });
        }

        return gridLines;
    }, [gridSize]);

    return (
        <Canvas style={[styles.canvas, { backgroundColor }, style]}>
            {lines.map((line, index) => (
                <Line
                    key={index}
                    p1={line.p1}
                    p2={line.p2}
                    color={line.color}
                    strokeWidth={strokeWidth}
                />
            ))}
        </Canvas>
    );
}

const styles = StyleSheet.create({
    canvas: {
        ...StyleSheet.absoluteFillObject,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
});
