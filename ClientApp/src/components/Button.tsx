import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { COLORS } from "../constants/theme";

const Button = ({ title, onPress, isValid, loader }: { title: string, onPress: () => void, isValid: boolean, loader: boolean }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[ styles.btnStyle, { backgroundColor: !isValid ? COLORS.gray : COLORS.primary } ]}
    >
      {!loader ? (
        <Text style={styles.btnTxt}>{title}</Text>
      ) : (
        <ActivityIndicator />
      )}
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  btnTxt: {
    fontFamily: "bold",
    color: COLORS.white,
    fontSize: 18,
  },
  btnStyle: {
    height: 50,
    width: "100%",
    marginVertical: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
});
