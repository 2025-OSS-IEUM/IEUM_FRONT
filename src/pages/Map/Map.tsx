import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import styled from "styled-components/native";
import { ActivityIndicator, Animated, Easing, Platform } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Path } from "react-native-svg";
import { Container, CustomText } from "../../components";
import { routesService } from "../../api/routes";
import { MapBottomSheet } from "./MapBottomSheet";
import { MapSearch } from "./MapSearch";
import { PlaceDetailSheet } from "./PlaceDetailSheet";
import { useScreenReader } from "../../tts";

const KAKAO_MAP_KEY = process.env.EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY;
const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;

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
  background-color: ${props => props.theme.colors.background};
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

const SearchCardWrapper = styled(Animated.View)`
  border-radius: 24px;
  overflow: hidden;
`;

const SearchTouchable = styled.TouchableOpacity`
  border-radius: 24px;
  overflow: hidden;
`;

const GlassSearchCard = styled(BlurView)`
  height: 60px;
  padding-left: 18px;
  padding-right: 18px;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 24px;
`;

const SearchText = styled(CustomText)`
  flex: 1;
  color: ${props => props.theme.colors.text.secondary};
  font-family: ${props => props.theme.fonts.medium};
  font-size: 16px;
`;

const QuickInfoWrapper = styled(Animated.View)`
  margin-top: 12px;
  ${Platform.select({
    ios: `
      shadow-color: #000;
      shadow-offset: 0px 4px;
      shadow-opacity: 0.1;
      shadow-radius: 12px;
    `,
    android: `elevation: 5;`,
  })}
`;

const QuickInfoCard = styled(LinearGradient)`
  border-radius: 24px;
  padding: 20px 24px;
  gap: 10px;
  border: 1px solid rgba(255, 255, 255, 0.6);
`;

const QuickInfoHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const QuickInfoTitle = styled(CustomText)`
  font-size: 16px;
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.fonts.semiBold};
`;

const QuickInfoBadge = styled.View`
  padding-top: 6px;
  padding-bottom: 6px;
  padding-left: 12px;
  padding-right: 12px;
  border-radius: 999px;
  background-color: rgba(104, 208, 198, 0.15);
`;

const QuickInfoBadgeText = styled(CustomText)`
  font-size: 12px;
  color: ${props => props.theme.colors.primary};
  font-family: ${props => props.theme.fonts.bold};
`;

const QuickInfoSubtitle = styled(CustomText)`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  font-family: ${props => props.theme.fonts.primary};
`;

const QuickInfoDistance = styled(CustomText)`
  font-size: 28px;
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.fonts.bold};
  margin-bottom: 4px;
`;

const FloatingActionGroup = styled(Animated.View)`
  position: absolute;
  right: 20px;
  bottom: 20px;
  align-items: flex-end;
`;

const FloatingButtonBase = styled(Animated.View)`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  padding: 4px;
  background-color: rgba(255, 255, 255, 0.95);
  overflow: hidden;
`;

const FloatingButtonTouchable = styled.TouchableOpacity`
  flex: 1;
`;

const FloatingGradient = styled(LinearGradient)`
  flex: 1;
  border-radius: 28px;
  align-items: center;
  justify-content: center;
`;

const FloatingButtonLabel = styled(CustomText)`
  margin-top: 6px;
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  font-family: ${props => props.theme.fonts.medium};
  text-align: center;
`;

const PulseRing = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 32px;
  background-color: rgba(104, 208, 198, 0.2);
`;

const SecondaryFloatingWrapper = styled.View`
  align-items: center;
  gap: 6px;
`;

const MissingKeyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-left: 24px;
  padding-right: 24px;
`;

const MapOverlay = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.3);
`;

const BottomSheetWrapper = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
`;

const mapCardShadow = Platform.select({
  ios: {
    shadowColor: "rgba(0, 0, 0, 0.08)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  android: {
    elevation: 6,
  },
  default: {},
});

const floatingShadow = Platform.select({
  ios: {
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  android: {
    elevation: 8,
  },
  default: {},
});

const locationButtonShadow = Platform.select({
  ios: {
    shadowColor: "rgba(104, 208, 198, 0.25)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  android: {
    elevation: 16,
  },
  default: {},
});

interface Guide {
  x: number;
  y: number;
  distance: number;
  type: number;
  guidance: string;
  road_index: number;
}

interface RouteData {
  path: Coordinate[];
  guides: Guide[];
}

// ... existing code ...

const ROUTE_DEVIATION_THRESHOLD = 30;
const TURN_ANGLE_THRESHOLD = 15; // 최소 회전 각도 (도)
const MIN_TURN_DISTANCE = 20; // 최소 회전 간격 (미터)

const getInstructionFromGuide = (guide: Guide, distance: number) => {
  const roundedDist = Math.round(distance / 10) * 10;
  if (roundedDist < 10) return "잠시 후 " + guide.guidance;
  return `${roundedDist}m 앞 ${guide.guidance}`;
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 1000);
};

