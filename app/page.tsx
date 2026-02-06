import Link from 'next/link';
import { getAllGameData } from '@/lib/cosmic';

export const revalidate = 3600;

export default async function HomePage() {
  const { dice, elements, enemies } = await getAllGameData();

  const bosses = enemies.filter(e => e.metadata.is_boss);
  const regularEnemies = enemies.filter(e => !e.metadata.is_boss);

  return (
    <div className="min-h-screen bg-dungeon-900">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-dungeon-900 to-fire/10" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🎲</div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fire via-lightning to-heal">
              Pocket
            </span>
            <br />
            <span className="text-white">Dicemancer</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            A turn-based dice battler combining inventory management, color matching combos, and Yahtzee-style rerolling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/play"
              className="btn-game bg-gradient-to-r from-fire to-burn text-white px-8 py-4 text-lg rounded-xl shadow-lg shadow-fire/30 hover:shadow-fire/50 hover:scale-105"
            >
              ⚔️ Start Dungeon Run
            </Link>
            <Link
              href="/bestiary"
              className="btn-game bg-dungeon-700 text-gray-200 px-8 py-4 text-lg rounded-xl border border-dungeon-500 hover:bg-dungeon-600"
            >
              👹 Bestiary
            </Link>
            <Link
              href="/codex"
              className="btn-game bg-dungeon-700 text-gray-200 px-8 py-4 text-lg rounded-xl border border-dungeon-500 hover:bg-dungeon-600"
            >
              📖 Codex
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-dungeon-800 rounded-xl p-6 text-center border border-dungeon-600">
            <div className="text-3xl font-black text-fire">{dice.length}</div>
            <div className="text-sm text-gray-400 mt-1">Dice Types</div>
          </div>
          <div className="bg-dungeon-800 rounded-xl p-6 text-center border border-dungeon-600">
            <div className="text-3xl font-black text-heal">{elements.length}</div>
            <div className="text-sm text-gray-400 mt-1">Elements</div>
          </div>
          <div className="bg-dungeon-800 rounded-xl p-6 text-center border border-dungeon-600">
            <div className="text-3xl font-black text-lightning">{enemies.length}</div>
            <div className="text-sm text-gray-400 mt-1">Enemies</div>
          </div>
        </div>

        {/* Elements Preview */}
        <h2 className="text-2xl font-bold mb-6 text-center">⚔️ Elemental Powers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-12">
          {elements.map(el => (
            <div
              key={el.id}
              className="bg-dungeon-800 rounded-lg p-4 border border-dungeon-600 text-center hover:border-dungeon-400 transition-colors"
            >
              <div className="text-3xl mb-2">{el.metadata.element_emoji}</div>
              <div className="font-semibold text-sm">{el.title}</div>
              <div className="text-xs text-gray-500 mt-1">{el.metadata.element_color.value}</div>
            </div>
          ))}
        </div>

        {/* Enemies Preview */}
        <h2 className="text-2xl font-bold mb-6 text-center">👹 Enemies Await</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {regularEnemies.slice(0, 4).map(enemy => (
            <div
              key={enemy.id}
              className="bg-dungeon-800 rounded-xl overflow-hidden border border-dungeon-600 hover:border-dungeon-400 transition-colors"
            >
              {enemy.metadata.enemy_image && (
                <img
                  src={`${enemy.metadata.enemy_image.imgix_url}?w=400&h=300&fit=crop&auto=format,compress`}
                  alt={enemy.title}
                  width={200}
                  height={150}
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="p-3">
                <div className="font-semibold text-sm">{enemy.title}</div>
                <div className="text-xs text-gray-500">
                  ❤️ {enemy.metadata.hp} HP &middot; ⚔️ {enemy.metadata.damage} DMG
                </div>
              </div>
            </div>
          ))}
        </div>

        {bosses.length > 0 && (
          <>
            <h3 className="text-xl font-bold mb-4 text-center text-fire">🔥 Boss Encounters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              {bosses.map(boss => (
                <div
                  key={boss.id}
                  className="bg-dungeon-800 rounded-xl overflow-hidden border-2 border-fire/30 hover:border-fire/60 transition-colors flex"
                >
                  {boss.metadata.enemy_image && (
                    <img
                      src={`${boss.metadata.enemy_image.imgix_url}?w=300&h=300&fit=crop&auto=format,compress`}
                      alt={boss.title}
                      width={120}
                      height={120}
                      className="w-28 h-28 object-cover"
                    />
                  )}
                  <div className="p-4 flex-1">
                    <div className="font-bold text-fire">{boss.title}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      ❤️ {boss.metadata.hp} HP &middot; ⚔️ {boss.metadata.damage} DMG &middot; ⏱️ {boss.metadata.attack_timer}
                    </div>
                    {boss.metadata.special_ability && (
                      <div className="text-xs text-gray-500 mt-2 italic">{boss.metadata.special_ability}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* How To Play */}
        <div className="bg-dungeon-800 rounded-xl p-6 border border-dungeon-600 mb-8">
          <h2 className="text-xl font-bold mb-4 text-center">🎮 How To Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-2xl">1️⃣</span>
                <p><strong>Conveyor advances</strong> — a new random die appears each turn. Grab it or let it fall!</p>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">2️⃣</span>
                <p><strong>Store or skip</strong> — move dice to your inventory for combo potential, or roll from conveyor for a 2x boost.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">3️⃣</span>
                <p><strong>Roll &amp; reroll</strong> — Yahtzee-style! Hold good results, reroll the rest. Build color combos for bonus damage.</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-2xl">4️⃣</span>
                <p><strong>Apply effects</strong> — Fire burns, Ice shields, Poison ticks, Lightning chains, Purple heals!</p>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">5️⃣</span>
                <p><strong>Survive!</strong> — Enemy attacks when their timer hits zero. Manage your resources carefully.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">⭐</span>
                <p><strong>Discard for tokens</strong> — Trade unwanted dice for bonus rerolls. Skip turns to bank tokens for boss fights.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/play"
            className="btn-game bg-gradient-to-r from-fire to-burn text-white px-10 py-4 text-lg rounded-xl shadow-lg shadow-fire/30 hover:shadow-fire/50 hover:scale-105 inline-block"
          >
            ⚔️ Begin Your Adventure
          </Link>
        </div>
      </section>
    </div>
  );
}