// theme/animations.ts
import { Easing } from 'react-native-reanimated';

export const animations = {
  timing: {
    fast: 200,
    medium: 300,
    slow: 500,
    verySlow: 800,
  },
  
  easing: {
    easeInOut: Easing.inOut(Easing.quad),
    easeOut: Easing.out(Easing.quad),
    easeIn: Easing.in(Easing.quad),
    bounce: Easing.bounce,
    elastic: Easing.elastic(1.5),
  },

  spring: {
    gentle: {
      damping: 20,
      stiffness: 90,
    },
    bouncy: {
      damping: 10,
      stiffness: 100,
    },
    snappy: {
      damping: 25,
      stiffness: 120,
    },
  },

  layout: {
    springConfig: {
      damping: 20,
      stiffness: 90,
    },
  },
};