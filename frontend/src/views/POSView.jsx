import OrderQueue from "./pos/OrderQueue.jsx";
import OrderBuilder from "./pos/OrderBuilder.jsx";

export default function POSView() {
  return (
    <div className="flex-1 flex min-h-0">
      <OrderQueue />
      <OrderBuilder />
    </div>
  );
}
