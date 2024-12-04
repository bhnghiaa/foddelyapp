import { StyleSheet, Image } from 'react-native'
import React from 'react'

interface NetworkImageProps {
  source: string,
  width: number,
  height: number,
  radius: number,
}

const NetworkImage = ({ source, width, height, radius }: NetworkImageProps) => {
  return (
    <Image
      source={{ uri: source }}
      style={[ styles(width, height, radius).image ]}

    />
  )
}

export default NetworkImage

const styles = (width: number, height: number, radius: number) => StyleSheet.create({
  image: {
    width: width,
    height: height,
    borderRadius: radius,
    resizeMode: "cover",
  }
})