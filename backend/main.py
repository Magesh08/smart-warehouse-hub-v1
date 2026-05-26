"""
boulty-v1 — FastAPI main application
"""
import logging
import sys
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.core.config import settings

# Add project root to path so `backend.*` imports work
sys.path.insert(0, ".")

from backend.routers.api_demo import router as demo_router
from backend.routers.pubsub import router as pubsub_router
from backend.routers.dashboard_ws import router as dashboard_ws_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("boulty-v1")

_start_time = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 boulty-v1 backend starting...")
    yield
    logger.info("🛑 boulty-v1 backend shutting down.")


app = FastAPI(
    title="boulty-v1 API",
    description="Local full-stack demo: FastAPI + Nginx + Redis PubSub",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS (allow all origins for local dev) ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time", "X-Server"],
)


# ── Request timing middleware ──
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    t0 = time.time()
    response = await call_next(request)
    elapsed = round((time.time() - t0) * 1000, 2)
    response.headers["X-Process-Time"] = f"{elapsed}ms"
    response.headers["X-Server"] = "boulty-v1"
    return response


# ── Mount routers ──
app.include_router(demo_router)
app.include_router(pubsub_router)
app.include_router(dashboard_ws_router)


# ── Root health endpoint ──
@app.get("/api/health")
async def root_health():
    uptime = round(time.time() - _start_time, 2)
    return {
        "status": "ok",
        "service": "boulty-v1",
        "version": "1.0.0",
        "uptime_seconds": uptime,
        "uptime_human": f"{int(uptime // 3600)}h {int((uptime % 3600) // 60)}m {int(uptime % 60)}s",
        "timestamp": time.time(),
    }


# ── Global exception handler ──
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": str(exc), "timestamp": time.time()},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.FASTAPI_HOST,
        port=settings.FASTAPI_PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL,
    )
