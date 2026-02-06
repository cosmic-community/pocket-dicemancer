import { getAllGameData } from '@/lib/cosmic';
import GameBoard from '@/components/GameBoard';

export const revalidate = 3600;

export default async function PlayPage() {
  const gameData = await getAllGameData();

  return (
    <div className="min-h-screen bg-dungeon-900">
      <GameBoard gameData={gameData} />
    </div>
  );
}