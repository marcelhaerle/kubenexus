from datetime import datetime

from pydantic import BaseModel


# Base model for common configs
class KubeResource(BaseModel):
    uid: str
    name: str
    namespace: str | None = None
    creation_timestamp: datetime | None = None


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
    node: str | None = None

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
