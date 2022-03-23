import os
import sys
import json
import copy
import pytest
import functools

# Local modules
from src.plugin import Plugin
from src.utils import (
    suppress_stdout,
    get_from_module,
    get_methods_from_class,
    parse_tests,
)
from src.parser import (
    get_source_data,
    get_test_data,
    get_functions_to_test,
    get_module_from_file_path,
)
from src.lib import py_native_to_input_value, NotSupported

G = {}


def parse_and_run(json_data):
    source = get_source_data(json_data)

    test_file, test_class = get_test_data(json_data)

    all_functions = get_methods_from_class(test_class)

    to_test = get_functions_to_test(all_functions, test_file)

    if not to_test.get("success"):
        return {"success": False, "result": to_test.get("result")}

    # Pytest cannot re-import the test file,
    # so we remove it from the imported modules
    del sys.modules[get_module_from_file_path(test_file.get("path"))]

    result = [run_test(test, source, False) for test in to_test.get("result")]

    return {"success": True, "result": result}


def __listener__(in_class, func, *args, **kwargs):
    try:
        # Save the original arguments passed to the function
        inputs = {
            "args": [py_native_to_input_value(arg) for x, arg in enumerate(args)],
            "kwargs": copy.deepcopy(kwargs),
        }
        raw_original_args = copy.deepcopy(args)
        raw_original_kwargs = copy.deepcopy(kwargs)
        # Execution
        outputs = {}
        try:
            # Add Run Data
            returnValue = copy.deepcopy(func(*args, **kwargs))
            # Parse the result of the function
            outputs.update(
                {
                    "error": False,
                    "rawReturnValue": returnValue,
                    "return": py_native_to_input_value(returnValue),
                }
            )
        except Exception as e:
            err = e
            # The function throw an error : we catch it and save it
            outputs.update(
                {
                    "error": True,
                    "throw": {
                        "type": type(e).__name__,
                        "args": str(e.args),
                        "message": e.__repr__(),
                    },
                }
            )

        outputs.update(
            {
                "expect": {
                    "args": [
                        {
                            "value": py_native_to_input_value(arg),
                            "modified": arg != raw_original_args[i],
                        }
                        for i, arg in enumerate(args)
                    ],
                    "kwargs": [
                        {
                            "key": key,
                            "value": py_native_to_input_value(value),
                            "modified": value != raw_original_kwargs[key],
                        }
                        for key, value in kwargs.items()
                    ],
                },
            }
        )

        # Add Data to Global Store
        G[func.__name__] = {"inputs": inputs, "outputs": outputs}

        if "rawReturnValue" in outputs:
            # We return the original returned value of the function
            return outputs.get("rawReturnValue")
        else:
            # If the function throw an error, we do the same
            raise err  # TODO: check
    except NotSupported as e:
        G[func.__name__] = {
            "inputs": {},
            "outputs": {
                "error": True,
                "throw": {
                    "message": "Ponicode does not support running this test case yet."
                },
            },
        }
        raise BaseException("Not supported")


def decorator(f, inClass):
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        return __listener__(inClass, f, *args, **kwargs)

    return wrapper


def set_decorator(reach):
    # Get module
    module = reach.get("module")
    function = reach.get("function")
    inst = reach.get("class")
    if inst is not None:
        # Replace the original method with the decorated one
        setattr(
            inst, function.__name__, decorator(getattr(inst, function.__name__), True)
        )
        setattr(module, inst.__name__, inst)
    else:
        # Replace the original function with the decorated one
        setattr(
            module,
            function.__name__,
            decorator(getattr(module, function.__name__), False),
        )

    return function.__name__


def run_test(test, reach, verbose=True):
    """Runs pytest

    Args:
        test (string): Name of the test function (e.g. test_isEmailValidPy_1)
        reach ([type]): The reach of the source function to test (e.g. isEmailValidPy)
        verbose (bool, optional): Verbose mode. Defaults to True.

    Returns:
        [type]: [description]
    """
    # Add the decorator to the function
    function = set_decorator(reach)

    # Load homemade Plugin
    p = Plugin()

    # Set the rights options for pytest
    pytest_options = ([] if verbose else ["-q"]) + [
        "--cache-clear",
        test,
    ]

    # Execute tests with pytest
    pytest.main(
        pytest_options,
        plugins=[
            p,
        ],
    )

    # Retrieve data from the decorator and the global variable
    expect_data = G.pop(function)
    test_results = [
        parse_tests(t) for t in p.passed_tests + p.failed_tests if test in t.nodeid
    ]
    return {
        "expect": expect_data,
        "pytest_data": test_results,
    }


def check_version():
    """
    Check if the version of python is supported (>=3.6.0)
    """
    if sys.version_info.major < 3 or sys.version_info.minor < 6:
        return False
    return True


def parse_stdin():
    """Parse the JSON written in the stdin,
        and run the test without writing in the stdout.

    Returns:
        JSON: The result stringified
    """
    try:
        line = sys.stdin.readline()
        json_data = json.loads(line)
        test_id = json_data["id"]
        if not check_version():
            return json.dumps(
                {
                    "id": test_id,
                    "success": False,
                    "result": "The Python version you are using is too old, make sure you're using Python >= 3.6.0",
                }
            )
        os.chdir(json_data["cwd"])
        sys.path.append(json_data["cwd"])
        with suppress_stdout():
            result = parse_and_run(json_data)
        result["id"] = test_id
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"id": test_id, "success": False, "result": e.__repr__()})


if __name__ == "__main__":
    while True:
        result = parse_stdin()
        print(result)
        G = {}
        sys.__stdout__.flush()

# if __name__ == "__main__":
#     try:
#         line = sys.stdin.readline()
#         sys.__stdin__.flush()
#         json_data = json.loads(line)
#         os.chdir(json_data["cwd"])
#         sys.path.append(json_data["cwd"])
#         result = parse_and_run(json_data)
#         print(json.dumps(result))
#     except Exception as e:
#         print(json.dumps({"success": False, "result": e.__repr__()}))
