from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# Base model for common configs
class KubeResource(BaseModel):
    uid: str
    name: str
    namespace: Optional[str] = None
    creation_timestamp: Optional[datetime] = None


class NamespaceSummary(KubeResource):
    phase: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "uid": "namespace-123",
                "name": "my-namespace",
                "phase": "Active",
            }
        }
    }


class PodSummary(KubeResource):
    status: str
    restarts: int = 0
    node: Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "uid": "123-456",
                "name": "nginx-pod",
                "namespace": "default",
                "status": "Running",
                "restarts": 0,
                "node": "worker-node-1",
            }
        }
    }
