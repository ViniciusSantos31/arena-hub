const SPORTS_EMOJIS = ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🎱", "🏉"];

export const LoadingAnimation = () => {
  const isIrregularBall = (emoji: string) => emoji === "🏈" || emoji === "🏉";

  return (
    <div className="flex items-center justify-center space-x-2 py-1">
      {SPORTS_EMOJIS.map((emoji, index) => {
        const animationDelay = `${index * 0.1}s`;

        if (isIrregularBall(emoji)) {
          return (
            <span
              key={index}
              style={{
                display: "inline-block",
                fontSize: "1.5rem",
                animationDelay: animationDelay,
              }}
              className="animate-bounce-rotate"
            >
              {emoji}
            </span>
          );
        }

        return (
          <span
            key={index}
            style={{
              display: "inline-block",
              fontSize: "1.5rem",
              animationDelay: animationDelay,
            }}
            className="animate-bounce"
          >
            {emoji}
          </span>
        );
      })}
    </div>
  );
};
