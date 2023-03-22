const formatHandle = (handle: string): string => {
  return handle.replace(/\s/g, '_')
}

export default formatHandle
