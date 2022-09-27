import { initiateTest } from "@/utils/unit-tests/test-mockup-fn";
import { screen } from "@testing-library/react";
import ReportListingPage from "@/src/pages/reports/[cover_id]/products/[product_id]";

jest.mock("@/src/modules/reporting/ReportListing", () => {
  return {
    __esModule: true,
    default: () => {
      return <div data-testid="listing-table"></div>;
    },
  };
});

describe("ReportListingPage test", () => {
  const { initialRender } = initiateTest(ReportListingPage);

  beforeEach(() => {
    initialRender();
  });

  test("should display ReportListingPage with ReportListing component", () => {
    const incident = screen.getByTestId("listing-table");
    expect(incident).toBeInTheDocument();
  });
});