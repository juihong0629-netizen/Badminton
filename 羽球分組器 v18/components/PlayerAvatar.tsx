
import React from 'react';
import { Player, Gender } from '../types';
import { MALE_AVATAR_URL, FEMALE_AVATAR_URL } from '../assets';

interface PlayerAvatarProps {
  player: Player;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player }) => {
  const isMale = player.gender === Gender.Male;

  return (
    <div className="flex flex-col items-center space-y-1">
       <div className="w-24 h-24 overflow-hidden">
        <img
          src={isMale ? MALE_AVATAR_URL : FEMALE_AVATAR_URL}
          className="w-full h-full object-cover"
          alt="player"
        />
       </div>
      <p className="text-on-surface text-3xl truncate w-32 text-center">{player.name}</p>
    </div>
  );
};