/**
 * 두 좌표 간의 방향(bearing)을 계산합니다 (0-360도)
 */
const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;
  return bearing;
};

/**
 * 방향 변화를 분석해서 회전 유형을 판단합니다
 */
const detectTurnType = (prevBearing: number, nextBearing: number): { type: number; guidance: string } => {
  let angleDiff = nextBearing - prevBearing;

  // 각도 차이를 -180 ~ 180 범위로 정규화
  if (angleDiff > 180) {
    angleDiff -= 360;
  } else if (angleDiff < -180) {
    angleDiff += 360;
  }

  const absAngle = Math.abs(angleDiff);

  // 직진 (각도 변화가 작음)
  if (absAngle < TURN_ANGLE_THRESHOLD) {
    return { type: 1, guidance: "직진" };
  }

  // 좌회전
  if (angleDiff > 0) {
    if (absAngle < 45) {
      return { type: 6, guidance: "약간 좌회전" };
    } else if (absAngle < 135) {
      return { type: 7, guidance: "좌회전" };
    } else {
      return { type: 8, guidance: "왼쪽으로 유턴" };
    }
  }
  // 우회전
  else {
    if (absAngle < 45) {
      return { type: 3, guidance: "약간 우회전" };
    } else if (absAngle < 135) {
      return { type: 4, guidance: "우회전" };
    } else {
      return { type: 5, guidance: "오른쪽으로 유턴" };
    }
  }
};

/**
 * 경로 좌표 배열을 분석해서 방향 전환점(Guide)을 생성합니다
 */
