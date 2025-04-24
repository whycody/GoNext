import { useState } from "react";

const useEmojiPicker = () => {
  const emojis = ["💼", "🎉", "📚", "🚀", "❤️", "🌟", "🎨", "🎵", "⚽", "🍕", "🏡", "💰", "🏢", "💻"];
  const [selectedEmoji, setSelectedEmoji] = useState(emojis[0]);

  const selectEmoji = (emoji: string) => {
    setSelectedEmoji(emoji);
  };

  return { emojis, selectedEmoji, selectEmoji };
};

export default useEmojiPicker;