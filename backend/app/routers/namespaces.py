from fastapi import APIRouter, HTTPException
from app.core.logging import logger

from typing import List
from app.k8s_client import get_k8s_client
from app.schemas import NamespaceSummary

router = APIRouter(
    prefix="/namespaces",
    tags=["namespaces"],
)


@router.get("/", response_model=List[NamespaceSummary])
async def list_namespaces():
    """
    List all namespaces as summaries.
    """
    core_api = get_k8s_client()
    if not core_api:
        logger.error("Kubernetes client initialization failed.")
        raise HTTPException(status_code=500, detail="K8s Client not configured")

    try:
        response = core_api.list_namespace()
        namespaces = []
        for item in response.items:
            summary = NamespaceSummary(
                uid=item.metadata.uid,
                name=item.metadata.name,
                creation_timestamp=item.metadata.creation_timestamp,
                phase=item.status.phase or "Unknown",
            )
            namespaces.append(summary)

        return namespaces

    except Exception as e:
        logger.error(f"Error fetching namespaces: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
