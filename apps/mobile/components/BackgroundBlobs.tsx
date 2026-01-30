import React, { useEffect } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// A smooth liquid mesh gradient shader
// Blends 3 colorful orbs that move slowly over time
const source = Skia.RuntimeEffect.Make(`
uniform float2 u_resolution;
uniform float u_time;

float4 main(float2 xy) {
  float2 uv = xy / u_resolution;
  
  // Create moving coordinate centers for the blobs
  // Blob 1: Top Left (Purple)
  float2 p1 = float2(0.2 + 0.1 * sin(u_time * 0.5), 0.2 + 0.1 * cos(u_time * 0.3));
  // Blob 2: Bottom Right (Blue/Cyan)
  float2 p2 = float2(0.8 - 0.1 * cos(u_time * 0.4), 0.8 - 0.1 * sin(u_time * 0.6));
  // Blob 3: Center Left (Orange)
  float2 p3 = float2(0.1 + 0.2 * sin(u_time * 0.3 + 2.0), 0.6 + 0.1 * cos(u_time * 0.5 + 1.0));

  // Calculate distance fields
  float d1 = distance(uv, p1);
  float d2 = distance(uv, p2);
  float d3 = distance(uv, p3);

  // Soften the falloff
  d1 = smoothstep(0.0, 0.8, d1);
  d2 = smoothstep(0.0, 0.8, d2);
  d3 = smoothstep(0.0, 0.7, d3);

  // Colors - Pastel Light Mode
  float3 c1 = float3(0.91, 0.48, 0.98); // Soft Lavender #E879F9
  float3 c2 = float3(0.40, 0.91, 0.98); // Soft Cyan #67E8F9
  float3 c3 = float3(0.99, 0.73, 0.45); // Soft Peach #FDBA74
  float3 bg = float3(0.96, 0.97, 1.0);  // Alice Blue/Off White Base

  // Mix based on influence
  float3 color = bg;
  color = mix(color, c1, 0.5 * (1.0 - d1)); // Softer influence
  color = mix(color, c2, 0.5 * (1.0 - d2));
  color = mix(color, c3, 0.5 * (1.0 - d3));

  return float4(color, 1.0);
}
`)!;

// Static background - no animation
export default function BackgroundBlobs() {
    // Fixed uniforms for a static snapshot of the gradient
    const uniforms = {
        u_resolution: [SCREEN_WIDTH, SCREEN_HEIGHT],
        u_time: 5.0, // Fixed time point for a nice static composition
    };

    return (
        <Canvas style={StyleSheet.absoluteFillObject}>
            <Fill>
                <Shader source={source} uniforms={uniforms} />
            </Fill>
        </Canvas>
    );
}
