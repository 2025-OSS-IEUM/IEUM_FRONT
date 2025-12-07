import React, { useState, useEffect } from "react";
import styled from "styled-components/native";
import { Platform } from "react-native";
import { MapIcon, HomeIcon, ProfileIcon } from "./FooterIcons";

type TabType = "map" | "home" | "profile" | "report";

interface FooterProps {
  initialTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

const FooterContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: 20px;
  padding-right: 20px;
  background-color: #f5f5f5;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
`;

const TabButton = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-top: 8px;
  padding-bottom: 8px;
`;

const IconContainer = styled.View`
  margin-bottom: 4px;
`;

const TabText = styled.Text<{ isActive: boolean }>`
  font-size: 12px;
  color: ${(props) => (props.isActive ? "#4A4A4A" : "#A2A2A2")};
  font-weight: ${(props) =>
    props.isActive
      ? props.theme.fontWeight.bold
      : props.theme.fontWeight.normal};
  font-family: ${(props) => props.theme.fonts.primary};
`;

export const Footer = ({ initialTab = "home", onTabChange }: FooterProps) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const getIconColor = (tab: TabType) => {
    return activeTab === tab ? "#4A4A4A" : "#A2A2A2";
  };

  return (
    <FooterContainer
      style={
        Platform.OS === "ios"
          ? {
              shadowColor: "rgba(0, 0, 0, 0.5)",
              shadowOffset: { width: 0, height: -1 },
              shadowOpacity: 0.2,
              shadowRadius: 1,
            }
          : { elevation: 2 }
      }
    >
      <TabButton onPress={() => handleTabPress("map")} activeOpacity={0.7}>
        <IconContainer>
          <MapIcon color={getIconColor("map")} />
        </IconContainer>
        <TabText isActive={activeTab === "map"}>지도</TabText>
      </TabButton>

      <TabButton onPress={() => handleTabPress("home")} activeOpacity={0.7}>
        <IconContainer>
          <HomeIcon color={getIconColor("home")} />
        </IconContainer>
        <TabText isActive={activeTab === "home"}>홈</TabText>
      </TabButton>

      <TabButton onPress={() => handleTabPress("profile")} activeOpacity={0.7}>
        <IconContainer>
          <ProfileIcon color={getIconColor("profile")} />
        </IconContainer>
        <TabText isActive={activeTab === "profile"}>내 정보</TabText>
      </TabButton>
    </FooterContainer>
  );
};
