import React, {
    PropsWithChildren,
    useCallback,
    useEffect,
    useState
  } from 'react'
import { EmblaCarouselType } from 'embla-carousel-react'
import {  ButtonBase, styled } from "@mui/material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTheme } from '@mui/material/styles';

  
type UsePrevNextButtonsType = {
  prevBtnDisabled: boolean
  nextBtnDisabled: boolean
  onPrevButtonClick: () => void
  onNextButtonClick: () => void
}
  
export const usePrevNextButtons = (
  emblaApi: EmblaCarouselType | undefined
): UsePrevNextButtonsType => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true)

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollPrev()
  }, [emblaApi])

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev())
    setNextBtnDisabled(!emblaApi.canScrollNext())
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    onSelect(emblaApi)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('select', onSelect)
  }, [emblaApi, onSelect])

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  }
}

type PropType = PropsWithChildren<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
>

export const PrevButton: React.FC<PropType> = ({ children, ...restProps }: any) => {
  const theme = useTheme();

  const StyledChevronLeftIcon = styled(ChevronLeftIcon)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: 24,
  }));


  return (
    <ButtonBase
      className="embla__button embla__button--prev"
      sx={{
        position: "absolute",
        zIndex: 10,
        opacity: 0.8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 48,
        height: 48,
        borderRadius: "50%",
        borderColor: theme.palette.primary.main,
        border: "2px solid",
        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
        backgroundColor: "white",
      }}
      {...restProps}
    >
      <StyledChevronLeftIcon />
      {children}
    </ButtonBase>
  )
}

export const NextButton: React.FC<PropType> = ({ children, ...restProps }: any) => {
  const theme = useTheme();

  const StyledChevronRightIcon = styled(ChevronRightIcon)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: 24,
  }));

  return (
    <ButtonBase
      className="embla__button embla__button--next"
      sx={{
        position: "absolute",
        opacity: 0.8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 48,
        height: 48,
        borderRadius: "50%",
        borderColor: theme.palette.primary.main,
        border: "2px solid",
        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
        backgroundColor: "white",
      }}
      {...restProps}
    >
      <StyledChevronRightIcon />
      {children}
    </ButtonBase>
  )
}
