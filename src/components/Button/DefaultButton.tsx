import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import styled from "styled-components/native";
import { CustomText } from "../Text";
import { theme } from "../../styles/theme";

interface DefaultButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const StyledButton = styled.TouchableOpacity<{ fullWidth?: boolean }>`
  ${props => (props.fullWidth ? "flex: 1;" : "")}
  padding: ${props => props.theme.spacing.md + 4}px ${props => props.theme.spacing.lg}px;
  background-color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.lg}px;
  align-items: center;
  justify-content: center;
  shadow-color: ${props => props.theme.colors.primary};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 4;
`;

export const DefaultButton = ({ children, fullWidth = false, activeOpacity = 0.8, ...props }: DefaultButtonProps) => {
  return (
    <StyledButton
      fullWidth={fullWidth}
      activeOpacity={activeOpacity}
      {...props}
    >
      <CustomText
        color={theme.colors.white}
        size={theme.fontSize.md}
        weight="bold"
      >
        {children}
      </CustomText>
    </StyledButton>
  );
};
