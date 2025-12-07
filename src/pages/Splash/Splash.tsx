import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import styled from "styled-components/native";
import Svg, { Circle, Path } from "react-native-svg";

const SplashContainer = styled(Animated.View)`
  flex: 1;
  background-color: #0b1620;
  align-items: center;
  justify-content: center;
`;

const LogoContainer = styled(Animated.View)`
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
`;

const LogoWrapper = styled(Animated.View)`
  width: 228px;
  height: 179px;
  align-items: center;
  justify-content: center;
`;

const IeumText = styled(Animated.Text)`
  font-family: ${(props) => props.theme.fonts.bold};
  font-size: 32px;
  color: #68d0c6;
  margin-top: 24px;
  letter-spacing: 2px;
`;

const MobicomText = styled(Animated.Text)`
  position: absolute;
  bottom: 40px;
  font-family: ${(props) => props.theme.fonts.primary};
  font-size: 14px;
  color: #ffffff;
  letter-spacing: 0.5px;
`;

interface SplashProps {
  onFinish?: () => void;
}

export const Splash = ({ onFinish }: SplashProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const mobicomFadeAnim = useRef(new Animated.Value(0)).current;
  const containerFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 로고 페이드 인 + 스케일 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // 텍스트 페이드 인 애니메이션 (로고 이후)
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // mobicom 텍스트 페이드 인
    Animated.sequence([
      Animated.delay(600),
      Animated.timing(mobicomFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // 스플래시 종료 시 페이드 아웃
    const timer = setTimeout(() => {
      Animated.timing(containerFadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) {
          onFinish();
        }
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    onFinish,
    fadeAnim,
    scaleAnim,
    textFadeAnim,
    mobicomFadeAnim,
    containerFadeAnim,
  ]);

  return (
    <SplashContainer
      style={{
        opacity: containerFadeAnim,
      }}
    >
      <LogoContainer
        style={{
          opacity: fadeAnim,
        }}
      >
        <LogoWrapper
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Svg width="228" height="179" viewBox="0 0 228 179" fill="none">
            <Circle
              cx="29.5"
              cy="117.5"
              r="29"
              fill="#68D0C6"
              stroke="#68D0C6"
            />
            <Circle
              cx="167.5"
              cy="29.5"
              r="29"
              fill="#68D0C6"
              stroke="#68D0C6"
            />
            <Path
              d="M5 173.5C127.5 173.5 99.5 72 214.5 72"
              stroke="#68D0C6"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <Path
              d="M151.558 90.7102C150.654 86.1722 152.974 81.5843 157.225 79.757C176.976 71.2671 190.951 68.2144 211.944 68.7694C216.488 68.8895 220.27 72.2188 221.157 76.6762L224.273 92.3302C225.63 99.1496 219.778 105.188 212.85 104.6C196.056 103.175 183.925 105.14 170.441 112.212C164.055 115.561 155.858 112.318 154.451 105.245L151.558 90.7102Z"
              fill="#68D0C6"
            />
            <Path
              d="M151.558 90.7102C150.654 86.1722 152.974 81.5843 157.225 79.757C176.976 71.2671 190.951 68.2144 211.944 68.7694C216.488 68.8895 220.27 72.2188 221.157 76.6762L224.273 92.3302C225.566 98.8291 220.312 104.619 213.819 104.64C213.174 104.642 212.524 104.636 211.883 104.705C196.06 106.409 184.734 107.179 171.517 114.111C165.131 117.46 155.858 112.318 154.451 105.245L151.558 90.7102Z"
              fill="#68D0C6"
            />
          </Svg>
        </LogoWrapper>
        <IeumText
          style={{
            opacity: textFadeAnim,
          }}
        >
          IEUM
        </IeumText>
      </LogoContainer>
      <MobicomText
        style={{
          opacity: mobicomFadeAnim,
        }}
      >
        mobicom
      </MobicomText>
    </SplashContainer>
  );
};
