import { type RouterOutputs, type RouterInputs } from "~/trpc/react";

// Types that correspond to the tRPC router outputs
export type AuthResponse = RouterOutputs["auth"]["login"];
export type RegisterResponse = RouterOutputs["auth"]["register"];
export type Teacher = RouterOutputs["teachers"]["getAll"][0];
export type Promo = RouterOutputs["promos"]["getAll"][0];
export type Module = RouterOutputs["modules"]["getAll"][0];

// Input types
export type TeacherInput = RouterInputs["teachers"]["create"];
export type PromoInput = RouterInputs["promos"]["create"];
export type ModuleInput = RouterInputs["modules"]["create"];
