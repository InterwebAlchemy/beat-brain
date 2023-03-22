import React from 'react'

export interface IconButtonProps extends React.ComponentPropsWithRef<'button'> {
  iconName: string
  a11yText: string
  buttonStyle?: 'primary' | 'secondary' | 'danger' | 'success'
  buttonVariant?: 'outlined' | 'iconOnly'
}

const IconButton = ({
  iconName,
  a11yText,
  children,
  className,
  buttonStyle = 'secondary',
  buttonVariant = 'outlined',
  ...props
}: IconButtonProps): React.ReactElement => {
  return (
    <button
      className={`icon-button icon-button--${buttonStyle} icon-button--${buttonVariant} clickable-icon ${
        typeof className !== 'undefined' ? ` ${className}` : ''
      }`}
      title={a11yText}
      {...props}>
      <div className="icon-button__icon" />
      <div className="icon-button__a11y-text">{a11yText}</div>
      {children}
    </button>
  )
}

export default IconButton
