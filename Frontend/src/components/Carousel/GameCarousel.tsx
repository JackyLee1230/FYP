import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel, { EmblaOptionsType } from 'embla-carousel-react'
import {
  PrevButton,
  NextButton,
  usePrevNextButtons
} from './CarouselArrowButtons'
import CarouselGameCard from "@/components/CarouselGameCard";
import { GameInfo } from '@/type/game';

type PropType = {
  options?: EmblaOptionsType
  gameList: GameInfo[],
}
  
const GameCarousel: React.FC<PropType> = ({ options, gameList }:PropType) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi);

  return (
    <section className="game">
      <div className="game__viewport" ref={emblaRef}>
        <div className="game__container">
          {gameList.map((gameData) => (
            <div key={gameData.id} className="game__slide">
              <CarouselGameCard  gameData={gameData} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
        <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
      </div>
    </section>
  )
}

export default GameCarousel;