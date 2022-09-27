import { initiateTest, mockFn } from "@/utils/unit-tests/test-mockup-fn";
import { screen } from "@testing-library/react";

jest.mock("@/common/ComingSoon", () => ({
  ComingSoon: () => <div data-testid="coming-soon"></div>,
}));

describe("ReportingNewCoverPage test", () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    mockFn.useRouter();
    mockFn.useCoverOrProductData();
    mockFn.getNetworkId();
    mockFn.fetch(true, undefined, { data: { incidentReport: [] } });
    process.env = { ...OLD_ENV, NEXT_PUBLIC_FEATURES: "none" };
    const DisputeFormPage =
      require("@/src/pages/reports/[cover_id]/incidents/[timestamp]/dispute").default;

    const { initialRender } = initiateTest(DisputeFormPage);
    initialRender();
  });
  test("Should display coming soon", () => {
    const comingSoon = screen.getByTestId("coming-soon");
    expect(comingSoon).toBeInTheDocument();
  });
});