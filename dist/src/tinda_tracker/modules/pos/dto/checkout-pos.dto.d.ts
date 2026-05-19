declare class CheckoutPosItemDto {
    productId: string;
    quantity: number;
}
export declare class CheckoutPosDto {
    items: CheckoutPosItemDto[];
    paidAmount: number;
    note?: string;
    reference?: string;
    deviceId?: string;
}
export { CheckoutPosItemDto };
