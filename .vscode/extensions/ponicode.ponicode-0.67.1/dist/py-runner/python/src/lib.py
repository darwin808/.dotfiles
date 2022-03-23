import json


class NotSupported(Exception):
    pass


def format_str(value):
    return json.dumps(value)


def handle_dictionnary(value):
    res = []
    for key, value in value.items():
        res.append(
            {"py_key": format_str(key), "py_rhs": py_native_to_input_value(value)}
        )

    return res


def handle_list(array):
    res = []
    for value in array:
        res.append(py_native_to_input_value(value))

    return res


def py_native_to_input_value(obj):
    """
    Generate a serialized version of the given variable

    Args:
        obj (any): The variable to serialize

    Returns:
        The serialized variable
    """
    py_type = type(obj).__name__
    if py_type == "str":
        return {"py_type": py_type, "py_value": format_str(obj)}
    if (
        py_type == "bool"
        or py_type == "int"
        or py_type == "float"
        or py_type == "NoneType"
    ):
        return {"py_type": py_type, "py_value": str(obj)}
    elif py_type == "dict":
        return {
            "py_type": py_type,
            "py_value": handle_dictionnary(obj),
        }
    elif py_type == "list":
        return {"py_type": py_type, "py_value": handle_list(obj)}
    elif py_type == "tuple":
        return {"py_type": py_type, "py_value": handle_list(obj), "py_length": len(obj)}
    else:
        raise NotSupported("[INTERNAL] Not supported value: " + py_type)
