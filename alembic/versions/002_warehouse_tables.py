"""Create warehouse tables: inventory_items, orders, order_items, users

Revision ID: 002
Revises: 001
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

# revision identifiers, used by Alembic.
revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    # ── 1. Create inventory_items table ──
    if "inventory_items" not in tables:
        op.create_table(
            "inventory_items",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("sku", sa.String(length=50), nullable=False),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("rack", sa.String(length=10), nullable=False),
            sa.Column("slot", sa.String(length=10), nullable=False),
            sa.Column("quantity", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("min_stock_level", sa.Integer(), nullable=False, server_default="10"),
            sa.Column("category", sa.String(length=100), nullable=False, server_default="General"),
            sa.Column("status", sa.String(length=20), nullable=False, server_default="in-stock"),
            sa.Column("tags", JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"),
            sa.Column("value", sa.Float(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_inventory_items_sku", "inventory_items", ["sku"], unique=True)

        # Seed inventory items
        op.execute("""
            INSERT INTO inventory_items (sku, name, description, rack, slot, quantity, min_stock_level, category, status, tags, value) VALUES
            ('WDG-001', 'Widget Pro X1', 'High performance widget', 'A', 'A3', 42, 10, 'Widgets', 'in-stock', '["industrial", "metal"]', 29.99),
            ('SNS-042', 'Sensor Module V3', 'High precision proximity sensor', 'A', 'A7', 8, 10, 'Electronics', 'low-stock', '["sensors", "hardware"]', 49.99),
            ('MTR-118', 'Motor Assembly K7', 'DC brush motor assembly', 'B', 'B2', 15, 10, 'Motors', 'in-stock', '["powertrain", "mechanical"]', 150.00),
            ('PCB-203', 'PCB Board Alpha', 'Main control board PCB', 'B', 'B9', 0, 5, 'Electronics', 'out-of-stock', '["electronics", "boards"]', 99.99),
            ('HYD-055', 'Hydraulic Valve T2', 'Heavy duty hydraulic control valve', 'C', 'C4', 33, 10, 'Hydraulics', 'in-stock', '["hydraulic", "industrial"]', 250.00),
            ('BRG-620', 'Bearing Set 6205', 'Standard deep groove ball bearing set', 'C', 'C11', 120, 20, 'Mechanical', 'in-stock', '["bearings", "mechanical"]', 5.99),
            ('CBL-099', 'Cable Harness C9', 'Custom 9-pin industrial cable harness', 'D', 'D5', 4, 10, 'Electrical', 'low-stock', '["cables", "harness"]', 12.50),
            ('LED-340', 'LED Panel Strip', 'Status indicator light panel strip', 'E', 'E3', 67, 15, 'Lighting', 'in-stock', '["lighting", "indicators"]', 8.99)
        """)

    # ── 2. Create orders table ──
    if "orders" not in tables:
        op.create_table(
            "orders",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("order_id", sa.String(length=20), nullable=False),
            sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
            sa.Column("assigned_robot", sa.String(length=20), nullable=True),
            sa.Column("progress", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_orders_order_id", "orders", ["order_id"], unique=True)

    # ── 3. Create order_items table ──
    if "order_items" not in tables:
        op.create_table(
            "order_items",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("order_id", sa.Integer(), nullable=False),
            sa.Column("sku", sa.String(length=50), nullable=False),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
            sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_order_items_order_id", "order_items", ["order_id"])

        # Seed orders & order_items
        op.execute("""
            INSERT INTO orders (id, order_id, status, assigned_robot, progress, notes, created_at) VALUES
            (1, 'ORD-2841', 'picking', 'AGV-01', 60, 'Express shipping requested', '2026-03-31 09:14:00+00'),
            (2, 'ORD-2842', 'pending', NULL, 0, 'Standard ground transport', '2026-03-31 10:22:00+00'),
            (3, 'ORD-2843', 'picking', 'AMR-01', 35, 'Fragile - handle with care', '2026-03-31 11:05:00+00'),
            (4, 'ORD-2844', 'completed', NULL, 100, 'Delivered to loading dock B', '2026-03-31 07:30:00+00'),
            (5, 'ORD-2845', 'pending', NULL, 0, NULL, '2026-03-31 12:18:00+00')
        """)

        op.execute("""
            INSERT INTO order_items (order_id, sku, name, quantity) VALUES
            (1, 'WDG-001', 'Widget Pro X1', 5),
            (2, 'SNS-042', 'Sensor Module V3', 12),
            (3, 'MTR-118', 'Motor Assembly K7', 3),
            (3, 'BRG-620', 'Bearing Set 6205', 20),
            (4, 'PCB-203', 'PCB Board Alpha', 8),
            (5, 'HYD-055', 'Hydraulic Valve T2', 2)
        """)

    # ── 4. Create users table ──
    if "users" not in tables:
        op.create_table(
            "users",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("username", sa.String(length=100), nullable=False),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("hashed_password", sa.String(length=255), nullable=False),
            sa.Column("full_name", sa.String(length=255), nullable=True),
            sa.Column("role", sa.String(length=20), nullable=False, server_default="viewer"),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_users_username", "users", ["username"], unique=True)
        op.create_index("ix_users_email", "users", ["email"], unique=True)

        # Hash default admin password dynamically using raw bcrypt
        import bcrypt
        admin_pw_hash = bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode("utf-8")
        operator_pw_hash = bcrypt.hashpw(b"operator123", bcrypt.gensalt()).decode("utf-8")

        op.execute(f"""
            INSERT INTO users (username, email, hashed_password, full_name, role, is_active) VALUES
            ('admin', 'admin@boulty.local', '{admin_pw_hash}', 'Warehouse Admin', 'admin', true),
            ('operator', 'operator@boulty.local', '{operator_pw_hash}', 'Shift Operator', 'operator', true)
        """)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "order_items" in tables:
        op.drop_table("order_items")
    if "orders" in tables:
        op.drop_table("orders")
    if "inventory_items" in tables:
        op.drop_table("inventory_items")
    if "users" in tables:
        op.drop_table("users")