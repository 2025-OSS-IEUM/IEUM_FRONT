import React from "react";
import styled from "styled-components/native";

interface CustomTextProps {
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: "normal" | "semibold" | "bold" | "300" | "600" | "700";
  align?: "left" | "center" | "right";
}

const StyledText = styled.Text<{
  size?: number;
  color?: string;
  weight?: string;
  align?: string;
}>`
  font-size: ${(props) => props.size || 16}px;
  color: ${(props) => props.color || "#000000"};
  font-weight: ${(props) => props.weight || "normal"};
  text-align: ${(props) => props.align || "left"};
  font-family: ${(props) => {
    if (props.weight === "bold" || props.weight === "700") {
      return props.theme.fonts.bold;
    }
    if (props.weight === "semibold") {
      return props.theme.fonts.semiBold;
    }
    if (props.weight === "600") {
      return props.theme.fonts.medium;
    }
    if (props.weight === "300") {
      return props.theme.fonts.light;
    }
    return props.theme.fonts.primary;
  }};
`;

export const CustomText = ({
  children,
  size,
  color,
  weight,
  align,
}: CustomTextProps) => {
  return (
    <StyledText size={size} color={color} weight={weight} align={align}>
      {children}
    </StyledText>
  );
};
