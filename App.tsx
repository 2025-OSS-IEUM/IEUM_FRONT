import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { ThemeProvider } from "styled-components/native";
import { theme } from "./src/styles";
import styled from "styled-components/native";
import { View, Text } from "react-native";
import { Footer } from "./src/components";
import { Home, Map, Profile } from "./src/pages";

type TabType = 'map' | 'home' | 'profile';

const MainContainer = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

export default function App() {
  const [fontsLoaded] = useFonts({
    "Pretendard-Thin": require("./assets/fonts/Pretendard-Thin.otf"),
    "Pretendard-ExtraLight": require("./assets/fonts/Pretendard-ExtraLight.otf"),
    "Pretendard-Light": require("./assets/fonts/Pretendard-Light.otf"),
    "Pretendard-Regular": require("./assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-Medium": require("./assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-SemiBold": require("./assets/fonts/Pretendard-SemiBold.otf"),
    "Pretendard-Bold": require("./assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-ExtraBold": require("./assets/fonts/Pretendard-ExtraBold.otf"),
    "Pretendard-Black": require("./assets/fonts/Pretendard-Black.otf"),
  });

  const [activeTab, setActiveTab] = useState<TabType>('home');

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'map':
        return <Map />;
      case 'home':
        return <Home />;
      case 'profile':
        return <Profile />;
      default:
        return <Home />;
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <MainContainer>
        {renderPage()}
        <Footer initialTab={activeTab} onTabChange={handleTabChange} />
      </MainContainer>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
