import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { ScrollView, View, TextInput, TouchableOpacity, Image, Alert, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";
import Svg, { Path } from "react-native-svg";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Container, CustomText } from "../../components";
import { InputField } from "../../components/Field";
import { DefaultButton } from "../../components/Button";
import { theme } from "../../styles/theme";
import { reportsService } from "../../api/reports";
import { ReportType, ReportCreate } from "../../types/api";

const KAKAO_JAVASCRIPT_KEY = process.env.EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY;

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

const Section = styled.View`
  margin-bottom: ${props => props.theme.spacing.md}px;
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg}px;
  padding: ${props => props.theme.spacing.lg}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.05;
  shadow-radius: 8px;
  elevation: 2;
`;

const SectionWithoutBackground = styled.View`
  margin-bottom: ${props => props.theme.spacing.xl}px;
  padding: 0px;
`;

const SectionTitleContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const SectionTitle = styled(CustomText)`
  font-size: ${props => props.theme.fontSize.lg}px;
  font-weight: bold;
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.fonts.bold};
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
  height: ${props => props.theme.sizes.mapHeight}px;
  border-radius: ${props => props.theme.borderRadius.lg}px;
  overflow: hidden;
  border: 1px solid ${props => props.theme.colors.border};
  margin-bottom: ${props => props.theme.spacing.md}px;
  background-color: ${props => props.theme.colors.lightGray};
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 1;
`;

const StyledWebView = styled(WebView)`
  width: 100%;
  height: 100%;
  background-color: transparent;
`;

const TextAreaContainer = styled.View`
  width: 100%;
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.md}px;
`;

const ImageContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: ${props => props.theme.spacing.md}px;
  gap: ${props => props.theme.spacing.sm}px;
`;

const ImageWrapper = styled.View`
  position: relative;
  margin-right: ${props => props.theme.spacing.sm}px;
  margin-bottom: ${props => props.theme.spacing.sm}px;
`;

const UploadedImage = styled.Image`
  width: ${props => props.theme.sizes.imageThumbnail}px;
  height: ${props => props.theme.sizes.imageThumbnail}px;
  border-radius: ${props => props.theme.borderRadius.lg}px;
  border: 2px solid ${props => props.theme.colors.border};
`;

const RemoveImageButton = styled.TouchableOpacity`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background-color: ${props => props.theme.colors.error};
  justify-content: center;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.3;
  shadow-radius: 4px;
  elevation: 3;
  border: 2px solid ${props => props.theme.colors.white};
`;

const ImageButton = styled.TouchableOpacity`
  width: ${props => props.theme.sizes.imageThumbnail}px;
  height: ${props => props.theme.sizes.imageThumbnail}px;
  border: 2px dashed ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.lg}px;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme.colors.lightGray};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-left: ${props => props.theme.spacing.md}px;
  padding-right: ${props => props.theme.spacing.md}px;
  padding-bottom: ${props => props.theme.spacing.lg}px;
  background-color: ${props => props.theme.colors.white};
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

const LocationInfoCard = styled.View`
  background-color: ${props => props.theme.colors.lightGray};
  border-radius: ${props => props.theme.borderRadius.md}px;
  padding: ${props => props.theme.spacing.md}px;
  margin-top: ${props => props.theme.spacing.sm}px;
  border-left-width: 3px;
  border-left-color: ${props => props.theme.colors.primary};
`;

const TypeButton = styled.TouchableOpacity<{ selected: boolean }>`
  padding: 12px;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${props => (props.selected ? props.theme.colors.primary : props.theme.colors.border)};
  background-color: ${props => (props.selected ? props.theme.colors.primary + "20" : "transparent")};
  margin-bottom: 8px;
`;

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface ReportProps {
  onNavigateToHome?: () => void;
  onReportSubmit?: (data: any) => void;
}

const DEFAULT_CENTER = {
  latitude: 36.362238,
  longitude: 127.340214,
};

