from typing import Any

class Service:
    path: Any
    port: Any
    start_error_message: Any
    log_file: Any
    env: Any
    def __init__(
        self, executable, port: int = ..., log_file=..., env: Any | None = ..., start_error_message: str = ...
    ) -> None: ...
    @property
    def service_url(self): ...
    def command_line_args(self) -> None: ...
    process: Any
    def start(self) -> None: ...
    def assert_process_still_running(self) -> None: ...
    def is_connectable(self): ...
    def send_remote_shutdown_command(self) -> None: ...
    def stop(self) -> None: ...
    def __del__(self) -> None: ...
