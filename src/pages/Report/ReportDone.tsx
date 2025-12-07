import React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";
import Svg, { Path } from "react-native-svg";
import { Container, CustomText } from "../../components";
import { DefaultButton } from "../../components/Button";
import { theme } from "../../styles/theme";

const ScrollContainer = styled.ScrollView`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const ContentContainer = styled.View`
  padding-left: ${props => props.theme.spacing.md}px;
  padding-right: ${props => props.theme.spacing.md}px;
  padding-top: ${props => props.theme.spacing.xl}px;
  padding-bottom: ${props => props.theme.spacing.xl}px;
  align-items: center;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-left: ${props => props.theme.spacing.md}px;
  padding-right: ${props => props.theme.spacing.md}px;
  padding-bottom: ${props => props.theme.spacing.lg}px;
  background-color: ${props => props.theme.colors.background};
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border};
  min-height: 56px;
  position: relative;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
  elevation: 2;
`;

const BackButton = styled.TouchableOpacity`
  position: absolute;
  left: ${props => props.theme.spacing.md}px;
  padding: ${props => props.theme.spacing.xs}px;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  z-index: 1;
  border-radius: ${props => props.theme.borderRadius.md}px;
`;

const BackButtonText = styled.Text`
  font-size: ${props => props.theme.fontSize.xl + 4}px;
  color: ${props => props.theme.colors.text.primary};
  font-weight: ${props => props.theme.fontWeight.normal};
  font-family: ${props => props.theme.fonts.medium};
`;

const HeaderTitleContainer = styled.View`
  display: flex;
  width: 215px;
  height: 32px;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  align-self: center;
`;

const HeaderTitle = styled.Text`
  font-size: ${props => props.theme.fontSize.lg + 2}px;
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  text-align: center;
  font-family: ${props => props.theme.fonts.bold};
`;

const IconContainer = styled.View`
  margin-top: ${props => props.theme.spacing.xl}px;
  margin-bottom: ${props => props.theme.spacing.lg}px;
`;

const SuccessMessage = styled.Text`
  font-size: 24px;
  font-weight: 600;
  color: #000;
  font-family: ${props => props.theme.fonts.semiBold};
  margin-bottom: ${props => props.theme.spacing.sm}px;
  text-align: center;
`;

const ThankYouMessage = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #a2a2a2;
  font-family: ${props => props.theme.fonts.semiBold};
  margin-bottom: ${props => props.theme.spacing.xl}px;
  text-align: center;
`;

const InfoCard = styled.View`
  width: 100%;
  max-width: 362px;
  min-height: 200px;
  flex-shrink: 0;
  border-radius: 15px;
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.lg}px;
  margin-bottom: ${props => props.theme.spacing.xl}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.05;
  shadow-radius: 8px;
  elevation: 2;
`;

const InfoTitle = styled(CustomText)`
  font-size: ${props => props.theme.fontSize.lg}px;
  font-weight: bold;
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.fonts.bold};
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const InfoLabel = styled(CustomText)`
  font-size: ${props => props.theme.fontSize.md}px;
  color: ${props => props.theme.colors.text.secondary};
  font-family: ${props => props.theme.fonts.medium};
  min-width: 80px;
`;

const InfoValue = styled(CustomText)`
  font-size: ${props => props.theme.fontSize.md}px;
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.fonts.primary};
  flex: 1;
  text-align: right;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${props => props.theme.colors.border};
  margin-top: ${props => props.theme.spacing.md}px;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const DescriptionRow = styled.View`
  margin-top: ${props => props.theme.spacing.md}px;
`;

const DescriptionLabel = styled(CustomText)`
  font-size: ${props => props.theme.fontSize.md}px;
  color: ${props => props.theme.colors.text.secondary};
  font-family: ${props => props.theme.fonts.medium};
  margin-bottom: ${props => props.theme.spacing.sm}px;
`;

const DescriptionValue = styled(CustomText)`
  font-size: ${props => props.theme.fontSize.md}px;
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.fonts.primary};
  line-height: 24px;
`;

const ButtonContainer = styled.View`
  width: 100%;
  max-width: 362px;
  margin-top: ${props => props.theme.spacing.md}px;
`;

interface ReportDoneProps {
  reportData: {
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    dangerType: string;
    description: string;
    images: string[];
  } | null;
  onNavigateToHome: () => void;
  onNavigateBack: () => void;
}

