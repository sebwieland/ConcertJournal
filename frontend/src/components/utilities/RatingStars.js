import { jsx as _jsx } from "react/jsx-runtime";
function RatingStars(props) {
    return (_jsx("div", { children: [1, 2, 3, 4, 5].map((i) => (_jsx("span", { style: { color: i <= props.rating ? "gold" : "gray" }, children: "\u2605" }, i))) }));
}
export default RatingStars;
//# sourceMappingURL=RatingStars.js.map