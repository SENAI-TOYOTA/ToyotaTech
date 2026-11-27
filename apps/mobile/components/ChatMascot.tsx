import {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Svg,
} from "react-native-svg";

export type ChatMascotMood = "idle" | "typing" | "happy";
export type ChatMascotVariant = "wheels" | "plain";

interface ChatMascotProps {
  size?: number;
  mood?: ChatMascotMood;
  variant?: ChatMascotVariant;
}

const bodyStartColor = "#FF4152";
const bodyEndColor = "#D40012";
const visorColor = "#8E0010";
const detailColor = "#FFFFFF";
const sparkleColor = "#FF6B7D";
const wheelColor = "#1A1A1A";
const wheelRadius = 4.5;
const wheelHubRadius = 1.5;
const wheelLift = "translate(0 -2.5)";
const sparkleMinSize = 72;

export default function ChatMascot({
  size = 48,
  mood = "idle",
  variant = "wheels",
}: ChatMascotProps) {
  const isHappy = mood === "happy";
  const isTyping = mood === "typing";
  const showSparkles = size >= sparkleMinSize;
  const showWheels = variant === "wheels";

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Defs>
        <LinearGradient id="techyBody" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={bodyStartColor} />
          <Stop offset="1" stopColor={bodyEndColor} />
        </LinearGradient>
      </Defs>
      <G transform={showWheels ? wheelLift : undefined}>
        {showWheels ? (
          <>
            <Circle cx={14} cy={43.5} r={wheelRadius} fill={wheelColor} />
            <Circle cx={34} cy={43.5} r={wheelRadius} fill={wheelColor} />
            <Circle cx={14} cy={43.5} r={wheelHubRadius} fill={detailColor} />
            <Circle cx={34} cy={43.5} r={wheelHubRadius} fill={detailColor} />
          </>
        ) : null}
        <Rect
          x={1.5}
          y={20.5}
          width={6.5}
          height={4.5}
          rx={2.25}
          fill={bodyEndColor}
        />
        <Rect
          x={40}
          y={20.5}
          width={6.5}
          height={4.5}
          rx={2.25}
          fill={bodyEndColor}
        />
        <Path
          d="M4 36C4 24 9.5 14.5 19 12L21 11.4C23 10.8 25 10.8 27 11.4L29 12C38.5 14.5 44 24 44 36C44 38.8 41.8 41 39 41H9C6.2 41 4 38.8 4 36Z"
          fill="url(#techyBody)"
        />
        <Rect
          x={10.5}
          y={16.5}
          width={27}
          height={9.5}
          rx={4.75}
          fill={visorColor}
          stroke={detailColor}
          strokeWidth={1}
        />
        {isTyping ? (
          <>
            <Path
              d="M15.5 21.25h5"
              stroke={detailColor}
              strokeWidth={2.2}
              strokeLinecap="round"
            />
            <Path
              d="M27.5 21.25h5"
              stroke={detailColor}
              strokeWidth={2.2}
              strokeLinecap="round"
            />
          </>
        ) : isHappy ? (
          <>
            <Path
              d="M15.6 21.9c1.2-2.3 3.7-2.3 4.9 0"
              stroke={detailColor}
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M27.6 21.9c1.2-2.3 3.7-2.3 4.9 0"
              stroke={detailColor}
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : (
          <>
            <Ellipse cx={18} cy={21.25} rx={2.2} ry={2.9} fill={detailColor} />
            <Ellipse cx={30} cy={21.25} rx={2.2} ry={2.9} fill={detailColor} />
          </>
        )}
        <Path
          d={
            isHappy
              ? "M15.8 32c3.4 5 13 5 16.4 0"
              : "M17.5 32.5c2.6 4.1 10.4 4.1 13 0"
          }
          stroke={detailColor}
          strokeWidth={2.4}
          strokeLinecap="round"
          fill="none"
        />
      </G>
      {showSparkles ? (
        <>
          <Path
            d="M36.5 4c0.45 4.1 1.9 4.9 5.5 5.5-3.6 0.6-5.05 1.4-5.5 5.5-0.45-4.1-1.9-4.9-5.5-5.5 3.6-0.6 5.05-1.4 5.5-5.5z"
            fill={sparkleColor}
          />
          <Path
            d="M43.2 12.8c0.25 2.35 1.1 2.8 3.2 3.2-2 0.4-2.85 0.85-3.2 3.2-0.25-2.35-1.1-2.8-3.2-3.2 2-0.4 2.85-0.85 3.2-3.2z"
            fill={sparkleColor}
          />
        </>
      ) : null}
    </Svg>
  );
}
