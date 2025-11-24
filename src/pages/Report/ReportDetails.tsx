import React, { useState } from "react";
import { ScrollView, View, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";
import Svg, { Path } from "react-native-svg";
import { Container, CustomText } from "../../components";
import { theme } from "../../styles/theme";

const ScrollContainer = styled.ScrollView`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const ContentContainer = styled.View`
  padding-left: ${props => props.theme.spacing.md}px;
  padding-right: ${props => props.theme.spacing.md}px;
  padding-top: ${props => props.theme.spacing.lg}px;
  padding-bottom: ${props => props.theme.spacing.xl}px;
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

const ProfileSection = styled.View`
  align-items: center;
  padding-top: ${props => props.theme.spacing.lg}px;
  padding-bottom: ${props => props.theme.spacing.lg}px;
  background-color: ${props => props.theme.colors.background};
`;

const ProfileImageContainer = styled.View`
  width: 90px;
  height: 90px;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const ProfileName = styled.Text`
  font-size: ${props => props.theme.fontSize.lg}px;
  font-weight: ${props => props.theme.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.fonts.bold};
`;

const TabContainer = styled.View`
  flex-direction: row;
  background-color: ${props => props.theme.colors.background};
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border};
`;

interface TabButtonProps {
  active?: boolean;
}

const TabButton = styled.TouchableOpacity<TabButtonProps>`
  flex: 1;
  padding: ${props => props.theme.spacing.md}px;
  align-items: center;
  justify-content: center;
  border-bottom-width: ${props => (props.active ? 1 : 0)}px;
  border-bottom-color: ${props => props.theme.colors.text.primary};
`;

const TabText = styled(CustomText)<TabButtonProps>`
  font-size: ${props => props.theme.fontSize.md}px;
  font-weight: ${props => (props.active ? props.theme.fontWeight.bold : props.theme.fontWeight.normal)};
  color: ${props => (props.active ? props.theme.colors.text.primary : props.theme.colors.text.secondary)};
  font-family: ${props => (props.active ? props.theme.fonts.bold : props.theme.fonts.medium)};
`;

const FilterContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  padding: ${props => props.theme.spacing.md}px;
  gap: ${props => props.theme.spacing.sm}px;
  background-color: ${props => props.theme.colors.background};
`;

interface FilterButtonProps {
  active?: boolean;
}

const FilterButton = styled.TouchableOpacity<FilterButtonProps>`
  padding: ${props => props.theme.spacing.sm}px ${props => props.theme.spacing.md}px;
  border-radius: 40px;
  background-color: ${props => props.theme.colors.white};
  shadow-color: #000;
  shadow-offset: 0px 0px;
  shadow-opacity: 0.2;
  shadow-radius: 0.8px;
  elevation: 2;
  border-width: ${props => (props.active ? 1.5 : 0)}px;
  border-color: ${props => (props.active ? props.theme.colors.primary : "transparent")};
`;

const FilterButtonText = styled.Text<FilterButtonProps>`
  font-size: ${props => props.theme.fontSize.md}px;
  font-weight: ${props => props.theme.fontWeight.medium};
  color: ${props => (props.active ? props.theme.colors.primary : props.theme.colors.text.primary)};
  font-family: ${props => props.theme.fonts.medium};
`;

const ReportListContainer = styled.View`
  padding: ${props => props.theme.spacing.md}px;
  background-color: ${props => props.theme.colors.white};
`;

const ReportItem = styled.TouchableOpacity`
  flex-direction: row;
  padding: ${props => props.theme.spacing.md}px;
  margin-bottom: ${props => props.theme.spacing.md}px;
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.md}px;
`;

const ReportThumbnail = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: ${props => props.theme.borderRadius.md}px;
  margin-right: ${props => props.theme.spacing.md}px;
  background-color: ${props => props.theme.colors.lightGray};
`;

const ReportContent = styled.View`
  flex: 1;
`;

const ReportHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0px;
`;

const ReportHeaderRight = styled.View`
  align-items: flex-end;
`;

const ReportTitle = styled(CustomText)`
  font-size: ${props => props.theme.fontSize.xxl}px;
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.fonts.bold};
  flex: 1;
  margin-right: ${props => props.theme.spacing.sm}px;
  margin-top: ${props => props.theme.spacing.xs}px;
`;

const ReportDate = styled.Text`
  font-size: ${props => props.theme.fontSize.sm}px;
  font-weight: ${props => props.theme.fontWeight.normal};
  color: ${props => props.theme.colors.text.secondary};
  font-family: ${props => props.theme.fonts.medium};
`;

const ReportDescriptionContainer = styled.View`
  margin-top: -${props => props.theme.spacing.lg}px;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const ReportDescription = styled.Text`
  font-size: 13px;
  font-weight: ${props => props.theme.fontWeight.normal};
  color: ${props => props.theme.colors.text.secondary};
  font-family: ${props => props.theme.fonts.medium};
