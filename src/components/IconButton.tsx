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
      className={`ai-research-assistant__icon-button ai-research-assistant__icon-button--${buttonStyle} ai-research-assistant__icon-button--${buttonVariant} clickable-icon ${
        typeof className !== 'undefined' ? ` ${className}` : ''
      }`}
      title={a11yText}
      {...props}>
      <div className="ai-research-assistant__icon-button__icon" />
      <div className="ai-research-assistant__icon-button__a11y-text">
        {a11yText}
      </div>
      {children}
    </button>
  )
}

export default IconButton
