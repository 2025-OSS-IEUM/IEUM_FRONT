import React, { useState, useRef, useEffect, useMemo } from "react";
import { Platform, TouchableOpacity, Animated, Modal, KeyboardAvoidingView } from "react-native";
import styled from "styled-components/native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, SvgUri } from "react-native-svg";
import { useAssets } from "expo-asset";
import { Container, CustomText, DefaultButton, InputField } from "../../components";
import { VoiceSettings } from "./VoiceSettings";
import { useScreenReader } from "../../tts";

const ProfileScroll = styled.ScrollView`
  flex: 1;
`;

const ContentWrapper = styled.View`
  flex: 1;
  padding-bottom: 32px;
  padding-left: 24px;
  padding-right: 24px;
`;

const HEADER_HEIGHT = 72;
const HEADER_TOP_OFFSET = 44;
const HEADER_TOTAL_HEIGHT = HEADER_HEIGHT + HEADER_TOP_OFFSET;

const Header = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${HEADER_TOTAL_HEIGHT}px;
  flex-direction: row;
  align-items: center;
  padding-top: ${HEADER_TOP_OFFSET}px;
  padding-left: 20px;
  padding-right: 20px;
  background-color: #f8f9fb;
  z-index: 10;
`;

const HeaderLeft = styled.View`
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
`;

const HeaderCenter = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const HeaderTitle = styled(CustomText)`
  font-size: 20px;
  font-weight: 700;
  color: #4b4b4b;
  text-align: center;
`;

const HeaderRight = styled.View`
  width: 40px;
  height: 40px;
`;

const GreetingCard = styled.View`
  padding-left: 10px;
`;

const GreetingText = styled(CustomText)`
  font-size: 24px;
  color: #4b4b4b;
  font-weight: 700;
  margin-bottom: 4px;
`;

const SubLink = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
`;

const SubLinkText = styled.Text`
  color: #797979;
  font-size: 16px;
  margin-right: 4px;
  margin-bottom: 8px;

  margin-top: 4px;
  font-family: ${props => props.theme.fonts.primary};
`;

const StatsCardContainer = styled.View`
  position: relative;
  z-index: 10;
`;

const StatsCardWrapper = styled.View`
  border-radius: 20px;
  border: 1px solid #c4bfbe;
  overflow: hidden;
  z-index: 20;
`;

const GradientCard = styled(LinearGradient)`
  flex-direction: row;
  align-items: center;
  padding-top: 32px;
  padding-bottom: 32px;
  padding-left: 24px;
  padding-right: 24px;
`;

const StatsList = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const StatItem = styled.View`
  flex: 1;
  align-items: center;
`;

const StatValue = styled(CustomText)`
  font-size: 28px;
  font-weight: 700;
`;

const StatLabel = styled(CustomText)`
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
`;

const StatDivider = styled.View`
  width: 1px;
  height: 48px;
  background-color: rgba(255, 255, 255, 0.35);
`;

const DogFigure = styled.View`
  position: absolute;
  top: -100px;
  right: -10px;
  width: 130px;
  height: 130px;
  justify-content: center;
  align-items: center;
  z-index: 5;
  transform: scaleX(-1);
`;

const Section = styled.View`
  margin-top: 32px;
`;

const SectionHeader = styled.View`
  margin-bottom: 12px;
  padding-left: 20px;
  margin-left: -10px;
`;

const SectionTitle = styled(CustomText)`
  font-size: 18px;
  font-weight: 600;
  color: #3d3d3d;
`;

const SectionCard = styled.View`
  background-color: #ffffff;
  border-radius: 20px;
  border: 1px solid #ededed;
`;

const Row = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-top: 18px;
  padding-bottom: 18px;
  padding-left: 20px;
  padding-right: 12px;
`;

const RowLabel = styled(CustomText)`
  font-size: 16px;
  color: #4b4b4b;
`;

const ArrowWrapper = styled.View`
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
`;

const SubLinkArrow = styled.View`
  width: 12px;
  height: 24px;
  margin-bottom: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 6px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: #f2f2f2;
  margin-left: 20px;
  margin-right: 12px;
