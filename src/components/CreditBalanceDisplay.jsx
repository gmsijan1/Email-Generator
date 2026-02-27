import { useCreditBalance } from "../hooks/useCreditBalance";

export default function CreditBalanceDisplay() {
  const balance = useCreditBalance();
  let display = "Loading...";
  if (balance !== null && balance !== undefined) {
    if (typeof balance === "string") {
      display = balance;
    } else if (typeof balance === "number") {
      display = balance.toString();
    } else {
      display = "0";
    }
  }
  return <span className="dashboard-credit">Credits: {display}</span>;
}
