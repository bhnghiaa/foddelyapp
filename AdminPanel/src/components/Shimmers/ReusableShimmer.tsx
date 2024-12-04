import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { COLORS } from "../../constants/theme";

const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);
interface ReusableShimmerProps {
  width: number | string;
  height: number | string;
  radius?: number;
  marginRight?: number | string;
}
const ReusableShimmer = ({ width, height, radius, marginRight }: ReusableShimmerProps) => {
  return (
    <ShimmerPlaceHolder
      style={{
        width: width,
        height: height,
        borderRadius: radius,
        marginRight: marginRight,
      }}
      shimmerColors={[ COLORS.secondary1, COLORS.secondary, COLORS.secondary1 ]}
    >
    </ShimmerPlaceHolder>
  );
}

export default ReusableShimmer;
