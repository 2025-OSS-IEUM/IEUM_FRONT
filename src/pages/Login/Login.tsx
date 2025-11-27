import React, { useState } from "react";
import { View, Platform, TouchableOpacity, ScrollView } from "react-native";
import styled from "styled-components/native";
import Svg, { Circle, Path } from "react-native-svg";
import { InputField } from "../../components/Field";
import { DefaultButton } from "../../components/Button";
import { CustomText } from "../../components/Text";
import { Container } from "../../components";
import { theme } from "../../styles/theme";

const LoginContainer = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const ScrollContent = styled(ScrollView)`
  flex: 1;
`;

const ContentWrapper = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-top: 60px;
  padding-bottom: 40px;
  padding-left: ${props => props.theme.spacing.lg}px;
  padding-right: ${props => props.theme.spacing.lg}px;
`;

const LogoContainer = styled.View`
  align-items: center;
  justify-content: center;
  margin-bottom: 60px;
`;

const LogoText = styled(CustomText)`
  margin-top: 20px;
  font-size: ${props => props.theme.fontSize.xxl}px;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
`;

const FormContainer = styled.View`
  width: 100%;
  max-width: 400px;
`;

const InputWrapper = styled.View`
  margin-bottom: ${props => props.theme.spacing.lg}px;
`;

const ButtonWrapper = styled.View`
  margin-top: ${props => props.theme.spacing.xl}px;
  margin-bottom: ${props => props.theme.spacing.lg}px;
`;

const LinkContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: ${props => props.theme.spacing.lg}px;
`;

const LinkDivider = styled.View`
  width: 1px;
  height: 14px;
  background-color: ${props => props.theme.colors.text.link};
  margin-left: ${props => props.theme.spacing.md}px;
  margin-right: ${props => props.theme.spacing.md}px;
`;

const LinkButton = styled.TouchableOpacity`
  padding-top: 4px;
  padding-bottom: 4px;
  padding-left: 8px;
  padding-right: 8px;
`;

interface LoginProps {
  onNavigateToSignUp?: () => void;
  onNavigateToFindId?: () => void;
  onNavigateToFindPassword?: () => void;
  onLoginSuccess?: () => void;
}

import { authService } from "../../api/auth";
import { storage } from "../../utils/storage";
import { Alert } from "react-native";

// ... inside Login component ...

