import React, { useState } from "react";
import { Platform, TouchableOpacity, View, ScrollView, Alert } from "react-native";
import styled from "styled-components/native";
import { InputField } from "../../components/Field";
import { DefaultButton } from "../../components/Button";
import { CustomText } from "../../components/Text";
import { Container } from "../../components";
import { theme } from "../../styles/theme";
import Svg, { Path } from "react-native-svg";
import { authService } from "../../api/auth";
import { DisabilityType } from "../../types/api";
import { useTtsContext } from "../../tts";
import { storage } from "../../utils/storage";

const SignUpContainer = styled.View`
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

const BackButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
`;

const ProgressContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const HeaderContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const ProgressDot = styled.View<{ active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${props => (props.active ? props.theme.colors.primary : props.theme.colors.border)};
  margin-left: ${props => props.theme.spacing.xs}px;
  margin-right: ${props => props.theme.spacing.xs}px;
`;

const ScrollContent = styled(ScrollView)`
  flex: 1;
`;

const ContentWrapper = styled.View`
  flex: 1;
  padding-top: ${props => props.theme.spacing.xl}px;
  padding-bottom: ${props => props.theme.spacing.xl}px;
  padding-left: ${props => props.theme.spacing.lg}px;
  padding-right: ${props => props.theme.spacing.lg}px;
`;

const Title = styled(CustomText)`
  font-size: ${props => props.theme.fontSize.xl}px;
  font-weight: bold;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xl}px;
  font-family: ${props => props.theme.fonts.bold};
`;

const FormContainer = styled.View`
  flex-shrink: 1;
`;

const InputWrapper = styled.View`
  margin-bottom: ${props => props.theme.spacing.lg}px;
`;

const ButtonWrapper = styled.View`
  margin-top: ${props => props.theme.spacing.xl}px;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const TermsContainer = styled.View`
  margin-top: ${props => props.theme.spacing.md}px;
`;

const TermsItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding-top: ${props => props.theme.spacing.md}px;
  padding-bottom: ${props => props.theme.spacing.md}px;
  padding-left: ${props => props.theme.spacing.sm}px;
  padding-right: ${props => props.theme.spacing.sm}px;
`;

const CheckboxContainer = styled.View<{ checked: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border-width: 2px;
  border-color: ${props => (props.checked ? props.theme.colors.primary : props.theme.colors.border)};
  background-color: ${props => (props.checked ? props.theme.colors.primary : "transparent")};
  align-items: center;
  justify-content: center;
  margin-right: ${props => props.theme.spacing.md}px;
`;

const TermsText = styled(CustomText)`
  flex: 1;
  font-size: ${props => props.theme.fontSize.md}px;
  color: ${props => props.theme.colors.text.primary};
`;

const ArrowIcon = styled.View`
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
`;

const SelectionButton = styled.TouchableOpacity<{ selected: boolean }>`
  padding: 16px;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${props => (props.selected ? props.theme.colors.primary : props.theme.colors.border)};
  background-color: ${props => (props.selected ? props.theme.colors.primary + "20" : "transparent")};
  margin-bottom: 12px;
`;

interface SignUpProps {
  onNavigateBack?: () => void;
  onSignUpSuccess?: () => void;
}

