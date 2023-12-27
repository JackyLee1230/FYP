import { ButtonBase } from '@mui/material'
import React from 'react'
import Image from "next/image";

type PropType = {
  selected: boolean
  imgSrc: string
  index: number
  onClick: () => void
}

export const Thumb: React.FC<PropType> = ({ selected, imgSrc, index, onClick }: PropType) => {
  return (
    <div
      className={'embla-thumbs__slide'.concat(
        selected ? ' embla-thumbs__slide--selected' : ''
      )}
    >
      <ButtonBase
        onClick={onClick}
        className="embla-thumbs__slide__button"
      >
        <Image
          className="embla-thumbs__slide__img"
          src={imgSrc}
          alt="review image thumbnail"
          width={0}
          height={0}
          style={{width: "100%"}}
          sizes="100vw"
        />
      </ButtonBase>
    </div>
  )
}
