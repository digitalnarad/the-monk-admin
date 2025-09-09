import { encrypt, decrypt } from "../utils/helpers";

const storage = {
  // Read
  get: (key) => {
    if (!key) return null;
    try {
      const encryptedData = localStorage.getItem("auth");
      if (!encryptedData) return null;

      const decryptedData = decrypt(encryptedData);
      if (!decryptedData) return null;

      const storData = JSON.parse(decryptedData);
      return storData && storData[key] ? storData[key] : null;
    } catch (error) {
      console.warn("Storage get error:", error);
      return null;
    }
  },

  // Update
  set: (key, data) => {
    if (!key) return false;
    try {
      const encryptedData = localStorage.getItem("auth");
      let storData = {};

      if (encryptedData) {
        const decryptedData = decrypt(encryptedData);
        if (decryptedData) {
          storData = JSON.parse(decryptedData);
        }
      }

      const updatedData = { ...storData, [key]: data };

      const encryptedUpdatedData = encrypt(updatedData);
      if (!encryptedUpdatedData) return false;

      localStorage.setItem("auth", encryptedUpdatedData);
      return true;
    } catch (error) {
      console.warn("Storage set error:", error);
      return false;
    }
  },

  // Clear all
  clear: () => {
    try {
      localStorage.clear();
      const now = new Date();
      localStorage.setItem("time", JSON.stringify(now));
      return true;
    } catch (error) {
      console.error("Storage clear error:", error);
      return false;
    }
  },
};

export default storage;
