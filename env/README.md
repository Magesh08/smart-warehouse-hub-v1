# boulty-v1 — Environment Configuration

This folder holds **all environment configuration** for the boulty-v1 stack.

## Quick Setup

```bash
# Copy the template and fill in your values
cp env/.env.example env/.env
```

## Files

| File | Purpose | Git-tracked? |
|------|---------|:---:|
| `.env.example` | Template with all variables and defaults | ✅ Yes |
| `.env` | Your actual secrets & config | ❌ No |
| `README.md` | This documentation | ✅ Yes |

## Variable Reference

### PostgreSQL Database
| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_HOST` | `localhost` | Database host |
| `POSTGRES_PORT` | `5435` | Database port |
| `POSTGRES_USER` | `boulty` | Database user |
| `POSTGRES_PASSWORD` | *(empty)* | Database password |
| `POSTGRES_DB` | `boulty_db` | Database name |

### Database Pool
| Variable | Default | Description |
|----------|---------|-------------|
| `DB_POOL_SIZE` | `10` | Number of persistent connections |
| `DB_MAX_OVERFLOW` | `20` | Extra connections under load |
| `DB_ECHO` | `false` | Log all SQL queries (debug) |

### pgAdmin
| Variable | Default | Description |
|----------|---------|-------------|
| `PGADMIN_DEFAULT_EMAIL` | `admin@boulty.local` | pgAdmin login email |
| `PGADMIN_DEFAULT_PASSWORD` | `changeme` | pgAdmin login password |
| `PGADMIN_PORT` | `5050` | pgAdmin web UI port |

### SSH Tunnel
| Variable | Default | Description |
|----------|---------|-------------|
| `SSH_HOST` | *(empty)* | Remote SSH server host |
| `SSH_PORT` | `22` | SSH port |
| `SSH_USER` | *(empty)* | SSH username |
| `SSH_PASSWORD` | *(empty)* | SSH password |

### MQTT / PubSub
| Variable | Default | Description |
|----------|---------|-------------|
| `MQTT_BROKER_HOST` | `broker.hivemq.com` | MQTT broker hostname |
| `MQTT_BROKER_PORT` | `1883` | MQTT broker port |

### FastAPI Backend
| Variable | Default | Description |
|----------|---------|-------------|
| `FASTAPI_HOST` | `0.0.0.0` | Server bind address |
| `FASTAPI_PORT` | `8000` | Server port |
| `DEBUG` | `false` | Enable debug mode |
| `LOG_LEVEL` | `info` | Logging level |

### Nginx
| Variable | Default | Description |
|----------|---------|-------------|
| `NGINX_PORT` | `8080` | Nginx listen port |

## Usage in Code

All variables are loaded by `backend/core/config.py` using Pydantic Settings:

```python
from backend.core.config import settings

# Access any variable
print(settings.POSTGRES_HOST)
print(settings.database_url)   # computed property
```

## Usage in Shell Scripts

```bash
source env/.env
echo $POSTGRES_PORT
```
