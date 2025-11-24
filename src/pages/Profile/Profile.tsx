import React from "react";
import { Platform, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, SvgUri } from "react-native-svg";
import { useAssets } from "expo-asset";
import { Container, CustomText } from "../../components";

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

const GreetingCard = styled.View`
  padding-left: 10px;
`;

const GreetingText = styled(CustomText)`
  font-size: 24px;
  color: #4b4b4b;
  font-weight: 700;
  margin-bottom: 4px;
`;

const SubLink = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
`;

const SubLinkText = styled.Text`
  color: #797979;
  font-size: 16px;
  margin-right: 4px;
  margin-bottom: 8px;

  margin-top: 4px;
  font-family: ${(props) => props.theme.fonts.primary};
`;

const StatsCardContainer = styled.View`
  position: relative;
  z-index: 10;
`;

const StatsCardWrapper = styled.View`
  border-radius: 20px;
  border: 1px solid #c4bfbe;
  overflow: hidden;
  z-index: 20;
`;

const GradientCard = styled(LinearGradient)`
  flex-direction: row;
  align-items: center;
  padding-top: 32px;
  padding-bottom: 32px;
  padding-left: 24px;
  padding-right: 24px;
`;

const StatsList = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const StatItem = styled.View`
  flex: 1;
  align-items: center;
`;

const StatValue = styled(CustomText)`
  font-size: 28px;
  font-weight: 700;
`;

const StatLabel = styled(CustomText)`
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
`;

const StatDivider = styled.View`
  width: 1px;
  height: 48px;
  background-color: rgba(255, 255, 255, 0.35);
`;

const DogFigure = styled.View`
  position: absolute;
  top: -100px;
  right: -10px;
  width: 130px;
  height: 130px;
  justify-content: center;
  align-items: center;
  z-index: 5;
  transform: scaleX(-1);
`;

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

const SectionCard = styled.View`
  background-color: #ffffff;
  border-radius: 20px;
  border: 1px solid #ededed;
`;

const Row = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-top: 18px;
  padding-bottom: 18px;
  padding-left: 20px;
  padding-right: 12px;
`;

const RowLabel = styled(CustomText)`
  font-size: 16px;
  color: #4b4b4b;
`;

const ArrowWrapper = styled.View`
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
`;

const SubLinkArrow = styled.View`
  width: 12px;
  height: 24px;
  margin-bottom: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 6px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: #f2f2f2;
  margin-left: 20px;
  margin-right: 12px;
`;

const ArrowIcon = () => (
  <Svg width="12" height="24" viewBox="0 0 12 24" fill="none">
    <Path
      d="M2.45199 6.57999L3.51299 5.51999L9.29199 11.297C9.38514 11.3896 9.45907 11.4996 9.50952 11.6209C9.55997 11.7421 9.58594 11.8722 9.58594 12.0035C9.58594 12.1348 9.55997 12.2648 9.50952 12.3861C9.45907 12.5073 9.38514 12.6174 9.29199 12.71L3.51299 18.49L2.45299 17.43L7.87699 12.005L2.45199 6.57999Z"
      fill="#797979"
    />
  </Svg>
);

const statsData = [
  { value: "4", label: "즐겨찾기" },
  { value: "15", label: "제보 내역" },
  { value: "3", label: "획득한 칭찬" },
];

const reportLinks = ["제보하기", "제보 내역", "신고하기"];
const settingLinks = ["즐겨찾기", "공지사항", "계정", "로그아웃"];

export const Profile = () => {
  const [assets] = useAssets([require("../../../assets/mypage/ieum.svg")]);
  const dogUri = assets?.[0]?.localUri ?? assets?.[0]?.uri;

  const cardShadow = Platform.select({
    ios: {
      shadowColor: "rgba(0, 0, 0, 0.15)",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  });

  return (
    <Container backgroundColor="#f8f9fb">
      <Header>
        <HeaderTitle size={20} weight="semibold">
          내 정보
        </HeaderTitle>
      </Header>
      <ProfileScroll
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HEADER_TOTAL_HEIGHT + 16 }}
      >
        <ContentWrapper>
          <GreetingCard>
            <GreetingText size={21} weight="700">
              홍길동님, 반가워요!
            </GreetingText>
            <SubLink>
              <SubLinkText>내 정보</SubLinkText>
              <SubLinkArrow>
                <ArrowIcon />
              </SubLinkArrow>
            </SubLink>
          </GreetingCard>

          <StatsCardContainer>
            <StatsCardWrapper style={cardShadow}>
              <GradientCard
                colors={["#c4bfbe", "#899099"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <StatsList>
                  {statsData.map((item, index) => (
                    <React.Fragment key={item.label}>
                      <StatItem>
                        <StatValue size={38} weight="700" color="white">
                          {item.value}
                        </StatValue>
                        <StatLabel size={15} color="white">
                          {item.label}
                        </StatLabel>
                      </StatItem>
                      {index < statsData.length - 1 && <StatDivider />}
                    </React.Fragment>
                  ))}
                </StatsList>
              </GradientCard>
            </StatsCardWrapper>
            {dogUri && (
              <DogFigure>
                <SvgUri uri={dogUri} width="100%" height="100%" />
              </DogFigure>
            )}
          </StatsCardContainer>

          <Section>
            <SectionHeader>
              <SectionTitle size={18} weight="600">
                제보
              </SectionTitle>
            </SectionHeader>
            <SectionCard>
              {reportLinks.map((label, index) => (
                <React.Fragment key={label}>
                  <Row activeOpacity={0.7}>
                    <RowLabel size={16} weight="300">
                      {label}
                    </RowLabel>
                    <ArrowWrapper>
                      <ArrowIcon />
                    </ArrowWrapper>
                  </Row>
                  {index < reportLinks.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </SectionCard>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle size={18} weight="600">
                설정
              </SectionTitle>
            </SectionHeader>
            <SectionCard>
              {settingLinks.map((label, index) => (
                <React.Fragment key={label}>
                  <Row activeOpacity={0.7}>
                    <RowLabel size={16} weight="300">
                      {label}{" "}
                    </RowLabel>
                    <ArrowWrapper>
                      <ArrowIcon />
                    </ArrowWrapper>
                  </Row>
                  {index < settingLinks.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </SectionCard>
          </Section>
        </ContentWrapper>
      </ProfileScroll>
    </Container>
  );
};
