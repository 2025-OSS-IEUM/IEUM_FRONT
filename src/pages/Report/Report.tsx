import React, { useState } from "react";
import {
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";
import Svg, { Path } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Container, CustomText } from "../../components";
import { InputField } from "../../components/Field";
import { DefaultButton } from "../../components/Button";
import { theme } from "../../styles/theme";

const ScrollContainer = styled.ScrollView`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
`;

const ContentContainer = styled.View`
  padding-left: ${(props) => props.theme.spacing.md}px;
  padding-right: ${(props) => props.theme.spacing.md}px;
  padding-top: ${(props) => props.theme.spacing.lg}px;
  padding-bottom: ${(props) => props.theme.spacing.xl}px;
`;

const Section = styled.View`
  margin-bottom: ${(props) => props.theme.spacing.md}px;
  background-color: ${(props) => props.theme.colors.white};
  border-radius: ${(props) => props.theme.borderRadius.lg}px;
  padding: ${(props) => props.theme.spacing.lg}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.05;
  shadow-radius: 8px;
  elevation: 2;
`;

const SectionWithoutBackground = styled.View`
  margin-bottom: ${(props) => props.theme.spacing.xl}px;
  padding: 0px;
`;

const SectionTitleContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${(props) => props.theme.spacing.md}px;
`;

const SectionTitle = styled(CustomText)`
  font-size: ${(props) => props.theme.fontSize.lg}px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text.primary};
  font-family: ${(props) => props.theme.fonts.bold};
  flex: 1;
`;

const LocationIconButton = styled.TouchableOpacity`
  width: 48px;
  height: 48px;
  justify-content: center;
  align-items: center;
`;

const MapContainer = styled.View`
  width: 100%;
  height: ${(props) => props.theme.sizes.mapHeight}px;
  border-radius: ${(props) => props.theme.borderRadius.lg}px;
  overflow: hidden;
  border: 1px solid ${(props) => props.theme.colors.border};
  margin-bottom: ${(props) => props.theme.spacing.md}px;
  background-color: ${(props) => props.theme.colors.lightGray};
  justify-content: center;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 1;
`;

const MapPlaceholder = styled.View`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  background-color: transparent;
`;

const MapPlaceholderText = styled(CustomText)`
  color: ${(props) => props.theme.colors.placeholder};
  font-size: ${(props) => props.theme.fontSize.md}px;
  margin-bottom: ${(props) => props.theme.spacing.xs}px;
  font-family: ${(props) => props.theme.fonts.medium};
`;

interface MapPlaceholderSubtextProps {
  withMarginTop?: boolean;
}

const MapPlaceholderSubtext = styled(CustomText)<MapPlaceholderSubtextProps>`
  color: ${(props) => props.theme.colors.placeholder};
  font-size: ${(props) => props.theme.fontSize.sm}px;
  margin-top: ${(props) => (props.withMarginTop ? props.theme.spacing.sm : 0)}px;
`;

const TextAreaContainer = styled.View`
  width: 100%;
  background-color: ${(props) => props.theme.colors.white};
  border-radius: ${(props) => props.theme.borderRadius.md}px;
`;

const ImageContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: ${(props) => props.theme.spacing.md}px;
  gap: ${(props) => props.theme.spacing.sm}px;
`;

const ImageWrapper = styled.View`
  position: relative;
  margin-right: ${(props) => props.theme.spacing.sm}px;
  margin-bottom: ${(props) => props.theme.spacing.sm}px;
`;

const UploadedImage = styled.Image`
  width: ${(props) => props.theme.sizes.imageThumbnail}px;
  height: ${(props) => props.theme.sizes.imageThumbnail}px;
  border-radius: ${(props) => props.theme.borderRadius.lg}px;
  border: 2px solid ${(props) => props.theme.colors.border};
`;

const RemoveImageButton = styled.TouchableOpacity`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background-color: ${(props) => props.theme.colors.error};
  justify-content: center;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.3;
  shadow-radius: 4px;
  elevation: 3;
  border: 2px solid ${(props) => props.theme.colors.white};
`;

const ImageButton = styled.TouchableOpacity`
  width: ${(props) => props.theme.sizes.imageThumbnail}px;
  height: ${(props) => props.theme.sizes.imageThumbnail}px;
  border: 2px dashed ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.borderRadius.lg}px;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.colors.lightGray};
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  margin-top: ${(props) => props.theme.spacing.md}px;
  gap: ${(props) => props.theme.spacing.sm}px;
`;

interface ActionButtonProps {
  marginRight?: boolean;
  variant?: "primary" | "secondary";
}

