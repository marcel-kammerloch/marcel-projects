import { useState, useEffect, useCallback, useRef } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Use a ref to store initialValue so it doesn't trigger effect/callback updates
  // if the user passes a new object/array literal on every render.
  const initialValueRef = useRef(initialValue);

  // Update ref if initialValue changes, although typically initialValue is only relevant on mount/fallback.
  // We can probably ignore updates to initialValue after mount for this use case to be safer,
  // or allow it. For the "Maximum update depth" fix, usually we just want to avoid the dependency loop.
  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Initialize on mount (client-side only)
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStoredValue(JSON.parse(item));
      } else {
        // If key doesn't exist, we rely on the useState(initialValue) above.
        // But if we want to explicitly ensure state matches initialValue (if it changed), we could:
        setStoredValue(initialValueRef.current);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      setStoredValue(initialValueRef.current);
    }
  }, [key]); // Only re-run if key changes. NOT when initialValue changes reference.

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          window.dispatchEvent(new Event("local-storage"));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}
