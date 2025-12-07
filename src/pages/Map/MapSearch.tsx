import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components/native";
import {
  TouchableOpacity,
  FlatList,
  TextInput,
  Keyboard,
  ActivityIndicator,
  Platform,
  Animated,
  Easing,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomText } from "../../components";
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
  recentPlaces?: Place[]; // 최근 선택한 장소들
}

const Container = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f8fafc;
  z-index: 100;
`;

const ContentWrapper = styled(Animated.View)`
  flex: 1;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding-left: 20px;
  padding-right: 20px;
  gap: 12px;
  margin-bottom: 12px;
  background-color: #ffffff;
  padding-bottom: 16px;
  border-bottom-width: 1px;
  border-bottom-color: #f1f5f9;
  ${Platform.select({
    ios: `
      shadow-color: rgba(0, 0, 0, 0.03);
      shadow-offset: 0px 2px;
      shadow-opacity: 1;
      shadow-radius: 8px;
    `,
    android: `elevation: 2;`,
  })}
`;

const BackButton = styled.TouchableOpacity`
  padding: 8px;
  margin-left: -8px;
  margin-right: 4px;
  background-color: #f8fafc;
  border-radius: 12px;
`;

const SearchInputContainer = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  border-radius: 16px;
  padding-left: 16px;
  padding-right: 12px;
  height: 52px;
  background-color: #f1f5f9;
`;

const IconButton = styled.TouchableOpacity`
  padding: 8px;
  margin-left: 4px;
`;

const ResultItem = styled.TouchableOpacity`
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 16px;
  padding-bottom: 16px;
  background-color: #ffffff;
  margin-bottom: 1px;
`;

const ResultMetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const PlaceName = styled(CustomText)`
  font-size: 16px;
  font-family: ${(props) => props.theme.fonts.semiBold};
  color: ${(props) => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const PlaceAddress = styled(CustomText)`
  font-size: 14px;
  color: ${(props) => props.theme.colors.text.secondary};
  font-family: ${(props) => props.theme.fonts.primary};
`;

const EmptyState = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-bottom: 100px;
`;

const RecentBadge = styled.View`
  padding-top: 4px;
  padding-bottom: 4px;
  padding-left: 8px;
  padding-right: 8px;
  border-radius: 6px;
  background-color: #eff6ff;
`;

const RecentBadgeText = styled(CustomText)`
  font-size: 11px;
  color: #3b82f6;
  font-family: ${(props) => props.theme.fonts.bold};
`;

const SectionLabel = styled(CustomText)`
  margin-left: 24px;
  margin-top: 24px;
  margin-bottom: 12px;
  color: ${(props) => props.theme.colors.placeholder};
  font-size: 13px;
  font-family: ${(props) => props.theme.fonts.bold};
`;

