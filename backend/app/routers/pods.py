from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.k8s_client import get_k8s_client
from app.schemas import PodSummary
from app.core.logging import logger

router = APIRouter(prefix="/pods", tags=["pods"])


@router.get("/", response_model=List[PodSummary])
async def list_pods(namespace: Optional[str] = Query(None)):
    """
    List all pods, optionally filtered by namespace.
    """
    logger.info(f"Fetching pods. Namespace filter: {namespace if namespace else 'ALL'}")

    core_api = get_k8s_client()
    if not core_api:
        logger.error("Kubernetes client initialization failed.")
        raise HTTPException(status_code=500, detail="K8s Client not configured")

    try:
        if namespace:
            response = core_api.list_namespaced_pod(namespace=namespace)
        else:
            response = core_api.list_pod_for_all_namespaces()

        pods = []
        for pod in response.items:
            restarts = 0
            if pod.status.container_statuses:
                restarts = sum(c.restart_count for c in pod.status.container_statuses)

            summary = PodSummary(
                uid=pod.metadata.uid,
                name=pod.metadata.name,
                namespace=pod.metadata.namespace,
                status=pod.status.phase or "Unknown",
                restarts=restarts,
                node=pod.spec.node_name,
                creation_timestamp=pod.metadata.creation_timestamp,
            )
            pods.append(summary)

        logger.debug(f"Successfully fetched {len(pods)} pods")
        return pods

    except Exception as e:
        logger.error(f"Error fetching pods: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")
