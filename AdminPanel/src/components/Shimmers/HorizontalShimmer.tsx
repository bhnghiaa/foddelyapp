import { StyleSheet, FlatList, View, FlatListProps } from "react-native";
import React from "react";
import { SIZES } from "../../constants/theme";
import ReusableShimmer from "./ReusableShimmer";

interface HorizontalShimmerProps {
  width: number | string;
  height: number | string;
  radius?: number;
  marginRight?: number | string;
}

const HorizontalShimmer: React.FC<HorizontalShimmerProps> = ({
  width,
  height,
  radius,
}) => {
  const shimmerList = [ 1, 2, 3, 4, 5, 6, 7, 8 ];

  return (
    <FlatList
      data={shimmerList}
      horizontal={true}
      contentContainerStyle={{ columnGap: SIZES.medium }}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <View
          style={styles.shimmer}
        >
          <ReusableShimmer width={width} height={height} radius={radius} />
        </View>
      )}
    />
  );
};

export default HorizontalShimmer;

const styles = StyleSheet.create({
  shimmer: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
});
