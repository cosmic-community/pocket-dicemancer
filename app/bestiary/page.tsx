import Link from 'next/link';
import { getEnemyTypes } from '@/lib/cosmic';

export const revalidate = 3600;

// Changed: Added fallback emoji map for bestiary display
const ENEMY_EMOJI_MAP: Record<string, string> = {
  'Rat': '🐀',
  'Skeleton': '💀',
  'Goblin': '👺',
  'Orc': '👹',
  'Slime': '🟢',
  'Spider': '🕷️',
  'Healer Mage': '🧙',
  'Dragon': '🐉',
  'Mimic': '📦',
  'Wraith': '👻',
};

export default async function BestiaryPage() {
  const enemies = await getEnemyTypes();

  const sortedEnemies = [...enemies].sort((a, b) => {
    if (a.metadata.is_boss !== b.metadata.is_boss) return a.metadata.is_boss ? 1 : -1;
    return a.metadata.min_floor - b.metadata.min_floor;
  });

  return (
    <div className="min-h-screen bg-dungeon-900">
      <header className="bg-dungeon-800 border-b border-dungeon-600">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Back
          </Link>
          <h1 className="text-xl font-bold">👹 Bestiary</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-400 text-center mb-8">
          All {enemies.length} enemies lurking in the dungeon. Data powered by Cosmic CMS.
        </p>

        <div className="space-y-4">
          {sortedEnemies.map(enemy => {
            // Changed: Get fallback emoji
            const fallbackEmoji = ENEMY_EMOJI_MAP[enemy.title] ?? '👹';

            return (
              <div
                key={enemy.id}
                className={`bg-dungeon-800 rounded-xl border ${
                  enemy.metadata.is_boss ? 'border-fire/40' : 'border-dungeon-600'
                } overflow-hidden flex animate-fade-in`}
              >
                {/* Changed: Better image display with fallback emoji */}
                <div className={`w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 bg-dungeon-700 ${enemy.metadata.is_boss ? 'border-r border-fire/20' : 'border-r border-dungeon-600'}`}>
                  {enemy.metadata.enemy_image ? (
                    <img
                      src={`${enemy.metadata.enemy_image.imgix_url}?w=400&h=400&fit=crop&auto=format,compress`}
                      alt={enemy.title}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      {fallbackEmoji}
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className={`font-bold text-lg ${enemy.metadata.is_boss ? 'text-fire' : 'text-white'}`}>
                      {enemy.title}
                    </h2>
                    {enemy.metadata.is_boss && (
                      <span className="text-xs bg-fire/20 text-fire px-2 py-0.5 rounded-full font-semibold">
                        BOSS
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-gray-300 mb-3">
                    <span>❤️ {enemy.metadata.hp} HP</span>
                    <span>⚔️ {enemy.metadata.damage} DMG</span>
                    <span>⏱️ {enemy.metadata.attack_timer} turns</span>
                    <span>🏰 Floor {enemy.metadata.min_floor}+</span>
                  </div>

                  {enemy.metadata.special_ability && (
                    <p className="text-xs text-gray-500 italic">
                      💡 {enemy.metadata.special_ability}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}