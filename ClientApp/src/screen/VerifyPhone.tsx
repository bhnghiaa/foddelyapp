import { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props { }
const VerifyPhone: FC<Props> = (props) => {
    return <View style={styles.container}><Text>VerifyPhone</Text></View>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default VerifyPhone;