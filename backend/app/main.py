from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.logging import setup_logging

logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("KubeNexus Backend starting up...")
    yield
    logger.info("KubeNexus Backend shutting down...")


app = FastAPI(
    title="KubeNexus Backend",
    version="0.1.0",
    description="Backend API for KubeNexus Kubernetes Management",
    lifespan=lifespan,
)


@app.get("/health")
async def health_check():
    """
    Simple health check for Kubernetes liveness probes.
    """
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    # Activate hot-reloading for fast dev feedback
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
