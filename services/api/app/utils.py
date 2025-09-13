def is_nonzero_number(val):
    try:
        return float(val) != 0
    except (TypeError, ValueError):
        return False