import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PANCH_TATTVA_GRADIENT } from '../../config/theme';

interface PanchTattvaRibbonProps {
  height?: number;
}

export const PanchTattvaRibbon: React.FC<PanchTattvaRibbonProps> = ({ height = 3.5 }) => {
  return (
    <View style={[styles.container, { height }]}>
      <LinearGradient
        colors={PANCH_TATTVA_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    width: '100%',
  },
});
