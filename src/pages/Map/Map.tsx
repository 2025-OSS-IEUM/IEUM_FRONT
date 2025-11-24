import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import styled from "styled-components/native";
import { ActivityIndicator, Platform } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import Svg, { Circle, Path } from "react-native-svg";
import { Container, CustomText } from "../../components";
import { MapBottomSheet } from "./MapBottomSheet";
import { MapSearch } from "./MapSearch";

const KAKAO_MAP_KEY = process.env.EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY;

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Place {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
}

const DEFAULT_CENTER: Coordinate = {
  latitude: 36.362238,
  longitude: 127.340214,
};

const MapWrapper = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
`;

const StyledWebView = styled(WebView)`
  flex: 1;
`;

const OverlayContainer = styled.View`
  position: absolute;
  width: 100%;
  padding-left: 20px;
  padding-right: 20px;
`;

const SearchCard = styled.TouchableOpacity`
  height: 52px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.95);
  flex-direction: row;
  align-items: center;
  padding-left: 16px;
  padding-right: 12px;
`;

const SearchText = styled(CustomText)`
  flex: 1;
  color: #a1a1a1;
`;

const FloatingButton = styled.TouchableOpacity`
  position: absolute;
  width: 54px;
  height: 54px;
  border-radius: 27px;
  background-color: rgba(255, 255, 255, 0.95);
  right: 20px;
  bottom: 440px;
  align-items: center;
  justify-content: center;
`;

const MissingKeyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-left: 24px;
  padding-right: 24px;
`;

