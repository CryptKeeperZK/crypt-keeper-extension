/**
 * @jest-environment jsdom
 */

import { WEB2_PROVIDER_OPTIONS } from "@src/constants";
import { render, screen } from "@testing-library/react";

import { Dropdown, DropdownProps } from "..";

describe("ui/components/Dropdown", () => {
    const defaultProps: DropdownProps = {
        label: "Web2 Provider",
        options: WEB2_PROVIDER_OPTIONS
    };

    beforeEach(() => {
        render(<Dropdown {...defaultProps} />);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test("should render properly", async () => {
        const web2ProviderLabel = await screen.findByTestId("Web2 Provider");

        expect(web2ProviderLabel).toBeInTheDocument();
    });
});