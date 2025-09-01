export interface EmojiData {
  emoji: string
  name: string
  category: string
}

export const emojis: EmojiData[] = [
  // 🐾 Animals & Nature (40)
  { emoji: '🐶', name: 'dog face', category: 'animals' },
  { emoji: '🐱', name: 'cat face', category: 'animals' },
  { emoji: '🐭', name: 'mouse face', category: 'animals' },
  { emoji: '🐹', name: 'hamster face', category: 'animals' },
  { emoji: '🐰', name: 'rabbit face', category: 'animals' },
  { emoji: '🦊', name: 'fox face', category: 'animals' },
  { emoji: '🐻', name: 'bear face', category: 'animals' },
  { emoji: '🐼', name: 'panda face', category: 'animals' },
  { emoji: '🐨', name: 'koala', category: 'animals' },
  { emoji: '🐯', name: 'tiger face', category: 'animals' },
  { emoji: '🦁', name: 'lion face', category: 'animals' },
  { emoji: '🐮', name: 'cow face', category: 'animals' },
  { emoji: '🐷', name: 'pig face', category: 'animals' },
  { emoji: '🐵', name: 'monkey face', category: 'animals' },
  { emoji: '🙈', name: 'see-no-evil monkey', category: 'animals' },
  { emoji: '🙉', name: 'hear-no-evil monkey', category: 'animals' },
  { emoji: '🙊', name: 'speak-no-evil monkey', category: 'animals' },
  { emoji: '🐒', name: 'monkey', category: 'animals' },
  { emoji: '🐔', name: 'chicken', category: 'animals' },
  { emoji: '🐣', name: 'hatching chick', category: 'animals' },
  { emoji: '🐦', name: 'bird', category: 'animals' },
  { emoji: '🦉', name: 'owl', category: 'animals' },
  { emoji: '🦅', name: 'eagle', category: 'animals' },
  { emoji: '🦆', name: 'duck', category: 'animals' },
  { emoji: '🦢', name: 'swan', category: 'animals' },
  { emoji: '🐢', name: 'turtle', category: 'animals' },
  { emoji: '🐍', name: 'snake', category: 'animals' },
  { emoji: '🦎', name: 'lizard', category: 'animals' },
  { emoji: '🐬', name: 'dolphin', category: 'animals' },
  { emoji: '🐳', name: 'whale', category: 'animals' },
  { emoji: '🦈', name: 'shark', category: 'animals' },
  { emoji: '🐊', name: 'crocodile', category: 'animals' },
  { emoji: '🐘', name: 'elephant', category: 'animals' },
  { emoji: '🦒', name: 'giraffe', category: 'animals' },
  { emoji: '🦓', name: 'zebra', category: 'animals' },
  { emoji: '🦛', name: 'hippopotamus', category: 'animals' },
  { emoji: '🦘', name: 'kangaroo', category: 'animals' },
  { emoji: '🦍', name: 'gorilla', category: 'animals' },
  { emoji: '🦧', name: 'orangutan', category: 'animals' },
  { emoji: '🐝', name: 'honeybee', category: 'animals' },

  // 🍴 Food & Drink (30)
  { emoji: '🍏', name: 'green apple', category: 'food' },
  { emoji: '🍎', name: 'red apple', category: 'food' },
  { emoji: '🍐', name: 'pear', category: 'food' },
  { emoji: '🍊', name: 'tangerine', category: 'food' },
  { emoji: '🍋', name: 'lemon', category: 'food' },
  { emoji: '🍌', name: 'banana', category: 'food' },
  { emoji: '🍉', name: 'watermelon', category: 'food' },
  { emoji: '🍇', name: 'grapes', category: 'food' },
  { emoji: '🍓', name: 'strawberry', category: 'food' },
  { emoji: '🍒', name: 'cherries', category: 'food' },
  { emoji: '🍑', name: 'peach', category: 'food' },
  { emoji: '🥭', name: 'mango', category: 'food' },
  { emoji: '🍍', name: 'pineapple', category: 'food' },
  { emoji: '🥥', name: 'coconut', category: 'food' },
  { emoji: '🥝', name: 'kiwi fruit', category: 'food' },
  { emoji: '🍅', name: 'tomato', category: 'food' },
  { emoji: '🥑', name: 'avocado', category: 'food' },
  { emoji: '🍆', name: 'eggplant', category: 'food' },
  { emoji: '🥔', name: 'potato', category: 'food' },
  { emoji: '🥕', name: 'carrot', category: 'food' },
  { emoji: '🌽', name: 'ear of corn', category: 'food' },
  { emoji: '🥒', name: 'cucumber', category: 'food' },
  { emoji: '🥬', name: 'leafy green', category: 'food' },
  { emoji: '🥦', name: 'broccoli', category: 'food' },
  { emoji: '🍔', name: 'hamburger', category: 'food' },
  { emoji: '🍟', name: 'french fries', category: 'food' },
  { emoji: '🍕', name: 'pizza', category: 'food' },
  { emoji: '🌭', name: 'hot dog', category: 'food' },
  { emoji: '🌮', name: 'taco', category: 'food' },
  { emoji: '🥗', name: 'green salad', category: 'food' },

  // ✈️ Travel & Places (30)
  { emoji: '🚗', name: 'car', category: 'travel' },
  { emoji: '🚕', name: 'taxi', category: 'travel' },
  { emoji: '🚙', name: 'sport utility vehicle', category: 'travel' },
  { emoji: '🚌', name: 'bus', category: 'travel' },
  { emoji: '🚎', name: 'trolleybus', category: 'travel' },
  { emoji: '🏎️', name: 'racing car', category: 'travel' },
  { emoji: '🚓', name: 'police car', category: 'travel' },
  { emoji: '🚑', name: 'ambulance', category: 'travel' },
  { emoji: '🚒', name: 'fire engine', category: 'travel' },
  { emoji: '🚚', name: 'delivery truck', category: 'travel' },
  { emoji: '🚛', name: 'articulated lorry', category: 'travel' },
  { emoji: '🚜', name: 'tractor', category: 'travel' },
  { emoji: '🏍️', name: 'motorcycle', category: 'travel' },
  { emoji: '🚲', name: 'bicycle', category: 'travel' },
  { emoji: '✈️', name: 'airplane', category: 'travel' },
  { emoji: '🛫', name: 'airplane departure', category: 'travel' },
  { emoji: '🛬', name: 'airplane arrival', category: 'travel' },
  { emoji: '🚀', name: 'rocket', category: 'travel' },
  { emoji: '🛸', name: 'flying saucer', category: 'travel' },
  { emoji: '🚁', name: 'helicopter', category: 'travel' },
  { emoji: '🚂', name: 'locomotive', category: 'travel' },
  { emoji: '🚆', name: 'train', category: 'travel' },
  { emoji: '🚈', name: 'light rail', category: 'travel' },
  { emoji: '🚊', name: 'tram', category: 'travel' },
  { emoji: '⛴️', name: 'ferry', category: 'travel' },
  { emoji: '🚢', name: 'ship', category: 'travel' },
  { emoji: '🗽', name: 'statue of liberty', category: 'travel' },
  { emoji: '🗼', name: 'tokyo tower', category: 'travel' },
  { emoji: '🏰', name: 'castle', category: 'travel' },
  { emoji: '🏯', name: 'japanese castle', category: 'travel' },
];

// Create a map for quick emoji to name lookup
export const emojiToName = new Map<string, string>();
emojis.forEach(emojiData => {
  emojiToName.set(emojiData.emoji, emojiData.name);
});

// Create a map for quick name to emoji lookup
export const nameToEmoji = new Map<string, string>();
emojis.forEach(emojiData => {
  nameToEmoji.set(emojiData.name, emojiData.emoji);
});

// Get emoji by name
export const getEmojiByName = (name: string): string | undefined => {
  return nameToEmoji.get(name);
};

// Get name by emoji
export const getNameByEmoji = (emoji: string): string | undefined => {
  return emojiToName.get(emoji);
};

// Get emojis by category
export const getEmojisByCategory = (category: string): EmojiData[] => {
  return emojis.filter(emoji => emoji.category === category);
};

// Get all categories
export const getCategories = (): string[] => {
  return [...new Set(emojis.map(emoji => emoji.category))];
};
