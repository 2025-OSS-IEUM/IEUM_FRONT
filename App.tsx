import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { ThemeProvider } from "styled-components/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "./src/styles";
import styled from "styled-components/native";
import { View, Text } from "react-native";
import { Footer } from "./src/components";
import { Home, Map, Profile, Report, ReportDetails, ReportDone } from "./src/pages";

type TabType = "map" | "home" | "profile" | "report";

interface ReportData {
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dangerType: string;
  description: string;
  images: string[];
}

type ReportStatus = "approved" | "pending" | "rejected";

interface ReportItemData {
  id: string;
  thumbnail: string | number;
  title: string;
  description: string;
  date: string;
  status: ReportStatus;
}

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
    "Pinkfong-Baby-Shark-Regular": require("./assets/fonts/Pinkfong Baby Shark Font_ Regular.ttf"),
    "Pinkfong-Baby-Shark-Light": require("./assets/fonts/Pinkfong Baby Shark Font_ Light.ttf"),
    "Pinkfong-Baby-Shark-Bold": require("./assets/fonts/Pinkfong Baby Shark Font_ Bold.ttf"),
  });

  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [showReportDone, setShowReportDone] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reports, setReports] = useState<ReportItemData[]>([]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const renderPage = () => {
    if (showReportDone && reportData) {
      return (
        <ReportDone
          reportData={reportData}
          onNavigateToHome={() => {
            setShowReportDone(false);
            setReportData(null);
            setActiveTab("home");
          }}
          onNavigateBack={() => {
            setShowReportDone(false);
            setReportData(null);
          }}
        />
      );
    }

    if (showReportDetails) {
      return (
        <ReportDetails
          reports={reports}
          onNavigateBack={() => setShowReportDetails(false)}
        />
      );
    }

    switch (activeTab) {
      case "map":
        return <Map onNavigateToReport={() => setActiveTab("report")} />;
      case "home":
        return (
          <Home
            onNavigateToReportDetails={() => setShowReportDetails(true)}
            onNavigateToReport={() => setActiveTab("report")}
          />
        );
      case "profile":
        return <Profile />;
      case "report":
        return (
          <Report
            onNavigateToHome={() => setActiveTab("home")}
            onReportSubmit={data => {
              setReportData(data);
              setShowReportDone(true);

              // 제보 내역에 추가
              const now = new Date();
              const dateStr = `${String(now.getFullYear()).slice(-2)}-${String(now.getMonth() + 1).padStart(
                2,
                "0"
              )}-${String(now.getDate()).padStart(2, "0")}`;

              const newReport: ReportItemData = {
                id: Date.now().toString(),
                thumbnail: data.images[0] || require("./assets/dummy/dummy1.png"),
                title: data.dangerType,
                description: data.description,
                date: dateStr,
                status: "pending",
              };

              setReports(prev => [newReport, ...prev]);
            }}
          />
        );
      default:
        return (
          <Home
            onNavigateToReportDetails={() => setShowReportDetails(true)}
            onNavigateToReport={() => setActiveTab("report")}
          />
        );
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
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <MainContainer>
          {renderPage()}
          <Footer
            initialTab={activeTab}
            onTabChange={handleTabChange}
          />
        </MainContainer>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
