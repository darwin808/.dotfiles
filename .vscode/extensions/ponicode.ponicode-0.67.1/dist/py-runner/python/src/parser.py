import importlib
import sys

# Local module
from .utils import get_from_module, get_module_from_file_path


def get_source_data(json_data):
    """
    Parse the sourceFile variable in the JSON used for the source file parsing
    """
    # Get data from the JSON
    source_file = json_data["sourceFile"]
    # Get the module via its path
    module_name = get_module_from_file_path(source_file.get("path"))

    # We check if it was already imported previously
    if module_name in sys.modules:
        # If it is, we reload it
        source_module = importlib.import_module(module_name)
        source_module = importlib.reload(source_module)
    else:
        # Otherwise we simply load it
        source_module = importlib.import_module(module_name)

    # Get the function to test originally given in the JSON
    source_class = None
    if source_file.get("class") is not None:
        source_class = get_from_module(source_module, source_file.get("class"))
        source_function = get_from_module(source_class, source_file.get("function"))
    else:
        source_function = get_from_module(source_module, source_file.get("function"))

    # Create the object to return
    source = {
        "module": source_module,
        "function": source_function,
        "class": source_class if source_class else None,
    }
    return source


def get_test_data(json_data):
    """
    Parse the testFile variable in the JSON used for the test source file parsing
    """
    # Get data from the JSON
    test_file = json_data["testFile"]

    # Get the module via its path
    test_module = importlib.import_module(
        get_module_from_file_path(test_file.get("path"))
    )

    # If already loaded, we reload it to be sure it's updated
    if test_module.__name__ in sys.modules:
        test_module = importlib.reload(test_module)

    # Get the class to test originally given in the JSON
    test_class = get_from_module(test_module, test_file.get("className"))

    return test_file, test_class


def get_functions_to_test(all_functions, test_file):
    """
    Return all the functions we want to test in the file
    """
    # Check if the function to test is present in the JSON,
    # if not we will test all the class function
    if "test" not in test_file:
        # Retrieving all the function of the class with the right reach for Pytest
        to_test = [
            test_file.get("path")
            + "::"
            + test_file.get("className")
            + "::"
            + func.__name__
            for func in all_functions
        ]
        return {"success": True, "result": to_test}

    # Get the function to test in the JSON
    function_to_test = test_file.get("test")

    # If the function does not exist in the class, we return an error
    if function_to_test not in [func.__name__ for func in all_functions]:
        return {
            "success": False,
            "result": function_to_test + " does not exist in " + test_file.get("path"),
        }

    # Otherwise, we create the right reach for Pytest and return it
    to_test = (
        test_file.get("path")
        + "::"
        + test_file.get("className")
        + "::"
        + function_to_test
    )

    return {"success": True, "result": [to_test]}
