import { jsx as _jsx } from "react/jsx-runtime";
import LoadingIndicator from "../../../components/utilities/LoadingIndicator";
import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../utils/test-utils";
describe("LoadingIndicator", () => {
    it("renders the CircularProgress component", () => {
        renderWithProviders(_jsx(LoadingIndicator, {}));
        // Check if the component renders with the correct structure
        const loadingElement = document.querySelector(".MuiCircularProgress-root");
        expect(loadingElement).toBeInTheDocument();
    });
    it("is wrapped in a Box with flex display", () => {
        renderWithProviders(_jsx(LoadingIndicator, {}));
        // Check if the Box component has the correct styling
        const boxElement = document.querySelector(".MuiBox-root");
        expect(boxElement).toBeInTheDocument();
        // Check if the Box has display: flex
        expect(boxElement).toHaveStyle("display: flex");
    });
});
//# sourceMappingURL=LoadingIndicator.test.js.map