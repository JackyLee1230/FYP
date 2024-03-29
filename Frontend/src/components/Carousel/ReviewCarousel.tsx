import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel, { EmblaOptionsType } from 'embla-carousel-react'
import {
  PrevButton,
  NextButton,
  usePrevNextButtons
} from './CarouselArrowButtons'
import { Thumb } from './CarouselThumbsButton'
import { useTheme } from '@mui/material/styles';
import ImageBackdrop from '@/components/ImageBackdrop';
import { Button } from '@mui/material';
import Image from "next/image";

type PropType = {
  options?: EmblaOptionsType
  images: string[]
}

const NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX =
  process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX;

const ReviewCarousel: React.FC<PropType> = ({ options, images }:PropType) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel(options)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true
  })

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi)

   const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaApi || !emblaThumbsApi) return
      emblaApi.scrollTo(index)
    },
    [emblaApi, emblaThumbsApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi || !emblaThumbsApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaThumbsApi.scrollTo(emblaApi.selectedScrollSnap())
  }, [emblaApi, emblaThumbsApi, setSelectedIndex])

  const handleClose = () => {
    setOpen(false);
  }

  const handleOpen = () => {
    setOpen(true);
  }

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  return (
    <div className="review">
      <div className="review__viewport" ref={emblaRef}>
        <div className="review__container">
            {images.map((image, index) => (
                <div className="review__slide" key={index}>
                    <div 
                      className="review__slide__number"           
                      style={{
                        backgroundColor: theme.palette.primary.main,
                        opacity: 0.8,
                      }}
                    >
                        <span 
                          style={{
                            color: "white",
                          }}
                        >
                          {index + 1}
                        </span>
                    </div>
                    <div       
                      style={{
                        opacity: 0.8,
                        position: "absolute",
                        top: "0.6rem",
                        left: "2.6rem",
                      }}
                    >
                      <Button variant='contained' color="info" onClick={handleOpen}>
                        View Image
                      </Button>
                    </div>
                    <Image
                        className="review__slide__img"
                        src={`${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${image}`}
                        alt="review image"
                        width={0}
                        height={0}
                        style={{width: "100%"}}
                        sizes="100vw"
                    />
                    <Image
                        className="review__slide__img_background"
                        src={`${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${image}`}
                        alt="review image background"
                        width={0}
                        height={0}
                        style={{width: "100%"}}
                        sizes="100vw"
                    />
                </div>
            ))}
        </div>
      </div>
      <ImageBackdrop open={open} handleClose={handleClose} imageUrl={`${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${images[selectedIndex]}`}/>

      <div className="review__buttons">
        <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
        <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
      </div>

      <div className="review-thumbs">
        <div className="review-thumbs__viewport" ref={emblaThumbsRef}>
          <div className="review-thumbs__container">
            {images.map((image, index) => (
                <Thumb
                    onClick={() => onThumbClick(index)}
                    selected={index === selectedIndex}
                    index={index}
                    imgSrc={`${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${image}`}
                    key={index}
                />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewCarousel
