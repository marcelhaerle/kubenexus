from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# Base model for common configs
class KubeResource(BaseModel):
    uid: str
    name: str
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
