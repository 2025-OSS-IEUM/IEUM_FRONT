import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Platform,
  Animated,
  TouchableOpacity,
  PanResponder,
} from "react-native";
import styled from "styled-components/native";
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
} from "react-native-svg";
import { theme } from "../../styles/theme";

interface MapBottomSheetProps {
  destination?: string;
  instruction?: string;
  onClose?: () => void;
  isPlaying?: boolean;
  panY?: Animated.Value; // Map.tsx에서 공유받는 애니메이션 값
  enableDrag?: boolean;
  distance?: number;
  isRecalculating?: boolean;
  hasDeviation?: boolean;
  currentCoordinate?: { latitude: number; longitude: number };
  destinationCoordinate?: { latitude: number; longitude: number };
  heading?: number | null;
  onReportDanger?: () => void;
  routePath?: { latitude: number; longitude: number }[];
  onBlurMap?: (shouldBlur: boolean) => void;
}

const bottomSheetShadow = Platform.select({
  ios: {
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  android: {
    elevation: 16,
  },
  default: {},
});

const BottomSheetContainer = styled.View`
  width: 100%;
  height: 320px;
  flex-shrink: 0;
  background-color: #ffffff;
  border-radius: 20px 20px 0 0;
  padding: 20px;
  align-items: center;
  position: relative;
`;

const AnimatedBottomSheet =
  Animated.createAnimatedComponent(BottomSheetContainer);

const HandleBarWrapper = styled.View`
  width: 100%;
  height: 30px;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
`;

const HandleBar = styled.View`
  width: 40px;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
`;

const AudioWaveContainer = styled.View`
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 40px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 2px;
  pointer-events: none;
`;

const AudioBar = styled.View<{ height: number }>`
  width: 1px;
  height: ${(props) => props.height}px;
  background-color: #68d0c6;
  border-radius: 0.5px;
`;

const DirectionContainer = styled.View`
  width: 105px;
  height: 105px;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 14px;
  position: relative;
`;

const ArrowWrapper = styled.View`
  position: absolute;
  width: 48px;
  height: 57px;
  justify-content: center;
  align-items: center;
`;

const DestinationText = styled.Text`
  color: ${(props) => props.theme.colors.placeholder};
  text-align: center;
  font-family: ${(props) => props.theme.fonts.semiBold};
  font-size: 14px;
  margin-bottom: 10px;
  letter-spacing: -0.3px;
`;

const InstructionText = styled.Text`
  color: ${(props) => props.theme.colors.text.primary};
  text-align: center;
  font-family: ${(props) => props.theme.fonts.extraBold};
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.5px;
`;

const StatusPill = styled.View`
  padding-top: 6px;
  padding-bottom: 6px;
  padding-left: 12px;
  padding-right: 12px;
  border-radius: 14px;
  background-color: rgba(255, 68, 68, 0.1);
  margin-top: 12px;
  border: 1px solid rgba(255, 68, 68, 0.2);
`;

const StatusPillText = styled.Text`
  color: ${(props) => props.theme.colors.error};
  text-align: center;
  font-family: ${(props) => props.theme.fonts.bold};
  font-size: 13px;
`;

const DistanceText = styled.Text`
  margin-top: 8px;
  color: #0076ef;
  text-align: center;
  font-family: ${(props) => props.theme.fonts.extraBold};
  font-size: 16px;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  width: 100%;
  margin-top: 16px;
  gap: 8px;
`;

const ActionButton = styled.TouchableOpacity<{
  variant?: "danger" | "secondary";
}>`
  flex: 1;
  height: 46px;
  border-radius: 14px;
  background-color: ${(props) =>
    props.variant === "danger" ? "#FFF5F5" : "#F8FAFC"};
  align-items: center;
  justify-content: center;
  border: 1px solid
    ${(props) =>
      props.variant === "danger"
        ? props.theme.colors.error
        : props.theme.colors.border};
`;

const ActionButtonText = styled.Text<{ variant?: "danger" | "secondary" }>`
  font-family: ${(props) => props.theme.fonts.bold};
  font-size: 15px;
  color: ${(props) =>
    props.variant === "danger"
      ? props.theme.colors.error
      : props.theme.colors.text.secondary};
`;

const toRadians = (deg: number) => (deg * Math.PI) / 180;

const calculateBearing = (
  from?: { latitude: number; longitude: number },
  to?: { latitude: number; longitude: number }
) => {
  if (!from || !to) return null;
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const dLon = toRadians(to.longitude - from.longitude);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
};

export const MapBottomSheet = ({
  destination = "국립한밭대학교 정문",
  instruction = "50걸음 직진 후 좌회전입니다",
  onClose,
  isPlaying = true,
  panY: externalPanY,
  enableDrag = true,
  distance,
  isRecalculating = false,
  hasDeviation = false,
  currentCoordinate,
  destinationCoordinate,
  heading = null,
  onReportDanger,
  routePath, // Add routePath prop
  onBlurMap,
}: MapBottomSheetProps) => {
  const [barHeights, setBarHeights] = useState<number[]>([]);
  const animationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (onBlurMap) {
      onBlurMap(!isCollapsed.current);
    }
  }, [onBlurMap]);

  // 외부에서 주입받은 panY가 없으면 내부에서 생성 (하위 호환성)
  const internalPanY = useRef(new Animated.Value(0)).current;
  const panY = externalPanY || internalPanY;

  // 높이 320px - 상단 탭 높이 30px - 여유분 10px = 280px 만큼 내려감
  const COLLAPSED_Y = 280;
  const isCollapsed = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        panY.setOffset(isCollapsed.current ? COLLAPSED_Y : 0);
        panY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        let nextValue = gestureState.dy;

        if (isCollapsed.current) {
          nextValue = Math.min(0, nextValue);
          nextValue = Math.max(nextValue, -COLLAPSED_Y);
        } else {
          nextValue = Math.max(0, nextValue);
          nextValue = Math.min(nextValue, COLLAPSED_Y);
        }

        panY.setValue(nextValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        panY.flattenOffset();
        const currentY =
          (isCollapsed.current ? COLLAPSED_Y : 0) + gestureState.dy;

        let shouldCollapse = false;
        if (gestureState.vy > 0.5) {
          shouldCollapse = true;
        } else if (gestureState.vy < -0.5) {
          shouldCollapse = false;
        } else {
          shouldCollapse = currentY > COLLAPSED_Y / 2;
        }

        isCollapsed.current = shouldCollapse;

        // Notify parent about collapse state change for blur effect
        if (onBlurMap) {
          onBlurMap(!shouldCollapse);
        }

        Animated.spring(panY, {
          toValue: shouldCollapse ? COLLAPSED_Y : 0,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }).start();
      },
    })
  ).current;

  // 오디오 웨이브 바 생성 (약 50개)
  const barCount = 50;

  useEffect(() => {
    const initialHeights = Array.from(
      { length: barCount },
      () => Math.random() * 26 + 2
    );
    setBarHeights(initialHeights);

    if (isPlaying) {
      const animateBars = () => {
        setBarHeights((prev) => prev.map(() => Math.random() * 26 + 2));
      };
      animationInterval.current = setInterval(animateBars, 100);
    }

    return () => {
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
      }
    };
  }, [isPlaying, barCount]);

  const bearingToDestination = useMemo(() => {
    if (!currentCoordinate || !routePath || routePath.length === 0) {
      return calculateBearing(currentCoordinate, destinationCoordinate);
    }

    // Find the next point on the path that is at least 10 meters away
    // to ensure the arrow points along the path, not just to the nearest point
    let targetPoint = routePath[routePath.length - 1];
    for (let i = 0; i < routePath.length; i++) {
      const point = routePath[i];
      const dist = Math.sqrt(
        Math.pow(point.latitude - currentCoordinate.latitude, 2) +
          Math.pow(point.longitude - currentCoordinate.longitude, 2)
      );
      // Approx conversion: 0.0001 degrees is roughly 11 meters
      if (dist > 0.0001) {
        targetPoint = point;
        break;
      }
    }

    return calculateBearing(currentCoordinate, targetPoint);
  }, [currentCoordinate, destinationCoordinate, routePath]);

  const arrowRotation = useMemo(() => {
    if (bearingToDestination === null) {
      return heading ?? 0;
    }
    if (heading === null) {
      return bearingToDestination;
    }
    const diff = (bearingToDestination - heading + 360) % 360;
    return diff;
  }, [bearingToDestination, heading]);

  if (!isPlaying) {
    return null;
  }

  return (
    <AnimatedBottomSheet
      style={[
        bottomSheetShadow || undefined,
        enableDrag ? { transform: [{ translateY: panY }] } : undefined,
      ]}
      {...(enableDrag ? panResponder.panHandlers : {})}
    >
      <HandleBarWrapper>
        <HandleBar />
      </HandleBarWrapper>

      {isPlaying && barHeights.length > 0 && (
        <AudioWaveContainer>
          {barHeights.map((height, index) => (
            <AudioBar key={index} height={height} />
          ))}
        </AudioWaveContainer>
      )}

      <DirectionContainer>
        <Svg width="105" height="105" viewBox="0 0 150 150" fill="none">
          <Defs>
            <LinearGradient
              id="paint0_linear_334_367"
              x1="75"
              y1="0"
              x2="75"
              y2="150"
              gradientUnits="userSpaceOnUse"
            >
              <Stop stopColor="#68D0C6" />
              <Stop offset="1" stopColor="#0076EF" />
            </LinearGradient>
          </Defs>
          <Circle
            cx="75"
            cy="75"
            r="72.5"
            stroke="url(#paint0_linear_334_367)"
            strokeWidth="5"
          />
        </Svg>
        <ArrowWrapper
          style={{
            transform: [{ rotate: `${arrowRotation ?? 0}deg` }],
          }}
        >
          <Svg width="48" height="57" viewBox="0 0 69 82" fill="none">
            <Defs>
              <LinearGradient
                id="paint0_linear_334_356"
                x1="34.379"
                y1="0"
                x2="34.379"
                y2="81.2556"
                gradientUnits="userSpaceOnUse"
              >
                <Stop stopColor="#68D0C6" />
                <Stop offset="1" stopColor="#0076EF" />
              </LinearGradient>
            </Defs>
            <Path
              d="M34.3789 3C34.3954 3 34.4116 3.00347 34.4268 3.00977C34.4419 3.01607 34.4562 3.02546 34.4678 3.03711L65.7197 34.2891C65.7439 34.3132 65.7578 34.3466 65.7578 34.3809C65.7577 34.415 65.7438 34.4476 65.7197 34.4717C65.6956 34.4958 65.663 34.5098 65.6289 34.5098C65.5948 34.5098 65.5622 34.4958 65.5381 34.4717L39.626 8.55371L34.5039 3.43066V78.1309C34.5038 78.1638 34.4909 78.1954 34.4678 78.2188C34.4443 78.2422 34.4121 78.2559 34.3789 78.2559C34.3458 78.2558 34.3144 78.2421 34.291 78.2188C34.2676 78.1954 34.254 78.1639 34.2539 78.1309V3.43066L29.1328 8.55371L3.21973 34.4717C3.19557 34.4958 3.16304 34.5098 3.12891 34.5098C3.09476 34.5098 3.06224 34.4958 3.03809 34.4717C3.01397 34.4476 3.00007 34.415 3 34.3809C3 34.3467 3.0139 34.3132 3.03809 34.2891L34.29 3.03711C34.3016 3.02548 34.3159 3.01607 34.3311 3.00977C34.3462 3.00347 34.3625 3.00001 34.3789 3Z"
              fill="#0076EF"
              stroke="url(#paint0_linear_334_356)"
              strokeWidth="6"
            />
          </Svg>
        </ArrowWrapper>
      </DirectionContainer>

      <DestinationText>{destination}</DestinationText>
      <InstructionText>{instruction}</InstructionText>
      {(hasDeviation || isRecalculating) && (
        <StatusPill>
          <StatusPillText>
            {isRecalculating
              ? "경로를 재탐색하고 있어요"
              : "경로에서 벗어났어요"}
          </StatusPillText>
        </StatusPill>
      )}

      <ButtonRow>
        <ActionButton
          variant="secondary"
          onPress={onReportDanger}
          activeOpacity={0.8}
        >
          <ActionButtonText variant="secondary">위험 제보</ActionButtonText>
        </ActionButton>
        <ActionButton variant="danger" onPress={onClose} activeOpacity={0.8}>
          <ActionButtonText variant="danger">안내 종료</ActionButtonText>
        </ActionButton>
      </ButtonRow>
    </AnimatedBottomSheet>
  );
};
