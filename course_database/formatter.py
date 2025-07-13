import logging

class ColoredFormatter(logging.Formatter):
    """
    A custom logging formatter that adds color based on log level.
    """
    
    # Define ANSI color codes
    COLOR_CODES = {
        logging.DEBUG: "\033[94m",    # Blue
        logging.INFO: "\033[92m",     # Green
        logging.WARNING: "\033[93m",  # Yellow
        logging.ERROR: "\033[91m",    # Red
        logging.CRITICAL: "\033[95m", # Magenta
        "RESET": "\033[0m"           # Reset to default color
    }

    def format(self, record):
        # Get the color code for the current log level
        color_code = self.COLOR_CODES.get(record.levelno, self.COLOR_CODES["RESET"])
        reset_code = self.COLOR_CODES["RESET"]

        # Apply color to the message part of the log record
        record.levelname = f"{color_code}{record.levelname}{reset_code}"
        record.msg = f"{color_code}{record.msg}{reset_code}" # Color the message itself if desired

        # Call the original formatter's format method
        # The base format string is defined when the formatter is initialized
        return super().format(record)

# --- Configuration ---
# Create a logger
logger = logging.getLogger("my_colorful_app")
logger.setLevel(logging.DEBUG) # Set the minimum level for logging

# Create a console handler
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)

# Create an instance of our custom formatter
# Example format string: "Timestamp - LevelName - LoggerName - Message"
formatter = ColoredFormatter(
    "%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# Add the formatter to the console handler
ch.setFormatter(formatter)

# Add the console handler to the logger
logger.addHandler(ch)

# --- Test the logging ---
logger.debug("This is a debug message.")
logger.info("An informative message here.")
logger.warning("Something might be going wrong!")
logger.error("Uh oh, an error occurred!")
logger.critical("Critical issue: System going down!")