import React from 'react'
import { Text, TextProps } from 'rebass'
import styled from 'styled-components'
import { Colors } from '../styled'

const TextWrapper = styled(Text)<{ color: keyof Colors }>`
  color: ${({ color, theme }) => (theme as any)[color]};
`

export const TYPE = {
  // --- GUNI STYLES ---
  heading1(props: TextProps) {
    return <TextWrapper fontWeight={700} fontSize={[16, 24]} color={'red4'} {...props} />
  },
  heading2(props: TextProps) {
    return <TextWrapper fontWeight={700} fontSize={[14, 16]} color={'white'} {...props} />
  },
  heading3(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={[13, 18]} color={'heading3'} {...props} />
  },
  heading4(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={[13, 16]} color={'heading3'} {...props} />
  },
  heading5(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={[14, 18]} color={'heading3'} {...props} />
  },
  heading6(props: TextProps) {
    return <TextWrapper fontWeight={700} fontSize={[16, 18]} color={'heading6'} {...props} />
  },
  description(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={[13, 16]} color={'text7'} {...props} />
  },
  button2(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={[13, 16]} color={'white'} {...props} />
  },
  // --- UNISWAP STYLES ---
  main(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text2'} {...props} />
  },
  link(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'primary1'} {...props} />
  },
  label(props: TextProps) {
    return <TextWrapper fontWeight={600} color={'text1'} {...props} />
  },
  black(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text1'} {...props} />
  },
  white(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'white'} {...props} />
  },
  body(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} color={'text1'} {...props} />
  },
  largeHeader(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={24} {...props} />
  },
  mediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={20} {...props} />
  },
  subHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} {...props} />
  },
  small(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={11} {...props} />
  },
  blue(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'blue1'} {...props} />
  },
  yellow(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'yellow3'} {...props} />
  },
  darkGray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text3'} {...props} />
  },
  gray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'bg3'} {...props} />
  },
  italic(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={12} fontStyle={'italic'} color={'text2'} {...props} />
  },
  error({ error, ...props }: { error: boolean } & TextProps) {
    return <TextWrapper fontWeight={500} color={error ? 'red1' : 'text2'} {...props} />
  },
}
