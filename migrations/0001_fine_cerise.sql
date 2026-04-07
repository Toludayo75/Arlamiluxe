CREATE INDEX "cart_items_user_id_idx" ON "cart_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cart_items_session_id_idx" ON "cart_items" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "cart_items_user_session_idx" ON "cart_items" USING btree ("user_id","session_id");--> statement-breakpoint
CREATE INDEX "collections_title_idx" ON "collections" USING btree ("title");--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_product_id_idx" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "orders_user_id_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_payment_status_idx" ON "orders" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "products_collection_id_idx" ON "products" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "products_name_idx" ON "products" USING btree ("name");--> statement-breakpoint
CREATE INDEX "products_name_description_idx" ON "products" USING btree ("name","description");--> statement-breakpoint
CREATE INDEX "shipping_rates_state_idx" ON "shipping_rates" USING btree ("state");