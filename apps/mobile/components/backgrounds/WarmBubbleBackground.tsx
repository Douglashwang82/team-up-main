import React, { useEffect } from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { useSharedValue, withRepeat, withTiming, Easing, useDerivedValue } from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Advanced Multidimensional Bubble Shader
// Deep, organic, and highly dynamic set of bubbles
const source = Skia.RuntimeEffect.Make(`
uniform float2 u_resolution;
uniform float u_time;

float4 main(float2 xy) {
  float2 uv = xy / u_resolution;
  
  // 7 Bubbles with diverse orbits and speeds
  // Bubble 1: Large Deep Core
  float2 p1 = float2(0.5 + 0.25 * sin(u_time * 0.15), 0.5 + 0.2 * cos(u_time * 0.1));
  // Bubble 2: Fast Coral Orb
  float2 p2 = float2(0.8 + 0.15 * cos(u_time * 0.4), 0.2 + 0.2 * sin(u_time * 0.3));
  // Bubble 3: Floating Pink Cloud
  float2 p3 = float2(0.2 - 0.1 * sin(u_time * 0.25), 0.8 + 0.1 * cos(u_time * 0.2));
  // Bubble 4: Tiny Bright Highlight
  float2 p4 = float2(0.1 + 0.4 * sin(u_time * 0.5), 0.1 + 0.4 * cos(u_time * 0.6));
  // Bubble 5: Mid-sized Peach
  float2 p5 = float2(0.9 - 0.3 * cos(u_time * 0.2), 0.7 - 0.2 * sin(u_time * 0.35));
  // Bubble 6: Deep Burgundy Sentinel
  float2 p6 = float2(0.3 + 0.2 * cos(u_time * 0.12 + 2.0), 0.3 + 0.25 * sin(u_time * 0.18 + 1.0));
  // Bubble 7: Soft Rose Drift
  float2 p7 = float2(0.6 + 0.3 * sin(u_time * 0.08 + 4.0), 0.85 + 0.1 * cos(u_time * 0.12 + 0.5));

  // Distance fields with varying sizes
  float d1 = distance(uv, p1) / 0.8;
  float d2 = distance(uv, p2) / 0.5;
  float d3 = distance(uv, p3) / 0.9;
  float d4 = distance(uv, p4) / 0.3;
  float d5 = distance(uv, p5) / 0.6;
  float d6 = distance(uv, p6) / 0.7;
  float d7 = distance(uv, p7) / 1.1;

  // Sharpness/Falloff control
  float s1 = smoothstep(1.0, 0.0, d1);
  float s2 = smoothstep(1.0, 0.0, d2);
  float s3 = smoothstep(1.0, 0.0, d3);
  float s4 = smoothstep(1.0, 0.0, d4);
  float s5 = smoothstep(1.0, 0.0, d5);
  float s6 = smoothstep(1.0, 0.0, d6);
  float s7 = smoothstep(1.0, 0.0, d7);

  // Modern 2026 Color Palette
  float3 c1 = float3(0.31, 0.05, 0.12); // Ultra Deep Burgundy #4f0c20
  float3 c2 = float3(0.91, 0.36, 0.46); // Coral #E85D75
  float3 c3 = float3(1.0, 0.60, 0.54);  // Light Pink #FF9A8A
  float3 c4 = float3(1.0, 0.9, 0.85);   // Soft Glow Highlight
  float3 c5 = float3(1.0, 0.63, 0.48);  // Peach #FFA07A
  float3 c6 = float3(0.55, 0.08, 0.22); // Deep Burgundy #8B1538
  float3 c7 = float3(1.0, 0.71, 0.76);  // Soft Rose #FFB6C1
  
  // Dynamic Background Base
  float3 bg = mix(c1, c6, uv.y);
  bg = mix(bg, c2, 0.2 * sin(u_time * 0.1));

  // Layered blending for depth
  float3 color = bg;
  
  // Additive and mix blend modes combined
  color += c2 * s2 * 0.4;
  color += c3 * s3 * 0.3;
  color = mix(color, c1, s1 * 0.5); // Large deep core
  color += c4 * s4 * 0.5; // Bright highlight
  color = mix(color, c5, s5 * 0.4);
  color = mix(color, c6, s6 * 0.6);
  color += c7 * s7 * 0.2;

  // Add a touch of grainy texture for high-end feel
  float noise = fract(sin(dot(uv, float2(12.9898, 78.233))) * 43758.5453);
  color += noise * 0.015;

  return float4(color, 1.0);
}
`)!;

export default function WarmBubbleBackground() {
    const time = useSharedValue(0);

    useEffect(() => {
        // Very slow, cinematic motion
        time.value = withRepeat(
            withTiming(100, { duration: 80000, easing: Easing.inOut(Easing.quad) }),
            -1,
            true // Yo-yo for seamless reversal
        );
    }, []);

    const uniforms = useDerivedValue(() => {
        return {
            u_resolution: [SCREEN_WIDTH, SCREEN_HEIGHT],
            u_time: time.value,
        };
    }, [time]);

    return (
        <View style={StyleSheet.absoluteFillObject}>
            <Canvas style={{ flex: 1 }}>
                <Fill>
                    <Shader source={source} uniforms={uniforms} />
                </Fill>
            </Canvas>
        </View>
    );
}
