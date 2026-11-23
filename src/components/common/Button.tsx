import { useTheme } from '@/store/theme/hook'
import { useMemo, useRef, useImperativeHandle, forwardRef, useState } from 'react'
import { useHorizontalMode } from '@/utils/hooks'
import { Pressable, type PressableProps, StyleSheet, type View, type ViewProps } from 'react-native'
// import { AppColors } from '@/theme'


export interface BtnProps extends PressableProps {
  ripple?: PressableProps['android_ripple']
  style?: ViewProps['style']
  onChangeText?: (value: string) => void
  onClearText?: () => void
  children: React.ReactNode
}


export interface BtnType {
  measure: (callback: (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => void) => void
}

export default forwardRef<BtnType, BtnProps>(({ ripple: propsRipple = {}, disabled, children, style, onFocus, onBlur, ...props }, ref) => {
  const theme = useTheme()
  const isTV = useHorizontalMode()
  const [focused, setFocused] = useState(false)
  const btnRef = useRef<View>(null)
  const ripple = useMemo(() => ({
    color: theme['c-primary-light-200-alpha-700'],
    ...propsRipple,
  }), [theme, propsRipple])

  useImperativeHandle(ref, () => ({
    measure(callback) {
      btnRef.current?.measure(callback)
    },
  }))

  return (
    <Pressable
      android_ripple={ripple}
      disabled={disabled}
      style={StyleSheet.compose(
        { opacity: disabled ? 0.3 : 1 },
        [style, isTV && focused ? { borderWidth: 2, borderColor: '#42CFF8', backgroundColor: 'rgba(40, 200, 245, 0.16)' } : null],
      )}
      onFocus={(event) => { setFocused(true); onFocus?.(event) }}
      onBlur={(event) => { setFocused(false); onBlur?.(event) }}
      {...props}
      ref={btnRef}
    >
      {children}
    </Pressable>
  )
})

