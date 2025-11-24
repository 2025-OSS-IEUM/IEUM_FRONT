import React, { useMemo, forwardRef } from "react";
import styled from "styled-components/native";
import { TextInput, TextInputProps } from "react-native";
import { theme } from "../../styles/theme";

interface InputFieldProps extends Omit<TextInputProps, "style"> {
  label?: string;
  helperText?: string;
  errorText?: string;
  successText?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  containerStyle?: object;
}

interface InputWrapProps {
  borderColor: string;
}

const Container = styled.View`
  width: 100%;
`;

const Label = styled.Text`
  font-family: ${props => props.theme.fonts.primary};
  font-size: ${props => props.theme.fontSize.md}px;
  font-weight: ${props => props.theme.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const InputWrap = styled.View<InputWrapProps>`
  flex-direction: row;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: ${({ borderColor }: InputWrapProps) => borderColor};
  padding-top: 10px;
  padding-bottom: 10px;
`;

const Side = styled.View`
  padding-left: 4px;
  padding-right: 4px;
`;

const StyledTextInput = React.forwardRef<TextInput, TextInputProps>((props, ref) => {
  return (
    <TextInput
      ref={ref}
      style={{
        flex: 1,
        fontFamily: theme.fonts.primary,
        fontSize: theme.fontSize.sm,
        color: theme.colors.text.primary,
        paddingTop: 6,
        paddingBottom: 6,
      }}
      {...props}
    />
  );
});

const HelperText = styled.Text`
  font-family: ${props => props.theme.fonts.primary};
  margin-top: 6px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.fontSize.sm}px;
`;

const ErrorText = styled.Text`
  font-family: ${props => props.theme.fonts.primary};
  margin-top: 6px;
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.fontSize.sm}px;
`;

const SuccessText = styled.Text`
  font-family: ${props => props.theme.fonts.primary};
  margin-top: 6px;
  color: #7ddb69;
  font-size: ${props => props.theme.fontSize.sm}px;
`;

export const InputField = forwardRef<TextInput, InputFieldProps>(
  ({ label, helperText, errorText, successText, left, right, containerStyle, secureTextEntry, ...inputProps }, ref) => {
    const borderColor = useMemo(() => {
      if (errorText) return theme.colors.error;
      if (successText) return "#7DDB69";
      return theme.colors.border;
    }, [errorText, successText]);

    return (
      <Container style={containerStyle}>
        {!!label && <Label>{label}</Label>}

        <InputWrap borderColor={borderColor}>
          {!!left && <Side>{left}</Side>}

          <StyledTextInput
            ref={ref}
            placeholderTextColor={theme.colors.placeholder}
            secureTextEntry={secureTextEntry}
            {...inputProps}
          />

          {!!right && <Side>{right}</Side>}
        </InputWrap>

        {!!errorText ? (
          <ErrorText>{errorText}</ErrorText>
        ) : !!successText ? (
          <SuccessText>{successText}</SuccessText>
        ) : !!helperText ? (
          <HelperText>{helperText}</HelperText>
        ) : null}
      </Container>
    );
  }
);
