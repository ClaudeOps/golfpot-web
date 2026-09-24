/** Dollar amounts each player contributes to the weekly pools. */
export interface GameRules {
  readonly pointsPerPlayer: number;
  readonly birdiesPerPlayer: number;
}

export const standardRules: GameRules = {
  pointsPerPlayer: 5,
  birdiesPerPlayer: 2,
};

export function entryFee(rules: GameRules): number {
  return rules.pointsPerPlayer + rules.birdiesPerPlayer;
}
