export interface SliderOptions {
  blocksPerView?: number;
  slideTime?: number;
  movesPerClick?: number;
  initialSlide?: number;
  loop?: boolean;
  /**
   * Enables transition between first and last slide.
   * NOTE?: Be aware of bad performance on mobile phones
   */
  firstToLastTransition?: boolean;
}
