import React, { useState, useRef, useEffect } from "react";
import { TouchableOpacity, Switch, PanResponder, Dimensions, LayoutChangeEvent, Alert } from "react-native";
import styled from "styled-components/native";
import { Container, CustomText } from "../../components";
import Svg, { Path } from "react-native-svg";
import { useTts } from "../../tts";
import * as Speech from "expo-speech";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDER_WIDTH = SCREEN_WIDTH - 96; // padding 24px * 2 + card padding 24px * 2

const HEADER_HEIGHT = 72;
const HEADER_TOP_OFFSET = 44;
const HEADER_TOTAL_HEIGHT = HEADER_HEIGHT + HEADER_TOP_OFFSET;

const Header = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${HEADER_TOTAL_HEIGHT}px;
  align-items: center;
  justify-content: center;
  padding-top: ${HEADER_TOP_OFFSET}px;
  background-color: #f8f9fb;
  z-index: 10;
  flex-direction: row;
`;

const BackButton = styled(TouchableOpacity)`
  position: absolute;
  left: 20px;
  top: ${HEADER_TOP_OFFSET + 14}px;
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
`;

const HeaderTitle = styled(CustomText)`
  font-size: 20px;
  font-weight: 700;
  color: #4b4b4b;
  text-align: center;
`;

const ContentScroll = styled.ScrollView`
  flex: 1;
`;

const ContentWrapper = styled.View`
  flex: 1;
  padding-top: ${HEADER_TOTAL_HEIGHT + 10}px;
  padding-bottom: 20px;
  padding-left: 24px;
  padding-right: 24px;
`;

const Section = styled.View`
  margin-bottom: 16px;
`;

const SectionCard = styled.View`
  background-color: #ffffff;
  border-radius: 20px;
  border: 1px solid #ededed;
  padding: 20px;
`;

const SettingRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0px;
`;

const SettingLabel = styled(CustomText)`
  font-size: 16px;
  color: #4b4b4b;
  flex: 1;
`;

const SliderContainer = styled.View`
  margin-bottom: 16px;
`;

const SliderLabel = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const SliderValue = styled(CustomText)`
  font-size: 14px;
  color: #797979;
`;

const SliderWrapper = styled.View`
  width: 100%;
  height: 40px;
  justify-content: center;
`;

const SliderTrack = styled.View`
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  position: relative;
`;

const SliderFill = styled.View<{ percentage: number }>`
  height: 4px;
  background-color: #68d0c6;
  border-radius: 2px;
  width: ${props => props.percentage}%;
  position: absolute;
  left: 0;
  top: 0;
`;

const SliderThumb = styled.View<{ position: number }>`
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: #68d0c6;
  border-radius: 10px;
  top: -8px;
  left: ${props => props.position}%;
  margin-left: -10px;
  border: 2px solid #ffffff;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 3;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-top: 8px;
`;

const Button = styled(TouchableOpacity)<{ variant?: "primary" | "secondary" }>`
  flex: 1;
  height: 52px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  background-color: ${props => (props.variant === "primary" ? "#68d0c6" : "#ffffff")};
  border: 1px solid ${props => (props.variant === "primary" ? "#68d0c6" : "#e0e0e0")};
`;

const ButtonText = styled(CustomText)<{ variant?: "primary" | "secondary" }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => (props.variant === "primary" ? "#ffffff" : "#4b4b4b")};
`;

const TestTextContainer = styled.View`
  margin-top: 16px;
  padding: 16px;
  background-color: #f8f9fb;
  border-radius: 12px;
`;

const TestText = styled(CustomText)`
  font-size: 14px;
  color: #797979;
  line-height: 20px;
