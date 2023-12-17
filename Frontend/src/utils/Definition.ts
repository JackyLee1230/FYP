export const EarlyAccessDefinition =
  "An early access game is a game that is still under development and may undergo significant changes before its final release. The game may not meet the expected standards of quality or content at the current stage. The developers may or may not provide updates or revisions to the game in the future.";

export const DLCDefinition = (baseGame: string | null | undefined) => {
  return `This DLC/Expandsion requires the base game ${baseGame} to play!`;
};

export const GameReceivedForFreeDefinition =
  "Game received for free (Gifted/For Review)";

