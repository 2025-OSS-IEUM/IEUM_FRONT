import React from "react";
import { Platform, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import Svg, { Path } from "react-native-svg";
import { Container, CustomText } from "../../components";
import { TTSSettingsPanel } from "../../tts";

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
  align-items: center;
  justify-content: center;
  padding-top: ${HEADER_TOP_OFFSET}px;
  background-color: #f8f9fb;
  z-index: 10;
`;

const HeaderTitle = styled(CustomText)`
  font-size: 20px;
  font-weight: 700;
  color: #4b4b4b;
  text-align: center;
`;

const BackButton = styled.TouchableOpacity`
  position: absolute;
  left: 20px;
  top: ${HEADER_TOP_OFFSET + 24}px;
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
  z-index: 11;
`;

const ArrowIcon = () => (
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

interface TTSSettingProps {
  onNavigateBack?: () => void;
}

export const TTSSetting = ({ onNavigateBack }: TTSSettingProps) => {
  return (
    <Container backgroundColor="#f8f9fb">
      <Header>
        {onNavigateBack && (
          <BackButton
            onPress={onNavigateBack}
            activeOpacity={0.7}
          >
            <ArrowIcon />
          </BackButton>
        )}
        <HeaderTitle
          size={20}
          weight="semibold"
        >
          음성 설정
        </HeaderTitle>
      </Header>
      <ProfileScroll
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HEADER_TOTAL_HEIGHT + 16 }}
      >
        <ContentWrapper>
          <Section>
            <SectionHeader>
              <SectionTitle
                size={18}
                weight="600"
              >
                음성 설정
              </SectionTitle>
            </SectionHeader>
            <TTSSettingsPanel />
          </Section>
        </ContentWrapper>
      </ProfileScroll>
    </Container>
  );
};
