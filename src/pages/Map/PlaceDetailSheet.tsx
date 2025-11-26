import React, { useState } from "react";
import styled from "styled-components/native";
import { Platform, Dimensions, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CustomText } from "../../components";
import Svg, { Path, Circle, Line } from "react-native-svg";
import { useTts } from "../../tts";

interface Place {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  category_group_name?: string;
}

interface PlaceDetailSheetProps {
  place: Place;
  distance?: number;
  onClose: () => void;
  onStartNavigation: () => void;
  onSetDestination: () => void;
}

const { width } = Dimensions.get("window");

const SheetContainer = styled.View`
  width: ${width - 32}px;
  margin-left: 16px;
  margin-bottom: 34px;
  background-color: #ffffff;
  border-radius: 24px;
  padding: 24px;
  ${Platform.select({
    ios: `
      shadow-color: rgba(0, 0, 0, 0.12);
      shadow-offset: 0px 8px;
      shadow-opacity: 1;
      shadow-radius: 24px;
    `,
    android: `elevation: 12;`,
  })}
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const TitleContainer = styled.View`
  flex: 1;
  margin-right: 12px;
`;

const PlaceTitle = styled(CustomText)`
  font-size: 22px;
  color: ${(props) => props.theme.colors.text.primary};
  margin-bottom: 4px;
  font-family: ${(props) => props.theme.fonts.bold};
`;

const AddressText = styled(CustomText)`
  font-size: 14px;
  color: ${(props) => props.theme.colors.text.secondary};
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.primary};
`;

const CloseButton = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 16px;
`;

const ActionRow = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-top: 8px;
`;

const ActionButton = styled.TouchableOpacity`
  flex: 1;
  height: 52px;
  border-radius: 16px;
  overflow: hidden;
`;

// LinearGradient를 감싸는 컴포넌트 정의
const GradientWrapper = styled(LinearGradient)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const PrimaryButtonGradient = ({ children }: { children: React.ReactNode }) => (
  <GradientWrapper
    colors={["#68D0C6", "#5095FF"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
  >
    {children}
  </GradientWrapper>
);

const SecondaryButton = styled.TouchableOpacity`
  flex: 1;
  height: 52px;
  border-radius: 16px;
  background-color: #f8f9fa;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border: 1px solid #eeeeee;
  gap: 8px;
`;

const ButtonText = styled(CustomText)<{ primary?: boolean }>`
  font-size: 16px;
  color: ${(props) =>
    props.primary
      ? props.theme.colors.text.white
      : props.theme.colors.text.primary};
  font-family: ${(props) => props.theme.fonts.bold};
`;

const InfoSection = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
`;

const InfoItem = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const InfoText = styled(CustomText)`
  font-size: 14px;
  color: ${(props) => props.theme.colors.text.secondary};
  font-family: ${(props) => props.theme.fonts.medium};
`;

const Divider = styled.View`
  width: 1px;
  height: 12px;
  background-color: ${(props) => props.theme.colors.border};
`;

const CategoryBadge = styled.View`
  padding: 4px 10px;
  background-color: #eafbf9;
  border-radius: 8px;
  align-self: flex-start;
  margin-bottom: 12px;
`;

const CategoryText = styled(CustomText)`
  font-size: 12px;
  color: ${(props) => props.theme.colors.primary};
  font-family: ${(props) => props.theme.fonts.semiBold};
`;

export const PlaceDetailSheet = ({
  place,
  distance,
  onClose,
  onStartNavigation,
  onSetDestination,
}: PlaceDetailSheetProps) => {
  const { speak } = useTts();

  const handleStartNavigation = () => {
    speak(`${place.place_name}으로 길 안내를 시작하겠습니다`);
    onStartNavigation();
  };

  return (
    <SheetContainer>
      <HeaderRow>
        <TitleContainer>
          {place.category_group_name && (
            <CategoryBadge>
              <CategoryText>{place.category_group_name}</CategoryText>
            </CategoryBadge>
          )}
          <PlaceTitle numberOfLines={1} ellipsizeMode="tail">
            {place.place_name}
          </PlaceTitle>
          <AddressText numberOfLines={2} ellipsizeMode="tail">
            {place.road_address_name || place.address_name}
          </AddressText>
        </TitleContainer>
        <CloseButton onPress={onClose}>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Path
              d="M18 6L6 18M6 6L18 18"
              stroke="#666666"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </CloseButton>
      </HeaderRow>

      <InfoSection>
        {distance && (
          <>
            <InfoItem>
              <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"
                  stroke="#68D0C6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Circle
                  cx="12"
                  cy="10"
                  r="3"
                  stroke="#68D0C6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <InfoText>{distance}m</InfoText>
            </InfoItem>
            <Divider />
          </>
        )}
        <InfoItem>
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke="#666666" strokeWidth="2" />
            <Path
              d="M12 6v6l4 2"
              stroke="#666666"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <InfoText>도보 약 {Math.ceil((distance || 0) / 67)}분</InfoText>
        </InfoItem>
      </InfoSection>

      <ActionRow>
        <SecondaryButton onPress={onSetDestination}>
          <ButtonText>도착지로 설정</ButtonText>
        </SecondaryButton>
        <ActionButton onPress={handleStartNavigation}>
          <PrimaryButtonGradient>
            <ButtonText primary>안내 시작</ButtonText>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </PrimaryButtonGradient>
        </ActionButton>
      </ActionRow>
    </SheetContainer>
  );
};
