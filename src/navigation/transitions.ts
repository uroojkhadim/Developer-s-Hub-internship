import { TransitionPresets } from '@react-navigation/stack';
import { StackCardInterpolationProps } from '@react-navigation/stack/lib/typescript/src/types';

// Custom transition configurations for smooth animations
export const ScreenTransitions = {
  // Default modal transition with slide from bottom
  ModalSlideFromBottom: {
    ...TransitionPresets.ModalSlideFromBottomIOS,
    cardStyleInterpolator: ({ current, layouts }: StackCardInterpolationProps) => ({
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
          extrapolate: 'clamp',
        }),
      },
    }),
  },

  // Fade transition for seamless screen changes
  FadeTransition: {
    gestureDirection: 'horizontal',
    cardStyleInterpolator: ({ current }: StackCardInterpolationProps) => ({
      cardStyle: {
        opacity: current.progress,
      },
    }),
    headerStyleInterpolator: ({ current }: StackCardInterpolationProps) => ({
      opacity: current.progress,
    }),
  },

  // Scale transition for modal-like effects
  ScaleTransition: {
    ...TransitionPresets.ModalPresentationIOS,
    cardStyleInterpolator: ({ current, next, layouts }: StackCardInterpolationProps) => {
      return {
        cardStyle: {
          transform: [
            {
              scale: next
                ? next.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.9],
                    extrapolate: 'clamp',
                  })
                : 1,
            },
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
      };
    },
  },

  // Slide horizontal with fade
  SlideHorizontalFade: {
    gestureDirection: 'horizontal',
    cardStyleInterpolator: ({ current, layouts }: StackCardInterpolationProps) => ({
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width * 0.3, 0],
            }),
          },
        ],
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        }),
      },
    }),
  },

  // Vertical slide with scale
  VerticalSlideScale: {
    gestureDirection: 'vertical',
    cardStyleInterpolator: ({ current, layouts }: StackCardInterpolationProps) => ({
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height * 0.1, 0],
            }),
          },
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          },
        ],
        opacity: current.progress,
      },
    }),
  },

  // Custom spring animation
  SpringTransition: {
    gestureDirection: 'horizontal',
    transitionSpec: {
      open: {
        animation: 'spring',
        config: {
          stiffness: 1000,
          damping: 500,
          mass: 3,
        },
      },
      close: {
        animation: 'spring',
        config: {
          stiffness: 1000,
          damping: 500,
          mass: 3,
        },
      },
    },
    cardStyleInterpolator: ({ current, layouts }: StackCardInterpolationProps) => ({
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    }),
  },
};

// Default transition for most screens
export const DefaultTransition = ScreenTransitions.SlideHorizontalFade;

// Modal transition for overlay screens
export const ModalTransition = ScreenTransitions.ModalSlideFromBottom;

// Fast transition for quick navigation
export const FastTransition = {
  ...TransitionPresets.SlideFromRightIOS,
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 200,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 200,
      },
    },
  },
};