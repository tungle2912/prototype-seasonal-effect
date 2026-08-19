/**
 * Emoji for the tab-animation favicon and for inserting into a message.
 *
 * Each one carries search keywords, because a merchant looking for a sale emoji
 * types "sale", not "label". Sorted the way the picker shows them: expressions,
 * then commerce, then occasions.
 */

export interface EmojiOption {
  emoji: string;
  keywords: string;
}

export const emojiOptions: EmojiOption[] = [
  { emoji: '😎', keywords: 'cool sunglasses' },
  { emoji: '🥳', keywords: 'party celebrate' },
  { emoji: '😍', keywords: 'love heart eyes' },
  { emoji: '🤩', keywords: 'star struck' },
  { emoji: '🥰', keywords: 'love' },
  { emoji: '😱', keywords: 'shock' },
  { emoji: '🔥', keywords: 'fire hot sale' },
  { emoji: '⚡', keywords: 'lightning bolt flash' },
  { emoji: '💥', keywords: 'boom' },
  { emoji: '✨', keywords: 'sparkle star' },
  { emoji: '⭐', keywords: 'star' },
  { emoji: '🌟', keywords: 'star glow' },
  { emoji: '🎁', keywords: 'gift present' },
  { emoji: '🎀', keywords: 'ribbon bow' },
  { emoji: '🛍', keywords: 'shopping bag' },
  { emoji: '🛒', keywords: 'cart' },
  { emoji: '🏷', keywords: 'tag sale price' },
  { emoji: '💸', keywords: 'money cash' },
  { emoji: '💰', keywords: 'money bag' },
  { emoji: '💳', keywords: 'card pay' },
  { emoji: '🎄', keywords: 'christmas tree' },
  { emoji: '🎅', keywords: 'santa' },
  { emoji: '❄', keywords: 'snow snowflake' },
  { emoji: '⛄', keywords: 'snowman' },
  { emoji: '🕯', keywords: 'candle' },
  { emoji: '🔔', keywords: 'bell ring' },
  { emoji: '🧧', keywords: 'red envelope lunar' },
  { emoji: '🏮', keywords: 'lantern' },
  { emoji: '🎃', keywords: 'halloween pumpkin' },
  { emoji: '👻', keywords: 'ghost' },
  { emoji: '🦇', keywords: 'bat' },
  { emoji: '🕸', keywords: 'cobweb' },
  { emoji: '🪔', keywords: 'diwali lamp' },
  { emoji: '🌸', keywords: 'blossom flower' },
  { emoji: '💐', keywords: 'bouquet flowers' },
  { emoji: '🌹', keywords: 'rose' },
  { emoji: '💗', keywords: 'heart pink' },
  { emoji: '❤️', keywords: 'heart red' },
  { emoji: '💚', keywords: 'heart green' },
  { emoji: '💙', keywords: 'heart blue' },
  { emoji: '🍁', keywords: 'leaf autumn' },
  { emoji: '🍀', keywords: 'clover luck' },
  { emoji: '☀️', keywords: 'sun summer' },
  { emoji: '🌙', keywords: 'moon' },
  { emoji: '🎉', keywords: 'confetti party' },
  { emoji: '🎊', keywords: 'confetti ball' },
  { emoji: '🎈', keywords: 'balloon' },
  { emoji: '🍬', keywords: 'candy' },
  { emoji: '⏰', keywords: 'clock alarm time' },
  { emoji: '⏳', keywords: 'hourglass time' },
  { emoji: '🚚', keywords: 'delivery truck ship' },
  { emoji: '📦', keywords: 'box parcel' },
  { emoji: '✅', keywords: 'check done' },
  { emoji: '❗', keywords: 'exclamation' },
  { emoji: '❓', keywords: 'question' },
  { emoji: '👀', keywords: 'eyes look' },
  { emoji: '👋', keywords: 'wave hello' },
  { emoji: '🤚', keywords: 'hand stop' },
  { emoji: '👉', keywords: 'point right' },
  { emoji: '💬', keywords: 'chat message' },
  { emoji: '🥶', keywords: 'cold freeze' },
  { emoji: '🤑', keywords: 'money face' },
  { emoji: '😭', keywords: 'cry sad' },
  { emoji: '🙏', keywords: 'please thanks' },
  { emoji: '🏆', keywords: 'trophy win' },
  { emoji: '🥇', keywords: 'medal first' },
  { emoji: '🎯', keywords: 'target' },
  { emoji: '🚀', keywords: 'rocket fast' },
];

export function searchEmoji(query: string): EmojiOption[] {
  const term = query.trim().toLowerCase();
  if (!term) return emojiOptions;
  return emojiOptions.filter(
    (option) => option.keywords.includes(term) || option.emoji === term,
  );
}