const generateGuidesFromPath = (path: Coordinate[]): Guide[] => {
  if (path.length < 3) {
    return [];
  }

  const guides: Guide[] = [];
  let accumulatedDistance = 0;

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const current = path[i];
    const next = path[i + 1];

    // 이전 구간의 방향
    const prevBearing = calculateBearing(prev.latitude, prev.longitude, current.latitude, current.longitude);
    // 다음 구간의 방향
    const nextBearing = calculateBearing(current.latitude, current.longitude, next.latitude, next.longitude);

    // 방향 변화 계산
    let angleDiff = nextBearing - prevBearing;
    if (angleDiff > 180) {
      angleDiff -= 360;
    } else if (angleDiff < -180) {
      angleDiff += 360;
    }

    const absAngle = Math.abs(angleDiff);

    // 회전이 감지되면 가이드 생성
    if (absAngle >= TURN_ANGLE_THRESHOLD) {
      const segmentDistance = calculateDistance(prev.latitude, prev.longitude, current.latitude, current.longitude);

      // 최소 거리 이상 떨어진 경우만 가이드 추가
      if (segmentDistance >= MIN_TURN_DISTANCE || guides.length === 0) {
        const turnInfo = detectTurnType(prevBearing, nextBearing);
        guides.push({
          x: current.longitude,
          y: current.latitude,
          distance: accumulatedDistance + segmentDistance,
          type: turnInfo.type,
          guidance: turnInfo.guidance,
          road_index: i,
        });
        accumulatedDistance = 0;
      } else {
        accumulatedDistance += segmentDistance;
      }
    } else {
      accumulatedDistance += calculateDistance(prev.latitude, prev.longitude, current.latitude, current.longitude);
    }
  }

  return guides;
};

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
        var isNavigating = false;
        var currentHeading = null;
        var defaultMarkerImage = null;

        function getDefaultMarkerImage() {
          if (defaultMarkerImage) {
            return defaultMarkerImage;
          }
          var imageSrc = "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2264%22%20height%3D%2269%22%20viewBox%3D%220%200%2064%2069%22%3E%3Cpath%20fill%3D%22%230076EF%22%20d%3D%22M32%2069C32%2069%204%2044.5%204%2028C4%2012.536%2016.536%200%2032%200C47.464%200%2060%2012.536%2060%2028C60%2044.5%2032%2069%2032%2069Z%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2228%22%20r%3D%2218%22%20fill%3D%22white%22%2F%3E%3Ctext%20x%3D%2232%22%20y%3D%2233%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20text-anchor%3D%22middle%22%20fill%3D%22%230076EF%22%20font-weight%3D%22bold%22%3EIEUM%3C%2Ftext%3E%3C%2Fsvg%3E";
          var imageSize = new kakao.maps.Size(64, 69); 
          var imageOption = {offset: new kakao.maps.Point(32, 69)}; 
          defaultMarkerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
          return defaultMarkerImage;
        }

        function createHeadingMarkerImage(angle) {
          var normalized = ((angle % 360) + 360) % 360;
          var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" fill="white" stroke="#0076EF" stroke-width="4"/><g transform="rotate(' + normalized + ' 30 30)"><path d="M30 8L39 32L30 27L21 32L30 8Z" fill="#0076EF"/></g></svg>';
          var encoded = encodeURIComponent(svg);
          var imageSrc = "data:image/svg+xml;charset=utf-8," + encoded;
          var imageSize = new kakao.maps.Size(60, 60);
          var imageOption = { offset: new kakao.maps.Point(30, 30) };
          return new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
        }

        function updateMarkerImage() {
          if (!currentMarker) {
            return;
          }
          if (isNavigating && typeof currentHeading === "number") {
            currentMarker.setImage(createHeadingMarkerImage(currentHeading));
          } else {
            currentMarker.setImage(getDefaultMarkerImage());
          }
        }

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
            currentMarker = new kakao.maps.Marker({
               position: options.center,
               image: getDefaultMarkerImage()
            });
            currentMarker.setMap(map);
            updateMarkerImage();

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
                      updateMarkerImage();
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
                  sendToRN("SEARCH_RESULT", []);
                  return;
                }
                
                if (!keyword || typeof keyword !== "string" || keyword.trim().length === 0) {
                  sendToRN("SEARCH_RESULT", []);
                  return;
                }
                
                try {
                  // 검색 시 옵션이 없으면 기본적으로 전체 지역 검색
                  ps.keywordSearch(keyword, function(resultData, status, pagination) {
                     try {
                       var safeData = Array.isArray(resultData) ? resultData : [];
                       var mappedResults = safeData.map(function(place) {
                          return {
                            id: place && place.id ? place.id : "",
                            place_name: place && place.place_name ? place.place_name : "",
                            address_name: place && place.address_name ? place.address_name : "",
                            road_address_name: place && place.road_address_name ? place.road_address_name : "",
                            x: place && place.x ? place.x : "",
                            y: place && place.y ? place.y : "",
                            phone: place && place.phone ? place.phone : "",
                            category_group_name: place && place.category_group_name ? place.category_group_name : ""
                          };
                       });

                       if (status === kakao.maps.services.Status.OK) {
                          sendToRN("SEARCH_RESULT", mappedResults);
                       } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
                          sendToRN("SEARCH_RESULT", []);
                       } else {
                          if (mappedResults.length > 0) {
                            // status가 null이거나 기타 값이어도 결과가 있으면 우선 전달
                            sendToRN("SEARCH_RESULT", mappedResults);
                            sendToRN("KAKAO_ERROR", "Search status: " + status + " (results delivered), keyword: " + keyword);
                          } else {
                            sendToRN("KAKAO_ERROR", "Search failed with status: " + status + ", keyword: " + keyword);
                            sendToRN("SEARCH_RESULT", []);
                          }
                       }
                     } catch (error) {
                       console.error("Error processing search results:", error);
                       sendToRN("KAKAO_ERROR", "Search result parsing error: " + (error && error.message ? error.message : "unknown"));
                       sendToRN("SEARCH_RESULT", []);
                     }
                  });
                } catch (error) {
                  console.error("Error calling keywordSearch:", error);
                  sendToRN("KAKAO_ERROR", "keywordSearch failed: " + (error && error.message ? error.message : "unknown"));
                  sendToRN("SEARCH_RESULT", []);
                }
             } else if (data.type === "SET_DESTINATION") {
                var place = data.payload.place;
                var routePath = data.payload.routePath;
                var lat = place.y;
                var lng = place.x;
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

                  if (currentMarker && routePath && routePath.length > 0) {
                    // 경로 좌표 배열을 kakao.maps.LatLng 객체 배열로 변환
                    var path = routePath.map(function(coord) {
                      return new kakao.maps.LatLng(coord.latitude, coord.longitude);
                    });
                    
                    polyline = new kakao.maps.Polyline({
                      path: path,
                      strokeWeight: 5,
                      strokeColor: '#0076EF',
                      strokeOpacity: 0.7,
                      strokeStyle: 'solid'
                    });
                    polyline.setMap(map);
                    
                    // 지도 범위 재설정 (경로 전체를 포함하도록)
                    var bounds = new kakao.maps.LatLngBounds();
                    bounds.extend(currentMarker.getPosition());
                    bounds.extend(destPos);
                    // 경로의 모든 좌표를 bounds에 추가
                    path.forEach(function(point) {
                      bounds.extend(point);
                    });
                    map.setBounds(bounds);
                  }
                }
             } else if (data.type === "SET_NAVIGATION_STATE") {
                isNavigating = !!(data.payload && data.payload.isNavigating);
                updateMarkerImage();
             } else if (data.type === "UPDATE_HEADING") {
                if (typeof data.payload === "number") {
                  currentHeading = data.payload;
                } else {
                  currentHeading = null;
                }
                if (isNavigating) {
                  updateMarkerImage();
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

export const Map = ({ onNavigateToReport }: { onNavigateToReport?: () => void }) => {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const [currentCoordinate, setCurrentCoordinate] = useState<Coordinate>(DEFAULT_CENTER);
  const [locationLabel, setLocationLabel] = useState("위치 정보 불러오는 중...");
  const [isLocating, setIsLocating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [destination, setDestination] = useState<Place | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [routePath, setRoutePath] = useState<Coordinate[]>([]);
  const [routeGuides, setRouteGuides] = useState<Guide[]>([]);
  const [currentInstruction, setCurrentInstruction] = useState<string>("");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showPlaceDetail, setShowPlaceDetail] = useState(false);
  const [isMapBlurred, setIsMapBlurred] = useState(false);
  const [recentPlaces, setRecentPlaces] = useState<Place[]>([]);
  const [isRecalculatingRoute, setIsRecalculatingRoute] = useState(false);
  const [hasRouteDeviation, setHasRouteDeviation] = useState(false);
  const [heading, setHeading] = useState<number | null>(null);
  const uiIntro = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const [hasReadInitialLocation, setHasReadInitialLocation] = useState(false);
  const [hasReadDestination, setHasReadDestination] = useState(false);

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
        // 에러가 발생해도 검색 상태는 해제
        setIsSearching(false);
        // 에러 로그는 개발 환경에서만 출력
        if (__DEV__) {
          console.log("[Map] Kakao Error:", data.payload);
        }
      }
      if (data.type === "SEARCH_RESULT") {
        if (__DEV__) {
          console.log("[Map] WebView SEARCH_RESULT:", Array.isArray(data.payload) ? data.payload.length : data.payload);
        }
        setSearchResults(data.payload);
        setIsSearching(false);
      }
    } catch (error) {
      // ignore
    }
  }, []);

  const getCoordinateFromPlace = useCallback((place: Place) => {
    return {
      latitude: parseFloat(place.y),
      longitude: parseFloat(place.x),
    };
  }, []);

  const calculateRemainingDistance = useCallback(
    (origin: Coordinate, place: Place | null) => {
      if (!place) {
        return null;
      }
      const destinationCoord = getCoordinateFromPlace(place);
      return calculateDistance(
        origin.latitude,
        origin.longitude,
        destinationCoord.latitude,
        destinationCoord.longitude
      );
    },
    [calculateDistance, getCoordinateFromPlace]
  );

  const searchPlaces = useCallback(
    async (keyword: string) => {
      if (!KAKAO_REST_API_KEY) {
        console.warn("카카오 REST API 키가 설정되지 않았습니다.");
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      if (__DEV__) {
        console.log("[Map] searchPlaces called:", keyword);
      }
      try {
        const params = new URLSearchParams({
          query: keyword,
          size: "15",
        });

        if (currentCoordinate) {
          params.append("x", currentCoordinate.longitude.toString());
          params.append("y", currentCoordinate.latitude.toString());
        }

        const requestUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?${params.toString()}`;
        if (__DEV__) {
          console.log("[Map] searchPlaces request:", requestUrl);
        }

        const response = await fetch(requestUrl, {
          method: "GET",
          headers: {
            Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Status ${response.status} ${response.statusText}: ${errorText}`);
        }

        const data = await response.json();
        if (__DEV__) {
          console.log(
            "[Map] searchPlaces response:",
            data?.meta?.total_count,
            Array.isArray(data?.documents) ? data.documents.length : "no-docs"
          );
        }
        if (Array.isArray(data?.documents)) {
          const normalized: Place[] = data.documents.map((doc: any, index: number) => ({
            id: doc?.id || `${doc?.x || "0"}_${doc?.y || "0"}_${doc?.place_name || index}`,
            place_name: doc?.place_name || "",
            address_name: doc?.address_name || "",
            road_address_name: doc?.road_address_name || "",
            x: doc?.x || "0",
            y: doc?.y || "0",
          }));
          setSearchResults(normalized);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.log("[Map] Kakao 검색 실패:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [currentCoordinate]
  );

  const handleSearch = (keyword: string) => {
    if (__DEV__) {
      console.log("[Map] handleSearch:", keyword);
    }
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    if (KAKAO_REST_API_KEY) {
      searchPlaces(trimmedKeyword);
      return;
    }

    if (__DEV__) {
      console.log("[Map] using WebView search fallback");
    }
    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "SEARCH_KEYWORD",
          payload: trimmedKeyword,
        })
      );
      return;
    }

    setIsSearching(false);
  };

  const getWalkingRoute = useCallback(
    async (origin: Coordinate, destination: Coordinate): Promise<RouteData | null> => {
      try {
        const response = await routesService.getRouteCandidates({
          start_lat: origin.latitude,
          start_lon: origin.longitude,
          end_lat: destination.latitude,
          end_lon: destination.longitude,
        });

        if (response.routes && response.routes.length > 0) {
          // 일단 첫 번째 경로를 사용
          const route = response.routes[0];

          // 경로 좌표 변환
          const linePath: Coordinate[] = route.path.map(p => ({
            latitude: p.lat,
            longitude: p.lon,
          }));

          // 경로 좌표 배열을 분석해서 방향 전환점(Guide) 생성
          const guides = generateGuidesFromPath(linePath);

          return { path: linePath, guides };
        }

        return null;
      } catch (error: any) {
        // 에러를 더 자세히 로깅하되, 사용자에게는 친화적인 메시지만 표시
        const errorMessage = error?.message || "경로 조회에 실패했습니다";
        console.error("❌ [Map.getWalkingRoute] 경로 조회 실패:", {
          message: errorMessage,
          status: error?.status,
          originalError: error?.originalError,
        });

        // 에러가 발생해도 기본 경로(직선)를 사용할 수 있도록 null 반환
        // TTS로 에러 메시지를 읽지 않도록 주의
        return null;
      }
    },
    []
  );

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    setIsSearchVisible(false);
    setShowPlaceDetail(true);

    const dist = calculateDistance(
      currentCoordinate.latitude,
      currentCoordinate.longitude,
      parseFloat(place.y),
      parseFloat(place.x)
    );
    setDistance(dist);

    // 최근 선택한 장소에 추가 (최대 5개, 중복 제거)
    setRecentPlaces(prev => {
      // 중복 제거 (같은 id가 있으면 제거)
      const filtered = prev.filter(p => p.id !== place.id);
      // 새로운 장소를 맨 앞에 추가
      const updated = [place, ...filtered];
      // 최대 5개까지만 유지
      return updated.slice(0, 5);
    });

    // 지도에 목적지 마커 표시
    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "SET_DESTINATION",
          payload: {
            place: place,
            routePath: [],
          },
        })
      );
    }
  };

  const sendRouteToWebView = useCallback((place: Place, route: Coordinate[]) => {
    if (!webViewRef.current) {
      return;
    }
    webViewRef.current.postMessage(
      JSON.stringify({
        type: "SET_DESTINATION",
        payload: {
          place,
          routePath: route,
        },
      })
    );
  }, []);

  const buildRouteBetween = useCallback(
    async (origin: Coordinate, place: Place) => {
      try {
        const destinationCoord = getCoordinateFromPlace(place);
        const routeData = await getWalkingRoute(origin, destinationCoord);

        const path = routeData?.path || [origin, destinationCoord];
        const guides = routeData?.guides || [];

        setRoutePath(path);
        setRouteGuides(guides);

        if (guides.length > 0) {
          // 첫 번째 가이드 설정
          const firstGuide = guides[0];
          const dist = calculateDistance(origin.latitude, origin.longitude, firstGuide.y, firstGuide.x);
          setCurrentInstruction(getInstructionFromGuide(firstGuide, dist));
        } else {
          // 경로 조회 실패 시에도 기본 안내 메시지 설정 (에러 메시지가 TTS로 읽히지 않도록)
          setCurrentInstruction("목적지까지 직진입니다");
        }

        setDistance(
          calculateDistance(origin.latitude, origin.longitude, destinationCoord.latitude, destinationCoord.longitude)
        );
        sendRouteToWebView(place, path);
        return path;
      } catch (error: any) {
        // 예상치 못한 에러 발생 시에도 안전한 기본 메시지 설정
        console.error("❌ [Map.buildRouteBetween] 예상치 못한 에러:", error);
        const destinationCoord = getCoordinateFromPlace(place);
        const fallbackPath = [origin, destinationCoord];
        setRoutePath(fallbackPath);
        setRouteGuides([]);
        setCurrentInstruction("목적지까지 직진입니다");
        setDistance(
          calculateDistance(origin.latitude, origin.longitude, destinationCoord.latitude, destinationCoord.longitude)
        );
        sendRouteToWebView(place, fallbackPath);
        return fallbackPath;
      }
    },
    [calculateDistance, getCoordinateFromPlace, getWalkingRoute, sendRouteToWebView]
  );

  const beginNavigation = useCallback(async () => {
    if (!selectedPlace) return;
    setDestination(selectedPlace);
    setShowPlaceDetail(false);
    setIsPlaying(true);
    setHasRouteDeviation(false);
    await buildRouteBetween(currentCoordinate, selectedPlace);
  }, [buildRouteBetween, currentCoordinate, selectedPlace]);

  const handleStartNavigation = useCallback(async () => {
    await beginNavigation();
  }, [beginNavigation]);

  const handleSetDestination = useCallback(async () => {
    await beginNavigation();
  }, [beginNavigation]);

  const getClosestDistanceToPath = useCallback(
    (coord: Coordinate, path: Coordinate[]) => {
      if (!path || path.length === 0) return Infinity;
      return path.reduce((minDistance, point) => {
        const dist = calculateDistance(coord.latitude, coord.longitude, point.latitude, point.longitude);
        return Math.min(minDistance, dist);
      }, Infinity);
    },
    [calculateDistance]
  );

  const updateNavigationInstruction = useCallback(
    (coord: Coordinate) => {
      if (routeGuides.length === 0 || routePath.length === 0) {
        // 가이드가 없으면 목적지까지 직진 안내
        if (destination) {
          const destCoord = getCoordinateFromPlace(destination);
          const remainingDist = calculateDistance(
            coord.latitude,
            coord.longitude,
            destCoord.latitude,
            destCoord.longitude
          );
          if (remainingDist > 0) {
            setCurrentInstruction(`${remainingDist}m 앞까지 직진입니다`);
          }
        }
        return;
      }

      // 경로 상에서 현재 위치에 가장 가까운 점 찾기
      let closestPathIndex = 0;
      let minPathDistance = Infinity;

      for (let i = 0; i < routePath.length; i++) {
        const pathPoint = routePath[i];
        const dist = calculateDistance(coord.latitude, coord.longitude, pathPoint.latitude, pathPoint.longitude);
        if (dist < minPathDistance) {
          minPathDistance = dist;
          closestPathIndex = i;
        }
      }

      // 경로 상의 현재 위치 이후에 있는 가이드 찾기
      let nextGuide: Guide | null = null;
      let minDistance = Infinity;

      for (const guide of routeGuides) {
        // 가이드의 road_index가 현재 경로 위치보다 앞에 있으면 다음 가이드
        if (guide.road_index > closestPathIndex) {
          const dist = calculateDistance(coord.latitude, coord.longitude, guide.y, guide.x);
          if (dist < minDistance) {
            minDistance = dist;
            nextGuide = guide;
          }
        }
      }

      // 다음 가이드를 찾지 못했지만 가이드가 있으면, 가장 가까운 가이드 사용
      if (!nextGuide && routeGuides.length > 0) {
        for (const guide of routeGuides) {
          const dist = calculateDistance(coord.latitude, coord.longitude, guide.y, guide.x);
          if (dist < minDistance) {
            minDistance = dist;
            nextGuide = guide;
          }
        }
      }

      // 가이드가 있으면 안내, 없으면 목적지까지 직진
      if (nextGuide && minDistance < 1000) {
        // 1km 이내의 가이드만 안내
        setCurrentInstruction(getInstructionFromGuide(nextGuide, minDistance));
      } else if (destination) {
        const destCoord = getCoordinateFromPlace(destination);
        const remainingDist = calculateDistance(
          coord.latitude,
          coord.longitude,
          destCoord.latitude,
          destCoord.longitude
        );
        if (remainingDist > 0) {
          setCurrentInstruction(`${remainingDist}m 앞까지 직진입니다`);
        }
      }
    },
    [routeGuides, routePath, destination, getCoordinateFromPlace]
  );

  const rerouteIfNecessary = useCallback(
    async (coord: Coordinate) => {
      if (!destination || routePath.length === 0 || isRecalculatingRoute) {
        return;
      }
      const minDistance = getClosestDistanceToPath(coord, routePath);
      const remaining = calculateRemainingDistance(coord, destination);
      if (remaining !== null) {
        setDistance(remaining);
      }

      // 안내 문구 업데이트
      updateNavigationInstruction(coord);

      if (minDistance > ROUTE_DEVIATION_THRESHOLD) {
        setHasRouteDeviation(true);
        setIsRecalculatingRoute(true);
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch {
          // ignore haptics failure
        }

        try {
          await buildRouteBetween(coord, destination);
        } finally {
          setIsRecalculatingRoute(false);
          setHasRouteDeviation(false);
        }
      } else {
        setHasRouteDeviation(false);
      }
    },
    [
      destination,
      routePath,
      isRecalculatingRoute,
      getClosestDistanceToPath,
      calculateRemainingDistance,
      buildRouteBetween,
    ]
  );

  const requestLocation = useCallback(
    async (moveMap = false) => {
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
        if (destination) {
          await rerouteIfNecessary(newCoord);
        }

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
          // 상세 주소 조합: 시/도 + 시/군/구 + 읍/면/동 + 상세주소(name)
          const parts = [result.region, result.city, result.district, result.street, result.name].filter(
            (part): part is string => !!part
          );

          // 중복 제거
          const uniqueParts = parts.filter((part, index) => parts.indexOf(part) === index);

          const addressText = uniqueParts.join(" ");
          setLocationLabel(addressText || "현재 위치");

          // 처음 위치를 불러왔을 때만 읽기
          if (!hasReadInitialLocation && addressText) {
            setHasReadInitialLocation(true);
          }
        }
      } catch (error) {
        setLocationLabel("위치 불러오기 실패");
      } finally {
        setIsLocating(false);
      }
    },
    [destination, rerouteIfNecessary, hasReadInitialLocation]
  );

  useEffect(() => {
    requestLocation(true);
  }, [requestLocation]);

  useEffect(() => {
    let headingSubscription: Location.LocationSubscription | null = null;

    const startHeadingWatch = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          return;
        }

        headingSubscription = await Location.watchHeadingAsync(location => {
          if (location.trueHeading >= 0) {
            setHeading(location.trueHeading);
          } else if (location.magHeading >= 0) {
            setHeading(location.magHeading);
          }
        });
      } catch {
        // ignore
      }
    };

    startHeadingWatch();

    return () => {
      if (headingSubscription) {
        headingSubscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    Animated.timing(uiIntro, {
      toValue: 1,
      duration: 600,
      delay: 150,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [uiIntro]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [pulseAnim]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        requestLocation(false);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [requestLocation, isPlaying]);

  useEffect(() => {
    if (!webViewRef.current) {
      return;
    }
    webViewRef.current.postMessage(
      JSON.stringify({
        type: "SET_NAVIGATION_STATE",
        payload: { isNavigating: isPlaying },
      })
    );
  }, [isPlaying]);

  useEffect(() => {
    if (!webViewRef.current || heading === null) {
      return;
    }
    webViewRef.current.postMessage(
      JSON.stringify({
        type: "UPDATE_HEADING",
        payload: heading,
      })
    );
  }, [heading]);

  const overlayAnimationStyle = {
    opacity: uiIntro,
    transform: [
      {
        translateY: uiIntro.interpolate({
          inputRange: [0, 1],
          outputRange: [-12, 0],
        }),
      },
    ],
  };

  const quickInfoAnimationStyle = {
    opacity: uiIntro,
    transform: [
      {
        translateY: uiIntro.interpolate({
          inputRange: [0, 1],
          outputRange: [-6, 0],
        }),
      },
    ],
  };

  const floatingGroupStyle = {
    opacity: uiIntro,
    transform: [
      {
        translateY: uiIntro.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  };

  const pulseStyle = {
    opacity: pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.35, 0],
    }),
    transform: [
      {
        scale: pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.8],
        }),
      },
    ],
  };
  // TTS로 읽을 텍스트 생성
  const mapScreenText = useMemo(() => {
    // 목적지가 설정되었을 때만 읽기 (한 번만)
    if (destination && distance !== null && !hasReadDestination) {
      return `지도 화면입니다. 현재 위치는 ${locationLabel}입니다. 목적지는 ${destination.place_name}이며, 약 ${distance}미터 떨어져 있습니다.`;
    } else if (
      locationLabel &&
      locationLabel !== "위치 정보 불러오는 중..." &&
      hasReadInitialLocation &&
      !destination &&
      !hasReadDestination
    ) {
      // 처음 위치를 불러왔을 때만 읽기 (목적지가 없을 때, 한 번만)
      return `지도 화면입니다. 현재 위치는 ${locationLabel}입니다.`;
    }
    return "";
  }, [locationLabel, destination, distance, hasReadInitialLocation, hasReadDestination]);

  // 목적지가 설정되었을 때 플래그 업데이트
  useEffect(() => {
    if (destination && distance !== null && !hasReadDestination) {
      setHasReadDestination(true);
    }
  }, [destination, distance, hasReadDestination]);

  // 화면 정보 읽기 (목적지가 설정되거나 처음 위치를 불러왔을 때만)
  useScreenReader(mapScreenText, { delay: 800, skipIfEmpty: true });

  if (!KAKAO_MAP_KEY) {
    return (
      <Container>
        <MissingKeyContainer>
          <CustomText
            size={18}
            weight="bold"
            style={{ marginBottom: 8 }}
          >
            카카오맵 API Key가 필요합니다
          </CustomText>
          <CustomText
            size={14}
            color="#666666"
            style={{ textAlign: "center" }}
          >
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
          {!isPlaying && (
            <SearchCardWrapper style={[overlayAnimationStyle, mapCardShadow || undefined]}>
              <SearchTouchable
                activeOpacity={0.85}
                onPress={() => setIsSearchVisible(true)}
              >
                <GlassSearchCard
                  intensity={65}
                  tint="light"
                >
                  <Svg
                    width="22"
                    height="22"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <Path
                      d="M13.875 12.625L17.25 16"
                      stroke="#68D0C6"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <Circle
                      cx="9"
                      cy="9"
                      r="5.5"
                      stroke="#68D0C6"
                      strokeWidth="2"
                    />
                  </Svg>
                  <SearchText size={16}>{locationLabel}</SearchText>
                  <Svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <Path
                      d="M8 5L15 12L8 19"
                      stroke="#68D0C6"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </GlassSearchCard>
              </SearchTouchable>
            </SearchCardWrapper>
          )}

          {isPlaying && (
            <QuickInfoWrapper style={quickInfoAnimationStyle}>
              <QuickInfoCard
                colors={["#ffffff", "#f0f9ff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={mapCardShadow || undefined}
              >
                <QuickInfoHeader>
                  <QuickInfoTitle>현재 경로</QuickInfoTitle>
                  <QuickInfoBadge>
                    <QuickInfoBadgeText size={12}>LIVE</QuickInfoBadgeText>
                  </QuickInfoBadge>
                </QuickInfoHeader>
                <QuickInfoDistance>{distance ? `약 ${distance}m 남음` : "안내 준비 중"}</QuickInfoDistance>
                <QuickInfoSubtitle>
                  {isRecalculatingRoute
                    ? "경로를 재탐색하고 있어요"
                    : destination?.place_name || "목적지를 검색해 안내를 시작하세요"}
                </QuickInfoSubtitle>
              </QuickInfoCard>
            </QuickInfoWrapper>
          )}
        </OverlayContainer>

        <FloatingActionGroup style={floatingGroupStyle}>
          <SecondaryFloatingWrapper>
            <FloatingButtonBase style={[floatingShadow || undefined, locationButtonShadow || undefined]}>
              <PulseRing style={pulseStyle} />
              <FloatingButtonTouchable
                activeOpacity={0.85}
                onPress={() => requestLocation(true)}
              >
                <FloatingGradient
                  colors={["#FFFFFF", "#F8FAFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isLocating ? (
                    <ActivityIndicator color="#68D0C6" />
                  ) : (
                    <Svg
                      width="26"
                      height="26"
                      viewBox="0 0 21 21"
                      fill="none"
                    >
                      <Circle
                        cx="10.5"
                        cy="10.5"
                        r="10"
                        stroke="#68D0C6"
                      />
                      <Circle
                        cx="10.5"
                        cy="10.5"
                        r="1.5"
                        fill="#68D0C6"
                      />
                      <Path
                        d="M10.5 1L10.5 4"
                        stroke="#68D0C6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <Path
                        d="M20 10.5L17 10.5"
                        stroke="#68D0C6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <Path
                        d="M10.5 20L10.5 17"
                        stroke="#68D0C6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <Path
                        d="M1 10.5L4 10.5"
                        stroke="#68D0C6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </Svg>
                  )}
                </FloatingGradient>
              </FloatingButtonTouchable>
            </FloatingButtonBase>
            <FloatingButtonLabel
              size={11}
              align="center"
            >
              내 위치
            </FloatingButtonLabel>
          </SecondaryFloatingWrapper>
        </FloatingActionGroup>

        {/* MapBottomSheet가 올라왔을 때의 블러 처리 */}
        {isMapBlurred && !showPlaceDetail && isPlaying && (
          <MapOverlay
            intensity={10}
            tint="dark"
          />
        )}

        {showPlaceDetail && selectedPlace && (
          <>
            <MapOverlay
              intensity={10}
              tint="dark"
            />
            <BottomSheetWrapper>
              <PlaceDetailSheet
                place={selectedPlace}
                distance={distance || undefined}
                onClose={() => {
                  setShowPlaceDetail(false);
                  setSelectedPlace(null);
                }}
                onStartNavigation={handleStartNavigation}
                onSetDestination={handleSetDestination}
              />
            </BottomSheetWrapper>
          </>
        )}

        {isPlaying && !showPlaceDetail && (
          <>
            {/* 안내 중일 때는 블러 처리하지 않음 (지도 봐야함) 
                만약 안내 중에도 바텀시트를 위로 올렸을 때만 블러하고 싶다면 
                MapBottomSheet 내부에서 상태를 관리해서 콜백으로 알려줘야 함.
                현재 요청은 "바텀시트가 올라올 때"이므로, PlaceDetailSheet가 떴을 때를 의미하는 것으로 보임.
                MapBottomSheet는 항상 떠있는 상태(Peek)이므로 기본적으로 블러 처리하지 않음.
            */}
            <BottomSheetWrapper>
              <MapBottomSheet
                destination={destination?.place_name || "목적지를 검색해 주세요"}
                instruction={
                  isRecalculatingRoute
                    ? "경로를 재탐색하고 있어요"
                    : currentInstruction ||
                      (distance ? `${distance}m 앞까지 직진입니다` : "목적지를 검색해 설정해주세요")
                }
                isPlaying={isPlaying}
                distance={distance || undefined}
                isRecalculating={isRecalculatingRoute}
                hasDeviation={hasRouteDeviation}
                currentCoordinate={currentCoordinate}
                destinationCoordinate={destination ? getCoordinateFromPlace(destination) : undefined}
                heading={heading}
                onClose={() => {
                  setIsPlaying(false);
                  setDestination(null);
                  setRoutePath([]);
                  setRouteGuides([]);
                  setCurrentInstruction("");
                  setHasRouteDeviation(false);
                  setIsRecalculatingRoute(false);
                }}
                onReportDanger={onNavigateToReport}
                routePath={routePath}
                onBlurMap={setIsMapBlurred}
              />
            </BottomSheetWrapper>
          </>
        )}
        {isSearchVisible && (
          <MapSearch
            onClose={() => setIsSearchVisible(false)}
            onSearch={handleSearch}
            searchResults={searchResults}
            isSearching={isSearching}
            onSelectPlace={handleSelectPlace}
            recentPlaces={recentPlaces}
          />
        )}
      </MapWrapper>
    </Container>
  );
};
