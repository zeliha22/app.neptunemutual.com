import { useEffect, useState } from "react";

export const useRetryUntilPassed = (callback, expected, interval = 1000) => {
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    let ignore = false;

    const intervalId = setInterval(() => {
      const result = callback();
      if (!ignore && result === expected) {
        setPassed(true);
        clearInterval(intervalId);
      }
    }, interval);

    return () => {
      ignore = true;
      clearInterval(intervalId);
    };
  }, [callback, expected, interval]);

  return passed;
};
