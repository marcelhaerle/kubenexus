import logging
import sys


def setup_logging():
    """
    Configures logging for the application.
    Sets the format to: [timestamp] [level] [module]: message
    """
    log_format = "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s"

    # Root Logger config
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[logging.StreamHandler(sys.stdout)],
    )

    # Specific loggers can be adjusted here
    logging.getLogger("kubernetes").setLevel(logging.WARNING)

    return logging.getLogger("kubenexus")


# Logger for fast access throughout the app
logger = logging.getLogger("kubenexus")
