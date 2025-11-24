import React, { useState, useEffect, useRef } from "react";
import { Animated } from "react-native";
import styled from "styled-components/native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, SvgUri } from "react-native-svg";
import { useAssets } from "expo-asset";
import { Container } from "../../components";
import { CustomText } from "../../components/Text";

const HomeContainer = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const TopGradientWrapper = styled.View`
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  overflow: visible;
  flex: 1;
`;

const TopGradientContainer = styled(LinearGradient)`
  padding-top: 100px;
  padding-bottom: 100px;
  padding-left: 0px;
  padding-right: 20px;
  position: relative;
  flex: 1;
`;

const HeaderContent = styled.View`
  margin-top: 5px;
  padding-left: 0px;
`;

const SkyContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
`;

const Cloud1 = styled(Animated.View)`
  position: absolute;
  top: 380px;
  left: 20px;
`;

const Cloud2 = styled(Animated.View)`
  position: absolute;
  top: 260px;
  right: 30px;
`;

const HomeImageContainer = styled.View`
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: -50px;
  left: 0;
  right: 0;
  z-index: 1;
`;

const HomeImageWrapper = styled.View`
  position: relative;
`;

const BottomGradientWrapper = styled.View`
  height: 117px;
  width: 100%;
  overflow: hidden;
`;

const BottomGradientContainer = styled(LinearGradient)`
  width: 100%;
  height: 100%;
  border-top-left-radius: 60px;
  border-top-right-radius: 60px;
`;

const ContentWrapper = styled.View`
  flex: 1;
`;

const HeaderContainer = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  z-index: 10;
  padding-top: 4px;
`;

const LeftSection = styled.View`
  flex-direction: row;
  align-items: center;
`;

const FootLogoWrapper = styled.View`
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  margin-right: -16px;
`;

const IeumTextContainer = styled.View`
  align-items: flex-start;
  justify-content: center;
`;

const StatusBarWrapper = styled.View`
  margin-top: 4px;
`;

const MiddleSection = styled.View`
  flex: 1;
  align-items: flex-start;
  justify-content: flex-start;
  margin-left: 8px;
  margin-right: 10px;
  padding-top: 16px;
`;

const NameText = styled.Text`
  color: #fff;
  text-align: left;
  font-family: "Pinkfong-Baby-Shark-Regular";
  font-size: 28px;
  font-weight: 400;
  line-height: 34px;
  margin-top: 0px;
  margin-bottom: 6px;
  shadow-color: rgba(0, 0, 0, 0.05);
  shadow-offset: 0px 2px;
  shadow-opacity: 1;
  shadow-radius: 4px;
  elevation: 1;
`;

const ProgressBarContainer = styled.View`
  width: 95%;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
  align-self: center;
`;

const ProgressBarFill = styled.View<{ progress: number }>`
  width: ${props => Math.min(props.progress, 100)}%;
  height: 100%;
  background-color: #fff;
  border-radius: 4px;
`;

const DaysText = styled.Text`
  color: #fff;
  text-align: left;
  font-family: "Pinkfong-Baby-Shark-Light";
  font-size: 26px;
  font-weight: 300;
  line-height: 32px;
  shadow-color: rgba(0, 0, 0, 0.05);
  shadow-offset: 0px 2px;
  shadow-opacity: 1;
  shadow-radius: 4px;
  elevation: 1;
`;

const MailIconWrapper = styled.View`
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  margin-top: 38px;
`;

const TouchableIeumHomeWrapper = styled.TouchableOpacity`
  position: absolute;
  right: 0;
  top: 5px;
  z-index: 2;
  transform: scaleX(-1);
`;

interface HomeProps {
  onNavigateToReportDetails?: () => void;
  onNavigateToReport?: () => void;
}

