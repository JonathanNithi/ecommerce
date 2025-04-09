import { Order } from "./orders";

export interface accountDetails {
    firstName: string;
    lastName: string;
    email: string;
    orders: Order[];
}