export const ReportDone = ({ reportData, onNavigateToHome, onNavigateBack }: ReportDoneProps) => {
  const insets = useSafeAreaInsets();

  // Helper to get readable danger type label
  const getDangerTypeLabel = (type: string | undefined) => {
    const types: Record<string, string> = {
      sidewalk_damage: "보도블록 파손",
      construction: "공사 중",
      missing_crosswalk: "횡단보도 없음",
      no_tactile: "점자블록 없음",
      etc: "기타",
    };
    return type ? types[type] || type : "위험 유형 없음";
  };

  return (
    <Container>
      {/* ... Header ... */}
      <Header style={{ paddingTop: insets.top + theme.spacing.md }}>
        <BackButton
          onPress={onNavigateBack}
          style={{ top: insets.top + theme.spacing.sm }}
        >
          <BackButtonText>←</BackButtonText>
        </BackButton>
        <HeaderTitleContainer>
          <HeaderTitle>제보 완료</HeaderTitle>
        </HeaderTitleContainer>
      </Header>

      <ScrollContainer>
        <ContentContainer>
          <IconContainer>
            <Svg
              width="150"
              height="150"
              viewBox="0 0 150 150"
              fill="none"
            >
              <Path
                d="M14.0625 75C14.0625 84.7375 16.35 93.9562 20.425 102.137C21.075 103.45 21.1375 105.406 20.3938 108.45C19.9999 109.987 19.5412 111.508 19.0187 113.006L18.8313 113.544C18.3688 114.919 17.8688 116.419 17.4938 117.812C15.1063 126.731 23.2688 134.894 32.1813 132.506C33.5813 132.131 35.075 131.631 36.4563 131.169L36.9938 130.981C38.4924 130.459 40.0125 130 41.55 129.606C44.5938 128.856 46.55 128.919 47.8625 129.575C56.2914 133.775 65.5828 135.953 75 135.938C108.656 135.938 135.938 108.656 135.938 75C135.938 41.3438 108.656 14.0625 75 14.0625C41.3438 14.0625 14.0625 41.3438 14.0625 75ZM91.15 58.7C92.1577 59.4278 92.8351 60.526 93.0332 61.7531C93.2313 62.9803 92.9338 64.2359 92.2063 65.2438L74.7062 89.4688C74.1283 90.2664 73.3782 90.9237 72.5116 91.3919C71.645 91.8601 70.6841 92.1272 69.7001 92.1734C68.7162 92.2197 67.7345 92.0438 66.8278 91.6589C65.9211 91.274 65.1127 90.6899 64.4625 89.95L55.85 80.1C55.0886 79.1578 54.7215 77.9573 54.8257 76.7504C54.9299 75.5435 55.4974 74.4237 56.4091 73.626C57.3208 72.8283 58.5059 72.4145 59.716 72.4714C60.9261 72.5283 62.0672 73.0515 62.9 73.9313L69.1813 81.1063L84.6062 59.7562C85.334 58.7485 86.4323 58.0711 87.6594 57.8731C88.8866 57.675 90.1421 57.9724 91.15 58.7Z"
                fill="#30B0C7"
              />
            </Svg>
          </IconContainer>

          <SuccessMessage>제보가 완료되었습니다</SuccessMessage>
          <ThankYouMessage>제보해 주셔서 감사합니다!</ThankYouMessage>

          <InfoCard>
            <InfoTitle>제보 정보</InfoTitle>
            <InfoRow>
              <InfoLabel>위치</InfoLabel>
              <InfoValue
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {reportData?.location?.address || "위치 정보 없음"}
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>위험 유형</InfoLabel>
              <InfoValue>{getDangerTypeLabel(reportData?.dangerType)}</InfoValue>
            </InfoRow>
            <Divider />
            <DescriptionRow>
              <DescriptionLabel>상세 설명</DescriptionLabel>
              <DescriptionValue>{reportData?.description || "상세 설명 없음"}</DescriptionValue>
            </DescriptionRow>
          </InfoCard>

          <ButtonContainer>
            <DefaultButton
              onPress={onNavigateToHome}
              fullWidth
            >
              홈으로
            </DefaultButton>
          </ButtonContainer>
        </ContentContainer>
      </ScrollContainer>
    </Container>
  );
};
