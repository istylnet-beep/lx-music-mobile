import { useCallback, useRef, forwardRef, useImperativeHandle, useState } from 'react'
import { useHorizontalMode } from '@/utils/hooks'
// import { StyleSheet } from 'react-native'
import Input, { type InputType, type InputProps } from '@/components/common/Input'

export interface SearchInputProps {
  onChangeText: (text: string) => void
  onSubmit: (text: string) => void
  onBlur: () => void
  onTouchStart: () => void
}

export interface SearchInputType {
  setText: (text: string) => void
  // getText: () => string
  focus: () => void
  blur: () => void
}

export default forwardRef<SearchInputType, SearchInputProps>(({ onChangeText, onSubmit, onBlur, onTouchStart }, ref) => {
  const isTV = useHorizontalMode()
  const [focused, setFocused] = useState(false)
  const [text, setText] = useState('')
  const inputRef = useRef<InputType>(null)

  useImperativeHandle(ref, () => ({
    // getText() {
    //   return text.trim()
    // },
    setText(text) {
      setText(text)
    },
    focus() {
      inputRef.current?.focus()
    },
    blur() {
      inputRef.current?.blur()
    },
  }))

  const handleChangeText = (text: string) => {
    setText(text)
    onChangeText(text.trim())
  }

  const handleClearText = useCallback(() => {
    setText('')
    onChangeText('')
    onSubmit('')
  }, [onChangeText, onSubmit])

  const handleSubmit = useCallback<NonNullable<InputProps['onSubmitEditing']>>(({ nativeEvent: { text } }) => {
    onSubmit(text)
  }, [onSubmit])

  return (
    <Input
      ref={inputRef}
      placeholder="搜尋歌曲、歌手或專輯..."
      value={text}
      onChangeText={handleChangeText}
      // TV focus styling is applied below.
      onSubmitEditing={handleSubmit}
      onClearText={handleClearText}
      onTouchStart={onTouchStart}
      clearBtn
      size={isTV ? 18 : 14}
      onFocus={() => { setFocused(true) }}
      onBlur={() => { setFocused(false); onBlur() }}
      style={isTV ? {
        height: 48,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#0B1722',
        borderWidth: 2,
        borderColor: focused ? '#42CFF8' : '#263B4B',
      } : undefined}
    />
  )
})
