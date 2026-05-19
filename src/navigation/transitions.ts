import type { Transition } from 'framer-motion'

export const PM_EASE_FLAGSHIP: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const TAB_TRANSITION: Transition = {
  duration: 0.38,
  ease: PM_EASE_FLAGSHIP,
}

export const STACK_TRANSITION: Transition = {
  duration: 0.4,
  ease: PM_EASE_FLAGSHIP,
}
