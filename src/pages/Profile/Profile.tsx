import React from "react";
import styled from "styled-components/native";
import { Container, CustomText } from "../../components";

const ProfileContainer = styled.View`
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

export const Profile = () => {
  return (
    <Container>
      <ProfileContainer>
        <Title size={24} weight="bold">
          내 정보 페이지
        </Title>
        <CustomText size={16}>
          프로필 정보가 여기에 표시됩니다.
        </CustomText>
      </ProfileContainer>
    </Container>
  );
};