const ActionButton = styled.TouchableOpacity<ActionButtonProps>`
  flex: 1;
  padding: ${(props) => props.theme.spacing.md + 4}px ${(props) => props.theme.spacing.lg}px;
  background-color: ${(props) => 
    props.variant === "secondary" 
      ? props.theme.colors.white 
      : props.theme.colors.primary};
  border-radius: ${(props) => props.theme.borderRadius.lg}px;
  align-items: center;
  justify-content: center;
  margin-right: ${(props) => (props.marginRight ? props.theme.spacing.sm : 0)}px;
  border-width: ${(props) => (props.variant === "secondary" ? 1.5 : 0)}px;
  border-color: ${(props) => 
    props.variant === "secondary" 
      ? props.theme.colors.primary 
      : "transparent"};
  shadow-color: ${(props) => props.theme.colors.primary};
  shadow-offset: 0px ${(props) => (props.variant === "secondary" ? 2 : 4)}px;
  shadow-opacity: ${(props) => (props.variant === "secondary" ? 0.1 : 0.3)};
  shadow-radius: ${(props) => (props.variant === "secondary" ? 4 : 8)}px;
  elevation: ${(props) => (props.variant === "secondary" ? 2 : 4)};
`;

const ButtonText = styled(CustomText)<{ variant?: "primary" | "secondary" }>`
  color: ${(props) => 
    props.variant === "secondary" 
      ? props.theme.colors.primary 
      : props.theme.colors.white};
  font-size: ${(props) => props.theme.fontSize.md}px;
  font-weight: ${(props) => props.theme.fontWeight.bold};
  font-family: ${(props) => props.theme.fonts.bold};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-left: ${(props) => props.theme.spacing.md}px;
  padding-right: ${(props) => props.theme.spacing.md}px;
  padding-bottom: ${(props) => props.theme.spacing.lg}px;
  background-color: ${(props) => props.theme.colors.white};
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.colors.border};
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
  left: ${(props) => props.theme.spacing.md}px;
  padding: ${(props) => props.theme.spacing.xs}px;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  z-index: 1;
  border-radius: ${(props) => props.theme.borderRadius.md}px;
`;

const BackButtonText = styled.Text`
  font-size: ${(props) => props.theme.fontSize.xl + 4}px;
  color: ${(props) => props.theme.colors.text.primary};
  font-weight: ${(props) => props.theme.fontWeight.normal};
  font-family: ${(props) => props.theme.fonts.medium};
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
  font-size: ${(props) => props.theme.fontSize.lg + 2}px;
  font-weight: ${(props) => props.theme.fontWeight.bold};
  color: ${(props) => props.theme.colors.text.primary};
  text-align: center;
  font-family: ${(props) => props.theme.fonts.bold};
`;

const LocationInfoCard = styled.View`
  background-color: ${(props) => props.theme.colors.lightGray};
  border-radius: ${(props) => props.theme.borderRadius.md}px;
  padding: ${(props) => props.theme.spacing.md}px;
  margin-top: ${(props) => props.theme.spacing.sm}px;
  border-left-width: 3px;
  border-left-color: ${(props) => props.theme.colors.primary};
`;

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface ReportProps {
  onNavigateToHome?: () => void;
  onReportSubmit?: (data: {
    location: LocationData;
    dangerType: string;
    description: string;
    images: string[];
  }) => void;
}

