import React from "react";
import styled from "styled-components/native";
import { Container, CustomText } from "../../components";

const HomeContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.colors.background};
`;

const Title = styled(CustomText)`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
`;

interface HomeProps {
  onNavigateToReportDetails?: () => void;
  onNavigateToReport?: () => void;
}

export const Home = ({ onNavigateToReportDetails, onNavigateToReport }: HomeProps) => {
  return (
    <Container>
      <HomeContainer>
        <Title
          size={24}
          weight="bold"
        >
          홈 페이지
        </Title>
        <CustomText size={16}>
          홈 화면이 여기에 표시됩니다.
        </CustomText>
      </HomeContainer>
    </Container>
  );
};
