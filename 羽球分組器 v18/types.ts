export enum Gender {
  Male = '男',
  Female = '女',
}

export enum GameMode {
  Doubles = '任意雙打',
  MixedDoubles = '男女混雙',
  MensDoubles = '男子雙打',
  WomensDoubles = '女子雙打',
  MensSingles = '男子單打',
  WomensSingles = '女子單打',
  AnySingles = '任意單打',
}

export interface Player {
  id: string;
  name: string;
  gender: Gender;
  playCount: number;
  isPriority?: boolean;
}

export interface Match {
  teamA: Player[];
  teamB: Player[];
}