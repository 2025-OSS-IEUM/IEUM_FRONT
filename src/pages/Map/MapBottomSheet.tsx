import React, { useEffect, useState, useRef } from "react";
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
import * as Location from "expo-location";
import { theme } from "../../styles/theme";

interface MapBottomSheetProps {
  destination?: string;
  instruction?: string;
  onClose?: () => void;
  isPlaying?: boolean;
  panY?: Animated.Value; // Map.tsx에서 공유받는 애니메이션 값
  enableDrag?: boolean;
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
  height: 419px;
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
  width: 150px;
  height: 150px;
  justify-content: center;
  align-items: center;
  margin-top: 70px;
  margin-bottom: 30px;
  position: relative;
`;

const ArrowWrapper = styled.View`
  position: absolute;
  width: 69px;
  height: 82px;
  justify-content: center;
  align-items: center;
`;

const DestinationText = styled.Text`
  color: #a2a2a2;
  text-align: center;
  font-family: ${(props) => props.theme.fonts.semiBold};
  font-size: 20px;
  margin-bottom: 20px;
`;

const InstructionText = styled.Text`
  color: #4a4a4a;
  text-align: center;
  font-family: ${(props) => props.theme.fonts.bold};
  font-size: 24px;
`;

export const MapBottomSheet = ({
  destination = "국립한밭대학교 정문",
  instruction = "50걸음 직진 후 좌회전입니다",
  onClose,
  isPlaying = true,
  panY: externalPanY,
  enableDrag = true,
}: MapBottomSheetProps) => {
  const [heading, setHeading] = useState<number | null>(null);
  const [barHeights, setBarHeights] = useState<number[]>([]);
  const animationInterval = useRef<NodeJS.Timeout | null>(null);

  // 외부에서 주입받은 panY가 없으면 내부에서 생성 (하위 호환성)
  const internalPanY = useRef(new Animated.Value(0)).current;
  const panY = externalPanY || internalPanY;

  const COLLAPSED_Y = 360;
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

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startWatchingHeading = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      subscription = await Location.watchHeadingAsync((location) => {
        if (location.trueHeading >= 0) {
          setHeading(location.trueHeading);
        } else if (location.magHeading >= 0) {
          setHeading(location.magHeading);
        }
      });
    };

    startWatchingHeading();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const arrowRotation = heading !== null ? heading : 0;

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
        <Svg width="150" height="150" viewBox="0 0 150 150" fill="none">
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
          <Svg width="69" height="82" viewBox="0 0 69 82" fill="none">
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
    </AnimatedBottomSheet>
  );
};
