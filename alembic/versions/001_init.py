"""Initial schema — creates items and pubsub_messages tables."""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    # ── items table ──
    if "items" not in tables:
        op.create_table(
            "items",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("name", sa.String(255), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("value", sa.Float(), nullable=True),
            sa.Column("tags", JSONB(), nullable=False, server_default="[]"),
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

        # Seed initial items
        op.execute("""
            INSERT INTO items (name, description, value, tags) VALUES
            ('Widget Alpha', 'A sample widget', 29.99, '["hardware","sample"]'),
            ('Widget Beta',  'Another widget',  49.99, '["software"]'),
            ('Widget Gamma', 'Third widget',    9.99,  '["misc"]')
        """)

    # ── pubsub_messages table ──
    if "pubsub_messages" not in tables:
        op.create_table(
            "pubsub_messages",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("channel", sa.String(100), nullable=False),
            sa.Column("message", sa.Text(), nullable=False),
            sa.Column("metadata", JSONB(), nullable=False, server_default="{}"),
            sa.Column(
                "published_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_pubsub_messages_channel", "pubsub_messages", ["channel"])
        op.create_index("ix_pubsub_messages_published_at", "pubsub_messages", ["published_at"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "pubsub_messages" in tables:
        op.drop_table("pubsub_messages")
    if "items" in tables:
        op.drop_table("items")
