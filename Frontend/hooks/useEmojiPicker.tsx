import { useState, useMemo, useCallback } from "react";

const useEmojiPicker = () => {
  const emojis = useMemo(
    () => ["💼", "🎉", "📚", "🚀", "❤️", "🌟", "🎨", "🎵", "⚽", "🍕", "🏡", "💰", "🏢", "💻"],
    []
  );

  const [selectedEmoji, setSelectedEmoji] = useState(emojis[0]);

  const selectEmoji = useCallback((emoji: string) => {
    setSelectedEmoji(emoji);
  }, []); 

  return { emojis, selectedEmoji, selectEmoji };
};

export default useEmojiPicker;