`;

const ArrowIcon = () => (
  <Svg
    width="12"
    height="24"
    viewBox="0 0 12 24"
    fill="none"
  >
    <Path
      d="M2.45199 6.57999L3.51299 5.51999L9.29199 11.297C9.38514 11.3896 9.45907 11.4996 9.50952 11.6209C9.55997 11.7421 9.58594 11.8722 9.58594 12.0035C9.58594 12.1348 9.55997 12.2648 9.50952 12.3861C9.45907 12.5073 9.38514 12.6174 9.29199 12.71L3.51299 18.49L2.45299 17.43L7.87699 12.005L2.45199 6.57999Z"
      fill="#797979"
    />
  </Svg>
);

const BackIcon = () => (
  <Svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <Path
      d="M15 18L9 12L15 6"
      stroke="#4b4b4b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EditIcon = () => (
  <Svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <Path
      d="M11.3333 2.00004C11.5084 1.82493 11.7163 1.68605 11.9447 1.59129C12.1731 1.49654 12.4173 1.44775 12.6639 1.44775C12.9105 1.44775 13.1547 1.49654 13.3831 1.59129C13.6115 1.68605 13.8194 1.82493 13.9945 2.00004C14.1696 2.17515 14.3085 2.38305 14.4032 2.61146C14.498 2.83987 14.5468 3.08405 14.5468 3.33071C14.5468 3.57737 14.498 3.82155 14.4032 4.04996C14.3085 4.27837 14.1696 4.48627 13.9945 4.66138L5.17667 13.4792L1.33334 14.6667L2.52084 10.8234L11.3333 2.00004Z"
      stroke="#4b4b4b"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HeaderBackButton = styled(TouchableOpacity)`
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
`;

const MyInfoScroll = styled.ScrollView`
  flex: 1;
`;

const MyInfoContent = styled.View`
  padding-top: ${HEADER_TOTAL_HEIGHT + 40}px;
  padding-bottom: 32px;
  padding-left: 24px;
  padding-right: 24px;
  align-items: center;
`;

const ProfileImageWrapper = styled(Animated.View)`
  margin-bottom: 20px;
`;

const ProfileImageContainer = styled(Animated.View)`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const ProfileGradient = styled(LinearGradient)`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  justify-content: center;
  align-items: center;
`;

const DefaultProfileIcon = () => (
  <Svg
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
  >
    <Path
      d="M40 40C47.4558 40 53.5 33.9558 53.5 26.5C53.5 19.0442 47.4558 13 40 13C32.5442 13 26.5 19.0442 26.5 26.5C26.5 33.9558 32.5442 40 40 40Z"
      fill="#ffffff"
    />
    <Path
      d="M40 45C28.9543 45 20 53.9543 20 65V67H60V65C60 53.9543 51.0457 45 40 45Z"
      fill="#ffffff"
    />
  </Svg>
);