const BottomSheetWrapper = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`;

const mapCardShadow = Platform.select({
  ios: {
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  android: {
    elevation: 6,
  },
  default: {},
});

const floatingShadow = Platform.select({
  ios: {
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  android: {
    elevation: 8,
  },
  default: {},
});

const generateKakaoMapTemplate = (apiKey: string) => `
  <!DOCTYPE html>
  <html lang="ko">
    <head>
      <meta charset="utf-8" />
      <meta
        name="viewport"
        content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
      <style>
        html, body, #map {
          margin: 0;
          padding: 0;
          height: 100%;
          background-color: #f5f7fa;
        }
      </style>
      <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = null;
        var currentMarker = null;
        var currentCircle = null;
        var destinationMarker = null;
        var polyline = null;
        var ps = null;

        function sendToRN(type, payload) {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload }));
          }
        }

        window.addEventListener("error", function (event) {
          sendToRN("KAKAO_ERROR", event.message || "Unknown script error");
        });

        kakao.maps.load(function () {
          try {
            var container = document.getElementById("map");
            var options = {
              center: new kakao.maps.LatLng(${DEFAULT_CENTER.latitude}, ${DEFAULT_CENTER.longitude}),
              level: 3
            };
            map = new kakao.maps.Map(container, options);
            
            // 장소 검색 객체 생성
            ps = new kakao.maps.services.Places();

            // 커스텀 마커 이미지 (IEUM 브랜드 컬러 적용)
            // 실제 ieum.svg 파일 내용을 Base64로 변환하여 넣으면 더 정확합니다.
            // 현재는 브랜드 컬러(#0076EF)를 적용한 커스텀 핀 아이콘을 사용합니다.
            var imageSrc = "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2264%22%20height%3D%2269%22%20viewBox%3D%220%200%2064%2069%22%3E%3Cpath%20fill%3D%22%230076EF%22%20d%3D%22M32%2069C32%2069%204%2044.5%204%2028C4%2012.536%2016.536%200%2032%200C47.464%200%2060%2012.536%2060%2028C60%2044.5%2032%2069%2032%2069Z%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2228%22%20r%3D%2218%22%20fill%3D%22white%22%2F%3E%3Ctext%20x%3D%2232%22%20y%3D%2233%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20text-anchor%3D%22middle%22%20fill%3D%22%230076EF%22%20font-weight%3D%22bold%22%3EIEUM%3C%2Ftext%3E%3C%2Fsvg%3E";
            var imageSize = new kakao.maps.Size(64, 69); 
            var imageOption = {offset: new kakao.maps.Point(32, 69)}; 
            var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
            
            currentMarker = new kakao.maps.Marker({
               position: options.center,
               image: markerImage
            });
            currentMarker.setMap(map);

            sendToRN("KAKAO_READY", { level: map.getLevel() });
          } catch (error) {
            sendToRN("KAKAO_ERROR", error && error.message ? error.message : "Unknown Kakao error");
          }
        });

        document.addEventListener("message", function (event) {
          handleMessage(event.data);
        });
        window.addEventListener("message", function (event) {
          handleMessage(event.data);
        });

        function handleMessage(raw) {
          try {
             var data = typeof raw === "string" ? JSON.parse(raw) : raw;
             
             if (data.type === "UPDATE_LOCATION") {
                var lat = data.payload.latitude;
                var lng = data.payload.longitude;
                var newPos = new kakao.maps.LatLng(lat, lng);

                if (map) {
                   if (data.payload.moveMap) {
                     map.panTo(newPos);
                   }

                   if (currentMarker) {
                      currentMarker.setPosition(newPos);
                   }
                   if (currentCircle) {
                      currentCircle.setMap(null);
                   }
                   currentCircle = new kakao.maps.Circle({
                      center: newPos,
                      radius: 30, 
                      strokeWeight: 1,
                      strokeColor: '#0076EF',
                      strokeOpacity: 0.1,
                      strokeStyle: 'solid',
                      fillColor: '#0076EF',
                      fillOpacity: 0.2
                   });
                   currentCircle.setMap(map);
                }
             } else if (data.type === "SEARCH_KEYWORD") {
                var keyword = data.payload;
                if (!ps) {
                  sendToRN("KAKAO_ERROR", "Places service not initialized");
                  return;
                }
                
                // 검색 시 옵션이 없으면 기본적으로 전체 지역 검색
                ps.keywordSearch(keyword, function(data, status, pagination) {
                   if (status === kakao.maps.services.Status.OK) {
                      var results = data.map(function(place) {
                        return {
                          id: place.id,
                          place_name: place.place_name,
                          address_name: place.address_name,
                          road_address_name: place.road_address_name,
                          x: place.x,
                          y: place.y,
                          phone: place.phone,
                          category_group_name: place.category_group_name
                        };
                      });
                      sendToRN("SEARCH_RESULT", results);
                   } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
                      sendToRN("SEARCH_RESULT", []);
                   } else {
                      // status가 null이거나 에러인 경우
                      sendToRN("KAKAO_ERROR", "Search failed with status: " + status + ", keyword: " + keyword);
                      sendToRN("SEARCH_RESULT", []);
                   }
                });
             } else if (data.type === "SET_DESTINATION") {
                var lat = data.payload.y;
                var lng = data.payload.x;
                var destPos = new kakao.maps.LatLng(lat, lng);
                
                if (map) {
                  if (destinationMarker) {
                    destinationMarker.setMap(null);
                  }
                  destinationMarker = new kakao.maps.Marker({
                    position: destPos
                  });
                  destinationMarker.setMap(map);

                  if (polyline) {
                    polyline.setMap(null);
                  }

                  if (currentMarker) {
                    var path = [currentMarker.getPosition(), destPos];
                    polyline = new kakao.maps.Polyline({
                      path: path,
                      strokeWeight: 5,
                      strokeColor: '#0076EF',
                      strokeOpacity: 0.7,
                      strokeStyle: 'solid'
                    });
                    polyline.setMap(map);
                    
                    // 지도 범위 재설정
                    var bounds = new kakao.maps.LatLngBounds();
                    bounds.extend(currentMarker.getPosition());
                    bounds.extend(destPos);
                    map.setBounds(bounds);
                  }
                }
             }
          } catch (e) {
            // ignore
          }
        }
      </script>
    </body>
  </html>
