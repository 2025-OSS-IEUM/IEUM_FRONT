import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components/native";
import {
  TouchableOpacity,
  FlatList,
  TextInput,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomText, InputField } from "../../components";
import { theme } from "../../styles/theme";

interface Place {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string; // longitude
  y: string; // latitude
}

interface MapSearchProps {
  onClose: () => void;
  onSearch: (keyword: string) => void;
  searchResults: Place[];
  isSearching: boolean;
  onSelectPlace: (place: Place) => void;
}

const Container = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  z-index: 100;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px 20px;
  border-bottom-width: 1px;
  border-bottom-color: #f0f0f0;
  gap: 12px;
`;

const BackButton = styled.TouchableOpacity`
  padding: 8px;
  margin-left: -8px;
`;

const SearchInputWrapper = styled.View`
  flex: 1;
`;

const ResultList = styled(FlatList as new () => FlatList<Place>)`
  flex: 1;
`;

const ResultItem = styled.TouchableOpacity`
  padding: 16px 20px;
  border-bottom-width: 1px;
  border-bottom-color: #f5f5f5;
`;

const EmptyState = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-bottom: 100px;
`;

export const MapSearch = ({
  onClose,
  onSearch,
  searchResults,
  isSearching,
  onSelectPlace,
}: MapSearchProps) => {
  const insets = useSafeAreaInsets();
  const [keyword, setKeyword] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // 컴포넌트 마운트 시 자동으로 포커스
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => {
    if (keyword.trim().length > 0) {
      onSearch(keyword);
      Keyboard.dismiss();
    }
  };

  const renderItem = ({ item }: { item: Place }) => (
    <ResultItem onPress={() => onSelectPlace(item)}>
      <CustomText size={16} weight="bold" style={{ marginBottom: 4 }}>
        {item.place_name}
      </CustomText>
      <CustomText size={14} color="#888888">
        {item.road_address_name || item.address_name}
      </CustomText>
    </ResultItem>
  );

  return (
    <Container style={{ paddingTop: insets.top }}>
      <Header>
        <BackButton onPress={onClose}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 19L8 12L15 5"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </BackButton>
        <SearchInputWrapper>
          <InputField
            ref={inputRef}
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={handleSearch}
            placeholder="장소, 주소 검색"
            returnKeyType="search"
            containerStyle={{ marginBottom: 0 }}
            right={
              keyword.length > 0 && (
                <TouchableOpacity onPress={() => setKeyword("")}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" fill="#E0E0E0" />
                    <Path
                      d="M15 9L9 15M9 9L15 15"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </Svg>
                </TouchableOpacity>
              )
            }
          />
        </SearchInputWrapper>
      </Header>

      {isSearching ? (
        <EmptyState>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </EmptyState>
      ) : (
        <ResultList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            keyword.length > 0 ? (
              <EmptyState>
                <CustomText color="#888888">검색 결과가 없습니다.</CustomText>
              </EmptyState>
            ) : (
              <EmptyState>
                <CustomText color="#888888">목적지를 검색해보세요.</CustomText>
              </EmptyState>
            )
          }
        />
      )}
    </Container>
  );
};

