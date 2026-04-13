export type UserRole = "super_admin" | "admin";
export type RestaurantUserRole = "owner" | "staff";
export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "rejected"
  | "cancelled";
export type OrderType = "pickup" | "delivery";
export type PromoType = "fixed" | "percentage";
export type SettingType = "string" | "number" | "boolean" | "json";

export interface Database {
  public: {
    Tables: {
      restaurant_users: {
        Row: {
          id: string;
          restaurant_id: string;
          email: string;
          name: string;
          password_hash: string;
          role: RestaurantUserRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["restaurant_users"]["Row"],
          "id" | "role" | "is_active" | "created_at" | "updated_at"
        > & {
          id?: string;
          role?: RestaurantUserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["restaurant_users"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "restaurant_users_restaurant_id_fkey";
            columns: ["restaurant_id"];
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
      restaurants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          phone: string | null;
          email: string | null;
          logo_url: string | null;
          cover_image_url: string | null;
          timezone: string;
          is_active: boolean;
          is_open: boolean;
          stripe_account_id: string | null;
          stripe_onboarding_complete: boolean;
          commission_rate: number;
          has_website_subscription: boolean;
          operating_hours: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["restaurants"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["restaurants"]["Insert"]
        >;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["customers"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["customers"]["Insert"]
        >;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          restaurant_id: string;
          customer_id: string;
          status: OrderStatus;
          type: OrderType;
          subtotal: number;
          discount_amount: number;
          delivery_fee: number;
          tax_amount: number;
          tip_amount: number;
          total: number;
          commission_rate_snapshot: number;
          commission_amount: number;
          net_restaurant_payout: number;
          promo_id: string | null;
          stripe_payment_intent_id: string | null;
          refund_amount: number | null;
          refund_reason: string | null;
          refunded_at: string | null;
          doordash_delivery_id: string | null;
          doordash_tracking_url: string | null;
          delivery_address: Record<string, unknown> | null;
          special_instructions: string | null;
          estimated_prep_minutes: number | null;
          placed_at: string | null;
          confirmed_at: string | null;
          preparing_at: string | null;
          ready_at: string | null;
          picked_up_at: string | null;
          delivered_at: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["orders"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string | null;
          name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          special_instructions: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["order_items"]["Row"],
          "id" | "created_at"
        > & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["order_items"]["Insert"]
        >;
        Relationships: [];
      };
      order_item_modifiers: {
        Row: {
          id: string;
          order_item_id: string;
          modifier_id: string | null;
          name: string;
          price: number;
        };
        Insert: Omit<
          Database["public"]["Tables"]["order_item_modifiers"]["Row"],
          "id"
        > & {
          id?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["order_item_modifiers"]["Insert"]
        >;
        Relationships: [];
      };
      menus: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          sort_order: number;
          external_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["menus"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["menus"]["Insert"]>;
        Relationships: [];
      };
      menu_categories: {
        Row: {
          id: string;
          menu_id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          sort_order: number;
          external_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["menu_categories"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["menu_categories"]["Insert"]
        >;
        Relationships: [];
      };
      menu_items: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          is_available: boolean;
          sort_order: number;
          prep_time_minutes: number | null;
          external_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["menu_items"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["menu_items"]["Insert"]
        >;
        Relationships: [];
      };
      modifier_groups: {
        Row: {
          id: string;
          menu_item_id: string;
          name: string;
          description: string | null;
          min_selections: number;
          max_selections: number;
          is_required: boolean;
          sort_order: number;
          external_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["modifier_groups"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["modifier_groups"]["Insert"]
        >;
        Relationships: [];
      };
      modifiers: {
        Row: {
          id: string;
          modifier_group_id: string;
          name: string;
          price: number;
          is_default: boolean;
          is_available: boolean;
          sort_order: number;
          external_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["modifiers"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["modifiers"]["Insert"]
        >;
        Relationships: [];
      };
      promotions: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          type: PromoType;
          value: number;
          min_subtotal: number | null;
          max_discount: number | null;
          starts_at: string | null;
          expires_at: string | null;
          usage_limit: number | null;
          usage_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["promotions"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["promotions"]["Insert"]
        >;
        Relationships: [];
      };
      platform_settings: {
        Row: {
          id: string;
          key: string;
          value: string;
          type: SettingType;
          label: string | null;
          description: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["platform_settings"]["Row"],
          "id" | "updated_at"
        > & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["platform_settings"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      restaurant_user_role: RestaurantUserRole;
      order_status: OrderStatus;
      order_type: OrderType;
      promo_type: PromoType;
      setting_type: SettingType;
    };
  };
}
