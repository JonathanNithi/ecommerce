import { Order } from "./orders";

export interface accountDetails {
    first_name: string;
    last_name: string;
    email: string;
    orders: Order[];
}
