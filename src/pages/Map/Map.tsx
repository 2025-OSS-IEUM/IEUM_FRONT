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

// Kakao Map Key (지도 표시용)
const KAKAO_JAVASCRIPT_KEY = process.env.EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY;

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
  opacity: 0.99;
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

const ROUTE_DEVIATION_THRESHOLD = 30;
const TURN_ANGLE_THRESHOLD = 15;
const MIN_TURN_DISTANCE = 20;

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

const detectTurnType = (prevBearing: number, nextBearing: number): { type: number; guidance: string } => {
  let angleDiff = nextBearing - prevBearing;

  if (angleDiff > 180) {
    angleDiff -= 360;
  } else if (angleDiff < -180) {
    angleDiff += 360;
  }

  const absAngle = Math.abs(angleDiff);

  if (absAngle < TURN_ANGLE_THRESHOLD) {
    return { type: 1, guidance: "직진" };
  }

  if (angleDiff > 0) {
    if (absAngle < 45) {
      return { type: 6, guidance: "약간 좌회전" };
    } else if (absAngle < 135) {
      return { type: 7, guidance: "좌회전" };
    } else {
      return { type: 8, guidance: "왼쪽으로 유턴" };
    }
  } else {
    if (absAngle < 45) {
      return { type: 3, guidance: "약간 우회전" };
    } else if (absAngle < 135) {
      return { type: 4, guidance: "우회전" };
    } else {
      return { type: 5, guidance: "오른쪽으로 유턴" };
    }
  }
};

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

    const prevBearing = calculateBearing(prev.latitude, prev.longitude, current.latitude, current.longitude);
    const nextBearing = calculateBearing(current.latitude, current.longitude, next.latitude, next.longitude);

    let angleDiff = nextBearing - prevBearing;
    if (angleDiff > 180) {
      angleDiff -= 360;
    } else if (angleDiff < -180) {
      angleDiff += 360;
    }

    const absAngle = Math.abs(angleDiff);

    if (absAngle >= TURN_ANGLE_THRESHOLD) {
      const segmentDistance = calculateDistance(prev.latitude, prev.longitude, current.latitude, current.longitude);

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
        var destinationMarker = null;
        var polyline = null;
        var places = null;
        var isNavigating = false;
        var currentHeading = 0;

        function initializeMap() {
          try {
            var container = document.getElementById('map');
            var options = {
              center: new kakao.maps.LatLng(${DEFAULT_CENTER.latitude}, ${DEFAULT_CENTER.longitude}),
              level: 3
            };

            map = new kakao.maps.Map(container, options);
            places = new kakao.maps.services.Places();
            
            // 기본 마커 이미지 설정
            var imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png"; 
            var imageSize = new kakao.maps.Size(64, 69); 
            var imageOption = {offset: new kakao.maps.Point(27, 69)}; 
            var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

            currentMarker = new kakao.maps.Marker({
              position: new kakao.maps.LatLng(${DEFAULT_CENTER.latitude}, ${DEFAULT_CENTER.longitude}),
              image: markerImage
            });
            currentMarker.setMap(map);

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
              }
              
              if (data.payload.moveMap) {
                map.setCenter(moveLatLon);
              }
            } 
            else if (data.type === "SET_DESTINATION") {
              var place = data.payload.place;
              var routePath = data.payload.routePath;
              var lat = parseFloat(place.y);
              var lng = parseFloat(place.x);
              var destLatLon = new kakao.maps.LatLng(lat, lng);

              // 목적지 마커
              if (destinationMarker) destinationMarker.setMap(null);
              destinationMarker = new kakao.maps.Marker({
                position: destLatLon
              });
              destinationMarker.setMap(map);

              // 경로 그리기
              if (polyline) {
                polyline.setMap(null);
                polyline = null;
              }

              if (routePath && routePath.length > 0) {
                sendToRN("WEBVIEW_LOG", { level: "info", message: "Drawing Polyline with " + routePath.length + " points." });

                var linePath = routePath.map(function(p) { 
                  return new kakao.maps.LatLng(p.latitude, p.longitude); 
                });

                polyline = new kakao.maps.Polyline({
                  path: linePath,
                  strokeWeight: 6,
                  strokeColor: '#0076EF',
                  strokeOpacity: 0.8,
                  strokeStyle: 'solid'
                });
                polyline.setMap(map);

                // 지도 범위 재설정
                var bounds = new kakao.maps.LatLngBounds();
                linePath.forEach(function(p) { bounds.extend(p); });
                map.setBounds(bounds);
              } else {
                sendToRN("WEBVIEW_LOG", { level: "warn", message: "No route path provided to draw." });
              }
            }
            else if (data.type === "SET_NAVIGATION_STATE") {
              isNavigating = !!data.payload.isNavigating;
              if (isNavigating) {
                 map.setLevel(1); // 줌인
              } else {
                 map.setLevel(3); // 줌아웃
              }
            }
            else if (data.type === "SEARCH_KEYWORD") {
              // payload: { keyword, latitude, longitude }
              searchKeyword(data.payload.keyword, data.payload.latitude, data.payload.longitude);
            }

          } catch (e) {
            sendToRN("WEBVIEW_LOG", { level: "error", message: "Msg Error: " + e.message });
          }
        }

        function searchKeyword(keyword, lat, lng) {
           if (!places) {
             try {
               places = new kakao.maps.services.Places();
             } catch (e) {
               sendToRN("WEBVIEW_LOG", { level: "error", message: "Places init error: " + e.message });
               return;
             }
           }
           
           var options = {};
           if (lat && lng) {
             // 거리순 정렬을 위해서는 location과 radius(또는 useMapBounds:true)가 필요할 수 있음
             // 여기서는 현재 위치 기준 20km 반경 내 검색 + 거리순 정렬
             options.location = new kakao.maps.LatLng(lat, lng);
             options.radius = 20000; // 20km
             options.sort = kakao.maps.services.SortBy.DISTANCE;
           }

           places.keywordSearch(keyword, function(result, status) {
              if (status === kakao.maps.services.Status.OK) {
                 var data = result.map(function(p) {
                    return {
                      id: p.id,
                      place_name: p.place_name,
                      address_name: p.address_name,
                      road_address_name: p.road_address_name,
                      x: p.x,
                      y: p.y,
                      distance: p.distance
                    };
                 });
                 sendToRN("SEARCH_RESULT", data);
              } else {
                 var msg = "Search status: " + status;
                 if (status === kakao.maps.services.Status.ZERO_RESULT) {
                   msg = "검색 결과가 없습니다.";
                 }
                 sendToRN("WEBVIEW_LOG", { level: "warn", message: msg });
                 sendToRN("SEARCH_RESULT", []);
              }
           }, options);
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
  const [isMapReady, setIsMapReady] = useState(false);

  const mapTemplate = useMemo(() => {
    if (!KAKAO_JAVASCRIPT_KEY) return "";
    return generateKakaoTemplate(KAKAO_JAVASCRIPT_KEY);
  }, []);

  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "KAKAO_READY") {
        setIsMapReady(true);
      }
      if (data.type === "SEARCH_RESULT") {
        setSearchResults(data.payload);
        setIsSearching(false);
      }
      if (data.type === "WEBVIEW_LOG") {
        console.log(`🌐 [WebView] ${data.payload.message}`);
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
      if (!place) return null;
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
    (keyword: string) => {
      if (!webViewRef.current) return;
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "SEARCH_KEYWORD",
          payload: {
            keyword: keyword,
            latitude: currentCoordinate.latitude,
            longitude: currentCoordinate.longitude,
          },
        })
      );
    },
    [currentCoordinate]
  );

  const handleSearch = (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    searchPlaces(trimmedKeyword);
  };

  const getWalkingRoute = useCallback(
    async (origin: Coordinate, destination: Coordinate): Promise<RouteData | null> => {
      try {
        console.log("[Map] 경로 탐색 시작:", { origin, destination });

        // 1. 안전 경로 분석 요청 (Backend에서 TMap 호출 및 분석 통합 수행)
        const routeRequest = {
          start_lat: origin.latitude,
          start_lon: origin.longitude,
          end_lat: destination.latitude,
          end_lon: destination.longitude,
          alternatives: true,
        };

        console.log("[Map] 1. 안전 경로 분석 요청:", routeRequest);
        // 기존 getRouteCandidates 호출 제거 -> getSafeRouteWithScores에 좌표 직접 전송
        const safeResponse = await routesService.getSafeRouteWithScores(routeRequest);

        const bestIndex = safeResponse.bestRouteIndex;
        const bestRoute = safeResponse.routes[bestIndex];

        if (!bestRoute) {
          console.warn(
            `[Map] 추천 경로(Index: ${bestIndex})가 routes(Length: ${safeResponse.routes.length})에 없습니다.`
          );
          return null;
        }

        console.log(
          `[Map] 안전 경로 분석 완료. 추천 경로 인덱스: ${bestIndex}, 안전 점수: ${bestRoute.safetyScore}, 거리: ${bestRoute.distance}`
        );
        console.log(`[Map] 경로 포인트 수: ${bestRoute.path.length}`);

        // 2. 경로 데이터 변환
        // Backend coordinates (lat, lon) -> Map Coordinate (latitude, longitude)
        const path: Coordinate[] = bestRoute.path.map(p => ({
          latitude: p.lat,
          longitude: p.lon,
        }));

        // 3. 가이드 생성 (Turn-by-turn instructions)
        // 백엔드에서 가이드 정보를 주지 않으므로 path 기반으로 클라이언트에서 생성
        const guides = generateGuidesFromPath(path);

        return { path, guides };
      } catch (error) {
        console.error("[Map] 경로 탐색 실패:", error);

        // 백엔드 호출 실패 시 TMap으로 폴백하거나 에러 처리
        // 여기서는 기존 TMap 로직을 폴백으로 유지할 수도 있지만,
        // 사용자 요청이 "백엔드 연동"이므로 실패 시 null 반환하여 에러 표시
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

    setRecentPlaces(prev => {
      const filtered = prev.filter(p => p.id !== place.id);
      return [place, ...filtered].slice(0, 5);
    });

    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "SET_DESTINATION",
          payload: { place, routePath: [] },
        })
      );
    }
  };

  const sendRouteToWebView = useCallback((place: Place, route: Coordinate[]) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "SET_DESTINATION",
          payload: { place, routePath: route },
        })
      );
    }
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
          const firstGuide = guides[0];
          // 첫 번째 가이드까지의 거리는 API에서 제공하거나 직접 계산
          // 여기서는 단순화를 위해 직접 계산
          const dist = calculateDistance(origin.latitude, origin.longitude, firstGuide.y, firstGuide.x);
          setCurrentInstruction(getInstructionFromGuide(firstGuide, dist));
        } else {
          setCurrentInstruction("목적지까지 직진입니다");
        }

        // 전체 거리 (API에서 제공하지 않을 경우 직선거리 사용)
        // TMap API 응답을 파싱할 때 totalDistance를 가져오는 것이 좋지만, 현재 로직에서는 place와 origin 거리로 설정
        setDistance(
          calculateDistance(origin.latitude, origin.longitude, destinationCoord.latitude, destinationCoord.longitude)
        );

        sendRouteToWebView(place, path);
        return path;
      } catch {
        const destinationCoord = getCoordinateFromPlace(place);
        const fallbackPath = [origin, destinationCoord];
        setRoutePath(fallbackPath);
        setRouteGuides([]);
        setCurrentInstruction("목적지까지 직진입니다");
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
      return path.reduce((min, point) => {
        return Math.min(min, calculateDistance(coord.latitude, coord.longitude, point.latitude, point.longitude));
      }, Infinity);
    },
    [calculateDistance]
  );

  const updateNavigationInstruction = useCallback(
    (coord: Coordinate) => {
      if (routeGuides.length === 0) {
        if (destination) {
          const destCoord = getCoordinateFromPlace(destination);
          const remainingDist = calculateDistance(
            coord.latitude,
            coord.longitude,
            destCoord.latitude,
            destCoord.longitude
          );
          if (remainingDist > 0) setCurrentInstruction(`${remainingDist}m 앞까지 직진입니다`);
        }
        return;
      }
      let closestIdx = 0;
      let minPathDist = Infinity;
      for (let i = 0; i < routePath.length; i++) {
        const d = calculateDistance(coord.latitude, coord.longitude, routePath[i].latitude, routePath[i].longitude);
        if (d < minPathDist) {
          minPathDist = d;
          closestIdx = i;
        }
      }

      let nextGuide = routeGuides.find(g => g.road_index > closestIdx);
      if (nextGuide) {
        const dist = calculateDistance(coord.latitude, coord.longitude, nextGuide.y, nextGuide.x);
        if (dist < 1000) setCurrentInstruction(getInstructionFromGuide(nextGuide, dist));
      }
    },
    [routeGuides, routePath, destination, getCoordinateFromPlace]
  );

  const rerouteIfNecessary = useCallback(
    async (coord: Coordinate) => {
      if (!destination || routePath.length === 0 || isRecalculatingRoute) return;

      const minDistance = getClosestDistanceToPath(coord, routePath);
      const remaining = calculateRemainingDistance(coord, destination);
      if (remaining !== null) setDistance(remaining);

      updateNavigationInstruction(coord);

      if (minDistance > ROUTE_DEVIATION_THRESHOLD) {
        setHasRouteDeviation(true);
        setIsRecalculatingRoute(true);
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch {}

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
        const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const newCoord = { latitude: coords.latitude, longitude: coords.longitude };
        setCurrentCoordinate(newCoord);

        if (destination) await rerouteIfNecessary(newCoord);

        if (webViewRef.current) {
          webViewRef.current.postMessage(
            JSON.stringify({ type: "UPDATE_LOCATION", payload: { ...newCoord, moveMap } })
          );
        }

        const [result] = await Location.reverseGeocodeAsync(newCoord);
        if (result) {
          const parts = [result.region, result.city, result.district, result.street, result.name].filter(Boolean);
          const uniqueParts = parts.filter((part, index) => parts.indexOf(part) === index);
          const addressText = uniqueParts.join(" ");
          setLocationLabel(addressText || "현재 위치");
          if (!hasReadInitialLocation && addressText) setHasReadInitialLocation(true);
        }
      } catch {
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
    if (isMapReady) {
      requestLocation(true);
      setIsMapReady(false);
    }
  }, [isMapReady, requestLocation]);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        sub = await Location.watchHeadingAsync(loc => {
          const h = loc.trueHeading >= 0 ? loc.trueHeading : loc.magHeading;
          if (h >= 0) setHeading(h);
        });
      }
    })();
    return () => {
      sub?.remove();
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
        Animated.timing(pulseAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) requestLocation(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [requestLocation, isPlaying]);

  useEffect(() => {
    webViewRef.current?.postMessage(
      JSON.stringify({ type: "SET_NAVIGATION_STATE", payload: { isNavigating: isPlaying } })
    );
  }, [isPlaying]);

  useEffect(() => {
    if (heading !== null) webViewRef.current?.postMessage(JSON.stringify({ type: "UPDATE_HEADING", payload: heading }));
  }, [heading]);

  const overlayAnimationStyle = {
    opacity: uiIntro,
    transform: [{ translateY: uiIntro.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
  };
  const quickInfoAnimationStyle = {
    opacity: uiIntro,
    transform: [{ translateY: uiIntro.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }],
  };
  const floatingGroupStyle = {
    opacity: uiIntro,
    transform: [{ translateY: uiIntro.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
  };
  const pulseStyle = {
    opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
    transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
  };

  const mapScreenText = useMemo(() => {
    if (destination && distance !== null && !hasReadDestination) {
      return `지도 화면입니다. 현재 위치는 ${locationLabel}입니다. 목적지는 ${destination.place_name}이며, 약 ${distance}미터 떨어져 있습니다.`;
    } else if (
      locationLabel &&
      locationLabel !== "위치 정보 불러오는 중..." &&
      hasReadInitialLocation &&
      !destination &&
      !hasReadDestination
    ) {
      return `지도 화면입니다. 현재 위치는 ${locationLabel}입니다.`;
    }
    return "";
  }, [locationLabel, destination, distance, hasReadInitialLocation, hasReadDestination]);

  useEffect(() => {
    if (destination && distance !== null && !hasReadDestination) setHasReadDestination(true);
  }, [destination, distance, hasReadDestination]);

  useScreenReader(mapScreenText, { delay: 800, skipIfEmpty: true });

  if (!KAKAO_JAVASCRIPT_KEY) {
    return (
      <Container>
        <MissingKeyContainer>
          <CustomText
            size={18}
            weight="bold"
            style={{ marginBottom: 8 }}
          >
            Kakao API Key가 필요합니다
          </CustomText>
          <CustomText
            size={14}
            color="#666666"
            style={{ textAlign: "center" }}
          >
            .env 파일의 EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY를 확인해주세요.
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
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="always"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onMessage={handleWebViewMessage}
          startInLoadingState={true}
          renderLoading={() => (
            <ActivityIndicator
              style={{ position: "absolute", top: "50%", left: "50%" }}
              size="large"
              color="#68D0C6"
            />
          )}
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
          <BottomSheetWrapper>
            <MapBottomSheet
              destination={destination?.place_name || "목적지를 검색해 주세요"}
              instruction={
                isRecalculatingRoute
                  ? "경로를 재탐색하고 있어요"
                  : currentInstruction || (distance ? `${distance}m 앞까지 직진입니다` : "목적지를 검색해 설정해주세요")
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