export const Home = ({ onNavigateToReportDetails, onNavigateToReport }: HomeProps) => {
  // 경험치 상태 (0-100 범위)
  const [experience, setExperience] = useState(0);

  // 구름 애니메이션
  const cloud1Anim = useRef(new Animated.Value(0)).current;
  const cloud2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloud1Anim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(cloud1Anim, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(cloud2Anim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        }),
        Animated.timing(cloud2Anim, {
          toValue: 0,
          duration: 10000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 가입일 
  const registrationDate = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1); // 하루 전
    return date;
  })[0];

  // 연결된 일수 계산
  const getDaysConnected = () => {
    const today = new Date();
    const diffTime = today.getTime() - registrationDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // 최소 1일
  };

  // 강아지 터치 시 경험치 증가
  const handleDogTouch = () => {
    setExperience(prev => {
      const increment = Math.random() * 5 + 2; // 2~7 사이의 랜덤 증가값
      return Math.min(prev + increment, 100); // 최대 100까지만
    });
  };

  const [assets] = useAssets([
    require("../../../assets/home/ieum-home.svg"),
    require("../../../assets/home/home-image.svg"),
    require("../../../assets/home/status-bar.svg"),
    require("../../../assets/home/mail.svg"),
    require("../../../assets/home/foot-logo.svg"),
  ]);
  const ieumHomeUri = assets?.[0]?.localUri ?? assets?.[0]?.uri;
  const homeImageUri = assets?.[1]?.localUri ?? assets?.[1]?.uri;
  const statusBarUri = assets?.[2]?.localUri ?? assets?.[2]?.uri;
  const mailUri = assets?.[3]?.localUri ?? assets?.[3]?.uri;
  const footLogoUri = assets?.[4]?.localUri ?? assets?.[4]?.uri;

  return (
    <Container
      padding={0}
      backgroundColor="transparent"
    >
      <HomeContainer>
        <ContentWrapper>
          <TopGradientWrapper>
            <TopGradientContainer
              colors={["#6FD0E2", "#E8ECF2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <HeaderContent>
                <HeaderContainer>
                  <LeftSection>
                    {footLogoUri && <FootLogoWrapper></FootLogoWrapper>}
                    <IeumTextContainer>
                      {statusBarUri && (
                        <StatusBarWrapper>
                          <SvgUri
                            uri={statusBarUri}
                            width={80}
                            height={86}
                          />
                        </StatusBarWrapper>
                      )}
                    </IeumTextContainer>
                  </LeftSection>
                  <MiddleSection>
                    <NameText>이음이</NameText>
                    <ProgressBarContainer>
                      <ProgressBarFill progress={experience} />
                    </ProgressBarContainer>
                    <DaysText>이어진지 {getDaysConnected()}일 됐어요!</DaysText>
                  </MiddleSection>
                  {mailUri && (
                    <MailIconWrapper>
                      <SvgUri
                        uri={mailUri}
                        width={50}
                        height={50}
                      />
                    </MailIconWrapper>
                  )}
                </HeaderContainer>
              </HeaderContent>
              <SkyContainer>
                <Cloud1
                  style={{
                    transform: [
                      {
                        translateX: cloud1Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 30],
                        }),
                      },
                    ],
                  }}
                >
                  <Svg
                    width={163}
                    height={34}
                    viewBox="0 0 163 34"
                    fill="none"
                  >
                    <Path
                      d="M8.4223 22.2922C-19.3191 18.9732 28.4399 -1.22315 51.1752 1.15322C59.1758 1.98947 61.4843 5.6597 69.5689 6.24695C80.6377 7.05098 85.4887 2.36819 96.4137 1.15322C153.818 -5.23067 181.383 16.7172 149.606 22.2922C149.608 36.2544 69.5689 33.4984 69.5689 33.4984C69.5689 33.4984 36.1637 25.6112 8.4223 22.2922Z"
                      fill="white"
                    />
                  </Svg>
                </Cloud1>
                <Cloud2
                  style={{
                    transform: [
                      {
                        translateX: cloud2Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -40],
                        }),
                      },
                    ],
                  }}
                >
                  <Svg
                    width={142}
                    height={48}
                    viewBox="0 0 142 48"
                    fill="none"
                  >
                    <Path
                      d="M0.306726 30.2386C-2.95707 13.6441 20.3964 -2.91486 43.2134 0.435505C51.2428 1.61451 53.5596 6.78903 61.6733 7.61698C72.7819 8.75054 77.4209 0.983738 88.6147 0.435505C114.938 -0.853737 141.759 11.2502 141.999 30.2386C142.294 53.6421 94.0969 47.8326 61.6733 46.0378C36.2959 44.6331 3.874 48.3761 0.306726 30.2386Z"
                      fill="white"
                    />
                  </Svg>
                </Cloud2>
              </SkyContainer>
              <HomeImageContainer>
                <HomeImageWrapper>
                  {homeImageUri && (
                    <SvgUri
                      uri={homeImageUri}
                      width={402}
                      height={244}
                    />
                  )}
                  {ieumHomeUri && (
                    <TouchableIeumHomeWrapper
                      onPress={handleDogTouch}
                      activeOpacity={0.8}
                    >
                      <SvgUri
                        uri={ieumHomeUri}
                        width={157}
                        height={195}
                      />
                    </TouchableIeumHomeWrapper>
                  )}
                </HomeImageWrapper>
              </HomeImageContainer>
            </TopGradientContainer>
          </TopGradientWrapper>
        </ContentWrapper>
        <BottomGradientWrapper>
          <BottomGradientContainer
            colors={["#C9AA76", "#F7CD86"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </BottomGradientWrapper>
      </HomeContainer>
    </Container>
  );
};
