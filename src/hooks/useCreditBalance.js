import { useEffect, useState } from "react";
import { getCreditBalance } from "../services/creditService";
import useAuth from "../contexts/useAuth";

export function useCreditBalance() {
  const { currentUser } = useAuth();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (currentUser) {
      getCreditBalance(currentUser.uid).then(setBalance);
    }
  }, [currentUser]);

  return balance;
}