`;

interface StatusBadgeProps {
  status: "approved" | "pending" | "rejected";
}

const StatusBadge = styled.View<StatusBadgeProps>`
  padding: ${props => props.theme.spacing.xs}px ${props => props.theme.spacing.sm}px;
  border-radius: 20px;
  margin-top: ${props => props.theme.spacing.md}px;
  background-color: ${props => {
    if (props.status === "approved") return "#5773BC";
    if (props.status === "pending") return "#4ECDC4";
    return "#F24737";
  }};
`;

const StatusBadgeText = styled.Text`
  font-size: 12px;
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.white};
  font-family: ${props => props.theme.fonts.semiBold};
`;

type TabType = "report" | "suggestion";
type FilterType = "all" | "approved" | "pending" | "rejected";
type ReportStatus = "approved" | "pending" | "rejected";

interface ReportItemData {
  id: string;
  thumbnail: string | number;
  title: string;
  description: string;
  date: string;
  status: ReportStatus;
}

interface ReportDetailsProps {
  onNavigateBack?: () => void;
  reports?: ReportItemData[];
}

export const ReportDetails = ({ onNavigateBack, reports: propReports }: ReportDetailsProps) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("report");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // TODO: 실제 데이터는 API에서 가져올 예정
  const mockReports: ReportItemData[] = [
    {
      id: "1",
      thumbnail: require("../../../assets/dummy/dummy1.png"),
      title: "보도블록 파손",
      description: "한밭대학교 n4동 보도블럭이 이상해요",
      date: "25-10-21",
      status: "approved",
    },
    {
      id: "2",
      thumbnail: require("../../../assets/dummy/dummy2.png"),
      title: "점자블록 파손",
      description: "한밭대학교 정문 앞 점자블록 파손",
      date: "25-09-13",
      status: "pending",
    },
    {
      id: "3",
      thumbnail: require("../../../assets/dummy/dummy3.png"),
      title: "킥보드 무단 주차",
      description: "한밭대학교 정문 앞 킥보드 무단 주차",
      date: "25-09-02",
      status: "rejected",
    },
    {
      id: "4",
      thumbnail: require("../../../assets/dummy/dummy1.png"),
      title: "계단 난간 파손",
      description: "한밭대학교 도서관 앞 계단 난간이 위험해요",
      date: "25-08-25",
      status: "approved",
    },
    {
      id: "5",
      thumbnail: require("../../../assets/dummy/dummy2.png"),
      title: "보행로 장애물",
      description: "한밭대학교 학생회관 앞 보행로에 장애물이 있어요",
      date: "25-08-15",
      status: "pending",
    },
    {
      id: "6",
      thumbnail: require("../../../assets/dummy/dummy3.png"),
      title: "가로등 불량",
      description: "한밭대학교 운동장 옆 가로등이 고장났어요",
      date: "25-08-05",
      status: "rejected",
    },
  ];

  const getStatusText = (status: ReportStatus): string => {
    switch (status) {
      case "approved":
        return "승인 완료";
      case "pending":
        return "승인 대기";
      case "rejected":
        return "미승인";
      default:
        return "";
    }
  };

  // propReports가 있으면 사용하고, 없으면 mockReports 사용
  const allReports = propReports && propReports.length > 0 ? propReports : mockReports;

  const filteredReports = allReports.filter(report => {
    if (activeFilter === "all") return true;
    return report.status === activeFilter;
  });

  return (
    <Container>
      <Header style={{ paddingTop: insets.top + theme.spacing.md }}>
        <BackButton
          onPress={onNavigateBack}
          style={{ top: insets.top + theme.spacing.sm }}
        >
          <BackButtonText>←</BackButtonText>
        </BackButton>
        <HeaderTitleContainer>
          <HeaderTitle>제보 내역</HeaderTitle>
        </HeaderTitleContainer>
      </Header>

      <ProfileSection>
        <ProfileImageContainer>
          <Svg
            width="90"
            height="90"
            viewBox="0 0 90 90"
            fill="none"
          >
            <Path
              d="M45.0001 0.25C69.7148 0.250043 89.7501 20.2853 89.7501 45C89.7501 69.7147 69.7148 89.75 45.0001 89.75C20.2854 89.75 0.250122 69.7147 0.250122 45C0.250122 20.2853 20.2854 0.25 45.0001 0.25Z"
              fill="#BFCDE6"
              stroke="#C8C9CC"
              strokeWidth="0.5"
            />
            <Path
              d="M45.0002 19.1997C56.5981 19.1998 66.0002 28.6018 66.0002 40.1997C66.0002 44.9677 64.409 49.3631 61.7317 52.8882C62.8435 53.7163 63.9009 54.6277 64.8928 55.6196C70.2859 61.0127 73.3185 68.3246 73.3274 75.9507L73.3625 75.9517C73.3532 79.1833 70.3033 82.2739 64.884 84.5435C59.4646 86.813 52.1191 88.0762 44.4641 88.0542C36.8092 88.0321 29.471 86.727 24.0647 84.4263C18.6586 82.1255 15.626 79.0173 15.635 75.7856H15.7297C15.7819 68.2192 18.8092 60.9738 24.1633 55.6196C25.3362 54.4468 26.5999 53.3857 27.9377 52.4429C25.4601 48.9961 24.0002 44.7686 24.0002 40.1997C24.0002 28.6017 33.4023 19.1997 45.0002 19.1997Z"
              fill="white"
            />
            <Path
              d="M45.0001 0.5C69.5767 0.500043 89.5001 20.4234 89.5001 45C89.5001 69.5766 69.5767 89.5 45.0001 89.5C20.4235 89.5 0.500122 69.5767 0.500122 45C0.500122 20.4233 20.4235 0.5 45.0001 0.5Z"
              stroke="#C8C9CC"
            />
            <Path
              d="M39.6003 36.5C39.9868 36.5001 40.3005 36.8137 40.3005 37.2002C40.3004 37.5866 39.9868 37.9003 39.6003 37.9004C39.2138 37.9004 38.9003 37.5867 38.9001 37.2002C38.9001 36.8136 39.2137 36.5 39.6003 36.5Z"
              fill="#BFCDE6"
              stroke="#BFCDE6"
            />
            <Path
              d="M50.4003 36.5C50.7868 36.5001 51.1005 36.8137 51.1005 37.2002C51.1004 37.5866 50.7867 37.9003 50.4003 37.9004C50.0137 37.9004 49.7002 37.5867 49.7001 37.2002C49.7001 36.8136 50.0137 36.5 50.4003 36.5Z"
              fill="#BFCDE6"
              stroke="#BFCDE6"
            />
            <Path
              d="M34.8 44.3999C43.0733 49.0336 47.5525 48.9867 55.2 44.3999"
              stroke="#BFCDE6"
              strokeLinecap="round"
            />
          </Svg>
        </ProfileImageContainer>
        <ProfileName>홍길동</ProfileName>
      </ProfileSection>

      <TabContainer>
        <TabButton
          active={activeTab === "report"}
          onPress={() => setActiveTab("report")}
        >
          <TabText active={activeTab === "report"}>제보 내역</TabText>
        </TabButton>
        <TabButton
          active={activeTab === "suggestion"}
          onPress={() => setActiveTab("suggestion")}
        >
          <TabText active={activeTab === "suggestion"}>수정 내역</TabText>
        </TabButton>
      </TabContainer>

      {activeTab === "report" && (
        <>
          <FilterContainer>
            <FilterButton
              active={activeFilter === "all"}
              onPress={() => setActiveFilter("all")}
            >
              <FilterButtonText active={activeFilter === "all"}>전체</FilterButtonText>
            </FilterButton>
            <FilterButton
              active={activeFilter === "approved"}
              onPress={() => setActiveFilter("approved")}
            >
              <FilterButtonText active={activeFilter === "approved"}>승인 완료</FilterButtonText>
            </FilterButton>
            <FilterButton
              active={activeFilter === "pending"}
              onPress={() => setActiveFilter("pending")}
            >
              <FilterButtonText active={activeFilter === "pending"}>승인 대기</FilterButtonText>
            </FilterButton>
            <FilterButton
              active={activeFilter === "rejected"}
              onPress={() => setActiveFilter("rejected")}
            >
              <FilterButtonText active={activeFilter === "rejected"}>미승인</FilterButtonText>
            </FilterButton>
          </FilterContainer>

          <ScrollContainer>
            <ReportListContainer>
              {filteredReports.map(report => (
                <ReportItem key={report.id}>
                  <ReportThumbnail
                    source={typeof report.thumbnail === "string" ? { uri: report.thumbnail } : report.thumbnail}
                  />
                  <ReportContent>
                    <View>
                      <ReportHeader>
                        <ReportTitle>{report.title}</ReportTitle>
                        <ReportHeaderRight>
                          <ReportDate>{report.date}</ReportDate>
                          <StatusBadge status={report.status}>
                            <StatusBadgeText>{getStatusText(report.status)}</StatusBadgeText>
                          </StatusBadge>
                        </ReportHeaderRight>
                      </ReportHeader>
                      <ReportDescriptionContainer>
                        <ReportDescription>
                          {report.description.length > 20
                            ? `${report.description.substring(0, 20)}...`
                            : report.description}
                        </ReportDescription>
                      </ReportDescriptionContainer>
                    </View>
                  </ReportContent>
                </ReportItem>
              ))}
            </ReportListContainer>
          </ScrollContainer>
        </>
      )}
    </Container>
  );
};
