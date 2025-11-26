import React from "react";
import { View, Switch, Platform } from "react-native";
import Slider from "@react-native-community/slider";
import styled from "styled-components/native";
import { useTTSSettings } from "./TTSContext";
import { useTTS } from "./useTTS";
import { CustomText } from "../components/Text";

const Container = styled.View`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  margin: 0px;
`;

const Section = styled.View`
  margin-bottom: 24px;
`;

const SectionTitle = styled(CustomText)`
  font-size: 18px;
  font-weight: bold;
  color: #4b4b4b;
  margin-bottom: 16px;
`;

const SliderContainer = styled.View`
  margin-bottom: 20px;
`;

const SliderLabel = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const SliderLabelText = styled(CustomText)`
  font-size: 14px;
  color: #797979;
`;

const SliderValue = styled(CustomText)`
  font-size: 14px;
  color: #4b4b4b;
  font-weight: 600;
`;

const SliderWrapper = styled.View`
  width: 100%;
  height: 40px;
`;

const GenderContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: #f8f9fb;
  border-radius: 12px;
`;

const GenderLabel = styled(CustomText)`
  font-size: 16px;
  color: #4b4b4b;
`;

const GenderSwitch = styled(Switch)`
  transform: ${Platform.OS === "ios" ? "scale(0.9)" : "scale(1)"};
`;

const TestButton = styled.TouchableOpacity`
  background-color: #68d0c6;
  padding: 12px 24px;
  border-radius: 10px;
  align-items: center;
  margin-top: 8px;
`;

const TestButtonText = styled(CustomText)`
  color: white;
  font-size: 14px;
  font-weight: 600;
`;

const ResetButton = styled.TouchableOpacity`
  background-color: #ff6b6b;
  padding: 12px 24px;
  border-radius: 10px;
  align-items: center;
  margin-top: 8px;
`;

const ResetButtonText = styled(CustomText)`
  color: white;
  font-size: 14px;
  font-weight: 600;
`;

export const TTSSettingsPanel = () => {
  const { settings, updateSettings, resetSettings } = useTTSSettings();
  const { speak } = useTTS();

  const handleRateChange = (value: number) => {
    updateSettings({ rate: value });
  };

  const handlePitchChange = (value: number) => {
    updateSettings({ pitch: value });
  };

  const handleVolumeChange = (value: number) => {
    updateSettings({ volume: value });
  };

  const handleGenderToggle = (value: boolean) => {
    updateSettings({ voiceGender: value ? "female" : "male" });
  };

  const handleTest = () => {
    const testText = "안녕하세요. 이것은 음성 설정 테스트입니다. 현재 설정으로 읽어드립니다.";
    speak(testText, {
      onError: (error: Error) => {
        console.error("TTS Test - Error:", error);
        alert(`TTS 오류가 발생했습니다: ${error.message}`);
      },
    });
  };

  const handleReset = () => {
    resetSettings();
  };

  const formatRate = (rate: number) => {
    return `${Math.round(rate * 100)}%`;
  };

  const formatPitch = (pitch: number) => {
    return pitch.toFixed(1);
  };

  const formatVolume = (volume: number) => {
    return `${Math.round(volume * 100)}%`;
  };

  const handleToggleEnabled = (value: boolean) => {
    updateSettings({ enabled: value });
  };

  return (
    <Container>
      <Section>
        <SectionTitle
          size={18}
          weight="bold"
        >
          음성 안내 활성화
        </SectionTitle>
        <GenderContainer>
          <GenderLabel size={16}>음성 안내 {settings.enabled ? "켜기" : "끄기"}</GenderLabel>
          <GenderSwitch
            value={settings.enabled}
            onValueChange={handleToggleEnabled}
            trackColor={{ false: "#d0d0d0", true: "#68d0c6" }}
            thumbColor="#ffffff"
          />
        </GenderContainer>
      </Section>

      <Section>
        <SectionTitle
          size={18}
          weight="bold"
        >
          음성 속도
        </SectionTitle>
        <SliderContainer>
          <SliderLabel>
            <SliderLabelText size={14}>느림</SliderLabelText>
            <SliderValue
              size={14}
              weight="600"
            >
              {formatRate(settings.rate)}
            </SliderValue>
          </SliderLabel>
          <SliderWrapper>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={0.3}
              maximumValue={1.0}
              value={settings.rate}
              onValueChange={handleRateChange}
              minimumTrackTintColor="#68d0c6"
              maximumTrackTintColor="#e0e0e0"
              thumbTintColor="#68d0c6"
              step={0.05}
            />
          </SliderWrapper>
        </SliderContainer>
      </Section>

      <Section>
        <SectionTitle
          size={18}
          weight="bold"
        >
          음성 높낮이 (피치)
        </SectionTitle>
        <SliderContainer>
          <SliderLabel>
            <SliderLabelText size={14}>낮음</SliderLabelText>
            <SliderValue
              size={14}
              weight="600"
            >
              {formatPitch(settings.pitch)}
            </SliderValue>
          </SliderLabel>
          <SliderWrapper>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={0.5}
              maximumValue={2.0}
              value={settings.pitch}
              onValueChange={handlePitchChange}
              minimumTrackTintColor="#68d0c6"
              maximumTrackTintColor="#e0e0e0"
              thumbTintColor="#68d0c6"
              step={0.1}
            />
          </SliderWrapper>
        </SliderContainer>
      </Section>

      <Section>
        <SectionTitle
          size={18}
          weight="bold"
        >
          볼륨
        </SectionTitle>
        <SliderContainer>
          <SliderLabel>
            <SliderLabelText size={14}>작음</SliderLabelText>
            <SliderValue
              size={14}
              weight="600"
            >
              {formatVolume(settings.volume)}
            </SliderValue>
          </SliderLabel>
          <SliderWrapper>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={0.0}
              maximumValue={1.0}
              value={settings.volume}
              onValueChange={handleVolumeChange}
              minimumTrackTintColor="#68d0c6"
              maximumTrackTintColor="#e0e0e0"
              thumbTintColor="#68d0c6"
              step={0.05}
            />
          </SliderWrapper>
        </SliderContainer>
      </Section>

      <Section>
        <SectionTitle
          size={18}
          weight="bold"
        >
          음성 성별
        </SectionTitle>
        <GenderContainer>
          <GenderLabel size={16}>{settings.voiceGender === "male" ? "남성" : "여성"}</GenderLabel>
          <GenderSwitch
            value={settings.voiceGender === "female"}
            onValueChange={handleGenderToggle}
            trackColor={{ false: "#d0d0d0", true: "#68d0c6" }}
            thumbColor="#ffffff"
          />
        </GenderContainer>
      </Section>

      <TestButton onPress={handleTest}>
        <TestButtonText>설정 테스트</TestButtonText>
      </TestButton>

      <ResetButton onPress={handleReset}>
        <ResetButtonText>기본값으로 초기화</ResetButtonText>
      </ResetButton>
    </Container>
  );
};
