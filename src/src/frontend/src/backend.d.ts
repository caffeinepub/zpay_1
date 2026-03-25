import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Stats {
    dailyVolume: bigint;
    depositCount: bigint;
    transferCount: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getId(_id: string): Promise<string>;
    getOrderDetails(orderId: string, orderType: string): Promise<string>;
    getTotalStats(): Promise<Stats>;
    initialize(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    updateUserCustom(_zpayId: string, name: string): Promise<void>;
}
