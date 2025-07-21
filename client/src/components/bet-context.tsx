import React, { createContext, useContext, useRef } from "react";

type BetContextType = {
  triggerPlaceBet: () => void;
  setPlaceBetHandler: (handler: () => void) => void;
};

const BetContext = createContext<BetContextType | undefined>(undefined);

export const useBetContext = () => {
  const ctx = useContext(BetContext);
  if (!ctx) throw new Error("useBetContext must be used within BetProvider");
  return ctx;
};

export const BetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const handlerRef = useRef<() => void>();

  const triggerPlaceBet = () => {
    handlerRef.current?.();
  };

  const setPlaceBetHandler = (handler: () => void) => {
    handlerRef.current = handler;
  };

  return (
    <BetContext.Provider value={{ triggerPlaceBet, setPlaceBetHandler }}>
      {children}
    </BetContext.Provider>
  );
}; 