class Plugin:
    """
    Pytest plugin used to generate a custom report
    """

    def __init__(self):
        self.passed_tests = []
        self.failed_tests = []
        self.teardown = []
        self.item_collected = []

    def pytest_runtest_teardown(self, item):
        self.teardown.append(item)

    def pytest_itemcollected(self, item):
        self.item_collected.append(item)

    def pytest_runtest_logreport(self, report):
        if not (report.when == "call"):
            return None
        if report.passed:
            self.passed_tests.append(report)
        else:
            self.failed_tests.append(report)
