# Firebase Data Model (Primary Store Contract)

This document defines the logical schema used by backend/mobile features.  
The current local runtime store mirrors this model for development.

## users/{userId}
- `userId: string`
- `languagePreference: "auto" | "en" | "ar"`
- `dietaryProfile: { halal: boolean, vegan: boolean, allergies: string[] }`
- `theme: "system" | "light" | "dark"`
- `voiceEnabled: boolean`
- `favorites: string[]` (menu item ids)
- `usualOrderPreset: { itemId: string, quantity: number }[]`
- `orderHistory: string[]` (order ids)
- `updatedAt: ISO string`

## menuItems/{itemId}
- Existing menu item fields (`name_en`, `name_ar`, `category`, etc.)
- `available: boolean` (existing)
- `isAvailable: boolean` (normalized alias)
- `availableQuantity?: number`
- `alternativeItemIds?: string[]`
- `updatedAt?: ISO string`

## promotions/{promoId}
- `promoId: string`
- `title: string`
- `description: string`
- `startAt: ISO string`
- `endAt: ISO string`
- `applicableCategories: string[]`
- `applicableItems: string[]`
- `priority: number` (lower = higher priority)
- `isActive: boolean`

## orders/{orderId}
- `orderId: string`
- `userId: string`
- `items: { itemId?: string, name?: string, quantity: number, price?: number }[]`
- `status: "received" | "preparing" | "ready"`
- `source: "chat" | "cart" | "reservation_preorder"`
- `reservationId?: string`
- `createdAt: ISO string`
- `updatedAt: ISO string`

## reservations/{reservationId}
- `reservationId: string`
- `userId: string`
- `dateTime: ISO string`
- `partySize: number`
- `contact: { name?: string, phone?: string }`
- `preorderItems: { itemId?: string, name?: string, quantity: number }[]`
- `status: "confirmed" | "cancelled" | "completed"`
- `createdAt: ISO string`
- `updatedAt: ISO string`

## upsellRules/{ruleId}
- `source_item: string`
- `suggestions: string[]`
