import { StyleSheet, FlatList, View } from "react-native";
import React from "react";
import { SIZES } from "../../constants/theme";
import ReusableShimmer from "./ReusableShimmer";

interface VerticalShimmerProps {
    width: number | string;
    height: number | string;
    radius?: number;
    marginBottom?: number | string;
}

const VerticalShimmer: React.FC<VerticalShimmerProps> = ({
    width,
    height,
    radius,
}) => {
    const shimmerList = [ 1, 2, 3, 4, 5, 6, 7, 8 ];

    return (
        <View>
            {shimmerList.map((item, index) => (
                <View key={index} style={styles.shimmer}>
                    <ReusableShimmer width={width} height={height} radius={radius} />
                </View>
            ))}
        </View>
    );
};

export default VerticalShimmer;

const styles = StyleSheet.create({
    shimmer: {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        marginBottom: SIZES.medium,
    },
});