`;

export const Map = () => {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const [currentCoordinate, setCurrentCoordinate] =
    useState<Coordinate>(DEFAULT_CENTER);
  const [locationLabel, setLocationLabel] =
    useState("위치 정보 불러오는 중...");
  const [isLocating, setIsLocating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [destination, setDestination] = useState<Place | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const mapTemplate = useMemo(() => {
    if (!KAKAO_MAP_KEY) return "";
    return generateKakaoMapTemplate(KAKAO_MAP_KEY);
  }, []);

  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "KAKAO_READY") {
        requestLocation(true);
      }
      if (data.type === "KAKAO_ERROR") {
        console.log("[Map] Kakao Error:", data.payload);
      }
      if (data.type === "SEARCH_RESULT") {
        setSearchResults(data.payload);
        setIsSearching(false);
      }
    } catch (error) {
      // ignore
    }
  }, []);

  // Haversine Formula for distance calculation
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Math.round(d * 1000); // Return in meters
  };

  const handleSearch = (keyword: string) => {
    if (webViewRef.current) {
      setIsSearching(true);
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "SEARCH_KEYWORD",
          payload: keyword,
        })
      );
    }
  };

  const handleSelectPlace = (place: Place) => {
    setDestination(place);
    setIsSearchVisible(false);
    setIsPlaying(true);

    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "SET_DESTINATION",
          payload: place,
        })
      );
    }

    const dist = calculateDistance(
      currentCoordinate.latitude,
      currentCoordinate.longitude,
      parseFloat(place.y),
      parseFloat(place.x)
    );
    setDistance(dist);
  };

  const requestLocation = useCallback(async (moveMap = false) => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationLabel("위치 권한 필요");
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newCoord = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
      setCurrentCoordinate(newCoord);

      if (webViewRef.current) {
        webViewRef.current.postMessage(
          JSON.stringify({
            type: "UPDATE_LOCATION",
            payload: { ...newCoord, moveMap },
          })
        );
      }

      const [result] = await Location.reverseGeocodeAsync(newCoord);
      if (result) {
        const addressText = [result.region, result.city, result.street]
          .filter(Boolean)
          .join(" ");
        setLocationLabel(addressText || "현재 위치");
      }
    } catch (error) {
      setLocationLabel("위치 불러오기 실패");
    } finally {
      setIsLocating(false);
    }
  }, []);

  useEffect(() => {
    requestLocation(true);
  }, [requestLocation]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        requestLocation(false);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [requestLocation, isPlaying]);

  if (!KAKAO_MAP_KEY) {
    return (
      <Container>
        <MissingKeyContainer>
          <CustomText size={18} weight="bold" style={{ marginBottom: 8 }}>
            카카오맵 API Key가 필요합니다
          </CustomText>
          <CustomText size={14} color="#666666" style={{ textAlign: "center" }}>
            .env 파일 설정을 확인해주세요.
          </CustomText>
        </MissingKeyContainer>
      </Container>
    );
  }

  return (
    <Container>
      <MapWrapper>
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

        <OverlayContainer style={{ paddingTop: insets.top + 12 }}>
          <SearchCard
            activeOpacity={0.8}
            style={mapCardShadow || undefined}
            onPress={() => setIsSearchVisible(true)}
          >
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <Path
                d="M13.875 12.625L17.25 16"
                stroke="#5095FF"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <Circle cx="9" cy="9" r="5.5" stroke="#5095FF" strokeWidth="2" />
            </Svg>
            <SearchText size={16} style={{ marginLeft: 8 }}>
              {locationLabel}
            </SearchText>
          </SearchCard>
        </OverlayContainer>

        <FloatingButton
          activeOpacity={0.8}
          onPress={() => requestLocation(true)}
          style={floatingShadow || undefined}
        >
          {isLocating ? (
            <ActivityIndicator color="#5095FF" />
          ) : (
            <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <Path
                d="M14 4L14 24"
                stroke="#5095FF"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <Path
                d="M4 14H24"
                stroke="#5095FF"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <Circle cx="14" cy="14" r="4" stroke="#5095FF" strokeWidth="2" />
            </Svg>
          )}
        </FloatingButton>

        <BottomSheetWrapper>
          <MapBottomSheet
            destination={destination?.place_name || "목적지를 검색해 주세요"}
            instruction={
              distance
                ? `약 ${distance}m 이동하세요`
                : "목적지를 검색해 설정해주세요"
            }
            isPlaying={isPlaying}
            onClose={() => setIsPlaying(false)}
          />
        </BottomSheetWrapper>

        {isSearchVisible && (
          <MapSearch
            onClose={() => setIsSearchVisible(false)}
            onSearch={handleSearch}
            searchResults={searchResults}
            isSearching={isSearching}
            onSelectPlace={handleSelectPlace}
          />
        )}
      </MapWrapper>
    </Container>
  );
};
