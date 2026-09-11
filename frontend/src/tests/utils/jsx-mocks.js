import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { vi } from "vitest";
// Mock the DefaultLayout component
export const MockDefaultLayout = ({ children, }) => _jsx("div", { "data-testid": "default-layout", children: children });
// Mock the RatingStars component
export const MockRatingStars = ({ rating }) => (_jsxs("div", { "data-testid": "rating-stars", "data-rating": rating, children: ["Rating: ", rating] }));
// Setup JSX mocks
export const setupJsxMocks = () => {
    vi.mock("../../theme/DefaultLayout", () => ({
        default: MockDefaultLayout,
    }));
    vi.mock("../../components/utilities/RatingStars", () => ({
        default: MockRatingStars,
    }));
};
//# sourceMappingURL=jsx-mocks.js.map