import { restClient } from "@polygon.io/client-js";

const API_KEY = "N9sWt6YbB9SOdX0bK7QTU37X1sRv2f2R";
const polygon = restClient(API_KEY);

console.log("Values:", Object.keys(polygon));
if (polygon.stocks) console.log("Stocks method exists");
else console.log("Stocks method MISSING");
