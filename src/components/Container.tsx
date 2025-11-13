import React from 'react';
import styled from 'styled-components/native';

interface ContainerProps {
  children: React.ReactNode;
  padding?: number;
  backgroundColor?: string;
}

const StyledContainer = styled.View<{ padding?: number; backgroundColor?: string }>`
  flex: 1;
  padding: ${(props) => props.padding || 0}px;
  background-color: ${(props) => props.backgroundColor || '#ffffff'};
`;

export const Container: React.FC<ContainerProps> = ({
  children,
  padding,
  backgroundColor,
}) => {
  return (
    <StyledContainer padding={padding} backgroundColor={backgroundColor}>
      {children}
    </StyledContainer>
  );
};