export const Login = ({
  onNavigateToSignUp,
  onNavigateToFindId,
  onNavigateToFindPassword,
  onLoginSuccess,
}: LoginProps) => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [idError, setIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Validate inputs explicitly
    let isValid = true;
    if (!id.trim()) {
      setIdError("아이디를 입력해주세요");
      isValid = false;
    } else {
      setIdError("");
    }

    if (!password.trim()) {
      setPasswordError("비밀번호를 입력해주세요");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (isValid) {
      try {
        setIsLoading(true);
        const response = await authService.login({
          username: id,
          password: password,
        });

        let userToSave = response.user;

        // Check if API returned mock data (userId "example_user" and username "홍길동")
        // If so, use the entered ID to create a temporary user object
        // so the user sees their own information instead of hardcoded data.
        if (response.user && response.user.userId === "example_user" && response.user.username === "홍길동") {
          // Try to preserve existing user info (especially phone number) from storage
          const existingUser = await storage.getUserInfo();

          userToSave = {
            ...response.user,
            user_id: id,
            username: id, // Use the entered ID as username
            name: id,
            // Preserve phone number from existing stored data if available
            phone: existingUser?.phone || undefined,
          } as any;
        } else {
          // Use the response from API as-is
          userToSave = {
            ...response.user,
          };
        }

        await storage.setToken(response.accessToken);
        await storage.setRefreshToken(response.refreshToken);
        // Save user info for fallback
        await storage.setUserInfo(userToSave);

        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } catch (error: any) {
        // 서버 에러 메시지 확인
        const errorDetail = error.response?.data?.detail;
        let errorMessage = "로그인 중 오류가 발생했습니다.";

        if (errorDetail) {
          if (typeof errorDetail === "string") {
            errorMessage = errorDetail;
          } else if (Array.isArray(errorDetail)) {
            errorMessage = errorDetail[0]?.msg || "입력 정보를 확인해주세요.";
          }
        }

        // 500 에러인 경우 더 자세한 정보 로깅
        if (error.response?.status === 500) {
          console.error("[Login Error] 500 Server Error:", {
            url: `${error.config?.baseURL}${error.config?.url}`,
            method: error.config?.method,
            requestData: { username: id, password: "***" },
            responseData: error.response?.data,
          });
          errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.\n\n" + errorMessage;
        }

        Alert.alert("로그인 실패", errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Container
      padding={0}
      backgroundColor={theme.colors.background}
    >
      <LoginContainer>
        <ScrollContent
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <ContentWrapper>
            <LogoContainer>
              <Svg
                width="117"
                height="130"
                viewBox="0 0 117 130"
                fill="none"
              >
                <Circle
                  cx="18.4899"
                  cy="57.1198"
                  r="13.8407"
                  fill="#68D0C6"
                  stroke="#68D0C6"
                />
                <Circle
                  cx="85.5752"
                  cy="14.3407"
                  r="13.8407"
                  fill="#68D0C6"
                  stroke="#68D0C6"
                />
                <Path
                  d="M6.57983 84.3427C66.1302 84.3427 52.5187 35.001 108.423 35.001"
                  stroke="#68D0C6"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <Path
                  d="M78.3039 46.502C77.5841 42.8855 79.4248 39.2072 82.8445 37.8275C90.4559 34.7565 96.4843 33.4495 104.463 33.4013C108.272 33.3782 111.446 36.2016 112.189 39.9377C113.327 45.6536 108.413 50.5888 102.585 50.6394C98.4963 50.6749 94.9168 51.2818 91.3361 52.6059C85.946 54.5991 79.4258 52.1383 78.3039 46.502Z"
                  fill="#68D0C6"
                />
                <Path
                  d="M77.8252 44.0966C77.3861 41.8906 78.5137 39.6603 80.5802 38.772C90.1817 34.6448 96.9753 33.1608 107.181 33.4306C109.389 33.489 111.228 35.1075 111.659 37.2743L113.174 44.8841C113.769 47.8758 111.511 50.5585 108.589 50.8433C107.947 50.9059 107.297 50.8846 106.656 50.9529C99.2206 51.7456 93.8142 52.1754 87.528 55.4724C84.4236 57.1006 79.9159 54.6006 79.2315 51.1625L77.8252 44.0966Z"
                  fill="#68D0C6"
                />
                <Path
                  d="M85.52 100H92.9372L100.953 119.58H101.272L109.287 100H116.704V128.871H110.882V109.969H110.643L103.106 128.752H99.1182L91.5814 109.89H91.3421V128.871H85.52V100Z"
                  fill="#68D0C6"
                />
                <Path
                  d="M67.3417 100H73.3632V118.742C73.3632 125.083 68.5779 129.27 61.3999 129.27C54.222 129.27 49.4766 125.083 49.4766 118.742V100H55.4582V118.264C55.4582 121.574 57.811 124.006 61.3999 124.006C65.0288 124.006 67.3417 121.574 67.3417 118.264V100Z"
                  fill="#68D0C6"
                />
                <Path
                  d="M18.1385 128.871V100H37.519V104.945H24.1202V111.963H36.5221V116.908H24.1202V123.926H37.5589V128.871H18.1385Z"
                  fill="#68D0C6"
                />
                <Path
                  d="M5.98162 100V128.871H0V100H5.98162Z"
                  fill="#68D0C6"
                />
                <Circle
                  cx="10"
                  cy="53"
                  r="3"
                  fill="white"
                />
                <Circle
                  cx="76"
                  cy="10"
                  r="3"
                  fill="white"
                />
              </Svg>
            </LogoContainer>

            <FormContainer>
              <InputWrapper>
                <InputField
                  label="아이디"
                  labelColor="rgba(25, 28, 50, 0.69)"
                  placeholder="아이디를 입력해주세요"
                  value={id}
                  onChangeText={text => {
                    setId(text);
                    if (idError) setIdError("");
                  }}
                  errorText={idError}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </InputWrapper>

              <InputWrapper>
                <InputField
                  label="비밀번호"
                  labelColor="rgba(25, 28, 50, 0.69)"
                  placeholder="비밀번호를 입력해주세요"
                  value={password}
                  onChangeText={text => {
                    setPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  errorText={passwordError}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </InputWrapper>

              <ButtonWrapper
                style={
                  Platform.OS === "ios"
                    ? {
                        shadowColor: "rgba(104, 208, 198, 0.3)",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 1,
                        shadowRadius: 8,
                      }
                    : { elevation: 4 }
                }
              >
                <DefaultButton
                  onPress={handleLogin}
                  fullWidth
                  loading={isLoading}
                  disabled={isLoading}
                >
                  로그인
                </DefaultButton>
              </ButtonWrapper>

              <LinkContainer>
                <LinkButton onPress={onNavigateToSignUp}>
                  <CustomText
                    size={theme.fontSize.sm}
                    color={theme.colors.primary}
                  >
                    회원가입
                  </CustomText>
                </LinkButton>
                <LinkDivider />
                <LinkButton onPress={onNavigateToFindId}>
                  <CustomText
                    size={theme.fontSize.sm}
                    color={theme.colors.text.link}
                  >
                    아이디 찾기
                  </CustomText>
                </LinkButton>
                <LinkDivider />
                <LinkButton onPress={onNavigateToFindPassword}>
                  <CustomText
                    size={theme.fontSize.sm}
                    color={theme.colors.text.link}
                  >
                    비밀번호 찾기
                  </CustomText>
                </LinkButton>
              </LinkContainer>
            </FormContainer>
          </ContentWrapper>
        </ScrollContent>
      </LoginContainer>
    </Container>
  );
};