`;

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

interface VoiceSettingsProps {
  onNavigateBack: () => void;
}

// 기본값
const DEFAULT_SPEED = 1.0;
const DEFAULT_PITCH = 1.0;
const DEFAULT_VOLUME = 1.0;

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({ onNavigateBack }) => {
  const { settings, updateSettings, speak, stop, readScreenText } = useTts();

  const [tempSpeed, setTempSpeed] = useState(settings.speed ?? DEFAULT_SPEED);
  const [tempPitch, setTempPitch] = useState(settings.pitch ?? DEFAULT_PITCH);
  const [tempVolume, setTempVolume] = useState(settings.volume ?? DEFAULT_VOLUME);
  const [tempEnabled, setTempEnabled] = useState(settings.enabled ?? true);
  const speedSliderRef = useRef({ x: 0, width: SLIDER_WIDTH });
  const pitchSliderRef = useRef({ x: 0, width: SLIDER_WIDTH });
  const volumeSliderRef = useRef({ x: 0, width: SLIDER_WIDTH });

  // TTS 설정이 변경되면 임시 값도 업데이트
  useEffect(() => {
    if (settings.speed !== undefined) {
      setTempSpeed(settings.speed);
    }
    if (settings.pitch !== undefined) {
      setTempPitch(settings.pitch);
    }
    if (settings.volume !== undefined) {
      setTempVolume(settings.volume);
    }
    if (settings.enabled !== undefined) {
      setTempEnabled(settings.enabled);
    }
  }, [settings.speed, settings.pitch, settings.volume, settings.enabled]);

  // 슬라이더 값 변경 핸들러
  const updateSpeed = (pageX: number) => {
    const { x, width } = speedSliderRef.current;
    const relativeX = pageX - x;
    const percentage = Math.max(0, Math.min(100, (relativeX / width) * 100));
    const newValue = (percentage / 100) * 2.0;
    setTempSpeed(newValue);
  };

  const updatePitch = (pageX: number) => {
    const { x, width } = pitchSliderRef.current;
    const relativeX = pageX - x;
    const percentage = Math.max(0, Math.min(100, (relativeX / width) * 100));
    const newValue = (percentage / 100) * 2.0;
    setTempPitch(newValue);
  };

  const updateVolume = (pageX: number) => {
    const { x, width } = volumeSliderRef.current;
    const relativeX = pageX - x;
    const percentage = Math.max(0, Math.min(100, (relativeX / width) * 100));
    const newValue = (percentage / 100) * 1.0; // 0.0 ~ 1.0
    setTempVolume(newValue);
  };

  // Speed Slider PanResponder
  const speedPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: evt => {
        const { pageX } = evt.nativeEvent;
        updateSpeed(pageX);
      },
      onPanResponderMove: evt => {
        const { pageX } = evt.nativeEvent;
        updateSpeed(pageX);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  // Pitch Slider PanResponder
  const pitchPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: evt => {
        const { pageX } = evt.nativeEvent;
        updatePitch(pageX);
      },
      onPanResponderMove: evt => {
        const { pageX } = evt.nativeEvent;
        updatePitch(pageX);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  // Volume Slider PanResponder
  const volumePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: evt => {
        const { pageX } = evt.nativeEvent;
        updateVolume(pageX);
      },
      onPanResponderMove: evt => {
        const { pageX } = evt.nativeEvent;
        updateVolume(pageX);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  // 적용 버튼
  const handleApply = () => {
    Alert.alert("설정 적용", "변경된 설정을 적용하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "확인",
        onPress: async () => {
          const speed = tempSpeed ?? DEFAULT_SPEED;
          const pitch = tempPitch ?? DEFAULT_PITCH;
          const volume = tempVolume ?? DEFAULT_VOLUME;
          const enabled = tempEnabled ?? true;

          await updateSettings({
            speed,
            pitch,
            volume,
            enabled,
          });

          if (!enabled) {
            stop();
            return;
          }

          // 설정이 적용되었음을 알리는 메시지
          const message = `속도 ${speed.toFixed(1)}, 피치 ${pitch.toFixed(1)}로 음성 설정이 적용되었습니다`;

          // 약간의 지연을 두고 메시지 읽기
          setTimeout(() => {
            Speech.speak(message, {
              language: "ko-KR",
              rate: speed,
              pitch: pitch,
              volume: volume,
            });
          }, 100);
        },
      },
    ]);
  };

  // 초기화 버튼
  const handleReset = () => {
    setTempSpeed(DEFAULT_SPEED);
    setTempPitch(DEFAULT_PITCH);
    setTempVolume(DEFAULT_VOLUME);
    setTempEnabled(true);
    updateSettings({
      speed: DEFAULT_SPEED,
      pitch: DEFAULT_PITCH,
      volume: DEFAULT_VOLUME,
      enabled: true,
    });
    stop();
  };

  // TTS 활성화/비활성화 토글
  const handleToggle = (value: boolean) => {
    setTempEnabled(value);
  };

  // Custom Slider Component
  const CustomSlider = ({
    value,
    min,
    max,
    panResponder,
    onLayout,
  }: {
    value: number;
    min: number;
    max: number;
    panResponder: any;
    onLayout: (event: LayoutChangeEvent) => void;
  }) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <SliderWrapper
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        <SliderTrack>
          <SliderFill percentage={percentage} />
          <SliderThumb position={percentage} />
        </SliderTrack>
      </SliderWrapper>
    );
  };

  return (
    <Container backgroundColor="#f8f9fb">
      <Header>
        <BackButton
          onPress={onNavigateBack}
          activeOpacity={0.7}
        >
          <BackIcon />
        </BackButton>
        <HeaderTitle
          size={20}
          weight="700"
        >
          음성 설정
        </HeaderTitle>
      </Header>
      <ContentScroll
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <ContentWrapper>
          <Section>
            <SectionCard>
              <SettingRow>
                <SettingLabel
                  size={16}
                  weight="300"
                >
                  음성 읽기 활성화
                </SettingLabel>
                <Switch
                  value={tempEnabled}
                  onValueChange={handleToggle}
                  trackColor={{ false: "#e0e0e0", true: "#68d0c6" }}
                  thumbColor="#ffffff"
                  ios_backgroundColor="#e0e0e0"
                />
              </SettingRow>
            </SectionCard>
          </Section>

          <Section>
            <SectionCard>
              <SliderContainer>
                <SliderLabel>
                  <SettingLabel
                    size={16}
                    weight="300"
                  >
                    속도
                  </SettingLabel>
                  <SliderValue
                    size={14}
                    weight="300"
                  >
                    {(tempSpeed ?? DEFAULT_SPEED).toFixed(1)}x
                  </SliderValue>
                </SliderLabel>
                <CustomSlider
                  value={tempSpeed ?? DEFAULT_SPEED}
                  min={0.0}
                  max={2.0}
                  panResponder={speedPanResponder}
                  onLayout={event => {
                    if (event?.nativeEvent?.layout) {
                      const { x, width } = event.nativeEvent.layout;
                      speedSliderRef.current = { x, width };
                    }
                  }}
                />
              </SliderContainer>

              <SliderContainer>
                <SliderLabel>
                  <SettingLabel
                    size={16}
                    weight="300"
                  >
                    피치
                  </SettingLabel>
                  <SliderValue
                    size={14}
                    weight="300"
                  >
                    {(tempPitch ?? DEFAULT_PITCH).toFixed(1)}
                  </SliderValue>
                </SliderLabel>
                <CustomSlider
                  value={tempPitch ?? DEFAULT_PITCH}
                  min={0.0}
                  max={2.0}
                  panResponder={pitchPanResponder}
                  onLayout={event => {
                    if (event?.nativeEvent?.layout) {
                      const { x, width } = event.nativeEvent.layout;
                      pitchSliderRef.current = { x, width };
                    }
                  }}
                />
              </SliderContainer>

              <SliderContainer>
                <SliderLabel>
                  <SettingLabel
                    size={16}
                    weight="300"
                  >
                    볼륨
                  </SettingLabel>
                  <SliderValue
                    size={14}
                    weight="300"
                  >
                    {Math.round((tempVolume ?? DEFAULT_VOLUME) * 100)}%
                  </SliderValue>
                </SliderLabel>
                <CustomSlider
                  value={tempVolume ?? DEFAULT_VOLUME}
                  min={0.0}
                  max={1.0}
                  panResponder={volumePanResponder}
                  onLayout={event => {
                    if (event?.nativeEvent?.layout) {
                      const { x, width } = event.nativeEvent.layout;
                      volumeSliderRef.current = { x, width };
                    }
                  }}
                />
              </SliderContainer>
            </SectionCard>
          </Section>

          <Section>
            <TestTextContainer>
              <TestText
                size={14}
                weight="300"
              >
                음성 설정이 활성화되면 화면의 텍스트가 자동으로 읽혀집니다. 속도와 피치를 조절하여 원하는 음성을
                설정하세요.
              </TestText>
            </TestTextContainer>
          </Section>

          <ButtonContainer>
            <Button
              variant="secondary"
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <ButtonText
                variant="secondary"
                size={16}
                weight="600"
              >
                초기화
              </ButtonText>
            </Button>
            <Button
              variant="primary"
              onPress={handleApply}
              activeOpacity={0.7}
            >
              <ButtonText
                variant="primary"
                size={16}
                weight="600"
              >
                적용
              </ButtonText>
            </Button>
          </ButtonContainer>
        </ContentWrapper>
      </ContentScroll>
    </Container>
  );
};
