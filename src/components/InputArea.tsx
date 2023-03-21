// create react functional component that wraps a textarea element and provides a throttled character count
import React, { useState, useEffect } from 'react'

import { useThrottledCallback, useDebounce } from 'use-debounce'

// import tokenCounter from '../utils/tokenCounter'

export interface InputAreaProps {
  type?: 'text' | 'textarea'
  name?: string
  id?: string
  value?: string
  label?: string
  a11yLabel?: string
  onChange?: (val: string) => void
  countType?: 'words' | 'characters' | 'tokens' | 'bytes'
  countPosition?: 'top' | 'bottom'
  countAlign?: 'left' | 'right'
  labelPosition?: 'top' | 'left'
  delay?: number
  maxCount?: number
  required?: boolean
  disabled?: boolean
}

const countInput = (input: string, countType: string): number => {
  switch (countType) {
    case 'tokens':
    // return tokenCounter(input)
    // eslint-disable-next-line no-fallthrough
    case 'words':
      return input.split(' ').length
    case 'bytes':
      return new TextEncoder().encode(input).length
    case 'characters':
    default:
      return input.length
  }
}

const InputArea = ({
  value = '',
  type = 'textarea',
  labelPosition = 'top',
  countType,
  countPosition,
  countAlign,
  delay = 300,
  required = false,
  disabled = false,
  name,
  id,
  label,
  a11yLabel,
  maxCount,
  onChange
}: InputAreaProps): React.ReactElement => {
  const [text, setText] = useState('')
  const [debouncedText] = useDebounce(text, delay)
  const [count, setCount] = useState(0)
  const [warning, setWarning] = useState(false)

  if (typeof name !== 'undefined' && typeof id === 'undefined') {
    id = name
  } else if (typeof name === 'undefined' && typeof id !== 'undefined') {
    name = id
  }

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLInputElement>
  ): void => {
    setText(e.target.value)

    if (typeof onChange === 'function') {
      onChange(e.target.value)
    }
  }

  const updateCount = (input: string): void => {
    if (typeof countType !== 'undefined') {
      setCount(countInput(input, countType))
    }
  }

  // throttle the character count update to every 100ms
  const throttledSetCount = useThrottledCallback(updateCount, delay)

  // update the character count when the text changes
  useEffect(() => {
    if (typeof countType !== 'undefined') {
      throttledSetCount(debouncedText)
    }
  }, [debouncedText, countType])

  useEffect(() => {
    if (typeof maxCount !== 'undefined') {
      if (count > maxCount) {
        setWarning(true)
      }
    }
  }, [count, maxCount])

  useEffect(() => {
    if (typeof value !== 'undefined') {
      setText(value)
    }
  }, [value])

  const renderCount = (): React.ReactElement => {
    if (typeof countType === 'undefined') {
      return <></>
    }

    return (
      <div
        className={`input-area__toolbar${
          typeof countAlign !== 'undefined'
            ? ` input-area__toolbar--${countAlign}`
            : ''
        }${
          typeof countPosition !== 'undefined'
            ? ` input-area__toolbar--${countPosition}`
            : ''
        }`}
        style={{
          flexDirection: countAlign === 'left' ? 'row' : 'row-reverse',
          textAlign: countAlign
        }}>
        <div className="input-area__toolbar__counter">
          {count} {count === 1 ? countType.slice(0, -1) : countType}
        </div>
        {warning ? (
          <div
            className="input-area__counter__warning"
            style={{ display: warning ? 'block' : 'none' }}>
            too many {countType}
          </div>
        ) : (
          <></>
        )}
      </div>
    )
  }

  return (
    <div className="input-area">
      {countPosition === 'top' ? renderCount() : <></>}
      <div
        className={`input-area__input${
          typeof label !== 'undefined'
            ? ` input-area__input--label-${labelPosition}`
            : ''
        }`}>
        {typeof label !== 'undefined' ? (
          <label className="input-area__input__label" htmlFor={id}>
            {label}
          </label>
        ) : (
          <></>
        )}
        {type === 'textarea' ? (
          <textarea
            id={id}
            name={name}
            placeholder="Type your message here"
            onChange={handleChange}
            value={value}
            required={required}
            disabled={disabled}
            aria-label={a11yLabel}
          />
        ) : (
          <input
            id={id}
            name={name}
            placeholder="Type your message here"
            onChange={handleChange}
            value={value}
            required={required}
            disabled={disabled}
            aria-label={a11yLabel}
          />
        )}
      </div>
      {countPosition === 'bottom' ? renderCount() : <></>}
    </div>
  )
}

export default InputArea