export const Report = ({ onNavigateToHome, onReportSubmit }: ReportProps) => {
  const insets = useSafeAreaInsets();
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [dangerType, setDangerType] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // TODO: 나중에 카카오맵 네이티브 SDK로 교체 예정
  const handleMapPress = (event: any) => {
    // 지도 클릭 시 위치 선택 (SDK 연동 시 구현)
    // const { latitude, longitude } = event.nativeEvent.coordinate;
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("권한 필요", "위치 권한이 필요합니다.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // 역지오코딩으로 주소 가져오기
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const addressString = address
        ? `${address.region} ${address.street || ""} ${address.name || ""}`.trim()
        : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      setSelectedLocation({
        latitude,
        longitude,
        address: addressString,
      });

      // TODO: 카카오맵 SDK로 지도 중심 이동 및 마커 표시
      // SDK 연동 시 지도 중심을 현재 위치로 이동하고 마커를 표시
    } catch (error) {
      Alert.alert("오류", "위치를 가져오는 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const handleImagePicker = async (useCamera: boolean) => {
    try {
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== "granted") {
        Alert.alert("권한 필요", "카메라/갤러리 권한이 필요합니다.");
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert("오류", "이미지를 선택하는 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      "사진 추가",
      "사진을 추가하는 방법을 선택해주세요.",
      [
        {
          text: "사진 촬영",
          onPress: () => handleImagePicker(true),
        },
        {
          text: "사진보관함 선택",
          onPress: () => handleImagePicker(false),
        },
        {
          text: "파일 업로드",
          onPress: () => handleImagePicker(false), // 파일 업로드도 갤러리와 동일하게 처리
        },
        {
          text: "취소",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedLocation) {
      Alert.alert("알림", "위치를 선택해주세요.");
      return;
    }
    if (!dangerType.trim()) {
      Alert.alert("알림", "위험 유형을 입력해주세요.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("알림", "상세 설명을 입력해주세요.");
      return;
    }
    if (images.length === 0) {
      Alert.alert("알림", "사진을 업로드해주세요.");
      return;
    }

    // TODO: 백엔드 API 호출
    const reportData = {
      location: selectedLocation,
      dangerType,
      description,
      images,
    };

    console.log("제보 데이터:", reportData);
    
    // 제보 완료 페이지로 이동
    onReportSubmit?.(reportData);
  };

  return (
    <Container>
      <Header style={{ paddingTop: insets.top + theme.spacing.md }}>
        <BackButton onPress={onNavigateToHome} style={{ top: insets.top + theme.spacing.sm }}>
          <BackButtonText>←</BackButtonText>
        </BackButton>
        <HeaderTitleContainer>
          <HeaderTitle>제보하기</HeaderTitle>
        </HeaderTitleContainer>
      </Header>
      <ScrollContainer>
        <ContentContainer>
          <Section>
            <SectionTitleContainer>
              <SectionTitle>위치 선택</SectionTitle>
              <LocationIconButton onPress={getCurrentLocation} activeOpacity={0.7}>
                <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M17 3.33989C18.5202 4.21758 19.7826 5.47997 20.6603 7.00017C21.538 8.52038 22 10.2448 22 12.0002C22 13.7556 21.5379 15.48 20.6602 17.0002C19.7825 18.5204 18.5201 19.7828 16.9999 20.6605C15.4797 21.5381 13.7552 22.0002 11.9998 22.0001C10.2445 22.0001 8.52002 21.538 6.99984 20.6603C5.47965 19.7826 4.21729 18.5202 3.33963 17C2.46198 15.4797 1.99996 13.7553 2 11.9999L2.005 11.6759C2.061 9.94888 2.56355 8.26585 3.46364 6.79089C4.36373 5.31592 5.63065 4.09934 7.14089 3.25977C8.65113 2.42021 10.3531 1.98629 12.081 2.00033C13.8089 2.01437 15.5036 2.47589 17 3.33989ZM16.914 8.40589C17.286 7.56889 16.431 6.71389 15.594 7.08589L6.594 11.0859L6.486 11.1409C5.736 11.5809 5.875 12.7499 6.757 12.9709L10.175 13.8239L11.03 17.2429C11.26 18.1649 12.528 18.2749 12.914 17.4059L16.914 8.40589Z"
                    fill="#68D0C6"
                  />
                </Svg>
              </LocationIconButton>
            </SectionTitleContainer>
            <MapContainer>
              <TouchableOpacity 
                style={{ width: '100%', height: '100%' }}
                onPress={handleMapPress}
                activeOpacity={0.9}
              >
                <MapPlaceholder>
                  <MapPlaceholderText>지도 영역</MapPlaceholderText>
                  <MapPlaceholderSubtext withMarginTop>
                    지도를 터치하여 위치를 선택하세요
                  </MapPlaceholderSubtext>
                </MapPlaceholder>
              </TouchableOpacity>
            </MapContainer>
          </Section>

          <Section>
            <SectionTitle>선택한 위치</SectionTitle>
            <LocationInfoCard>
              {selectedLocation ? (
                <>
                  <InputField
                    value={selectedLocation.address}
                    editable={false}
                    containerStyle={{ marginBottom: theme.spacing.sm }}
                  />
                  <InputField
                    value={`위도: ${selectedLocation.latitude.toFixed(6)}, 경도: ${selectedLocation.longitude.toFixed(6)}`}
                    editable={false}
                    containerStyle={{ opacity: 0.7 }}
                  />
                </>
              ) : (
                <CustomText color={theme.colors.placeholder} size={theme.fontSize.md}>
                  위치를 선택해주세요
                </CustomText>
              )}
            </LocationInfoCard>
          </Section>

          <Section>
            <SectionTitle>위험 유형</SectionTitle>
            <InputField
              placeholder="예: 보도블록 파손, 점자블록 파손, 공사 등"
              value={dangerType}
              onChangeText={setDangerType}
              containerStyle={{ width: '100%' }}
            />
          </Section>

          <Section>
            <SectionTitle>상세 설명</SectionTitle>
            <TextAreaContainer>
              <InputField
                placeholder="위험 요소에 대한 상세한 설명을 입력해주세요."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                containerStyle={{ width: '100%'}}
              />
            </TextAreaContainer>
          </Section>

          <Section>
            <SectionTitle>사진 업로드</SectionTitle>
            <ImageContainer>
              {images.map((uri, index) => (
                <ImageWrapper key={index}>
                  <UploadedImage source={{ uri }} />
                  <RemoveImageButton onPress={() => removeImage(index)} activeOpacity={0.8}>
                    <CustomText color={theme.colors.white} size={16} weight="bold">
                      ×
                    </CustomText>
                  </RemoveImageButton>
                </ImageWrapper>
              ))}
              {images.length < 5 && (
                <ImageButton onPress={showImagePickerOptions} activeOpacity={0.7}>
                  <CustomText color={theme.colors.primary} size={theme.fontSize.xl * 1.5} weight="bold">
                    +
                  </CustomText>
                </ImageButton>
              )}
            </ImageContainer>
          </Section>

          <SectionWithoutBackground>
            <DefaultButton onPress={handleSubmit} fullWidth>
              제보하기
            </DefaultButton>
          </SectionWithoutBackground>
        </ContentContainer>
      </ScrollContainer>
    </Container>
  );
};

