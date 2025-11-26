import React, { useMemo, forwardRef } from "react";
import styled from "styled-components/native";
import { TextInput, TextInputProps, View } from "react-native";
import { theme } from "../../styles/theme";
import Svg, { Path } from "react-native-svg";

interface PasswordValidation {
  minLength: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

interface InputFieldProps extends Omit<TextInputProps, "style"> {
  label?: string;
  labelColor?: string;
  helperText?: string;
  errorText?: string;
  successText?: string;
  passwordValidation?: PasswordValidation;
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

const Label = styled.Text<{ labelColor?: string }>`
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: ${(props) => props.theme.fontSize.md}px;
  font-weight: 600;
  color: ${(props) => props.labelColor || props.theme.colors.text.primary};
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

const StyledTextInput = React.forwardRef<TextInput, TextInputProps>(
  (props, ref) => {
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
  }
);

const HelperText = styled.Text`
  font-family: ${(props) => props.theme.fonts.primary};
  margin-top: 6px;
  color: ${(props) => props.theme.colors.text.secondary};
  font-size: ${(props) => props.theme.fontSize.sm}px;
`;

const MessageContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 6px;
`;

const MessageText = styled.Text<{ color: string }>`
  font-family: ${(props) => props.theme.fonts.primary};
  color: ${(props) => props.color};
  font-size: ${(props) => props.theme.fontSize.sm}px;
  margin-left: 4px;
`;

const PasswordValidationContainer = styled.View`
  margin-top: 6px;
`;

const PasswordValidationItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 4px;
`;

const IconContainer = styled.View`
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
`;

const CheckIcon = () => (
  <IconContainer>
    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <Path
        d="M13.3333 4L6 11.3333L2.66667 8"
        stroke="#7DDB69"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </IconContainer>
);

const ErrorIcon = () => (
  <IconContainer>
    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <Path
        d="M12 4L4 12M4 4L12 12"
        stroke={theme.colors.error}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </IconContainer>
);

export const InputField = forwardRef<TextInput, InputFieldProps>(
  (
    {
      label,
      labelColor,
      helperText,
      errorText,
      successText,
      passwordValidation,
      left,
      right,
      containerStyle,
      secureTextEntry,
      ...inputProps
    },
    ref
  ) => {
    const borderColor = useMemo(() => {
      if (errorText) return theme.colors.error;
      if (successText) return "#7DDB69";
      return theme.colors.border;
    }, [errorText, successText]);

    return (
      <Container style={containerStyle}>
        {!!label && <Label labelColor={labelColor}>{label}</Label>}

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

        {!!passwordValidation ? (
          <PasswordValidationContainer>
            <PasswordValidationItem>
              {passwordValidation.minLength ? <CheckIcon /> : <View style={{ width: 16, height: 16 }} />}
              <MessageText color={passwordValidation.minLength ? "#7DDB69" : theme.colors.text.secondary}>
                8개 문자 이상
              </MessageText>
            </PasswordValidationItem>
            <PasswordValidationItem>
              {passwordValidation.hasNumber ? <CheckIcon /> : <View style={{ width: 16, height: 16 }} />}
              <MessageText color={passwordValidation.hasNumber ? "#7DDB69" : theme.colors.text.secondary}>
                숫자 1개 이상
              </MessageText>
            </PasswordValidationItem>
            <PasswordValidationItem>
              {passwordValidation.hasSpecialChar ? <CheckIcon /> : <View style={{ width: 16, height: 16 }} />}
              <MessageText color={passwordValidation.hasSpecialChar ? "#7DDB69" : theme.colors.text.secondary}>
                특수문자 1개 이상
              </MessageText>
            </PasswordValidationItem>
          </PasswordValidationContainer>
        ) : !!errorText ? (
          <MessageContainer>
            <ErrorIcon />
            <MessageText color={theme.colors.error}>{errorText}</MessageText>
          </MessageContainer>
        ) : !!successText ? (
          <MessageContainer>
            <CheckIcon />
            <MessageText color="#7DDB69">{successText}</MessageText>
          </MessageContainer>
        ) : !!helperText ? (
          <HelperText>{helperText}</HelperText>
        ) : null}
      </Container>
    );
  }
);
