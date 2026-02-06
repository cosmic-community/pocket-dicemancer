import Link from 'next/link';
import { getDiceDefinitions, getElementEffects } from '@/lib/cosmic';
import type { ElementColor } from '@/types';

export const revalidate = 3600;

const ELEMENT_BG: Record<string, string> = {
  red: 'bg-fire/20 border-fire/40 text-fire',
  blue: 'bg-ice/20 border-ice/40 text-ice',
  green: 'bg-poison/20 border-poison/40 text-poison',
  yellow: 'bg-lightning/20 border-lightning/40 text-lightning',
  orange: 'bg-burn/20 border-burn/40 text-burn',
  purple: 'bg-heal/20 border-heal/40 text-heal',
  gray: 'bg-stun/20 border-stun/40 text-stun',
};

const TIER_BG: Record<string, string> = {
  common: 'bg-gray-600/20 text-gray-300',
  rare: 'bg-ice/20 text-ice',
  epic: 'bg-heal/20 text-heal',
  legendary: 'bg-lightning/20 text-lightning',
};

export default async function CodexPage() {
  const [dice, elements] = await Promise.all([
    getDiceDefinitions(),
    getElementEffects(),
  ]);

  const sortedDice = [...dice].sort((a, b) => {
    const tierOrder: Record<string, number> = { common: 0, rare: 1, epic: 2, legendary: 3 };
    const tA = tierOrder[a.metadata.tier.key] ?? 0;
    const tB = tierOrder[b.metadata.tier.key] ?? 0;
    if (tA !== tB) return tA - tB;
    return a.metadata.element.key.localeCompare(b.metadata.element.key);
  });

  return (
    <div className="min-h-screen bg-dungeon-900">
      <header className="bg-dungeon-800 border-b border-dungeon-600">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Back
          </Link>
          <h1 className="text-xl font-bold">📖 Codex</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Elements Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">⚔️ Element Effects</h2>
          <div className="grid gap-4">
            {elements.map(el => {
              const colorKey = el.metadata.element_color.key as ElementColor;
              const colorClass = ELEMENT_BG[colorKey] ?? 'bg-dungeon-700 border-dungeon-500 text-gray-300';
              return (
                <div
                  key={el.id}
                  className={`rounded-xl p-5 border ${colorClass} animate-fade-in`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{el.metadata.element_emoji}</span>
                    <div>
                      <h3 className="font-bold text-lg">{el.title}</h3>
                      <span className="text-xs opacity-70">{el.metadata.element_color.value}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm mb-3">
                    <span>⚡ {el.metadata.instant_damage_percent}% instant</span>
                    <span>🕐 {el.metadata.dot_damage_percent}% DoT</span>
                    {el.metadata.dot_duration > 0 && (
                      <span>📊 {el.metadata.dot_duration} turns</span>
                    )}
                  </div>
                  {el.metadata.special_mechanic && (
                    <p className="text-sm opacity-80 italic">{el.metadata.special_mechanic}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Dice Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">🎲 Dice Collection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sortedDice.map(die => {
              const colorKey = die.metadata.element.key as ElementColor;
              const colorClass = ELEMENT_BG[colorKey] ?? 'bg-dungeon-700 border-dungeon-500 text-gray-300';
              const tierClass = TIER_BG[die.metadata.tier.key] ?? '';
              return (
                <div
                  key={die.id}
                  className={`rounded-xl p-4 border ${colorClass} animate-fade-in`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{die.metadata.element_emoji}</span>
                      <span className="font-bold text-sm">{die.title}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${tierClass}`}>
                      {die.metadata.tier_pips} {die.metadata.tier.value}
                    </span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {die.metadata.face_values.map((v, i) => (
                      <div
                        key={i}
                        className={`w-9 h-9 rounded flex items-center justify-center text-xs font-bold ${
                          v === 0 ? 'bg-black/40 text-red-400' : 'bg-white/10'
                        }`}
                      >
                        {v === 0 ? '☠️' : `${die.metadata.element_emoji.repeat(v)}`}
                      </div>
                    ))}
                  </div>
                  {die.metadata.has_skull && (
                    <div className="text-xs text-red-400/70">☠️ Has skull face (miss)</div>
                  )}
                  {die.metadata.special_effect_description && (
                    <div className="text-xs italic opacity-70 mt-1">
                      ✨ {die.metadata.special_effect_description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}