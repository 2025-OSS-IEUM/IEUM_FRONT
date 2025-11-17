import React from "react";
import styled from "styled-components/native";
import { Container, CustomText } from "../../components";

const MapContainer = styled.View`
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

export const Map = () => {
  return (
    <Container>
      <MapContainer>
        <Title size={24} weight="bold">
          지도 페이지
        </Title>
        <CustomText size={16}>
          지도 기능이 여기에 표시됩니다.
        </CustomText>
      </MapContainer>
    </Container>
  );
};

