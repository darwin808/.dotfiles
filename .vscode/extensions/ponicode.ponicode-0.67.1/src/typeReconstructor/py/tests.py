import ast
import unittest

from parse_python import parse_annotation, type_parser
from utils import Construct, ConstructParameter, ObjectReference


def native_to_construct_parameter(t: str):
    return ConstructParameter(ObjectReference("native", t))


class TestParseAnnotation(unittest.TestCase):
    def test_primitive(self):
        types = ["float", "int", "bool", "str"]
        inputs = [ast.parse(t).body[0].value for t in types]
        expected = [ConstructParameter(ObjectReference("native", t)) for t in types]

        for i, e in zip(inputs, expected):
            out = parse_annotation(i)
            self.assertEqual(out, e)

    def test_generics(self):
        types = [
            "list[int]",
            "List[float]",
            "Union[int, float]",
            "typing.Optional[str]",
        ]
        inputs = [ast.parse(t).body[0].value for t in types]
        expected = [
            ConstructParameter(
                ObjectReference("native", "list"),
                typeParameters=[native_to_construct_parameter("int")],
            ),
            ConstructParameter(
                ObjectReference("native", "list"),
                typeParameters=[native_to_construct_parameter("float")],
            ),
            ConstructParameter(
                ObjectReference("native", "union"),
                typeParameters=[
                    native_to_construct_parameter("int"),
                    native_to_construct_parameter("float"),
                ],
            ),
            ConstructParameter(
                ObjectReference("native", "optional"),
                typeParameters=[native_to_construct_parameter("str")],
            ),
        ]

        for i, e in zip(inputs, expected):
            out = parse_annotation(i)
            self.assertEqual(out, e)


class TestParseType(unittest.TestCase):
    def test_type_reference(self):
        types = ["int", "Callable[[float, int], bool]"]
        expected = [
            Construct("TypeReference", [native_to_construct_parameter("int")]),
            Construct(
                "TypeReference",
                [
                    ConstructParameter(
                        ObjectReference("native", "callable"),
                        None,
                        [
                            ConstructParameter(
                                ObjectReference("native", "typesList"),
                                None,
                                [
                                    native_to_construct_parameter("float"),
                                    native_to_construct_parameter("int"),
                                ],
                            ),
                            native_to_construct_parameter("bool"),
                        ],
                    )
                ],
            ),
        ]

        for i, e in zip(types, expected):
            out = type_parser(i)[0]
            self.assertEqual(out, e)


if __name__ == "__main__":
    unittest.main()
