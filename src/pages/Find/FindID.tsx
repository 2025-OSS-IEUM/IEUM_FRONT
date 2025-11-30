import React, { useState } from "react";
import { Platform, ScrollView, View, Modal, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import Svg, { Path } from "react-native-svg";
import { InputField } from "../../components/Field";
import { DefaultButton } from "../../components/Button";
import { CustomText } from "../../components/Text";
import { Container } from "../../components";
import { theme } from "../../styles/theme";
import { authService } from "../../api/auth";
import { Alert } from "react-native";

const FindIDContainer = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const HeaderContainer = styled.View`
  padding-top: 60px;
  padding-bottom: ${props => props.theme.spacing.md}px;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-left: ${props => props.theme.spacing.md}px;
  padding-right: ${props => props.theme.spacing.md}px;
`;

const HeaderContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const HeaderTitle = styled(CustomText)`
  font-size: ${props => props.theme.fontSize.xl}px;
  font-weight: bold;
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.fonts.bold};
  flex: 1;
  text-align: center;
`;

const BackButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
`;

const ScrollContent = styled(ScrollView)`
  flex: 1;
`;

const ContentWrapper = styled.View`
  flex: 1;
  align-items: center;
  padding-top: ${props => props.theme.spacing.xl}px;
  padding-bottom: 40px;
  padding-left: ${props => props.theme.spacing.lg}px;
  padding-right: ${props => props.theme.spacing.lg}px;
`;

const FormContainer = styled.View`
  width: 100%;
  max-width: 400px;
`;

const InputWrapper = styled.View`
  margin-bottom: ${props => props.theme.spacing.lg}px;
`;

const ButtonWrapper = styled.View`
  margin-top: auto;
  margin-bottom: ${props => props.theme.spacing.lg}px;
  width: 100%;
`;

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.View`
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg}px;
  padding: ${props => props.theme.spacing.xl}px;
  width: 80%;
  max-width: 400px;
  align-items: center;
`;

const ModalTitle = styled(CustomText)`
  font-size: ${props => props.theme.fontSize.lg}px;
  font-weight: bold;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md}px;
  font-family: ${props => props.theme.fonts.bold};
`;

const ModalUsername = styled(CustomText)`
  font-size: ${props => props.theme.fontSize.xl}px;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.xl}px;
  font-family: ${props => props.theme.fonts.bold};
`;

const ModalButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.md}px;
  padding: ${props => props.theme.spacing.md}px ${props => props.theme.spacing.xl}px;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

interface FindIDProps {
  onNavigateBack?: () => void;
}

export const FindID = ({ onNavigateBack }: FindIDProps) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [foundUsername, setFoundUsername] = useState("");

  const handleBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleFindID = async () => {
    // Validate email
    let isValid = true;
    if (!email.trim()) {
      setEmailError("이메일을 입력해주세요");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("올바른 이메일 형식이 아닙니다");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (isValid) {
      try {
        setIsLoading(true);
        const response = await authService.lookupUsername({
          email: email.trim().toLowerCase(),
        });

        if (response.username) {
          setFoundUsername(response.username);
          setModalVisible(true);
        } else {
          Alert.alert("아이디 찾기 실패", "해당 이메일로 등록된 아이디를 찾을 수 없습니다.");
        }
      } catch (error: any) {
        // 404 에러인 경우 등록되지 않은 정보로 처리
        if (error.response?.status === 404) {
          Alert.alert("알림", "등록되지 않은 정보입니다.");
          return;
        }

        console.error("[FindID] 아이디 찾기 에러:", error);

        let errorMessage = "아이디 찾기 중 오류가 발생했습니다.";
        if (error.response?.data) {
          if (typeof error.response.data === "string") {
            errorMessage = error.response.data;
          } else if (error.response.data.detail) {
            if (Array.isArray(error.response.data.detail)) {
              errorMessage = error.response.data.detail[0]?.msg || errorMessage;
            } else {
              errorMessage = error.response.data.detail;
            }
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        Alert.alert("아이디 찾기 실패", errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setFoundUsername("");
  };

  return (
    <Container
      padding={0}
      backgroundColor={theme.colors.background}
    >
      <FindIDContainer>
        <HeaderContainer>
          <HeaderRow>
            <HeaderContent>
              <BackButton onPress={handleBack}>
                <Svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <Path
                    d="M15 18L9 12L15 6"
                    stroke={theme.colors.text.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </BackButton>
              <HeaderTitle>아이디 찾기</HeaderTitle>
              <View style={{ width: 40 }} />
            </HeaderContent>
          </HeaderRow>
        </HeaderContainer>

        <ScrollContent
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <ContentWrapper>
            <FormContainer>
              <InputWrapper>
                <InputField
                  label="이메일"
                  labelColor="rgba(25, 28, 50, 0.69)"
                  placeholder="이메일을 입력해주세요"
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    if (emailError) setEmailError("");
                  }}
                  errorText={emailError}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </InputWrapper>
            </FormContainer>
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
                onPress={handleFindID}
                fullWidth
                loading={isLoading}
                disabled={isLoading}
              >
                아이디 찾기
              </DefaultButton>
            </ButtonWrapper>
          </ContentWrapper>
        </ScrollContent>

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseModal}
        >
          <ModalOverlay>
            <ModalContent
              style={
                Platform.OS === "ios"
                  ? {
                      shadowColor: "rgba(0, 0, 0, 0.3)",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 1,
                      shadowRadius: 8,
                    }
                  : { elevation: 8 }
              }
            >
              <ModalTitle>아이디 찾기 결과</ModalTitle>
              <ModalUsername>{foundUsername}</ModalUsername>
              <ModalButton onPress={handleCloseModal}>
                <CustomText
                  color={theme.colors.white}
                  size={theme.fontSize.md}
                  weight="bold"
                >
                  확인
                </CustomText>
              </ModalButton>
            </ModalContent>
          </ModalOverlay>
        </Modal>
      </FindIDContainer>
    </Container>
  );
};