const generateKakaoTemplate = (appKey: string) => `
  <!DOCTYPE html>
  <html lang="ko">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        html, body, #map {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          background-color: #f5f7fa;
        }
      </style>
      <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services,clusterer"></script>
      <script>
        function sendToRN(type, payload) {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload }));
          }
        }

        window.onerror = function(message) {
          sendToRN("WEBVIEW_LOG", { level: "error", message: message });
        };
      </script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = null;
        var currentMarker = null;
        var selectedMarker = null;

        function initializeMap() {
          try {
            var container = document.getElementById('map');
            var options = {
              center: new kakao.maps.LatLng(${DEFAULT_CENTER.latitude}, ${DEFAULT_CENTER.longitude}),
              level: 3
            };

            map = new kakao.maps.Map(container, options);
            
            // 지도 클릭 이벤트
            kakao.maps.event.addListener(map, 'click', function(mouseEvent) {        
              var latlng = mouseEvent.latLng;
              
              if (selectedMarker) {
                selectedMarker.setPosition(latlng);
              } else {
                var imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"; 
                var imageSize = new kakao.maps.Size(24, 35); 
                var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize); 
                
                selectedMarker = new kakao.maps.Marker({
                  position: latlng,
                  map: map,
                  image: markerImage 
                });
              }
              
              sendToRN("MAP_CLICK", { 
                latitude: latlng.getLat(), 
                longitude: latlng.getLng() 
              });
            });

            sendToRN("KAKAO_READY", { level: map.getLevel() });
          } catch (e) {
            sendToRN("KAKAO_ERROR", e.message);
          }
        }

        kakao.maps.load(function() {
          initializeMap();
        });

        document.addEventListener("message", function (event) {
          handleMessage(event.data);
        });
        window.addEventListener("message", function (event) {
          handleMessage(event.data);
        });

        function handleMessage(raw) {
          if (!map) return;

          try {
            var data = typeof raw === "string" ? JSON.parse(raw) : raw;

            if (data.type === "UPDATE_LOCATION") {
              var lat = data.payload.latitude;
              var lng = data.payload.longitude;
              var moveLatLon = new kakao.maps.LatLng(lat, lng);
              
              if (currentMarker) {
                currentMarker.setPosition(moveLatLon);
              } else {
                // 현재 위치 마커
                var imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png"; 
                var imageSize = new kakao.maps.Size(64, 69); 
                var imageOption = {offset: new kakao.maps.Point(27, 69)}; 
                var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

                currentMarker = new kakao.maps.Marker({
                  position: moveLatLon,
                  map: map,
                  image: markerImage
                });
              }
              
              if (data.payload.moveMap) {
                map.setCenter(moveLatLon);
              }
            } 
          } catch (e) {
            sendToRN("WEBVIEW_LOG", { level: "error", message: "Msg Error: " + e.message });
          }
        }
      </script>
    </body>
  </html>
`;