const EmptyIcon = styled.View`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: #f1f5f9;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

export const MapSearch = ({
  onClose,
  onSearch,
  searchResults,
  isSearching,
  onSelectPlace,
  recentPlaces = [],
}: MapSearchProps) => {
  const insets = useSafeAreaInsets();
  const [keyword, setKeyword] = useState("");
  const inputRef = useRef<TextInput>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchKeywordRef = useRef<string>("");
  const appearAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 컴포넌트 마운트 시 자동으로 포커스
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    Animated.timing(appearAnim, {
      toValue: 1,
      duration: 350,
      delay: 40,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [appearAnim]);

  // 자동완성: 검색어 변경 시 debounce 적용 (실제로 변경되었을 때만 검색)
  useEffect(() => {
    const trimmedKeyword = keyword.trim();

    // 검색어가 실제로 변경되지 않았으면 검색하지 않음
    if (trimmedKeyword === lastSearchKeywordRef.current) {
      return;
    }

    // 이전 타이머 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 검색어가 3글자 이상일 때만 자동 검색
    if (trimmedKeyword.length >= 3) {
      debounceTimerRef.current = setTimeout(() => {
        // 검색어가 여전히 변경되었는지 확인
        if (trimmedKeyword !== lastSearchKeywordRef.current) {
          lastSearchKeywordRef.current = trimmedKeyword;
          onSearch(trimmedKeyword);
        }
      }, 500); // 500ms debounce
    } else if (trimmedKeyword.length === 0) {
      // 검색어가 비어있으면 이전 검색어 초기화
      lastSearchKeywordRef.current = "";
    }

    // cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [keyword, onSearch]);

  const handleSearch = () => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword.length > 0) {
      // debounce 타이머가 있다면 취소하고 즉시 검색
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      lastSearchKeywordRef.current = trimmedKeyword;
      onSearch(trimmedKeyword);
      Keyboard.dismiss();
    }
  };

  const handleKeywordChange = (text: string) => {
    setKeyword(text);
  };

  const renderItem = ({ item, index }: { item: Place; index: number }) => {
    const isRecentList = keyword.trim().length === 0;
    return (
      <ResultItem onPress={() => onSelectPlace(item)} activeOpacity={0.7}>
        <ResultMetaRow>
          <PlaceName>{item.place_name}</PlaceName>
          {isRecentList && index === 0 && (
            <RecentBadge>
              <RecentBadgeText>최근</RecentBadgeText>
            </RecentBadge>
          )}
        </ResultMetaRow>
        <PlaceAddress>
          {item.road_address_name || item.address_name}
        </PlaceAddress>
      </ResultItem>
    );
  };

  // 표시할 데이터 결정: 검색어가 있으면 검색 결과, 없으면 최근 선택한 장소
  const displayData = keyword.trim().length > 0 ? searchResults : recentPlaces;
  const isEmpty = displayData.length === 0;
  const sectionTitle =
    keyword.trim().length > 0 ? "검색 결과" : "최근 선택한 장소";
  const contentAnimationStyle = {
    opacity: appearAnim,
    transform: [
      {
        translateY: appearAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  };

  return (
    <Container>
      <ContentWrapper style={contentAnimationStyle}>
        <Header style={{ paddingTop: insets.top + 12 }}>
          <BackButton onPress={onClose} activeOpacity={0.7}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 19L8 12L15 5"
                stroke="#64748b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </BackButton>
          <SearchInputContainer>
            <Svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              style={{ marginRight: 8 }}
            >
              <Circle cx="11" cy="11" r="7" stroke="#94a3b8" strokeWidth="2" />
              <Path
                d="M20 20L17 17"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </Svg>
            <TextInput
              ref={inputRef}
              value={keyword}
              onChangeText={handleKeywordChange}
              onSubmitEditing={handleSearch}
              placeholder="목적지 검색"
              placeholderTextColor="#94a3b8"
              returnKeyType="search"
              autoFocus
              style={{
                flex: 1,
                color: "#1e293b",
                paddingTop: 0,
                paddingBottom: 0,
                fontFamily: theme.fonts.primary,
                fontSize: 16,
                height: "100%",
              }}
            />
            {keyword.length > 0 && (
              <IconButton onPress={() => setKeyword("")} activeOpacity={0.7}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" fill="#cbd5e1" />
                  <Path
                    d="M15 9L9 15M9 9L15 15"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </Svg>
              </IconButton>
            )}
          </SearchInputContainer>
        </Header>

        {isSearching && keyword.trim().length >= 3 ? (
          <EmptyState>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </EmptyState>
        ) : (
          <FlatList
            data={displayData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 120 }}
            ListHeaderComponent={<SectionLabel>{sectionTitle}</SectionLabel>}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState>
                <EmptyIcon>
                  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </EmptyIcon>
                <CustomText color="#64748b" style={{ marginBottom: 4 }}>
                  {keyword.trim().length > 0
                    ? "검색 결과가 없습니다."
                    : "최근 검색 기록이 없습니다."}
                </CustomText>
              </EmptyState>
            }
          />
        )}
      </ContentWrapper>
    </Container>
  );
};
