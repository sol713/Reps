const isBrowser = typeof window !== "undefined";

export const storage = {
  read(key, fallback) {
    if (!isBrowser) {
      return fallback;
    }

    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) {
        return fallback;
      }
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  },
  write(key, value) {
    if (!isBrowser) {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
    }
  }
};
