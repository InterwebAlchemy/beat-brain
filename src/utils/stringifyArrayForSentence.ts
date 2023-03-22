export interface StringifyArrayForSentenceOptions {
  separator: string
  oxfordComma: boolean
  finalConjunction: string
}

const DEFAULT_OPTIONS: StringifyArrayForSentenceOptions = {
  separator: ',',
  oxfordComma: true,
  finalConjunction: 'and'
}

const stringifyArrayForSentence = (
  array: string[],
  options: StringifyArrayForSentenceOptions = DEFAULT_OPTIONS
): string => {
  const { separator, oxfordComma, finalConjunction } = {
    ...DEFAULT_OPTIONS,
    ...options
  }

  if (array.length === 0) {
    return ''
  }

  if (array.length === 1) {
    return array[0]
  }

  if (array.length === 2) {
    return array.join(` ${finalConjunction} `)
  }

  if (oxfordComma) {
    return array
      .map((item, index, array) => {
        if (index === array.length - 1) {
          return `${finalConjunction} ${item}`
        }

        return item
      })
      .join(`${separator} `)
  }

  return array
    .map((item, index, array) => {
      // return final item without any adjustments
      if (index === array.length - 1) {
        return item
      }

      // add the conjunction as a suffix to the second to last item
      if (index === array.length - 2) {
        return `${item} ${finalConjunction}`
      }

      // add comma after every item except the last one
      return `${item}${separator}`
    })
    .join(' ')
}

export default stringifyArrayForSentence
