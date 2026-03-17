import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

export function getSportTypeColor(sportType: string): {
  bg: string;
  text: string;
} {
  const normalizedKey = (sportType || "").toLowerCase();

  const colorMap: { [key: string]: { bg: string; text: string } } = {
    basketball: { bg: "#FFF3E0", text: "#E65100" },
    soccer: { bg: "#E8F5E9", text: "#2E7D32" },
    football: { bg: "#E8F5E9", text: "#2E7D32" },
    tennis: { bg: "#FFF9C4", text: "#F57F17" },
    baseball: { bg: "#F3E5F5", text: "#7B1FA2" },
    volleyball: { bg: "#E0F7FA", text: "#00838F" },
    "multi-sport": { bg: "#EDE7F6", text: "#5E35B1" },
    "track & field": { bg: "#E3F2FD", text: "#1565C0" },
    fitness: { bg: "#FFEBEE", text: "#C62828" },
    badminton: { bg: "#E0F7FA", text: "#00838F" },
    table_tennis: { bg: "#FFF9C4", text: "#F57F17" },
    billiards: { bg: "#F3E5F5", text: "#7B1FA2" },
    swimming: { bg: "#E3F2FD", text: "#1565C0" },
  };

  return (
    colorMap[normalizedKey] || { bg: Colors.gray[100], text: Colors.gray[700] }
  );
}