export const Report = ({ onNavigateToHome, onReportSubmit }: ReportProps) => {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [dangerType, setDangerType] = useState<ReportType>("sidewalk_damage");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const mapTemplate = useMemo(() => {
    if (!KAKAO_JAVASCRIPT_KEY) return "";
    return generateKakaoTemplate(KAKAO_JAVASCRIPT_KEY);
  }, []);

  // handleLocationSelect를 ref로 관리하여 무한 루프 방지
  const handleLocationSelectRef = useRef<((latitude: number, longitude: number) => Promise<void>) | null>(null);

  // handleLocationSelect 함수를 useCallback으로 안정화
  const handleLocationSelect = useCallback(async (latitude: number, longitude: number) => {
    try {
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
    } catch (error) {
      console.error("역지오코딩 실패:", error);
      // 역지오코딩 실패해도 좌표는 저장
      setSelectedLocation({
        latitude,
        longitude,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });
    }
  }, []);

  useEffect(() => {
    handleLocationSelectRef.current = handleLocationSelect;
  }, [handleLocationSelect]);

  // handleWebViewMessage
  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "KAKAO_READY") {
        // 지도 준비 완료
      }
      if (data.type === "MAP_CLICK") {
        const { latitude, longitude } = data.payload;
        if (handleLocationSelectRef.current) {
          handleLocationSelectRef.current(latitude, longitude);
        }
      }
      if (data.type === "KAKAO_ERROR") {
        if (__DEV__) {
          console.log("[Report] Kakao Map Error:", data.payload);
        }
      }
      if (data.type === "WEBVIEW_LOG") {
        console.log(`🌐 [Report WebView] ${data.payload.message}`);
      }
    } catch (error) {
      // ignore
    }
  }, []);

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

      // 카카오맵에 현재 위치 표시
      if (webViewRef.current) {
        webViewRef.current.postMessage(
          JSON.stringify({
            type: "UPDATE_LOCATION",
            payload: { latitude, longitude, moveMap: true },
          })
        );
      }
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
          onPress: () => handleImagePicker(false),
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
      console.warn("⚠️ [Report.handleSubmit] 위치를 선택해주세요.");
      Alert.alert("알림", "위치를 선택해주세요.");
      return;
    }
    if (!description.trim()) {
      console.warn("⚠️ [Report.handleSubmit] 상세 설명을 입력해주세요.");
      Alert.alert("알림", "상세 설명을 입력해주세요.");
      return;
    }
    if (images.length === 0) {
      console.warn("⚠️ [Report.handleSubmit] 사진을 업로드해주세요.");
      Alert.alert("알림", "사진을 최소 1장 업로드해주세요.");
      return;
    }

    try {
      setIsLoading(true);

      const reportData: ReportCreate = {
        type: dangerType,
        description,
        location: {
          type: "Point",
          coordinates: [selectedLocation.longitude, selectedLocation.latitude] as [number, number],
        },
        photoUrls: images,
        severity: "medium",
        status: "pending_review",
      };

      console.log("[Report.handleSubmit] 제보 데이터 준비 완료:", reportData);
      console.log(`[Report.handleSubmit] 제보 위치: ${selectedLocation.latitude}, ${selectedLocation.longitude}`);

      const response = await reportsService.createReport(reportData);

      console.log("[Report.handleSubmit] 제보가 성공적으로 등록되었습니다!");

      if (selectedLocation) {
        onReportSubmit?.({
          location: {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            address: selectedLocation.address,
          },
          dangerType: dangerType,
          description: description,
          images: images,
        });
      }
    } catch (error: any) {
      console.error("[Report.handleSubmit] 제보 실패:", error);

      let errorMessage = "제보 중 오류가 발생했습니다.";

      if (error?.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map((d: any) => d?.msg || String(d))
            .filter(Boolean)
            .join("\n");
        } else {
          try {
            errorMessage =
              typeof error.response.data.detail === "string"
                ? error.response.data.detail
                : JSON.stringify(error.response.data.detail);
          } catch {
            errorMessage = String(error.response.data.detail);
          }
        }
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert("제보 실패", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const reportTypes: { label: string; value: ReportType }[] = [
    { label: "보도블록 파손", value: "sidewalk_damage" },
    { label: "공사 중", value: "construction" },
    { label: "횡단보도 없음", value: "missing_crosswalk" },
    { label: "점자블록 없음", value: "no_tactile" },
    { label: "기타", value: "etc" },
  ];

  return (
    <Container>
      <Header style={{ paddingTop: insets.top + theme.spacing.md }}>
        <BackButton
          onPress={onNavigateToHome}
          style={{ top: insets.top + theme.spacing.sm }}
        >
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
              <LocationIconButton
                onPress={getCurrentLocation}
                activeOpacity={0.7}
              >
                <Svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <Path
                    d="M17 3.33989C18.5202 4.21758 19.7826 5.47997 20.6603 7.00017C21.538 8.52038 22 10.2448 22 12.0002C22 13.7556 21.5379 15.48 20.6602 17.0002C19.7825 18.5204 18.5201 19.7828 16.9999 20.6605C15.4797 21.5381 13.7552 22.0002 11.9998 22.0001C10.2445 22.0001 8.52002 21.538 6.99984 20.6603C5.47965 19.7826 4.21729 18.5202 3.33963 17C2.46198 15.4797 1.99996 13.7553 2 11.9999L2.005 11.6759C2.061 9.94888 2.56355 8.26585 3.46364 6.79089C4.36373 5.31592 5.63065 4.09934 7.14089 3.25977C8.65113 2.42021 10.3531 1.98629 12.081 2.00033C13.8089 2.01437 15.5036 2.47589 17 3.33989ZM16.914 8.40589C17.286 7.56889 16.431 6.71389 15.594 7.08589L6.594 11.0859L6.486 11.1409C5.736 11.5809 5.875 12.7499 6.757 12.9709L10.175 13.8239L11.03 17.2429C11.26 18.1649 12.528 18.2749 12.914 17.4059L16.914 8.40589Z"
                    fill="#68D0C6"
                  />
                </Svg>
              </LocationIconButton>
            </SectionTitleContainer>
            <MapContainer>
              {KAKAO_JAVASCRIPT_KEY ? (
                <StyledWebView
                  ref={webViewRef}
                  originWhitelist={["*"]}
                  source={{ html: mapTemplate, baseUrl: "http://localhost" }}
                  javaScriptEnabled
                  domStorageEnabled
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  onMessage={handleWebViewMessage}
                />
              ) : (
                <View style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                  <CustomText
                    color={theme.colors.placeholder}
                    size={theme.fontSize.md}
                  >
                    Kakao Map API Key가 필요합니다
                  </CustomText>
                </View>
              )}
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
                    value={`위도: ${selectedLocation.latitude.toFixed(6)}, 경도: ${selectedLocation.longitude.toFixed(
                      6
                    )}`}
                    editable={false}
                    containerStyle={{ opacity: 0.7 }}
                  />
                </>
              ) : (
                <CustomText
                  color={theme.colors.placeholder}
                  size={theme.fontSize.md}
                >
                  위치를 선택해주세요
                </CustomText>
              )}
            </LocationInfoCard>
          </Section>

          <Section>
            <SectionTitle>위험 유형</SectionTitle>
            <View style={{ marginTop: 12 }}>
              {reportTypes.map(type => (
                <TypeButton
                  key={type.value}
                  selected={dangerType === type.value}
                  onPress={() => setDangerType(type.value)}
                >
                  <CustomText
                    color={dangerType === type.value ? theme.colors.primary : theme.colors.text.primary}
                    weight={dangerType === type.value ? "bold" : "normal"}
                  >
                    {type.label}
                  </CustomText>
                </TypeButton>
              ))}
            </View>
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
                containerStyle={{ width: "100%" }}
              />
            </TextAreaContainer>
          </Section>

          <Section>
            <SectionTitle>사진 업로드</SectionTitle>
            <ImageContainer>
              {images.map((uri, index) => (
                <ImageWrapper key={index}>
                  <UploadedImage source={{ uri }} />
                  <RemoveImageButton
                    onPress={() => removeImage(index)}
                    activeOpacity={0.8}
                  >
                    <CustomText
                      color={theme.colors.white}
                      size={16}
                      weight="bold"
                    >
                      ×
                    </CustomText>
                  </RemoveImageButton>
                </ImageWrapper>
              ))}
              {images.length < 5 && (
                <ImageButton
                  onPress={showImagePickerOptions}
                  activeOpacity={0.7}
                >
                  <CustomText
                    color={theme.colors.primary}
                    size={theme.fontSize.xl * 1.5}
                    weight="bold"
                  >
                    +
                  </CustomText>
                </ImageButton>
              )}
            </ImageContainer>
          </Section>

          <SectionWithoutBackground>
            <DefaultButton
              onPress={handleSubmit}
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              제보하기
            </DefaultButton>
          </SectionWithoutBackground>
        </ContentContainer>
      </ScrollContainer>
    </Container>
  );
};
