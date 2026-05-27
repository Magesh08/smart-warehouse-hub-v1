import time

_start_time = time.time()

def get_uptime_seconds() -> float:
    return round(time.time() - _start_time, 2)

def get_uptime_human(uptime: float) -> str:
    h = int(uptime // 3600)
    m = int((uptime % 3600) // 60)
    s = int(uptime % 60)
    return f"{h}h {m}m {s}s"