interface AccountInfo {
  id: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface PersonalInfo {
  name: string;
  phone: string;
  birthDate: string;
}

interface TermsAgreement {
  allAgreed: boolean;
  serviceTerms: boolean;
  privacyPolicy: boolean;
  locationService: boolean;
  age14: boolean;
  marketing: boolean;
}

export const SignUp = ({ onNavigateBack, onSignUpSuccess }: SignUpProps) => {
  const { updateSettings } = useTtsContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    id: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "",
    phone: "",
    birthDate: "",
  });
  const [disabilityType, setDisabilityType] = useState<DisabilityType>("none");

  const [terms, setTerms] = useState<TermsAgreement>({
    allAgreed: false,
    serviceTerms: false,
    privacyPolicy: false,
    locationService: false,
    age14: false,
    marketing: false,
  });

  const [errors, setErrors] = useState<{
    account?: Partial<AccountInfo>;
    personal?: Partial<PersonalInfo>;
    terms?: string;
  }>({});

  const [validation, setValidation] = useState<{
    idAvailable?: boolean;
    emailAvailable?: boolean;
    passwordValid?: {
      minLength: boolean;
      hasNumber: boolean;
      hasSpecialChar: boolean;
    };
    passwordMatch?: boolean;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

  const formatPhoneNumber = (text: string) => {
    const numbers = text.replace(/[^\d]/g, "");
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const formatBirthDate = (text: string) => {
    const numbers = text.replace(/[^\d]/g, "");
    if (numbers.length <= 4) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    } else {
      return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6, 8)}`;
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (onNavigateBack) {
      onNavigateBack();
    }
  };

  const validateStep1 = () => {
    const newErrors: Partial<AccountInfo> = {};
    let isValid = true;

    if (!accountInfo.id.trim()) {
      newErrors.id = "아이디를 입력해주세요";
      isValid = false;
    }

    if (!accountInfo.email.trim()) {
      newErrors.email = "이메일을 입력해주세요";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountInfo.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
      isValid = false;
    }

    if (!accountInfo.password.trim()) {
      newErrors.password = "비밀번호를 입력해주세요";
      isValid = false;
    } else if (accountInfo.password.length < 8) {
      newErrors.password = "비밀번호는 8자 이상이어야 합니다";
      isValid = false;
    }

    if (!accountInfo.confirmPassword.trim()) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요";
      isValid = false;
    } else if (accountInfo.password !== accountInfo.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
      isValid = false;
    }

    setErrors({ account: newErrors });
    return isValid;
  };

  const validateStep2 = () => {
    const newErrors: Partial<PersonalInfo> = {};
    let isValid = true;

    if (!personalInfo.name.trim()) {
      newErrors.name = "이름을 입력해주세요";
      isValid = false;
    }

    if (!personalInfo.phone.trim()) {
      newErrors.phone = "전화번호를 입력해주세요";
      isValid = false;
    }

    if (!personalInfo.birthDate.trim()) {
      newErrors.birthDate = "생년월일을 입력해주세요";
      isValid = false;
    }

    setErrors({ personal: newErrors });
    return isValid;
  };

  const validateStep3 = () => {
    if (!terms.serviceTerms || !terms.privacyPolicy || !terms.locationService || !terms.age14) {
      setErrors(prev => ({
        ...prev,
        terms: "필수 약관에 모두 동의해주세요",
      }));
      return false;
    }
    setErrors(prev => ({ ...prev, terms: undefined }));
    return true;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      if (validateStep3()) {
        setCurrentStep(4);
      }
    } else if (currentStep === 4) {
      // Step 2에서 name이 필수로 검증되므로, 여기서는 항상 값이 있음
      const trimmedName = personalInfo.name.trim();

      try {
        setIsLoading(true);

        // 요청 데이터를 명시적으로 정리하여 서버에 전송 (OpenAPI 스펙 준수)
        // SignupRequest 스펙:
        // - username: string (4-20자) - required
        // - email: string (email format) - required
        // - password: string (최소 8자) - required
        // - passwordConfirm: string - required
        // - name: string (1-50자) OR null - required (null 허용)
        // - disabilityType: DisabilityType enum - required
        // - consent: ConsentCreate { terms: boolean, privacy: boolean } - required
        const signupData: {
          username: string;
          email: string;
          password: string;
          passwordConfirm: string;
          name: string;
          phone: string;
          disabilityType: DisabilityType;
          consent: {
            terms: boolean;
            privacy: boolean;
          };
        } = {
          username: accountInfo.id.trim(),
          email: accountInfo.email.trim().toLowerCase(),
          password: accountInfo.password,
          passwordConfirm: accountInfo.confirmPassword,
          name: trimmedName, // Step 2에서 검증되었으므로 항상 값이 있음
          phone: personalInfo.phone.replace(/[^\d]/g, ""), // 하이픈 제거하고 숫자만 전송
          disabilityType: disabilityType,
          consent: {
            terms: Boolean(terms.serviceTerms),
            privacy: Boolean(terms.privacyPolicy),
          },
        };

        // 데이터 검증
        if (!signupData.username || signupData.username.length < 4 || signupData.username.length > 20) {
          throw new Error("아이디는 4자 이상 20자 이하여야 합니다.");
        }
        if (!signupData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
          throw new Error("올바른 이메일 형식이 아닙니다.");
        }
        if (!signupData.password || signupData.password.length < 8) {
          throw new Error("비밀번호는 8자 이상이어야 합니다.");
        }
        if (signupData.password !== signupData.passwordConfirm) {
          throw new Error("비밀번호가 일치하지 않습니다.");
        }
        if (!signupData.consent.terms || !signupData.consent.privacy) {
          throw new Error("필수 약관에 동의해주세요.");
        }

        const signupResponse = await authService.signup(signupData);

        // 회원가입 응답 유효성 검증
        if (!signupResponse) {
          throw new Error("회원가입 응답이 없습니다.");
        }

        // 필수 필드 확인
        if (!signupResponse.username || !signupResponse.email) {
          throw new Error("회원가입 응답에 필수 정보가 없습니다.");
        }

        // mock 데이터인지 확인 (example_user 등 테스트 데이터)
        if (
          signupResponse.username === "example_user" ||
          signupResponse.email === "user@example.com" ||
          signupResponse.username === "홍길동"
        ) {
          throw new Error("회원가입이 제대로 처리되지 않았습니다. 서버 오류가 발생했습니다.");
        }

        // 요청한 정보와 응답 정보가 일치하는지 확인
        if (signupResponse.username !== signupData.username) {
          throw new Error("회원가입 응답의 아이디가 일치하지 않습니다.");
        }

        if (signupResponse.email.toLowerCase() !== signupData.email.toLowerCase()) {
          throw new Error("회원가입 응답의 이메일이 일치하지 않습니다.");
        }

        // Save user info with email and phone from signup form
        // 스프레드를 먼저 하고, 필요한 필드를 덮어쓰기
        const userInfoToSave = {
          ...signupResponse, // Include any additional fields from API response
          user_id: signupResponse.username, // 서버에서 받은 username 사용
          username: signupResponse.username, // 서버에서 받은 username 사용
          email: signupResponse.email, // 서버에서 받은 email 사용
          name: personalInfo.name,
          phone: personalInfo.phone,
        };
        await storage.setUserInfo(userInfoToSave);

        // 시각 장애인 경우 TTS 자동 활성화
        if (disabilityType === "blind" || disabilityType === "low_vision") {
          await updateSettings({ enabled: true });
        } else {
          await updateSettings({ enabled: false });
        }

        Alert.alert("회원가입 성공", "회원가입이 완료되었습니다.", [{ text: "확인", onPress: onSignUpSuccess }]);
      } catch (error: any) {
        let errorMessage = "오류가 발생했습니다.";
        if (error.response?.data) {
          if (typeof error.response.data === "string") {
            errorMessage = error.response.data;
          } else if (error.response.data.detail) {
            if (Array.isArray(error.response.data.detail)) {
              errorMessage =
                error.response.data.detail[0]?.msg || error.response.data.detail[0]?.message || errorMessage;
            } else {
              errorMessage = error.response.data.detail;
            }
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        // 500 에러인 경우 더 자세한 메시지 표시
        if (error.response?.status === 500) {
          errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.\n\n" + errorMessage;
        }

        Alert.alert("회원가입 실패", errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAllAgree = () => {
    const newValue = !terms.allAgreed;
    setTerms({
      allAgreed: newValue,
      serviceTerms: newValue,
      privacyPolicy: newValue,
      locationService: newValue,
      age14: newValue,
      marketing: newValue,
    });
  };

  const handleTermToggle = (key: keyof TermsAgreement) => {
    setTerms(prev => {
      const newTerms = { ...prev, [key]: !prev[key] };
      newTerms.allAgreed =
        newTerms.serviceTerms && newTerms.privacyPolicy && newTerms.locationService && newTerms.age14;
      return newTerms;
    });
  };

  const checkIdAvailability = async (id: string) => {
    if (id.length >= 3) {
      try {
        const response = await authService.checkUsername(id);
        setValidation(prev => ({ ...prev, idAvailable: response.available }));
      } catch (e) {
        setValidation(prev => ({ ...prev, idAvailable: false }));
      }
    } else {
      setValidation(prev => ({ ...prev, idAvailable: false }));
    }
  };

  const checkEmailAvailability = async (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      try {
        const response = await authService.checkEmail(email);
        setValidation(prev => ({ ...prev, emailAvailable: response.available }));
      } catch (e) {
        setValidation(prev => ({ ...prev, emailAvailable: false }));
      }
    } else {
      setValidation(prev => ({ ...prev, emailAvailable: false }));
    }
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    setValidation(prev => ({
      ...prev,
      passwordValid: { minLength, hasNumber, hasSpecialChar },
    }));
  };

  const checkPasswordMatch = (password: string, confirmPassword: string) => {
    if (confirmPassword.length > 0) {
      setValidation(prev => ({
        ...prev,
        passwordMatch: password === confirmPassword,
      }));
    } else {
      setValidation(prev => ({ ...prev, passwordMatch: undefined }));
    }
  };

  const renderStep1 = () => (
    <>
      <Title>계정 정보를 입력해 주세요</Title>
      <FormContainer>
        <InputWrapper>
          <InputField
            label="아이디"
            labelColor="rgba(25, 28, 50, 0.69)"
            placeholder="아이디를 입력해주세요"
            value={accountInfo.id}
            onChangeText={text => {
              setAccountInfo(prev => ({ ...prev, id: text }));
              if (text.length > 0) {
                checkIdAvailability(text);
              } else {
                setValidation(prev => ({ ...prev, idAvailable: undefined }));
              }
              if (errors.account?.id) {
                setErrors(prev => ({
                  ...prev,
                  account: { ...prev.account, id: undefined },
                }));
              }
            }}
            errorText={
              validation.idAvailable === false && accountInfo.id.length > 0
                ? "이미 사용 중인 아이디입니다"
                : errors.account?.id
            }
            successText={
              validation.idAvailable === true && accountInfo.id.length > 0 ? "사용 가능한 아이디입니다" : undefined
            }
            autoCapitalize="none"
            autoCorrect={false}
          />
        </InputWrapper>

        <InputWrapper>
          <InputField
            label="이메일"
            labelColor="rgba(25, 28, 50, 0.69)"
            placeholder="이메일을 입력해주세요"
            value={accountInfo.email}
            onChangeText={text => {
              setAccountInfo(prev => ({ ...prev, email: text }));
              if (text.length > 0) {
                checkEmailAvailability(text);
              } else {
                setValidation(prev => ({
                  ...prev,
                  emailAvailable: undefined,
                }));
              }
              if (errors.account?.email) {
                setErrors(prev => ({
                  ...prev,
                  account: { ...prev.account, email: undefined },
                }));
              }
            }}
            errorText={
              validation.emailAvailable === false && accountInfo.email.length > 0
                ? "이미 사용 중인 이메일입니다"
                : errors.account?.email
            }
            successText={
              validation.emailAvailable === true && accountInfo.email.length > 0
                ? "사용 가능한 이메일입니다"
                : undefined
            }
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </InputWrapper>

        <InputWrapper>
          <InputField
            label="비밀번호"
            labelColor="rgba(25, 28, 50, 0.69)"
            placeholder="비밀번호를 입력해주세요"
            value={accountInfo.password}
            onChangeText={text => {
              setAccountInfo(prev => ({ ...prev, password: text }));
              validatePassword(text);
              checkPasswordMatch(text, accountInfo.confirmPassword);
              if (errors.account?.password) {
                setErrors(prev => ({
                  ...prev,
                  account: { ...prev.account, password: undefined },
                }));
              }
            }}
            errorText={errors.account?.password}
            passwordValidation={validation.passwordValid}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </InputWrapper>

        <InputWrapper>
          <InputField
            label="비밀번호 확인"
            labelColor="rgba(25, 28, 50, 0.69)"
            placeholder="비밀번호를 다시 입력해주세요"
            value={accountInfo.confirmPassword}
            onChangeText={text => {
              setAccountInfo(prev => ({ ...prev, confirmPassword: text }));
              checkPasswordMatch(accountInfo.password, text);
              if (errors.account?.confirmPassword) {
                setErrors(prev => ({
                  ...prev,
                  account: { ...prev.account, confirmPassword: undefined },
                }));
              }
            }}
            errorText={
              validation.passwordMatch === false && accountInfo.confirmPassword.length > 0
                ? "비밀번호가 일치하지 않습니다"
                : errors.account?.confirmPassword
            }
            successText={
              validation.passwordMatch === true && accountInfo.confirmPassword.length > 0
                ? "비밀번호가 일치합니다"
                : undefined
            }
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </InputWrapper>
      </FormContainer>
    </>
  );

  const renderStep2 = () => (
    <>
      <Title>개인 정보를 입력해 주세요</Title>
      <FormContainer>
        <InputWrapper>
          <InputField
            label="이름"
            labelColor="rgba(25, 28, 50, 0.69)"
            placeholder="이름을 입력해주세요"
            value={personalInfo.name}
            onChangeText={text => {
              setPersonalInfo(prev => ({ ...prev, name: text }));
              if (errors.personal?.name) {
                setErrors(prev => ({
                  ...prev,
                  personal: { ...prev.personal, name: undefined },
                }));
              }
            }}
            errorText={errors.personal?.name}
          />
        </InputWrapper>

        <InputWrapper>
          <InputField
            label="전화번호"
            labelColor="rgba(25, 28, 50, 0.69)"
            placeholder="전화번호를 입력해주세요"
            value={personalInfo.phone}
            onChangeText={text => {
              const formatted = formatPhoneNumber(text);
              setPersonalInfo(prev => ({ ...prev, phone: formatted }));
              if (errors.personal?.phone) {
                setErrors(prev => ({
                  ...prev,
                  personal: { ...prev.personal, phone: undefined },
                }));
              }
            }}
            errorText={errors.personal?.phone}
            keyboardType="phone-pad"
            maxLength={13}
          />
        </InputWrapper>

        <InputWrapper>
          <InputField
            label="생년월일"
            labelColor="rgba(25, 28, 50, 0.69)"
            placeholder="생년월일을 입력해주세요"
            value={personalInfo.birthDate}
            onChangeText={text => {
              const formatted = formatBirthDate(text);
              setPersonalInfo(prev => ({ ...prev, birthDate: formatted }));
              if (errors.personal?.birthDate) {
                setErrors(prev => ({
                  ...prev,
                  personal: { ...prev.personal, birthDate: undefined },
                }));
              }
            }}
            errorText={errors.personal?.birthDate}
            keyboardType="numeric"
            maxLength={10}
          />
        </InputWrapper>
      </FormContainer>
    </>
  );

  const renderStep3 = () => (
    <>
      <Title>원활한 서비스 이용을 위해{`\n`}필수 약관 동의가 필요해요</Title>
      <FormContainer>
        <TermsContainer>
          <TermsItem onPress={handleAllAgree}>
            <CheckboxContainer checked={terms.allAgreed}>
              {terms.allAgreed && (
                <Svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <Path
                    d="M13.3333 4L6 11.3333L2.66667 8"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              )}
            </CheckboxContainer>
            <TermsText weight="bold">모두 동의합니다.</TermsText>
          </TermsItem>

          <TermsItem onPress={() => handleTermToggle("serviceTerms")}>
            <CheckboxContainer checked={terms.serviceTerms}>
              {terms.serviceTerms && (
                <Svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <Path
                    d="M13.3333 4L6 11.3333L2.66667 8"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              )}
            </CheckboxContainer>
            <TermsText>(필수) 서비스 이용약관에 동의합니다.</TermsText>
            <ArrowIcon>
              <Svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <Path
                  d="M9 18L15 12L9 6"
                  stroke={theme.colors.text.secondary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </ArrowIcon>
          </TermsItem>

          <TermsItem onPress={() => handleTermToggle("privacyPolicy")}>
            <CheckboxContainer checked={terms.privacyPolicy}>
              {terms.privacyPolicy && (
                <Svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <Path
                    d="M13.3333 4L6 11.3333L2.66667 8"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              )}
            </CheckboxContainer>
            <TermsText>(필수) 개인정보 처리방침에 동의합니다.</TermsText>
            <ArrowIcon>
              <Svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <Path
                  d="M9 18L15 12L9 6"
                  stroke={theme.colors.text.secondary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </ArrowIcon>
          </TermsItem>

          <TermsItem onPress={() => handleTermToggle("locationService")}>
            <CheckboxContainer checked={terms.locationService}>
              {terms.locationService && (
                <Svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <Path
                    d="M13.3333 4L6 11.3333L2.66667 8"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              )}
            </CheckboxContainer>
            <TermsText>(필수) 위치기반 서비스 이용약관에 동의합니다.</TermsText>
            <ArrowIcon>
              <Svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <Path
                  d="M9 18L15 12L9 6"
                  stroke={theme.colors.text.secondary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </ArrowIcon>
          </TermsItem>

          <TermsItem onPress={() => handleTermToggle("age14")}>
            <CheckboxContainer checked={terms.age14}>
              {terms.age14 && (
                <Svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <Path
                    d="M13.3333 4L6 11.3333L2.66667 8"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              )}
            </CheckboxContainer>
            <TermsText>(필수) 만 14세 이상입니다.</TermsText>
          </TermsItem>

          <TermsItem onPress={() => handleTermToggle("marketing")}>
            <CheckboxContainer checked={terms.marketing}>
              {terms.marketing && (
                <Svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <Path
                    d="M13.3333 4L6 11.3333L2.66667 8"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              )}
            </CheckboxContainer>
            <TermsText>(선택) 마케팅 정보 수신에 동의합니다.</TermsText>
          </TermsItem>
        </TermsContainer>
        {errors.terms && (
          <CustomText
            size={theme.fontSize.sm}
            color={theme.colors.error}
            style={{ marginTop: theme.spacing.sm }}
          >
            {errors.terms}
          </CustomText>
        )}
      </FormContainer>
    </>
  );

  const renderStep4 = () => {
    const types: { label: string; value: DisabilityType }[] = [
      { label: "해당 없음", value: "none" },
      { label: "시각 장애 (전맹)", value: "blind" },
      { label: "시각 장애 (저시력)", value: "low_vision" },
      { label: "청각 장애", value: "hearing" },
      { label: "지체 장애", value: "mobility" },
      { label: "인지 장애", value: "cognitive" },
      { label: "기타", value: "other" },
    ];

    return (
      <>
        <Title>장애 유형을 선택해 주세요</Title>
        <FormContainer>
          {types.map(type => (
            <SelectionButton
              key={type.value}
              selected={disabilityType === type.value}
              onPress={() => setDisabilityType(type.value)}
            >
              <CustomText color={disabilityType === type.value ? theme.colors.primary : theme.colors.text.primary}>
                {type.label}
              </CustomText>
            </SelectionButton>
          ))}
        </FormContainer>
      </>
    );
  };

  return (
    <Container
      padding={0}
      backgroundColor={theme.colors.background}
    >
      <SignUpContainer>
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
              <ProgressContainer>
                <ProgressDot active={currentStep >= 1} />
                <ProgressDot active={currentStep >= 2} />
                <ProgressDot active={currentStep >= 3} />
                <ProgressDot active={currentStep >= 4} />
              </ProgressContainer>
              <View style={{ width: 40 }} />
            </HeaderContent>
          </HeaderRow>
        </HeaderContainer>

        <ScrollContent
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <ContentWrapper>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            <ButtonWrapper
              style={
                Platform.OS === "ios"
                  ? {
                      shadowColor: "rgba(104, 208, 198, 0.3)",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 1,
                    }
                  : { elevation: 2 }
              }
            >
              <DefaultButton
                onPress={handleNext}
                fullWidth
                loading={isLoading}
                disabled={isLoading}
              >
                {currentStep === 4 ? "완료" : "다음"}
              </DefaultButton>
            </ButtonWrapper>
          </ContentWrapper>
        </ScrollContent>
      </SignUpContainer>
    </Container>
  );
};
