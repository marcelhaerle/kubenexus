from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@patch("app.routers.namespaces.get_k8s_client")
def test_list_namespaces(mock_get_client):
    mock_api = MagicMock()
    mock_namespace = MagicMock()
    mock_namespace.metadata.uid = "test-uid"
    mock_namespace.metadata.name = "test-namespace"
    mock_namespace.metadata.creation_timestamp = "2024-01-01T00:00:00Z"
    mock_namespace.status.phase = "Active"

    mock_api.list_namespace.return_value.items = [mock_namespace]
    mock_get_client.return_value = mock_api

    response = client.get("/namespaces")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "test-namespace"
    assert data[0]["phase"] == "Active"


@patch("app.routers.pods.get_k8s_client")
def test_list_pods(mock_get_client):
    mock_api = MagicMock()
    mock_pod = MagicMock()
    mock_pod.metadata.uid = "test-uid"
    mock_pod.metadata.name = "test-pod"
    mock_pod.metadata.namespace = "default"
    mock_pod.status.phase = "Running"
    mock_pod.status.container_statuses = []
    mock_pod.spec.node_name = "minikube"

    mock_api.list_pod_for_all_namespaces.return_value.items = [mock_pod]
    mock_get_client.return_value = mock_api

    response = client.get("/pods")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "test-pod"
    assert data[0]["status"] == "Running"
