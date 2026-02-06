import React, { useEffect } from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import { Canvas, Fill, Shader, Skia, Uniforms } from "@shopify/react-native-skia";
import { useSharedValue, withRepeat, withTiming, Easing, useDerivedValue } from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// A smooth liquid mesh gradient shader - Modern 2026 Style
// Darker, richer, neon-infused
const source = Skia.RuntimeEffect.Make(`
uniform float2 u_resolution;
uniform float u_time;

float4 main(float2 xy) {
  float2 uv = xy / u_resolution;
  
  // Create moving coordinate centers for the blobs
  // Blob 1: Top Left - slow moving
  float2 p1 = float2(0.3 + 0.2 * sin(u_time * 0.3), 0.3 + 0.2 * cos(u_time * 0.2));
  // Blob 2: Bottom Right - faster
  float2 p2 = float2(0.7 - 0.2 * cos(u_time * 0.5), 0.7 - 0.2 * sin(u_time * 0.4));
  // Blob 3: Center/Floating - medium
  float2 p3 = float2(0.5 + 0.3 * sin(u_time * 0.4 + 1.0), 0.5 + 0.2 * cos(u_time * 0.6 + 2.0));

  // Calculate distance fields
  float d1 = distance(uv, p1);
  float d2 = distance(uv, p2);
  float d3 = distance(uv, p3);

  // Soften the falloff for that "glow" look
  d1 = smoothstep(0.0, 1.2, d1); // Larger spread
  d2 = smoothstep(0.0, 1.0, d2);
  d3 = smoothstep(0.0, 1.1, d3);

  // Colors - 2026 Dark Neon Mode
  float3 c1 = float3(0.66, 0.33, 0.97); // Neon Purple #A855F7
  float3 c2 = float3(0.0, 0.7, 0.9);   // Cyan/Blue #0EA5E9
  float3 c3 = float3(0.98, 0.45, 0.09); // Bright Orange #F97316
  
  // Deep Background
  float3 bg = float3(0.05, 0.05, 0.08); // Almost Black Blue

  // Mix based on influence
  float3 color = bg;
  
  // Additive mixing for "Light" effect
  color += c1 * (1.0 - d1) * 0.6;
  color += c2 * (1.0 - d2) * 0.5;
  color += c3 * (1.0 - d3) * 0.4;

  // Add subtle noise/dither (optional, simpler version)
  // float noise = fract(sin(dot(uv, float2(12.9898, 78.233))) * 43758.5453);
  // color += noise * 0.02;

  return float4(color, 1.0);
}
`)!;

export default function BackgroundBlobs() {
    const time = useSharedValue(0);

    useEffect(() => {
        time.value = withRepeat(
            withTiming(100, { duration: 40000, easing: Easing.linear }),
            -1,
            false
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