const NameContainer = styled(Animated.View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 40px;
`;

const NameText = styled(CustomText)`
  font-size: 22px;
  font-weight: 700;
  color: #4b4b4b;
  margin-right: 8px;
`;

const EditButton = styled(TouchableOpacity)`
  width: 32px;
  height: 32px;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  background-color: #f0f0f0;
`;

const EditButtonAnimated = styled(Animated.View)`
  width: 32px;
  height: 32px;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  background-color: #f0f0f0;
`;

const InfoCard = styled(Animated.View)`
  width: 100%;
  background-color: #ffffff;
  border-radius: 20px;
  margin-bottom: 24px;
  overflow: hidden;
`;

const InfoCardGradient = styled(LinearGradient)`
  width: 100%;
  border-radius: 20px;
`;

const InfoRow = styled.View`
  padding-top: 18px;
  padding-bottom: 18px;
  padding-left: 20px;
  padding-right: 20px;
`;

const InfoLabel = styled(CustomText)`
  font-size: 14px;
  color: #4b4b4b;
  margin-bottom: 8px;
`;

const InfoValue = styled(CustomText)`
  font-size: 16px;
  color: #797979;
`;

const InfoDivider = styled.View`
  height: 1px;
  background-color: #f2f2f2;
  margin-left: 20px;
  margin-right: 20px;
`;

const EditButtonContainer = styled(Animated.View)`
  width: 100%;
  padding-top: 20px;
`;

const BounceButton = styled(Animated.View)`
  width: 100%;
`;

const ModalButtonContainer = styled.View`
  flex-direction: row;
  gap: 12px;
  width: 100%;
`;

const CancelButton = styled(TouchableOpacity)`
  flex: 1;
  padding-top: 14px;
  padding-bottom: 14px;
  border-radius: 12px;
  background-color: #f0f0f0;
  align-items: center;
  justify-content: center;
`;

const CancelButtonText = styled(CustomText)`
  font-size: 16px;
  font-weight: 600;
  color: #797979;
`;

const SaveButton = styled(TouchableOpacity)`
  flex: 1;
  padding-top: 14px;
  padding-bottom: 14px;
  border-radius: 12px;
  background-color: #68d0c6;
  align-items: center;
  justify-content: center;
`;

const SaveButtonText = styled(CustomText)`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
`;

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.View`
  width: 85%;
  max-width: 350px;
  background-color: #ffffff;
  border-radius: 20px;
  padding-top: 32px;
  padding-bottom: 32px;
  padding-left: 24px;
  padding-right: 24px;
`;

const ModalTitle = styled(CustomText)`
  font-size: 20px;
  font-weight: 700;
  color: #4b4b4b;
  margin-bottom: 24px;
  text-align: center;
`;

const ModalInputContainer = styled.View`
  margin-bottom: 20px;
`;

const statsData = [
  { value: "4", label: "즐겨찾기" },
  { value: "15", label: "제보 내역" },
  { value: "3", label: "획득한 칭찬" },
];

const reportLinks = ["제보하기", "제보 내역", "신고하기"];
const settingLinks = ["즐겨찾기", "음성 설정", "계정", "로그아웃"];

interface ProfileProps {
  onNavigateToReport?: () => void;
  onNavigateToReportDetails?: () => void;
}

export const Profile = ({ onNavigateToReport, onNavigateToReportDetails }: ProfileProps) => {
  const [showMyInfo, setShowMyInfo] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [userName, setUserName] = useState("홍길동");
  const [userEmail, setUserEmail] = useState("hong12@naver.com");
  const [editName, setEditName] = useState("홍길동");
  const [editEmail, setEditEmail] = useState("hong12@naver.com");
  const [assets] = useAssets([require("../../../assets/mypage/ieum.svg")]);
  const dogUri = assets?.[0]?.localUri ?? assets?.[0]?.uri;

  const cardShadow = Platform.select({
    ios: {
      shadowColor: "rgba(0, 0, 0, 0.15)",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  });

  const infoCardShadow = Platform.select({
    ios: {
      shadowColor: "rgba(0, 0, 0, 0.05)",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
  });

  // 애니메이션 값들
  const profileScale = useRef(new Animated.Value(1)).current;
  const profileRotation = useRef(new Animated.Value(0)).current;
  const nameScale = useRef(new Animated.Value(1)).current;
  const editButtonScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // 컴포넌트 마운트 시 애니메이션
  useEffect(() => {
    if (showMyInfo) {
      // 카드 페이드인 애니메이션
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 리셋
      cardOpacity.setValue(0);
      cardTranslateY.setValue(20);
    }
  }, [showMyInfo]);

  const handleProfilePress = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(profileScale, {
          toValue: 0.95,
          tension: 300,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(profileRotation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(profileScale, {
          toValue: 1,
          tension: 300,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(profileRotation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const handleNamePress = () => {
    Animated.sequence([
      Animated.spring(nameScale, {
        toValue: 1.1,
        tension: 200,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(nameScale, {
        toValue: 1,
        tension: 200,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleButtonPress = () => {
    if (isEditingEmail) {
      // 저장
      setUserEmail(editEmail);
      setIsEditingEmail(false);
    } else {
      // 수정 모드로 전환
      setEditEmail(userEmail);
      setIsEditingEmail(true);
    }

    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.95,
        tension: 300,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 300,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCancelEmail = () => {
    setEditEmail(userEmail);
    setIsEditingEmail(false);
  };

  const handleEditNamePress = () => {
    setEditName(userName);
    setShowNameModal(true);
  };

  const handleSaveName = () => {
    setUserName(editName);
    setShowNameModal(false);
  };

  const handleCancelName = () => {
    setEditName(userName);
    setShowNameModal(false);
  };

  const profileRotate = profileRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "10deg"],
  });

  // TTS로 읽을 텍스트 생성 (메인 프로필 화면일 때만)
  const profileScreenText = useMemo(() => {
    if (showMyInfo || showVoiceSettings) {
      return ""; // 내 정보나 음성 설정 화면일 때는 읽지 않음
    }
    const text = `내 정보 페이지입니다. ${userName}님, 반가워요!`;
    console.log("[Profile] TTS Text:", text);
    return text;
  }, [userName, showMyInfo, showVoiceSettings]);

  // 화면 정보 읽기
  useScreenReader(profileScreenText, { delay: 500, skipIfEmpty: true });

  if (showVoiceSettings) {
    return <VoiceSettings onNavigateBack={() => setShowVoiceSettings(false)} />;
  }

  if (showMyInfo) {
    return (
      <Container backgroundColor="#f8f9fb">
        <Header>
          <HeaderLeft>
            <HeaderBackButton
              onPress={() => setShowMyInfo(false)}
              activeOpacity={0.7}
            >
              <BackIcon />
            </HeaderBackButton>
          </HeaderLeft>
          <HeaderCenter>
            <HeaderTitle
              size={20}
              weight="700"
            >
              내 정보
            </HeaderTitle>
          </HeaderCenter>
          <HeaderRight />
        </Header>
        <MyInfoScroll
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <MyInfoContent>
            <ProfileImageWrapper>
              <TouchableOpacity
                onPress={handleProfilePress}
                activeOpacity={1}
              >
                <ProfileImageContainer
                  style={{
                    transform: [{ scale: profileScale }, { rotate: profileRotate }],
                  }}
                >
                  <ProfileGradient
                    colors={["#b3e5fc", "#81d4fa", "#4fc3f7"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <DefaultProfileIcon />
                  </ProfileGradient>
                </ProfileImageContainer>
              </TouchableOpacity>
            </ProfileImageWrapper>

            <NameContainer style={{ transform: [{ scale: nameScale }] }}>
              <TouchableOpacity
                onPress={handleNamePress}
                activeOpacity={1}
              >
                <NameText>{userName}</NameText>
              </TouchableOpacity>
              <EditButtonAnimated style={{ transform: [{ scale: editButtonScale }] }}>
                <TouchableOpacity
                  onPress={handleEditNamePress}
                  activeOpacity={0.7}
                >
                  <EditIcon />
                </TouchableOpacity>
              </EditButtonAnimated>
            </NameContainer>

            <InfoCard
              style={[
                infoCardShadow,
                {
                  opacity: cardOpacity,
                  transform: [{ translateY: cardTranslateY }],
                },
              ]}
            >
              <InfoRow>
                <InfoLabel
                  size={14}
                  weight="600"
                >
                  아이디
                </InfoLabel>
                <InfoValue
                  size={16}
                  color="#797979"
                >
                  honghong12
                </InfoValue>
              </InfoRow>
              <InfoDivider />
              <InfoRow>
                <InfoLabel
                  size={14}
                  weight="600"
                >
                  이메일
                </InfoLabel>
                {isEditingEmail ? (
                  <InputField
                    value={editEmail}
                    onChangeText={setEditEmail}
                    placeholder="이메일을 입력하세요"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    containerStyle={{ width: "100%", marginBottom: 0 }}
                  />
                ) : (
                  <InfoValue
                    size={16}
                    color="#797979"
                  >
                    {userEmail}
                  </InfoValue>
                )}
              </InfoRow>
              <InfoDivider />
              <InfoRow>
                <InfoLabel
                  size={14}
                  weight="600"
                >
                  전화번호
                </InfoLabel>
                <InfoValue
                  size={16}
                  color="#797979"
                >
                  010-1234-5678
                </InfoValue>
              </InfoRow>
            </InfoCard>

            <EditButtonContainer>
              {isEditingEmail ? (
                <ModalButtonContainer>
                  <CancelButton
                    onPress={handleCancelEmail}
                    activeOpacity={0.7}
                  >
                    <CancelButtonText>취소</CancelButtonText>
                  </CancelButton>
                  <BounceButton style={{ flex: 1, transform: [{ scale: buttonScale }] }}>
                    <SaveButton
                      onPress={handleButtonPress}
                      activeOpacity={0.8}
                    >
                      <SaveButtonText>저장</SaveButtonText>
                    </SaveButton>
                  </BounceButton>
                </ModalButtonContainer>
              ) : (
                <BounceButton style={{ transform: [{ scale: buttonScale }] }}>
                  <DefaultButton
                    fullWidth
                    onPress={handleButtonPress}
                  >
                    수정하기
                  </DefaultButton>
                </BounceButton>
              )}
            </EditButtonContainer>
          </MyInfoContent>
        </MyInfoScroll>

        <Modal
          visible={showNameModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCancelName}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ModalOverlay>
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
                activeOpacity={1}
                onPress={handleCancelName}
              />
              <TouchableOpacity
                activeOpacity={1}
                onPress={e => e.stopPropagation()}
              >
                <ModalContent
                  style={
                    Platform.OS === "ios"
                      ? {
                          shadowColor: "rgba(0, 0, 0, 0.2)",
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 1,
                          shadowRadius: 12,
                        }
                      : { elevation: 8 }
                  }
                >
                  <ModalTitle>이름 수정</ModalTitle>

                  <ModalInputContainer>
                    <InputField
                      label="이름"
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="이름을 입력하세요"
                    />
                  </ModalInputContainer>

                  <ModalButtonContainer>
                    <CancelButton
                      onPress={handleCancelName}
                      activeOpacity={0.7}
                    >
                      <CancelButtonText>취소</CancelButtonText>
                    </CancelButton>
                    <SaveButton
                      onPress={handleSaveName}
                      activeOpacity={0.8}
                    >
                      <SaveButtonText>저장</SaveButtonText>
                    </SaveButton>
                  </ModalButtonContainer>
                </ModalContent>
              </TouchableOpacity>
            </ModalOverlay>
          </KeyboardAvoidingView>
        </Modal>
      </Container>
    );
  }

  return (
    <Container backgroundColor="#f8f9fb">
      <Header>
        <HeaderTitle
          size={20}
          weight="semibold"
        >
          내 정보
        </HeaderTitle>
      </Header>
      <ProfileScroll
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HEADER_TOTAL_HEIGHT + 16 }}
      >
        <ContentWrapper>
          <GreetingCard>
            <GreetingText
              size={21}
              weight="700"
            >
              {userName}님, 반가워요!
            </GreetingText>
            <SubLink
              onPress={() => setShowMyInfo(true)}
              activeOpacity={0.7}
            >
              <SubLinkText>내 정보</SubLinkText>
              <SubLinkArrow>
                <ArrowIcon />
              </SubLinkArrow>
            </SubLink>
          </GreetingCard>

          <StatsCardContainer>
            <StatsCardWrapper style={cardShadow}>
              <GradientCard
                colors={["#c4bfbe", "#899099"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <StatsList>
                  {statsData.map((item, index) => (
                    <React.Fragment key={item.label}>
                      <StatItem>
                        <StatValue
                          size={38}
                          weight="700"
                          color="white"
                        >
                          {item.value}
                        </StatValue>
                        <StatLabel
                          size={15}
                          color="white"
                        >
                          {item.label}
                        </StatLabel>
                      </StatItem>
                      {index < statsData.length - 1 && <StatDivider />}
                    </React.Fragment>
                  ))}
                </StatsList>
              </GradientCard>
            </StatsCardWrapper>
            {dogUri && (
              <DogFigure>
                <SvgUri
                  uri={dogUri}
                  width="100%"
                  height="100%"
                />
              </DogFigure>
            )}
          </StatsCardContainer>

          <Section>
            <SectionHeader>
              <SectionTitle
                size={18}
                weight="600"
              >
                제보
              </SectionTitle>
            </SectionHeader>
            <SectionCard>
              {reportLinks.map((label, index) => (
                <React.Fragment key={label}>
                  <Row
                    activeOpacity={0.7}
                    onPress={() => {
                      if (label === "제보하기") {
                        onNavigateToReport?.();
                      } else if (label === "제보 내역") {
                        onNavigateToReportDetails?.();
                      }
                    }}
                  >
                    <RowLabel
                      size={16}
                      weight="300"
                    >
                      {label}
                    </RowLabel>
                    <ArrowWrapper>
                      <ArrowIcon />
                    </ArrowWrapper>
                  </Row>
                  {index < reportLinks.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </SectionCard>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle
                size={18}
                weight="600"
              >
                설정
              </SectionTitle>
            </SectionHeader>
            <SectionCard>
              {settingLinks.map((label, index) => (
                <React.Fragment key={label}>
                  <Row
                    activeOpacity={0.7}
                    onPress={() => {
                      if (label === "음성 설정") {
                        setShowVoiceSettings(true);
                      }
                    }}
                  >
                    <RowLabel
                      size={16}
                      weight="300"
                    >
                      {label}{" "}
                    </RowLabel>
                    <ArrowWrapper>
                      <ArrowIcon />
                    </ArrowWrapper>
                  </Row>
                  {index < settingLinks.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </SectionCard>
          </Section>
        </ContentWrapper>
      </ProfileScroll>
    </Container>
  );
};
