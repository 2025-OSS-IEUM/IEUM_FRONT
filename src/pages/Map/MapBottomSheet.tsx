import React, { useEffect, useState, useRef } from "react";
import { Alert, Animated } from "react-native";
import styled from "styled-components/native";
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Rect } from "react-native-svg";
import * as Location from "expo-location";
import { theme } from "../../styles/theme";

interface MapBottomSheetProps {
  destination?: string;
  instruction?: string;
  onClose?: () => void;
  isPlaying?: boolean;
}

const BottomSheetContainer = styled.View`
  width: 402px;
  height: 419px;
  flex-shrink: 0;
  background-color: #ffffff;
  border-radius: 20px 20px 0 0;
  padding: 20px;
  align-items: center;
  position: relative;
`;

const CloseButton = styled.TouchableOpacity`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
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
`;

const AudioBar = styled.View<{ height: number }>`
  width: 1px;
  height: ${props => props.height}px;
  background-color: #68d0c6;
  border-radius: 0.5px;
`;

const DirectionContainer = styled.View`
  width: 150px;
  height: 150px;
  justify-content: center;
  align-items: center;
  margin-top: 80px;
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
  font-family: ${props => props.theme.fonts.semiBold};
  font-size: 20px;
  margin-bottom: 20px;
`;

const InstructionText = styled.Text`
  color: #4a4a4a;
  text-align: center;
  font-family: ${props => props.theme.fonts.bold};
  font-size: 24px;
`;

export const MapBottomSheet: React.FC<MapBottomSheetProps> = ({
  destination = "국립한밭대학교 정문",
  instruction = "50걸음 직진 후 좌회전입니다",
  onClose,
  isPlaying = true,
}) => {
  const [heading, setHeading] = useState<number | null>(null);
  const [barHeights, setBarHeights] = useState<number[]>([]);
  const animationInterval = useRef<NodeJS.Timeout | null>(null);

  // 오디오 웨이브 바 생성 (약 50개)
  const barCount = 50;

  useEffect(() => {
    // 초기 높이 설정 (최대 28px)
    const initialHeights = Array.from({ length: barCount }, () => Math.random() * 26 + 2);
    setBarHeights(initialHeights);

    if (isPlaying) {
      const animateBars = () => {
        setBarHeights(prev => prev.map(() => Math.random() * 26 + 2));
      };

      // 주기적으로 애니메이션 반복 (100ms마다)
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

      subscription = await Location.watchHeadingAsync(location => {
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

  const handleClose = () => {
    Alert.alert(
      "안내 종료",
      "안내를 종료할까요?",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "종료",
          onPress: onClose,
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  // 화살표는 위쪽을 가리키므로, heading이 0일 때는 0도 회전
  // heading이 북쪽(0도)을 기준으로 회전
  const arrowRotation = heading !== null ? heading : 0;

  return (
    <BottomSheetContainer>
      {isPlaying && barHeights.length > 0 && (
        <AudioWaveContainer>
          {barHeights.map((height, index) => (
            <AudioBar
              key={index}
              height={height}
            />
          ))}
        </AudioWaveContainer>
      )}
      <CloseButton onPress={handleClose}>
        <Svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <Path
            d="M12 13.3998L7.1 18.2998C6.91667 18.4831 6.68334 18.5748 6.4 18.5748C6.11667 18.5748 5.88334 18.4831 5.7 18.2998C5.51667 18.1165 5.425 17.8831 5.425 17.5998C5.425 17.3165 5.51667 17.0831 5.7 16.8998L10.6 11.9998L5.7 7.0998C5.51667 6.91647 5.425 6.68314 5.425 6.3998C5.425 6.11647 5.51667 5.88314 5.7 5.6998C5.88334 5.51647 6.11667 5.4248 6.4 5.4248C6.68334 5.4248 6.91667 5.51647 7.1 5.6998L12 10.5998L16.9 5.6998C17.0833 5.51647 17.3167 5.4248 17.6 5.4248C17.8833 5.4248 18.1167 5.51647 18.3 5.6998C18.4833 5.88314 18.575 6.11647 18.575 6.3998C18.575 6.68314 18.4833 6.91647 18.3 7.0998L13.4 11.9998L18.3 16.8998C18.4833 17.0831 18.575 17.3165 18.575 17.5998C18.575 17.8831 18.4833 18.1165 18.3 18.2998C18.1167 18.4831 17.8833 18.5748 17.6 18.5748C17.3167 18.5748 17.0833 18.4831 16.9 18.2998L12 13.3998Z"
            fill="#4A4A4A"
          />
        </Svg>
      </CloseButton>

      <DirectionContainer>
        <Svg
          width="150"
          height="150"
          viewBox="0 0 150 150"
          fill="none"
        >
          <Defs>
            <LinearGradient
              id="paint0_linear_334_368"
              x1="75"
              y1="0"
              x2="75"
              y2="150"
              gradientUnits="userSpaceOnUse"
            >
              <Stop stopColor="#68D0C6" />
              <Stop
                offset="1"
                stopColor="#0076EF"
              />
            </LinearGradient>
          </Defs>
          <Circle
            cx="75"
            cy="75"
            r="72.5"
            stroke="url(#paint0_linear_334_368)"
            strokeWidth="5"
          />
        </Svg>
        <ArrowWrapper
          style={{
            transform: [{ rotate: `${arrowRotation ?? 0}deg` }],
          }}
        >
          <Svg
            width="69"
            height="82"
            viewBox="0 0 69 82"
            fill="none"
          >
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
                <Stop
                  offset="1"
                  stopColor="#0076EF"
                />
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
    </BottomSheetContainer>
  );
};
