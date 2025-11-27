import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { ThemeProvider } from "styled-components/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "./src/styles";
import styled from "styled-components/native";
import { View, Text } from "react-native";
import { Footer } from "./src/components";
import { Home, Map, Profile, Report, ReportDetails, ReportDone, Splash, Login, SignUp } from "./src/pages";
import { TtsProvider } from "./src/tts";

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

  const [showSplash, setShowSplash] = useState(true);
  const [showLoginSplash, setShowLoginSplash] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [previousTab, setPreviousTab] = useState<TabType | null>(null);
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
        return (
          <Map
            onNavigateToReport={() => {
              setPreviousTab("map");
              setActiveTab("report");
            }}
          />
        );
      case "home":
        return (
          <Home
            onNavigateToReportDetails={() => setShowReportDetails(true)}
            onNavigateToReport={() => {
              setPreviousTab("home");
              setActiveTab("report");
            }}
          />
        );
      case "profile":
        return (
          <Profile
            onNavigateToReport={() => {
              setPreviousTab("profile");
              setActiveTab("report");
            }}
            onNavigateToReportDetails={() => setShowReportDetails(true)}
          />
        );
      case "report":
        return (
          <Report
            onNavigateToHome={() => {
              if (previousTab) {
                setActiveTab(previousTab);
              } else {
                setActiveTab("home");
              }
            }}
            onReportSubmit={data => {
              // 제보 완료 후 처리
              // API 응답은 ReportResponse 타입: { type, description, location: { type: "Point", coordinates: [lng, lat] }, photoUrls, ... }
              try {
                // GeoJSON 형식의 location을 변환: coordinates는 [longitude, latitude]
                const coordinates = data.location?.coordinates || [0, 0];
                const longitude = coordinates[0] || 0;
                const latitude = coordinates[1] || 0;

                const reportDataToSave: ReportData = {
                  location: {
                    latitude: latitude,
                    longitude: longitude,
                    address: `위도: ${latitude.toFixed(6)}, 경도: ${longitude.toFixed(6)}`, // 주소는 나중에 역지오코딩으로 가져올 수 있음
                  },
                  dangerType: data.type || "",
                  description: data.description || "",
                  images: data.photoUrls || [],
                };

                setReportData(reportDataToSave);
                setShowReportDone(true);

                // 제보 내역에 추가
                const now = new Date();
                const dateStr = `${String(now.getFullYear()).slice(-2)}-${String(now.getMonth() + 1).padStart(
                  2,
                  "0"
                )}-${String(now.getDate()).padStart(2, "0")}`;

                const reportTypeLabels: Record<string, string> = {
                  sidewalk_damage: "보도블록 파손",
                  construction: "공사 중",
                  missing_crosswalk: "횡단보도 없음",
                  no_tactile: "점자블록 없음",
                  etc: "기타",
                };

                const newReport: ReportItemData = {
                  id: data.id || Date.now().toString(),
                  thumbnail:
                    (reportDataToSave.images && reportDataToSave.images.length > 0 && reportDataToSave.images[0]) ||
                    require("./assets/dummy/dummy1.png"),
                  title: reportTypeLabels[data.type] || data.type || "",
                  description: reportDataToSave.description,
                  date: dateStr,
                  status: data.status === "approved" ? "approved" : data.status === "resolved" ? "approved" : "pending",
                };

                setReports(prev => [newReport, ...prev]);
              } catch (error) {
                console.error("❌ [App.onReportSubmit] 제보 데이터 처리 중 오류:", error);
              }
            }}
          />
        );
      default:
        return (
          <Home
            onNavigateToReportDetails={() => setShowReportDetails(true)}
            onNavigateToReport={() => {
              setPreviousTab("home");
              setActiveTab("report");
            }}
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

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <ThemeProvider theme={theme}>
          <Splash onFinish={() => setShowSplash(false)} />
          <StatusBar style="light" />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  if (showLoginSplash) {
    return (
      <SafeAreaProvider>
        <ThemeProvider theme={theme}>
          <Splash
            onFinish={() => {
              setShowLoginSplash(false);
              setIsLoggedIn(true);
            }}
          />
          <StatusBar style="light" />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  if (!isLoggedIn) {
    if (showSignUp) {
      return (
        <SafeAreaProvider>
          <ThemeProvider theme={theme}>
            <TtsProvider>
              <SignUp
                onNavigateBack={() => setShowSignUp(false)}
                onSignUpSuccess={() => {
                  setShowSignUp(false);
                  setShowLoginSplash(true);
                }}
              />
            </TtsProvider>
            <StatusBar style="auto" />
          </ThemeProvider>
        </SafeAreaProvider>
      );
    }

    return (
      <SafeAreaProvider>
        <ThemeProvider theme={theme}>
          <Login
            onLoginSuccess={() => setShowLoginSplash(true)}
            onNavigateToSignUp={() => setShowSignUp(true)}
            onNavigateToFindId={() => {
              // TODO: 아이디 찾기 페이지로 이동
              console.log("Navigate to FindId");
            }}
            onNavigateToFindPassword={() => {
              // TODO: 비밀번호 찾기 페이지로 이동
              console.log("Navigate to FindPassword");
            }}
          />
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <TtsProvider>
          <MainContainer>
            {renderPage()}
            <Footer
              initialTab={activeTab}
              onTabChange={handleTabChange}
            />
          </MainContainer>
          <StatusBar style="auto" />
        </TtsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
