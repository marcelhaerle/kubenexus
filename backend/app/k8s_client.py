from kubernetes import client, config


def get_k8s_client():
    """
    Loads the K8s config (in-cluster or local ~/.kube/config)
    and returns the CoreV1Api.
    """
    try:
        # Try in-cluster config first
        config.load_incluster_config()
    except config.ConfigException:
        try:
            # Fallback to local config
            config.load_kube_config()
        except config.ConfigException:
            # For unit tests without cluster access or CI/CD
            print("Warning: No K8s config found.")
            return None

    return client.CoreV1Api()
